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

export class GenerateUnityFiles {
  public generateFiles(): void {
    this.clearDirectories();
    this.generateDataMapped();
    this.generateGameObjectMap();
    this.generateVrcExpressionParamters();
    this.generateAnimations();
    this.generateAnimatorController();
    this.generateShadersAndMaterials();
  }



  private generateUniqueId(): number {
    return Math.floor(Math.random() * (999999999 - 100000000 + 1)) + 100000000;
  }

  private generateGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character: string) => {
      const randomNumber: number = (Math.random() * 16) | 0;
      const randomValue: number = character === 'x' ? randomNumber : (randomNumber & 0x3) | 0x8;
      return randomValue.toString(16);
    }).replaceAll('-', '');
  }

  private clearDirectories(): void {
    FileService.clearDirectory(this.outputInternalDirectory.slice(0, -1));
    FileService.clearDirectory(this.outputExternalDirectory.slice(0, -1));
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

  private generateDataMapped(): void {
    let startIndex: number = 0;
    const bitAllocations: Array<BitAllocation> = [];
    const configData: Array<BitAllocation> = FileService.getFileJson(this.userInputDirectory + 'data.json');
    const inputData: Array<string> = FileService.getFileJson(this.userInputDirectory + 'input.json');

    // Sort configData by size in descending order
    const sortedConfigData = configData.sort((a, b) => b.size - a.size);

    for (const bitAllocation of sortedConfigData) {
      const range: { start: number, end: number } = {
        start: startIndex,
        end: startIndex + bitAllocation.size - 1
      };

      const res: BitAllocation = {
        ...bitAllocation,
        range: range,
        msbName: this.bitIndexToEightBitName[(range.start - range.start % 8) / 8]!,
        lsbName: this.bitIndexToEightBitName[(range.start - range.start % 8) / 8 + 1]!,
        bitIndex: range.start % 8,
        shaderParameters: [`LSB${bitAllocation.shaderParameters}`, `MSB${bitAllocation.shaderParameters}`]
      };
      startIndex += bitAllocation.size;
      bitAllocations.push(res);
    }

    const allocatedBitsSize: number = bitAllocations.reduce((acc, val) => acc + val.size, 0);
    const allocatedInputBitsSize: number = inputData.length; // Input data is array of 1-bits
    const overflowBits: number = allocatedBitsSize % 8;

    if (overflowBits !== 0) {
      const minrange: number = allocatedBitsSize - overflowBits;
      const overflows: Array<BitAllocation> = bitAllocations.filter(b => b.range.start >= minrange);

      // Filter out the overflow bit allocations from the original array
      const nonOverflows: Array<BitAllocation> = bitAllocations.filter(b => b.range.start < minrange);
      const lastChunkBeforeOverflow: string = nonOverflows[nonOverflows.length - 1]!.lsbName;

      nonOverflows
        .filter((bitAllocation: BitAllocation) => bitAllocation.lsbName === lastChunkBeforeOverflow)
        .forEach((bitAllocation: BitAllocation) => bitAllocation.lsbName = bitAllocation.msbName);

      // Handle the overflow allocations
      overflows.forEach((overflow, index) => {
        for (let i = 0; i < overflow.size; i++) {
          nonOverflows.push({
            range: { start: overflow.range.start + i, end: overflow.range.start + i },
            size: 1,
            name: overflow.name,
            lsbName: `Overflow_${index}_${i}`,
            msbName: `Overflow_${index}_${i}`,
            bitIndex: 0,
            objectNames: overflow.objectNames,
            shaderParameters: overflow.shaderParameters,
          });
        }
      });

      // Update the bitAllocations with the new list
      bitAllocations.length = 0;
      bitAllocations.push(...nonOverflows);
    }

    if (allocatedBitsSize + allocatedInputBitsSize > 256) {
      throw new Error(`Too many bits allocated (limit 256): ${allocatedBitsSize} + ${allocatedInputBitsSize}`);
    }

    FileService.writeToFile(this.outputInternalDirectory + 'data_mapped.json', bitAllocations);
  }

  private generateVrcExpressionParamters(): void {
    const dataConfigurations: Array<BitAllocation> = FileService.getFileJson(this.outputInternalDirectory + 'data_mapped.json');
    const dataInputs: Array<string> = FileService.getFileJson(this.userInputDirectory + 'input.json');

    const chunks: Array<string> = [];
    const overflowingBits: Array<string> = [];

    dataConfigurations.forEach((data: BitAllocation) => {
      if (data.lsbName.includes('Overflow')) {
        if (!overflowingBits.includes(data.lsbName)) {
          overflowingBits.push(data.lsbName);
        }

        return;
      }

      if (!chunks.includes(data.lsbName)) {
        chunks.push(data.lsbName);
      }
      if (!chunks.includes(data.msbName)) {
        chunks.push(data.msbName);
      }
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
          parameters: chunks.map((chunk) => {
            return {
              name: chunk,
              valueType: 0, // 0 == 8-bit integer
              saved: 0,
              defaultValue: 0,
              networkSynced: 1
            }
          }).concat(overflowingBits.map((overflow) => {
            return {
              name: overflow,
              valueType: 2, // 2 == boolean
              saved: 0,
              defaultValue: 0,
              networkSynced: 1
            }
          }).concat(dataInputs.map((input) => {
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

    FileService.createYamlDocuments(yamlDocument, this.unityHeader, this.outputExternalDirectory + 'Vrchat/VRCExpressionParameters.asset');
    FileService.createYamlDocument(yamlMetadata, null, this.outputExternalDirectory + 'Vrchat/VRCExpressionParameters.asset.meta');
  }

  private generateAnimations(): void {
    const data: Array<BitAllocation> = FileService.getFileJson(this.outputInternalDirectory + 'data_mapped.json');
    const uniqueStartNames: Array<string> = [...new Set(data.flatMap(allocation => [allocation.lsbName, allocation.msbName]))];

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

    const generateGenericBinding = (pathId: number, attributeId: number): GenericBinding => {
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
          m_Curve: {
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
      const attributeId: number = this.generateUniqueId();
      const pathId: number = this.generateUniqueId();

      return [
        allocations.flatMap((allocation: BitAllocation): Array<FloatCurve> => {
          return allocation.objectNames.map((path: string) => generateFloatCurve(defaultValue, `_${allocation.shaderParameters[0]}`, path));
        }),

        allocations.flatMap((allocation: BitAllocation): Array<GenericBinding> => {
          return allocation.objectNames.map((_: string) => generateGenericBinding(pathId, attributeId));
        }),

        allocations.flatMap((allocation: BitAllocation): Array<EditorCurve> => {
          return allocation.objectNames.map((path: string) => generateEditorCurves(defaultValue, `_${allocation.shaderParameters[0]}`, path));
        })
      ];
    }


    for (const name of uniqueStartNames) {
      ['Start', 'End'].forEach((suffix: string) => {
        const maxValue: number = name.includes('Overflow') ? 1 : 255;

        const [newFloatCurves, newGenericBindings, newEditorCurves] = generateAnimationPairData(suffix, data.filter((bitAllocation: BitAllocation) => bitAllocation.lsbName === name).map((bitAllocation: BitAllocation) => {
          return {
            ...bitAllocation,
            shaderParameters: [
              bitAllocation.shaderParameters[0]!
            ]
          }
        }), maxValue);

        const [newFloatCurves2, newGenericBindings2, newEditorCurves2] = generateAnimationPairData(suffix, data.filter((bitAllocation: BitAllocation) => bitAllocation.msbName === name).map((bitAllocation: BitAllocation) => {
          return {
            ...bitAllocation,
            shaderParameters: [
              bitAllocation.shaderParameters[1]!
            ]
          }
        }), maxValue);

        const floatCurves: Array<FloatCurve> = [...newFloatCurves, ...newFloatCurves2];
        const genericBindings: Array<GenericBinding> = [...newGenericBindings, ...newGenericBindings2];
        const editorCurves: Array<EditorCurve> = [...newEditorCurves, ...newEditorCurves2];

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

  private generateAnimatorController(): void {
    const mapJsonConfig = () => {
      const data: Array<BitAllocation> = FileService.getFileJson(this.outputInternalDirectory + 'data_mapped.json');
      const uniqueNames: Set<string> = new Set();

      for (const item of data) {
        uniqueNames.add(item.lsbName);
        uniqueNames.add(item.msbName);
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

    const generateAnimatorLayer = (name: string, animatorStateMachineId: number): AnimationLayer => {
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

    const generateAnimatorState = (animatorStateTransitionId: number, blendTreeId: number): AnimatorState => {
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

    const generateAnimatorStateMachine = (name: string, animatorStateId: number): AnimatorStateMachine => {
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

    const generateBlendTree = (name: string, motionStartGuid: string, motionEndGuid: string, minThreshold: number, maxThreshold: number): BlendTree => {
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
              m_Motion: { fileID: 7400000, guid: motionStartGuid, type: 2 },
              m_Threshold: minThreshold,
              m_Position: { x: 0, y: 0 },
              m_TimeScale: 1,
              m_CycleOffset: 0,
              m_DirectBlendParameter: name,
              m_Mirror: 0,
            },
            {
              serializedVersion: 2,
              m_Motion: { fileID: 7400000, guid: motionEndGuid, type: 2 },
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
    const animationNames: Array<string> = FileService.getFileNamesInDir(this.outputExternalDirectory + 'Animations').filter((v: string) => v.includes('.meta'));

    const animatorParameters: Array<AnimationParamter> = jsonData.name.map((name: string) => generateAnimatorParameter(name));
    const animatorLayers: Array<AnimationLayer> = jsonData.name.map((name: string, index: number) => generateAnimatorLayer(name, jsonData.animatorStateMachineId[index]!));

    const yamls: Array<YamlDocument> = [
      {
        tag: this.documentNameToIdentifier.get('AnimatorController')!,
        anchor: this.generateUniqueId(),
        data: {
          AnimatorController: generateAnimatorController(animatorParameters, animatorLayers)
        }
      }
    ];

    for (let i = 0; i < jsonData.name.length; i++) {
      const name: string = jsonData.name[i]!;
      const animatorStateId: number = jsonData.animatorStateId[i]!;
      const animatorStateTransitionId: number = jsonData.animatorStateTransitionId[i]!;
      const blendTreeId: number = jsonData.blendTreeId[i]!;
      const minT: number = jsonData.minThreshold[i]!;
      const maxT: number = jsonData.maxThreshold[i]!;
      const startAnimationName: string = `${this.outputExternalDirectory}Animations/${animationNames.filter((v: string) => v === `${name}_Start.anim.meta`).find(v => v.includes('_Start'))}`;
      const endAnimationName: string = `${this.outputExternalDirectory}Animations/${animationNames.filter((v: string) => v === `${name}_End.anim.meta`).find(v => v.includes('_End'))}`;
      const motionStartGuid: string = FileService.findInFile(startAnimationName, /guid: ([a-f0-9]+)/g).replace('guid: ', '');
      const motionEndGuid: string = FileService.findInFile(endAnimationName, /guid: ([a-f0-9]+)/g).replace('guid: ', '');

      yamls.push({
        tag: this.documentNameToIdentifier.get('AnimatorStateMachine')!,
        anchor: this.generateUniqueId(),
        data: [generateAnimatorStateMachine(name, animatorStateId)]
      });
      yamls.push({
        tag: this.documentNameToIdentifier.get('AnimatorState')!,
        anchor: this.generateUniqueId(),
        data: [generateAnimatorState(animatorStateTransitionId, blendTreeId)]
      });
      yamls.push({
        tag: this.documentNameToIdentifier.get('AnimatorStateTransition')!,
        anchor: this.generateUniqueId(),
        data: [generateAnimatorStateTransition()]
      });
      yamls.push({
        tag: this.documentNameToIdentifier.get('BlendTree')!,
        anchor: this.generateUniqueId(),
        data: [generateBlendTree(name, motionStartGuid, motionEndGuid, minT, maxT)]
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

    FileService.createYamlDocuments(yamls, this.unityHeader, this.outputExternalDirectory + 'Animations/FX.controller');
    FileService.createYamlDocument(metadata, null, this.outputExternalDirectory + 'Animations/FX.controller.meta');
  }

  private generateShadersAndMaterials(): void {
    const data: Array<Array<string>> = FileService.getFileJson(this.outputInternalDirectory + 'data_game_object_shader_parameter_map.json');
    const data2: Array<BitAllocation> = FileService.getFileJson(this.outputInternalDirectory + 'data_mapped.json');

    for (const [index, [key, values]] of Object.entries(data).entries()) {
      const shaderProperties: Array<string> = [];
      const shaderVariables: Array<string> = [];
      const matFloats: Array<string> = [];
      const propertiesLines: Array<string> = key.split(', ');

      for (let i = 0; i < propertiesLines.length; i++) {
        const prop: string = propertiesLines[i]!;
        shaderProperties.push(`_${prop} ("${prop}", Range(0,255)) = 0`);
        shaderVariables.push(`float _${prop};`);
        matFloats.push(`- _${prop}: 0`);

        if (prop.includes('LSB')) {
          const text = prop.replace('LSB', '');
          shaderProperties.push(`_Index${text} ("Index${text}", Range(0,15)) = 0`);
          shaderVariables.push(`float _Index${text};`);
          matFloats.push(`- _Index${text}: -1`);
        }
      }

      const shaderPropertiesString = shaderProperties.sort().join('\n        ');
      const shaderVariablesString = shaderVariables.sort().join('\n        ');

      const shaderFilePath: string = this.outputExternalDirectory + `/Materials/shader_${index + 1}.shader`;
      const shaderMetaFilePath: string = this.outputExternalDirectory + `/Materials/shader_${index + 1}.shader.meta`;
      const shaderGuid: string = this.generateGuid();
      // TODO fix shader template functions
      FileService.copyFile(this.templateDirectory + 'shader_base.shader', shaderFilePath);
      FileService.replaceInFile(shaderFilePath, '__[REPLACEME_PROPERTIES]__', shaderPropertiesString);
      FileService.replaceInFile(shaderFilePath, '__[REPLACEME_VARIABLES]__', shaderVariablesString);

      FileService.copyFile(this.templateDirectory + 'shader_base.shader.meta', shaderMetaFilePath);
      FileService.replaceInFile(shaderMetaFilePath, '__[REPLACEME]__', shaderGuid);

      for (const matNam of values) {
        const matName: string = matNam.replace('/', '_');
        const matFilePath: string = this.outputExternalDirectory + `/Materials/${matName}.mat`;
        const matFileMetaPath: string = this.outputExternalDirectory + `/Materials/${matName}.mat.meta`;
        const matFloatsString: string = matFloats
          .sort()
          .map((matFloat: string) => {
            if (!(matFloat.includes(': -1') && matFloat.includes('- _Index'))) {
              return matFloat;
            }

            const shaderParameterNameWithoutPrefix: string = matFloat.replace(/- _Index|:.*/g, '');
            const relevantData: Array<BitAllocation> = data2.filter((d: BitAllocation) => d.shaderParameters.some((e: string) => e.includes(shaderParameterNameWithoutPrefix)))
            const matchingAllocation: BitAllocation = relevantData.find((v) => v.objectNames.some(o => o === matNam))!;

            return matFloat.replace('-1', `${matchingAllocation.bitIndex}`);
          })
          .join('\n    ');

        FileService.copyFile(this.templateDirectory + 'shader_material_base.mat', matFilePath);
        FileService.replaceInFile(matFilePath, '__[REPLACEME_MATERIAL_NAME]__', matName);
        FileService.replaceInFile(matFilePath, '__[SHADER_GUID]__', shaderGuid);
        FileService.replaceInFile(matFilePath, '__[REPLACEME_FLOATS]__', matFloatsString);

        FileService.copyFile(this.templateDirectory + 'shader_material_base.mat.meta', matFileMetaPath);
        FileService.replaceInFile(matFileMetaPath, '__[REPLACEME]__', this.generateGuid());
      }
    }
  }

  private readonly templateDirectory: string = './configurations/templates/';
  private readonly userInputDirectory: string = './configurations/user_defined_data/';
  private readonly outputInternalDirectory: string = './configurations/auto_generated_files_internal/';
  private readonly outputExternalDirectory: string = './configurations/auto_generated_files_external/';
  private readonly bitIndexToEightBitName: Array<string> = Object.keys(EightBitChunkName);

  private readonly unityHeader: string = '%YAML 1.1\n%TAG !u! tag:unity3d.com,2011:';
  private readonly documentNameToIdentifier: Map<string, UnityYamlTag> = new Map<string, UnityYamlTag>([
    ['AnimationClip', '--- !u!74',],
    ['AnimatorController', '--- !u!91',],
    ['MonoBehaviour', '--- !u!114',],
    ['BlendTree', '--- !u!206',],
    ['AnimatorStateTransition', '--- !u!1101',],
    ['AnimatorState', '--- !u!1102',],
    ['AnimatorStateMachine', '--- !u!1107',],
  ]);
}


interface AnimatorData {
  name: Array<string>;
  animatorStateMachineId: Array<number>;
  animatorStateId: Array<number>;
  animatorStateTransitionId: Array<number>;
  blendTreeId: Array<number>;
  minThreshold: Array<number>;
  maxThreshold: Array<number>;
}