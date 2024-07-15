import { BitAllocation, EightBitChunkName } from 'shared-lib';
import { FileService } from './file-service';
import { UnityMetadata } from '../models/unity_yaml/unityMetadata';
import { FloatCurve } from '../models/unity_yaml/floatCurve';
import { GenericBinding } from '../models/unity_yaml/genericBounding';
import { EditorCurve } from '../models/unity_yaml/editorCurve';
import { AnimationClip } from '../models/unity_yaml/animationClip';
import { AnimatorController } from '../models/unity_yaml/animatorController';
import { AnimationParamter } from '../models/unity_yaml/animationParamter';
import { AnimationLayer } from '../models/unity_yaml/animationLayer';
import { MAnimatorParamter } from '../models/unity_yaml/mAnimatorParameter';
import { AnimatorState } from '../models/unity_yaml/animatorState';
import { BlendTree } from '../models/unity_yaml/blendTree';
import { AnimatorStateTransition } from '../models/unity_yaml/animatorStateTransition';
import { UnityYamlTag, YamlDocument } from './yaml-parser';
import { AnimatorStateMachine } from '../models/unity_yaml/animatorStateMachine';
import { Color } from '../models/unity_yaml/color';
import { MTexEnvs } from '../models/unity_yaml/mTexEnvs';
import { Material } from '../models/unity_yaml/material';
import { UnityShaderMetadata } from '../models/unity_yaml/unityShaderMetadata';
import { FileReference } from '../models/unity_yaml/fileReference';

export class GenerateUnityFiles {
  public generateFiles(): void {
    const sceneYamlDocuments: Array<YamlDocument> = FileService.parseYamlFile(this.configData.parentFolderPath + this.configData.sceneName);

    this.clearDirectories();
    this.generateDataMapped();
    this.generateGameObjectMap();
    this.generateVrcExpressionParamters(sceneYamlDocuments);
    this.generateAnimations();
    this.generateAnimatorController(sceneYamlDocuments);
    this.generateShadersAndMaterials(sceneYamlDocuments);

    FileService.createYamlDocuments(sceneYamlDocuments, this.unityHeader, this.outputExternalDirectory + '/' + this.configData.sceneName);
  }



  private clearDirectories(): void {
    FileService.clearDirectory(this.outputInternalDirectory.slice(0, -1));
    FileService.clearDirectory(this.outputExternalDirectory.slice(0, -1));
  }


  private generateDataMapped(): void {
    let startIndex: number = 0;
    const bitAllocations: Array<BitAllocation> = [];
    const userDefinedData: Array<BitAllocation> = FileService.getFileJson(this.userInputDirectory + 'data.json');

    // Sort configData by size in descending order
    const sorteduserDefinedData = userDefinedData.sort((a, b) => b.size - a.size);

    // Iterate through shader bits (these need to be chunked)
    for (const bitAllocation of sorteduserDefinedData.filter(cd => cd.type === 'Shader')) {
      const range: { start: number, end: number } = {
        start: startIndex,
        end: startIndex + bitAllocation.size - 1
      };

      const startChunk: number = Math.floor(range.start / 8);
      const endChunk: number = Math.floor(range.end / 8);
      const bitChunks: Array<string> = Array.from({ length: endChunk - startChunk + 1 }, (_, i: number) => this.bitIndexToEightBitName[startChunk + i]!);

      const res: BitAllocation = {
        ...bitAllocation,
        range: range,
        bitStartIndex: range.start % 8,
        bitChunks: bitChunks,
        shaderParameters: bitChunks.map((_bitChunk: string, index: number) => `${bitAllocation.shaderParameters}_${index}`)
      };

      startIndex += bitAllocation.size;
      bitAllocations.push(res);
    }

    let allocatedBitsSize: number = bitAllocations.reduce((acc, val) => acc + val.size, 0);
    const allocatedInputBitsSize: number = this.inputData.length; // Input data is array of 1-bits
    const overflowBits: number = allocatedBitsSize % 8;
    startIndex += overflowBits;

    if (overflowBits !== 0) {
      const minrange: number = allocatedBitsSize - overflowBits;
      const overflows: Array<BitAllocation> = bitAllocations.filter(b => b.range.start >= minrange);

      // Filter out the overflow bit allocations from the original array
      const nonOverflows: Array<BitAllocation> = bitAllocations.filter(b => b.range.start < minrange);
      const lastChunkBeforeOverflow: string = nonOverflows[nonOverflows.length - 1]!.bitChunks.slice(-1)[0]!;
      // 
      nonOverflows
        .filter((bitAllocation: BitAllocation) => bitAllocation!.bitChunks.slice(-1)[0]! === lastChunkBeforeOverflow)
        .forEach((bitAllocation: BitAllocation) => bitAllocation.bitChunks.pop());

      // Handle the overflow allocations
      overflows.forEach((overflow, index) => {
        for (let i = 0; i < overflow.size; i++) {
          nonOverflows.push({
            ...overflow,
            range: { start: overflow.range.start + i, end: overflow.range.start + i },
            size: 1,
            bitChunks: [`Overflow_${index}_${i}`],
            bitStartIndex: 0,
          });
        }
      });

      // Clear the bitAllocations array
      bitAllocations.length = 0;
      // Update the bitAllocations with the new list
      bitAllocations.push(...nonOverflows);
    }

    for (const bitAllocation of sorteduserDefinedData.filter(cd => cd.type === 'Default')) {
      const range: { start: number, end: number } = {
        start: startIndex,
        end: startIndex + bitAllocation.size - 1
      };

      const res: BitAllocation = {
        ...bitAllocation,
        range: range,
        bitChunks: [`Default_${bitAllocation.name}`],
        bitStartIndex: 0,
      };
      startIndex += bitAllocation.size;
      bitAllocations.push(res);
    }
    allocatedBitsSize = bitAllocations.reduce((acc, val) => acc + val.size, 0);

    if (allocatedBitsSize + allocatedInputBitsSize > 256) {
      throw new Error(`Too many bits allocated (limit 256): ${allocatedBitsSize} + ${allocatedInputBitsSize}`);
    }

    FileService.writeToFile(this.outputInternalDirectory + 'data_mapped.json', bitAllocations);
  }

  private generateGameObjectMap(): void {
    const gameObjectToShaders: Record<string, Set<Set<string>>> = {};
    const shaderToGameObjectMap: Record<string, string[]> = {};

    // Read the JSON data from the file
    const bitAllocations: Array<BitAllocation> = FileService.getFileJson(this.outputInternalDirectory + 'data_mapped.json');

    // First, map each game object to all its shader parameters
    for (const allocation of bitAllocations) {
      const objectNames: Array<string> = allocation.objectNames;
      const shaderParameters: Set<string> = new Set<string>(allocation.shaderParameters);

      for (const objectName of objectNames) {
        if (!(objectName in gameObjectToShaders)) {
          gameObjectToShaders[objectName] = new Set<Set<string>>();
        }

        gameObjectToShaders[objectName]!.add(shaderParameters);
      }
    }

    // Now, map sets of shader parameters to game objects, ensuring uniqueness
    for (const [objectName, shaders] of Object.entries(gameObjectToShaders)) {
      // Combine all shader sets for this object into one key
      const combinedShaderKey = Array.from(shaders).reduce((acc, cur) => new Set([...acc, ...cur]), new Set<string>());
      const combinedShaderKeyString = Array.from(combinedShaderKey).sort().join(', ');

      if (!(combinedShaderKeyString in shaderToGameObjectMap)) {
        shaderToGameObjectMap[combinedShaderKeyString] = [];
      }
      shaderToGameObjectMap[combinedShaderKeyString]!.push(objectName);
    }

    // Convert shader set keys to a sorted, comma-separated string for JSON serialization
    const finalMap = Object.fromEntries(
      Object.entries(shaderToGameObjectMap).map(([key, value]) => [key, value.sort()])
    );

    FileService.writeToFile(this.outputInternalDirectory + 'data_game_object_shader_parameter_map.json', finalMap);
  }

  private generateVrcExpressionParamters(sceneYamlDocuments: Array<YamlDocument>): void {
    const dataMapped: Array<BitAllocation> = FileService.getFileJson(this.outputInternalDirectory + 'data_mapped.json');

    const chunks: Array<string> = [];
    const overflowingBits: Array<string> = [];
    const defaultBits: Array<{ name: string, defaultValue: number }> = [];

    dataMapped.forEach((data: BitAllocation) => {
      data.bitChunks.forEach((bitChunkName: string) => {
        if (bitChunkName.includes('Overflow')) {
          if (overflowingBits.includes(bitChunkName)) {
            throw Error(`Dublicate data.json value: ${data}`);
          }

          overflowingBits.push(bitChunkName);
          return;
        }

        if (bitChunkName.includes('Default')) {
          if (defaultBits.some(db => db.name === bitChunkName)) {
            throw Error(`Dublicate data.json value: ${data}`);
          }

          defaultBits.push({ name: bitChunkName, defaultValue: data.defaultValue });
          return;
        }

        if (!chunks.includes(bitChunkName)) {
          chunks.push(bitChunkName);
        }
      });
    });

    const yamlDocument: Array<YamlDocument> = [{
      tag: this.documentNameToIdentifier.get('MonoBehaviour')!,
      anchor: this.generateUniqueId(),
      data: {
        MonoBehaviour: {
          m_ObjectHideFlags: 0,
          m_CorrespondingSourceObject: { fileID: 0 },
          m_PrefabInstance: { fileID: 0 },
          m_PrefabAsset: { fileID: 0 },
          m_GameObject: { fileID: 0 },
          m_Enabled: 1,
          m_EditorHideFlags: 0,
          m_Script: { fileID: -1506855854, guid: '67cc4cb7839cd3741b63733d5adf0442', type: 3 }, // hardcoded but probably needs to be dynamic
          m_Name: 'VRCExpressionParameters',
          m_EditorClassIdentifier: null,
          parameters: chunks.map((chunk: string) => {
            return {
              name: chunk,
              valueType: 0, // 0 == 8-bit integer
              saved: 0,
              defaultValue: 0,
              networkSynced: 1
            }
          }).concat(overflowingBits.map((overflow: string) => {
            return {
              name: overflow,
              valueType: 2, // 2 == boolean
              saved: 0,
              defaultValue: 0,
              networkSynced: 1
            }
          })).concat(defaultBits.map((defaults: { name: string, defaultValue: number }) => {
            return {
              name: defaults.name,
              valueType: 2, // 2 == boolean
              saved: 0,
              defaultValue: defaults.defaultValue,
              networkSynced: 1
            }
          }).concat(this.inputData.map((input: string) => {
            return {
              name: `!${input}`,
              valueType: 2, // 2 == boolean
              saved: 0,
              defaultValue: 0,
              networkSynced: 1
            }
          })))
        }
      }
    }];

    const yamlMetadata: UnityMetadata = {
      fileFormatVersion: 2,
      guid: this.generateGuid(),
      NativeFormatImporter: {
        externalObjects: {},
        mainObjectFileID: 11400000,
        userData: null,
        assetBundleName: '',
        assetBundleVariant: null,
      }
    };

    this.updateSceneObject(sceneYamlDocuments, 'MonoBehaviour', ['expressionsMenu', 'expressionParameters'], 'expressionParameters', { fileID: yamlDocument[0]!.anchor, guid: yamlMetadata.guid, type: 2 });
    FileService.createYamlDocuments(yamlDocument, this.unityHeader, this.outputExternalDirectory + 'Vrchat/VRCExpressionParameters.asset');
    FileService.createYamlDocument(yamlMetadata, null, this.outputExternalDirectory + 'Vrchat/VRCExpressionParameters.asset.meta');
  }

  private generateAnimations(): void {
    const data: Array<BitAllocation> = FileService.getFileJson(this.outputInternalDirectory + 'data_mapped.json');
    const uniqueStartNames: Array<string> = [...new Set(data.flatMap(allocation => allocation.bitChunks))];

    const generateFloatCurve = (value: number, attribute: string, path: string): FloatCurve => {
      return {
        serializedVersion: 2,
        curve: {
          serializedVersion: 2,
          m_Curve: [
            {
              serializedVersion: 3,
              time: 0,
              value: value,
              inSlope: 0,
              outSlope: 0,
              tangentMode: 136,
              weightedMode: 0,
              inWeight: 0.33333334,
              outWeight: 0.33333334,
            },
          ],
          m_PreInfinity: 2,
          m_PostInfinity: 2,
          m_RotationOrder: 4,
        },
        attribute: `material.${attribute}`,
        path: path,
        classID: 23,
        script: { fileID: 0 },
        flags: 16
      };
    };

    const generateGenericBinding = (pathId: string, attributeId: string): GenericBinding => {
      return {
        serializedVersion: 2,
        path: pathId,
        attribute: attributeId,
        script: { fileID: 0 },
        typeID: 23,
        customType: 22,
        isPPtrCurve: 0,
        isIntCurve: 0,
        isSerializeReferenceCurve: 0
      }
    };

    const generateEditorCurves = (value: number, attribute: string, path: string): EditorCurve => {
      return {
        serializedVersion: 2,
        curve: {
          serializedVersion: 2,
          m_Curve: [
            {
              serializedVersion: 3,
              time: 0,
              value: value,
              inSlope: 0,
              outSlope: 0,
              tangentMode: 0,
              weightedMode: 0,
              inWeight: 0.33333334,
              outWeight: 0.33333334,
            }
          ],
          m_PreInfinity: 2,
          m_PostInfinity: 2,
          m_RotationOrder: 4,
        },
        attribute: `material.${attribute}`,
        path: path,
        classID: 23,
        script: { fileID: 0 },
        flags: 16,
      };
    }

    const generateAnimationClip = (name: string, floatCurves: Array<FloatCurve>, genericBindings: Array<GenericBinding>, editorCurves: Array<EditorCurve>): AnimationClip => {
      return {
        AnimationClip: {
          m_ObjectHideFlags: 0,
          m_CorrespondingSourceObject: { fileID: 0 },
          m_PrefabInstance: { fileID: 0 },
          m_PrefabAsset: { fileID: 0 },
          m_Name: name,
          serializedVersion: 7,
          m_Legacy: 0,
          m_Compressed: 0,
          m_UseHighQualityCurve: 1,
          m_RotationCurves: [],
          m_CompressedRotationCurves: [],
          m_EulerCurves: [],
          m_PositionCurves: [],
          m_ScaleCurves: [],
          m_FloatCurves: floatCurves,
          m_PPtrCurves: [],
          m_SampleRate: 60,
          m_WrapMode: 0,
          m_Bounds: {
            m_Center: { x: 0, y: 0, z: 0 },
            m_Extent: { x: 0, y: 0, z: 0 },
          },
          m_ClipBindingConstant: {
            genericBindings: genericBindings,
            pptrCurveMapping: [],
          },
          m_AnimationClipSettings: {
            serializedVersion: 2,
            m_AdditiveReferencePoseClip: { fileID: 0 },
            m_AdditiveReferencePoseTime: 0,
            m_StartTime: 0,
            m_StopTime: 0,
            m_OrientationOffsetY: 0,
            m_Level: 0,
            m_CycleOffset: 0,
            m_HasAdditiveReferencePose: 0,
            m_LoopTime: 0,
            m_LoopBlend: 0,
            m_LoopBlendOrientation: 0,
            m_LoopBlendPositionY: 0,
            m_LoopBlendPositionXZ: 0,
            m_KeepOriginalOrientation: 0,
            m_KeepOriginalPositionY: 1,
            m_KeepOriginalPositionXZ: 0,
            m_HeightFromFeet: 0,
            m_Mirror: 0,
          },
          m_EditorCurves: editorCurves,
          m_EulerEditorCurves: [],
          m_HasGenericRootTransform: 0,
          m_HasMotionFloatCurves: 0,
          m_Events: [],
        }
      };
    }

    const generateAnimationPairData = (suffix: string, allocations: Array<BitAllocation>, maxValue: number): [FloatCurve[], GenericBinding[], EditorCurve[]] => {
      const defaultValue: number = suffix === 'Start' ? 0 : maxValue;
      const attributeId: string = this.generateUniqueId();
      const pathId: string = this.generateUniqueId();

      return [
        allocations.flatMap((allocation: BitAllocation): Array<FloatCurve> => {
          return allocation.objectNames.map((path: string) => generateFloatCurve(defaultValue, `_${allocation.shaderParameters[0]}`, this.removeFirstOccurrence(path, '/')));
        }),

        allocations.flatMap((allocation: BitAllocation): Array<GenericBinding> => {
          return allocation.objectNames.map((_: string) => generateGenericBinding(pathId, attributeId));
        }),

        allocations.flatMap((allocation: BitAllocation): Array<EditorCurve> => {
          return allocation.objectNames.map((path: string) => generateEditorCurves(defaultValue, `_${allocation.shaderParameters[0]}`, this.removeFirstOccurrence(path, '/')));
        })
      ];
    }


    for (const name of uniqueStartNames) {
      const maxValue: number = name.includes('Overflow') ? 1 : 255;
      const bitAllocations: Array<BitAllocation> = data.filter((bitAllocation: BitAllocation) => bitAllocation.bitChunks.includes(name));
      const uniqueValues = [...new Set(bitAllocations.flatMap(b => b.bitChunks))];

      ['Start', 'End'].forEach((suffix: string) => {
        const floatCurves: Array<FloatCurve> = [];
        const genericBindings: Array<GenericBinding> = [];
        const editorCurves: Array<EditorCurve> = [];

        uniqueValues.forEach((_v, i) => {
          const d = bitAllocations.map((bitAllocation: BitAllocation) => {
            return {
              ...bitAllocation,
              shaderParameters: [
                bitAllocation.shaderParameters[i]!
              ]
            }
          }).filter((bitAllocation: BitAllocation) => {
            return bitAllocation.shaderParameters[0] !== undefined;
          });
          const [newFloatCurves, newGenericBindings, newEditorCurves] = generateAnimationPairData(suffix, d, maxValue);
          floatCurves.push(...newFloatCurves);
          genericBindings.push(...newGenericBindings);
          editorCurves.push(...newEditorCurves);
        });

        const animation: Array<YamlDocument> = [{
          tag: this.documentNameToIdentifier.get('AnimationClip')!,
          anchor: this.generateUniqueId(),
          data: generateAnimationClip(`${name}_${suffix}`, floatCurves, genericBindings, editorCurves)
        }];
        const metadata: UnityMetadata = {
          fileFormatVersion: 2,
          guid: this.generateGuid(),
          NativeFormatImporter: {
            externalObjects: {},
            mainObjectFileID: 7400000,
            userData: null,
            assetBundleName: '',
            assetBundleVariant: null,
          }
        };

        FileService.createYamlDocuments(animation, this.unityHeader, `${this.outputExternalDirectory}Animations/${name}_${suffix}.anim`);
        FileService.createYamlDocument(metadata, null, `${this.outputExternalDirectory}Animations/${name}_${suffix}.anim.meta`);
      });
    }
  }

  private generateAnimatorController(sceneYamlDocuments: Array<YamlDocument>): void {
    const mapJsonConfig = () => {
      const data: Array<BitAllocation> = FileService.getFileJson(this.outputInternalDirectory + 'data_mapped.json');
      const uniqueNames: Set<string> = new Set();

      for (const item of data) {
        item.bitChunks.forEach((bitchunkName: string) => uniqueNames.add(bitchunkName));
      }

      const uniqueNameList: Array<string> = Array.from(uniqueNames).sort();

      const animatorData: AnimatorData = {
        name: uniqueNameList,
        animatorStateMachineId: Array.from({ length: uniqueNameList.length }, (_, __) => this.generateUniqueId()),
        animatorStateId: Array.from({ length: uniqueNameList.length }, (_, __) => this.generateUniqueId()),
        animatorStateTransitionId: Array.from({ length: uniqueNameList.length }, (_, __) => this.generateUniqueId()),
        blendTreeId: Array.from({ length: uniqueNameList.length }, (_, __) => this.generateUniqueId()),
        minThreshold: new Array(uniqueNameList.length).fill(0),
        maxThreshold: uniqueNameList.map((name) => name.includes('Overflow') ? 1 : 255),
      };

      return animatorData;
    }

    const generateAnimatorParameter = (name: string): MAnimatorParamter => {
      return {
        m_Name: name,
        m_Type: 1,
        m_DefaultFloat: 0,
        m_DefaultInt: 0,
        m_DefaultBool: 0,
        m_Controller: { fileID: 9100000 }
      }
    }

    const generateAnimatorLayer = (name: string, animatorStateMachineId: string): AnimationLayer => {
      return {
        serializedVersion: 5,
        m_Name: name,
        m_StateMachine: { fileID: animatorStateMachineId },
        m_Mask: { fileID: 0 },
        m_Motions: [],
        m_Behaviours: [],
        m_BlendingMode: 0,
        m_SyncedLayerIndex: -1,
        m_DefaultWeight: 1,
        m_IKPass: 0,
        m_SyncedLayerAffectsTiming: 0,
        m_Controller: { fileID: 9100000 },
      };
    }

    const generateAnimatorController = (animatorParamaters: Array<AnimationParamter>, animatorLayers: Array<AnimationLayer>): AnimatorController => {
      return {
        m_ObjectHideFlags: 0,
        m_CorrespondingSourceObject: { fileID: 0 },
        m_PrefabInstance: { fileID: 0 },
        m_PrefabAsset: { fileID: 0 },
        m_Name: 'FX',
        serializedVersion: 5,
        m_AnimatorParameters: animatorParamaters,
        m_AnimatorLayers: animatorLayers,
      };
    }

    const generateAnimatorState = (animatorStateTransitionId: string, blendTreeId: string): AnimatorState => {
      return {
        AnimatorState: {
          serializedVersion: 6,
          m_ObjectHideFlags: 1,
          m_CorrespondingSourceObject: { fileID: 0 },
          m_PrefabInstance: { fileID: 0 },
          m_PrefabAsset: { fileID: 0 },
          m_Name: 'Blend Tree',
          m_Speed: 1,
          m_CycleOffset: 0,
          m_Transitions: [{ fileID: animatorStateTransitionId }],
          m_StateMachineBehaviours: [],
          m_Position: { x: 50, y: 50, z: 0 },
          m_IKOnFeet: 0,
          m_WriteDefaultValues: 1,
          m_Mirror: 0,
          m_SpeedParameterActive: 0,
          m_MirrorParameterActive: 0,
          m_CycleOffsetParameterActive: 0,
          m_TimeParameterActive: 0,
          m_Motion: { fileID: blendTreeId },
          m_Tag: null,
          m_SpeedParameter: null,
          m_MirrorParameter: null,
          m_CycleOffsetParameter: null,
          m_TimeParameter: null,
        }
      };
    }

    const generateAnimatorStateMachine = (name: string, animatorStateId: string): AnimatorStateMachine => {
      return {
        AnimatorStateMachine: {
          serializedVersion: 6,
          m_ObjectHideFlags: 1,
          m_CorrespondingSourceObject: { fileID: 0 },
          m_PrefabInstance: { fileID: 0 },
          m_PrefabAsset: { fileID: 0 },
          m_Name: name,
          m_ChildStates: [{
            serializedVersion: 1,
            m_State: { fileID: animatorStateId },
            m_Position: { x: 300, y: 120, z: 0 },
          }],
          m_ChildStateMachines: [],
          m_AnyStateTransitions: [],
          m_EntryTransitions: [],
          m_StateMachineTransitions: {},
          m_StateMachineBehaviours: [],
          m_AnyStatePosition: { x: 50, y: 20, z: 0 },
          m_EntryPosition: { x: 50, y: 120, z: 0 },
          m_ExitPosition: { x: 600, y: 120, z: 0 },
          m_ParentStateMachinePosition: { x: 600, y: 20, z: 0 },
          m_DefaultState: { fileID: animatorStateId }
        }
      };
    }

    const generateBlendTree = (name: string, motionStartGuid: string, motionEndGuid: string, minThreshold: number, maxThreshold: number, motionStartFileId: number, motionEndFileId: number): BlendTree => {
      return {
        BlendTree: {
          m_ObjectHideFlags: 1,
          m_CorrespondingSourceObject: { fileID: 0 },
          m_PrefabInstance: { fileID: 0 },
          m_PrefabAsset: { fileID: 0 },
          m_Name: 'Blend Tree',
          m_Childs: [
            {
              serializedVersion: 2,
              m_Motion: { fileID: motionStartFileId, guid: motionStartGuid, type: 2 },
              m_Threshold: minThreshold,
              m_Position: { x: 0, y: 0 },
              m_TimeScale: 1,
              m_CycleOffset: 0,
              m_DirectBlendParameter: name,
              m_Mirror: 0,
            },
            {
              serializedVersion: 2,
              m_Motion: { fileID: motionEndFileId, guid: motionEndGuid, type: 2 },
              m_Threshold: maxThreshold,
              m_Position: { x: 0, y: 0 },
              m_TimeScale: 1,
              m_CycleOffset: 0,
              m_DirectBlendParameter: name,
              m_Mirror: 0,
            }
          ],
          m_BlendParameter: name,
          m_BlendParameterY: name,
          m_MinThreshold: minThreshold,
          m_MaxThreshold: maxThreshold,
          m_UseAutomaticThresholds: 0,
          m_NormalizedBlendValues: 0,
          m_BlendType: 0,
        }
      }
    }

    const generateAnimatorStateTransition = (): AnimatorStateTransition => {
      return {
        AnimatorStateTransition: {
          m_ObjectHideFlags: 1,
          m_CorrespondingSourceObject: { fileID: 0 },
          m_PrefabInstance: { fileID: 0 },
          m_PrefabAsset: { fileID: 0 },
          m_Name: '',
          m_Conditions: [],
          m_DstStateMachine: { fileID: 0 },
          m_DstState: { fileID: 0 },
          m_Solo: 0,
          m_Mute: 0,
          m_IsExit: 1,
          serializedVersion: 3,
          m_TransitionDuration: 0.25,
          m_TransitionOffset: 0,
          m_ExitTime: 0.75,
          m_HasExitTime: 1,
          m_HasFixedDuration: 1,
          m_InterruptionSource: 0,
          m_OrderedInterruption: 1,
          m_CanTransitionToSelf: 1,
        }
      };
    }

    const jsonData: AnimatorData = mapJsonConfig();
    const animationMetaNames: Array<string> = FileService.getFileNamesInDir(this.outputExternalDirectory + 'Animations').filter((v: string) => v.includes('.meta'));
    const animationNames: Array<string> = FileService.getFileNamesInDir(this.outputExternalDirectory + 'Animations').filter((v: string) => v.includes('.anim') && !v.includes('.meta'));

    const animatorParameters: Array<AnimationParamter> = jsonData.name.map((name: string) => generateAnimatorParameter(name));
    const animatorLayers: Array<AnimationLayer> = jsonData.name.map((name: string, index: number) => generateAnimatorLayer(name, jsonData.animatorStateMachineId[index]!));

    const yamls: Array<YamlDocument> = [
      {
        tag: this.documentNameToIdentifier.get('AnimatorController')!,
        anchor: '9100000',
        data: {
          AnimatorController: generateAnimatorController(animatorParameters, animatorLayers)
        }
      }
    ];

    for (let i = 0; i < jsonData.name.length; i++) {
      const name: string = jsonData.name[i]!;
      const animatorStateId: string = jsonData.animatorStateId[i]!;
      const animatorStateTransitionId: string = jsonData.animatorStateTransitionId[i]!;
      const animatorStateMachineId: string = jsonData.animatorStateMachineId[i]!;
      const blendTreeId: string = jsonData.blendTreeId[i]!;
      const minT: number = jsonData.minThreshold[i]!;
      const maxT: number = jsonData.maxThreshold[i]!;
      const startAnimationMetaName: string = `${this.outputExternalDirectory}Animations/${animationMetaNames.filter((v: string) => v === `${name}_Start.anim.meta`).find(v => v.includes('_Start'))}`;
      const endAnimationMetaName: string = `${this.outputExternalDirectory}Animations/${animationMetaNames.filter((v: string) => v === `${name}_End.anim.meta`).find(v => v.includes('_End'))}`;
      const startAnimationName: string = `${this.outputExternalDirectory}Animations/${animationNames.filter((v: string) => v === `${name}_Start.anim`).find(v => v.includes('_Start'))}`;
      const endAnimationName: string = `${this.outputExternalDirectory}Animations/${animationNames.filter((v: string) => v === `${name}_End.anim`).find(v => v.includes('_End'))}`;
      const motionStartGuid: string = FileService.findInFile(startAnimationMetaName, /guid: ([a-f0-9]+)/g).replace('guid: ', '');
      const motionEndGuid: string = FileService.findInFile(endAnimationMetaName, /guid: ([a-f0-9]+)/g).replace('guid: ', '');
      const motionStartFileId: string = FileService.findInFile(startAnimationName, /--- !u!74 &([0-9]*)/g).replace('--- !u!74 &', '');
      const motionEndFileId: string = FileService.findInFile(endAnimationName, /--- !u!74 &([0-9]*)/g).replace('--- !u!74 &', '');

      yamls.push({
        tag: this.documentNameToIdentifier.get('AnimatorStateMachine')!,
        anchor: animatorStateMachineId,
        data: generateAnimatorStateMachine(name, animatorStateId)
      });
      yamls.push({
        tag: this.documentNameToIdentifier.get('AnimatorState')!,
        anchor: animatorStateId,
        data: generateAnimatorState(animatorStateTransitionId, blendTreeId)
      });
      yamls.push({
        tag: this.documentNameToIdentifier.get('AnimatorStateTransition')!,
        anchor: animatorStateTransitionId,
        data: generateAnimatorStateTransition()
      });
      yamls.push({
        tag: this.documentNameToIdentifier.get('BlendTree')!,
        anchor: blendTreeId,
        data: generateBlendTree(name, motionStartGuid, motionEndGuid, minT, maxT, Number(motionStartFileId), Number(motionEndFileId))
      });
    }

    const metadata: UnityMetadata = {
      fileFormatVersion: 2,
      guid: this.generateGuid(),
      NativeFormatImporter: {
        externalObjects: {},
        mainObjectFileID: 7400000,
        userData: null,
        assetBundleName: '',
        assetBundleVariant: null,
      }
    }

    this.updateSceneObject(sceneYamlDocuments, 'Animator', ['m_Controller'], 'm_Controller', { fileID: yamls[0]!.anchor, guid: metadata.guid, type: 2 });
    const updateValue = this.getObjectInYamlDocument(sceneYamlDocuments, 'MonoBehaviour', ['expressionsMenu', 'baseAnimationLayers'], 'baseAnimationLayers').map((v: any) => {
      if (v.type === 5) {
        v.animatorController = {
          fileID: yamls[0]!.anchor,
          guid: metadata.guid,
          type: 2
        };
      }

      return v;
    });
    this.updateSceneObject(sceneYamlDocuments, 'MonoBehaviour', ['expressionsMenu', 'baseAnimationLayers'], 'baseAnimationLayers', updateValue);

    FileService.createYamlDocuments(yamls, this.unityHeader, this.outputExternalDirectory + 'Animations/FX.controller');
    FileService.createYamlDocument(metadata, null, this.outputExternalDirectory + 'Animations/FX.controller.meta');
  }

  private generateShadersAndMaterials(sceneYamlDocuments: Array<YamlDocument>): void {
    const dataShaderParamterMap: Array<Array<string>> = FileService.getFileJson(this.outputInternalDirectory + 'data_game_object_shader_parameter_map.json');
    const dataMapped: Array<BitAllocation> = FileService.getFileJson(this.outputInternalDirectory + 'data_mapped.json');
    const sceneNode: SceneNode = this.createParentChildObject(sceneYamlDocuments);

    const generateMaterial = (name: string, shaderGuid: string, m_TexEnvs: Array<{ [key in string]: MTexEnvs }>, m_Ints: Array<{ [key in string]: number }>, m_Floats: Array<{ [key in string]: number }>, m_Colors: Array<{ [key in string]: Color }>): Material => {
      return {
        Material: {
          serializedVersion: 8,
          m_ObjectHideFlags: 0,
          m_CorrespondingSourceObject: { fileID: 0 },
          m_PrefabInstance: { fileID: 0 },
          m_PrefabAsset: { fileID: 0 },
          m_Name: name,
          m_Shader: { fileID: 4800000, guid: shaderGuid, type: 3 },
          m_Parent: { fileID: 0 },
          m_ModifiedSerializedProperties: 0,
          m_ValidKeywords: [],
          m_InvalidKeywords: [],
          m_LightmapFlags: 4,
          m_EnableInstancingVariants: 0,
          m_DoubleSidedGI: 0,
          m_CustomRenderQueue: -1,
          stringTagMap: {},
          disabledShaderPasses: [],
          m_LockedProperties: null,
          m_SavedProperties: {
            serializedVersion: 3,
            m_TexEnvs: m_TexEnvs,
            m_Ints: m_Ints,
            m_Floats: m_Floats,
            m_Colors: m_Colors
          },
          m_BuildTextureStacks: []
        }
      }
    }

    for (const [index, [key, values]] of Object.entries(dataShaderParamterMap).entries()) {
      const shaderProperties: Array<string> = [];
      const shaderVariables: Array<string> = [];
      const m_TexEnvs: Array<{ [key in string]: MTexEnvs }> = [
        {
          ['_MainTex']: {
            m_Texture: { fileID: 0 },
            m_Scale: { x: 1, y: 1 },
            m_Offset: { x: 0, y: 0 }
          }
        }
      ];
      const m_Ints: Array<{ [key in string]: number }> = [];
      const m_Floats: Array<{ [key in string]: number }> = [];
      const m_Colors: Array<{ [key in string]: Color }> = [
        {
          _Color: {
            r: 1,
            g: 1,
            b: 1,
            a: 1
          }
        }
      ];

      key.split(', ').forEach((prop: string) => {
        shaderProperties.push(`_${prop} ("${prop}", Range(0,255)) = 0`);
        m_Floats.push({ [`_${prop}`]: 0 });
        shaderVariables.push(`float _${prop};`);

        const k = prop.replaceAll('_', '').slice(0, -1);
        const kk = `_${k}StartIndex ("${k}StartIndex", Range(0,15)) = 0`;

        if (shaderProperties.includes(kk)) {
          return;
        }

        shaderProperties.push(kk);
        m_Floats.push({ [`_${k}StartIndex`]: -1 });
        shaderVariables.push(`float _${k}StartIndex;`);

        shaderProperties.push(`_${k}BitsSize ("${k}BitsSize", Range(0,15)) = 0`);
        m_Floats.push({ [`_${k}BitsSize`]: -1 });
        shaderVariables.push(`float _${k}BitsSize;`);
      });

      const shaderPropertiesString: string = shaderProperties.sort().join('\n        ');
      const shaderVariablesString: string = shaderVariables.sort().join('\n        ');

      const shaderFilePath: string = this.outputExternalDirectory + `/Materials/Shaders/Shader_${index}.shader`;
      const shaderMetaFilePath: string = this.outputExternalDirectory + `/Materials/Shaders/Shader_${index}.shader.meta`;
      const shaderGuid: string = this.generateGuid();
      const shaderMetadata: UnityShaderMetadata = {
        fileFormatVersion: 2,
        guid: shaderGuid,
        ShaderImporter: {
          externalObjects: {},
          defaultTextures: [{
            _MainTex: { instanceID: 0 }
          }],
          nonModifiableTextures: [],
          userData: null,
          assetBundleName: null,
          assetBundleVariant: null
        }
      };
      // TODO fix shader template functions
      FileService.copyFile(this.templateDirectory + 'shader_base.shader', shaderFilePath);
      FileService.replaceInFile(shaderFilePath, '__[REPLACEME_PROPERTIES]__', shaderPropertiesString);
      FileService.replaceInFile(shaderFilePath, '__[REPLACEME_VARIABLES]__', shaderVariablesString);

      FileService.createYamlDocument(shaderMetadata, null, shaderMetaFilePath);

      for (const matNam of values) {
        const matFloats: any = m_Floats
          .map((matFloat: any) => {
            for (const [key, value] of Object.entries(matFloat)) {
              if (value !== -1) {
                continue;
              }

              if (key.includes('StartIndex')) {
                const relevantData: Array<BitAllocation> = dataMapped.filter((bitAllocation: BitAllocation) => bitAllocation.shaderParameters.some((e: string) => e.replaceAll('_', '').includes(key.replace('StartIndex', '').replaceAll('_', ''))))
                const matchingAllocation: BitAllocation = relevantData.find((v) => v.objectNames.some(o => o === matNam))!;
                return { [key]: matchingAllocation.bitStartIndex };
              }

              if (key.includes('BitsSize')) {
                const relevantData: Array<BitAllocation> = dataMapped.filter((bitAllocation: BitAllocation) => bitAllocation.shaderParameters.some((e: string) => e.replaceAll('_', '').includes(key.replace('BitsSize', '').replaceAll('_', ''))))
                const matchingAllocation: BitAllocation = relevantData.find((v) => v.objectNames.some(o => o === matNam))!;
                return { [key]: matchingAllocation.size };
              }
            }
            return matFloat;
          });

        const yaml: Array<YamlDocument> = [
          {
            tag: this.documentNameToIdentifier.get('Material')!,
            anchor: '2100000',
            data: generateMaterial(matNam.split('/')!.pop()!, shaderGuid, m_TexEnvs, m_Ints, matFloats, m_Colors)
          }
        ];
        const metadata: UnityMetadata = {
          fileFormatVersion: 2,
          guid: this.generateGuid(),
          NativeFormatImporter: {
            externalObjects: {},
            mainObjectFileID: 2100000,
            userData: null,
            assetBundleName: '',
            assetBundleVariant: null,
          }
        };

        const node = this.findNodeByPath(sceneNode, `/${matNam}`);
        if (node === undefined) {
          throw Error(`Missing game node in scene ${matNam}`);
        }

        (node.meshRenderer?.data as { MeshRenderer: any }).MeshRenderer.m_Materials = [
          { fileID: yaml[0]?.anchor, guid: metadata.guid, type: 2 }
        ];
        FileService.createYamlDocuments(yaml, this.unityHeader, this.outputExternalDirectory + `/Materials/${matNam.replace('/', '_')}.mat`);
        FileService.createYamlDocument(metadata, null, this.outputExternalDirectory + `/Materials/${matNam.replace('/', '_')}.mat.meta`);
      }
    }
  }


  // Utilities
  private generateUniqueId(): string {
    return (Math.floor(Math.random() * (999999999 - 100000000 + 1)) + 100000000).toString();
  }

  private generateGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character: string) => {
      const randomNumber: number = (Math.random() * 16) | 0;
      const randomValue: number = character === 'x' ? randomNumber : (randomNumber & 0x3) | 0x8;
      return randomValue.toString(16);
    }).replaceAll('-', '');
  }

  private createParentChildObject(yamlDocuments: Array<YamlDocument>): SceneNode {
    const sceneRoots = yamlDocuments.find((yamlDocument: YamlDocument) => yamlDocument.tag === this.documentNameToIdentifier.get('SceneRoots'))!;

    let res: SceneNode = {
      path: '',
      parent: undefined,
      gameObject: sceneRoots,
      transform: sceneRoots,
      meshRenderer: sceneRoots,
      children: this.recursivelyGetBuildA(yamlDocuments, (sceneRoots.data as { SceneRoots: any }).SceneRoots.m_Roots, '')
    };

    return res;
  }

  private recursivelyGetBuildA(yamlDocuments: Array<YamlDocument>, childrenReferences: Array<FileReference>, path: string): Array<SceneNode> {
    return childrenReferences.map((fileReference: FileReference) => yamlDocuments.find(yamlDocument => yamlDocument.anchor === fileReference.fileID)!)
      .filter((yamlDocument: YamlDocument) => yamlDocument.tag === this.documentNameToIdentifier.get('Transform'))
      .map((transform: YamlDocument): SceneNode => {
        const transformData: any = (transform.data as { Transform: any }).Transform;
        const gameObject: YamlDocument = yamlDocuments.find((yamlDocument: YamlDocument) => yamlDocument.anchor === transformData.m_GameObject.fileID)!;
        const gameObjectData: any = (gameObject.data as { GameObject: any }).GameObject;

        const parent: YamlDocument | undefined = yamlDocuments.find((yamlDocument: YamlDocument) => yamlDocument.anchor === transformData.m_Father.fileID);
        const fullPath: string = `${path}/${gameObjectData.m_Name}`;
        const meshRenderer: YamlDocument | undefined = yamlDocuments
          .filter((yamlDocument: YamlDocument) => yamlDocument.tag === this.documentNameToIdentifier.get('MeshRenderer'))
          .find((yamlDocument: YamlDocument) => (yamlDocument.data as { MeshRenderer: any }).MeshRenderer.m_GameObject.fileID === gameObject.anchor)!;

        return {
          path: fullPath,
          gameObject: gameObject,
          transform: transform,
          meshRenderer: meshRenderer,
          parent: parent,
          children: this.recursivelyGetBuildA(yamlDocuments, transformData.m_Children, fullPath)
        };
      });
  }

  private removeFirstOccurrence(str: string, toRemove: string): string {
    let parts: Array<string> = str.split(toRemove);

    if (parts.length > 1) {
      parts.shift();
      return parts.join(toRemove);
    }

    return str;
  }

  private getYamlDocuments(sceneObject: Array<YamlDocument>, tag: string, identifierKeys: Array<string> = []): Array<YamlDocument> {
    const gameObjects: Array<YamlDocument> = sceneObject.filter((so: YamlDocument) => {
      if (so.tag !== this.documentNameToIdentifier.get(tag)) {
        return false;
      }

      if (identifierKeys.length === 0) {
        return true;
      }

      const gameObject: any = (so.data as Record<string, any>)[tag];
      const gameObjectKeys = Object.keys(gameObject);

      return identifierKeys.every((param) => gameObjectKeys.includes(param));
    });

    if (gameObjects.length === 0) {
      throw Error(`Invalid ${tag} no matches found`);
    }

    return gameObjects;
  }

  private getObjectInYamlDocument(sceneObject: Array<YamlDocument>, tag: string, identifierKeys: Array<string> = [], parameterKey: string) {
    const gameObjects: Array<YamlDocument> = this.getYamlDocuments(sceneObject, tag, identifierKeys);

    if (gameObjects.length !== 1) {
      throw Error(`Invalid ${tag} with identifiers ${identifierKeys}. Too many matches found ${gameObjects.length}`);
    }

    const parentKey: string = this.findKeyByValue(this.documentNameToIdentifier, gameObjects[0]!.tag);
    const parentObject = this.getValue(gameObjects[0]!, parentKey);

    return parentObject[parameterKey];
  }

  private updateSceneObject(sceneObject: Array<YamlDocument>, tag: string, identifierKeys: Array<string>, parameterKey: string, parameterValue: any): void {
    const gameObjects: Array<YamlDocument> = sceneObject.filter((so: YamlDocument) => {
      if (so.tag !== this.documentNameToIdentifier.get(tag)) {
        return false;
      }

      const gameObject: any = (so.data as Record<string, any>)[tag];
      const gameObjectKeys = Object.keys(gameObject);

      return identifierKeys.every((param) => gameObjectKeys.includes(param));
    });

    if (gameObjects.length !== 1) {
      throw Error(`Invalid ${tag}: ${gameObjects.length} | ${gameObjects}`);
    }

    (gameObjects[0]!.data as Record<string, any>)[tag][parameterKey] = parameterValue;
  }

  private findKeyByValue(map: Map<any, any>, value: any): string {
    for (let [key, val] of map.entries()) {
      if (val === value) {
        return key;
      }
    }

    throw Error(`Value: ${value} is not in map: ${map}`);
  }

  private getValue(document: YamlDocument, key: string): any {
    if (Array.isArray(document.data)) {
      return document.data.map(item => item[key]);
    }

    return document.data[key];
  }

  private findNodeByPath(root: SceneNode, targetPath: string): SceneNode | undefined {
    if (root.path === targetPath) {
      return root;
    }

    for (const child of root.children) {
      const result = this.findNodeByPath(child, targetPath);
      if (result) {
        return result;
      }
    }

    return undefined;
  }

  private readonly templateDirectory: string = './configurations/templates/';
  private readonly userInputDirectory: string = './configurations/user_defined_data/';
  private readonly outputInternalDirectory: string = './configurations/auto_generated_files_internal/';
  private readonly outputExternalDirectory: string = './configurations/auto_generated_files_external/';
  private readonly bitIndexToEightBitName: Array<string> = Object.keys(EightBitChunkName);

  private readonly unityHeader: string = '%YAML 1.1\n%TAG !u! tag:unity3d.com,2011:';
  private readonly documentNameToIdentifier: Map<string, UnityYamlTag> = new Map<string, UnityYamlTag>([
    ['GameObject', '--- !u!1'],
    ['Transform', '--- !u!4'],
    ['Camera', '--- !u!20'],
    ['Material', '--- !u!21'],
    ['MeshRenderer', '--- !u!23'],
    ['MeshFilter', '--- !u!33'],
    ['OcclusionCullingSettings', '--- !u!29'],
    ['AnimationClip', '--- !u!74'],
    ['AudioListener', '--- !u!81'],
    ['AnimatorController', '--- !u!91'],
    ['Animator', '--- !u!95'],
    ['RenderSettings', '--- !u!104'],
    ['Light', '--- !u!108'],
    ['MonoBehaviour', '--- !u!114'],
    ['LightmapSettings', '--- !u!157'],
    ['NavMeshSettings', '--- !u!196'],
    ['BlendTree', '--- !u!206'],
    ['PrefabInstance', '--- !u!1001'],
    ['AnimatorStateTransition', '--- !u!1101'],
    ['AnimatorState', '--- !u!1102'],
    ['AnimatorStateMachine', '--- !u!1107'],
    ['SceneRoots', '--- !u!1660057539'],
  ]);

  private readonly inputData: Array<string> = FileService.getFileJson(this.userInputDirectory + 'input.json');
  private readonly configData: ConfigData = FileService.getFileJson(this.userInputDirectory + 'config.json');
}


interface AnimatorData {
  name: Array<string>;
  animatorStateMachineId: Array<string>;
  animatorStateId: Array<string>;
  animatorStateTransitionId: Array<string>;
  blendTreeId: Array<string>;
  minThreshold: Array<number>;
  maxThreshold: Array<number>;
}

interface ConfigData {
  sceneName: string;
  parentFolderPath: string;
}

interface SceneNode {
  path: string;
  gameObject: YamlDocument;
  transform: YamlDocument;
  meshRenderer: YamlDocument | undefined;
  children: Array<SceneNode>;
  parent: YamlDocument | undefined;
};