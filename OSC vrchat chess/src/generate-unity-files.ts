// @ts-ignore
import fs from 'fs-extra';
import { BitAllocation } from './models/bit_allocation';

export class GenerateUnityFiles {
  public generateFiles(): void {
    this.generateDataMapped();
    this.generateGameObjectMap();
    this.generateAnimations();
    this.generateVrcExpressionParamters();
    this.generateAnimatorController();
    this.generateShadersAndMaterials();
  }

  private getFile(path: string): string {
    return fs.readFileSync(path, 'utf8');
  }

  private writeToFile(path: string, val: string | object): void {
    const content = typeof val === 'string' ? val : JSON.stringify(val, null, 2);
    fs.outputFileSync(path, content);
  }

  private copyFile(sourcePath: string, destinationPath: string): void {
    fs.copySync(sourcePath, destinationPath);
  }

  private createFile(path: string): void {
    fs.ensureFileSync(path);
  }

  private appendToFile(path: string, data: string): void {
    fs.appendFileSync(path, data);
  }

  private getFileNamesInDir(directoryPath: string): Array<string> {
    return fs.readdirSync(directoryPath);
  }

  private findInFile(path: string, regex: RegExp): string {
    const data = this.getFile(path);
    const matches = data.match(regex) || [];

    if (matches.length > 1) {
      throw Error(`Too many matches in findInFile ${path} | ${regex}`);
    }

    return matches.pop()!;
  }

  private replaceInFile(path: string, placeholder: string, replacement: string): void {
    const content = this.getFile(path).replace(placeholder, replacement);
    fs.outputFileSync(path, content);
  }

  private generateUniqueId(): number {
    return Math.floor(Math.random() * (999999999 - 100000000 + 1)) + 100000000;
  }

  private generateGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character: string) => {
      const randomNumber: number = (Math.random() * 16) | 0;
      const randomValue: number = character === 'x' ? randomNumber : (randomNumber & 0x3) | 0x8;
      return randomValue.toString(16);
    });
  }

  private generateGameObjectMap(): void {
    this.createFile(this.outputInternalDirectory + 'data_game_object_shader_parameter_map.json');
    const gameObjectToShaders: GameObjectToShaders = {};
    const shaderToGameObjectMap: ShaderToGameObjectMap = {};

    // Read the JSON data from the file
    const entries: Entry[] = JSON.parse(this.getFile(this.outputInternalDirectory + 'data_mapped.json'));

    // First, map each game object to all its shader parameters
    for (const entry of entries) {
      const objectNames: Array<string> = entry.objectNames;
      const shaderParameters = new Set<string>(entry.shaderParameters);

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

    this.writeToFile(this.outputInternalDirectory + 'data_game_object_shader_parameter_map.json', finalMap);
  }

  private generateDataMapped(): void {
    this.createFile(this.outputInternalDirectory + 'data_mapped.json');
    let startIndex: number = 0;
    const bitAllocations: Array<BitAllocation> = [];
    const data: Array<BitAllocation> = JSON.parse(this.getFile(this.userInputDirectory + 'data.json'))
    for (const bitAllocation of data) {
      const range: { start: number, end: number } = {
        'start': startIndex,
        'end': startIndex + bitAllocation.size
      };

      const res: BitAllocation = {
        ...bitAllocation,
        'range': range,
        'startName': this.bitIndexToEightBitName[(range['start'] - range['start'] % 8) / 8]!,
        'endName': this.bitIndexToEightBitName[(range['start'] - range['start'] % 8) / 8 + 1]!,
        'bitIndex': range['start'] % 16
      }
      startIndex += bitAllocation.size;
      bitAllocations.push(res)
    }


    const allocatedBitsSize: number = bitAllocations.reduce((acc, val) => acc + val.size, 0);
    const overflowBits: number = allocatedBitsSize % 8;
    let overflowNumber: number = 1

    if (overflowBits !== 0) {
      for (let i = bitAllocations.length - overflowBits; i < bitAllocations.length; i++) {
        bitAllocations[i]!.startName = `Overflow_bit_${overflowNumber}`;
        bitAllocations[i]!.endName = `Overflow_bit_${overflowNumber}`;
        overflowNumber += 1;
      }
    }

    if (allocatedBitsSize > 256) {
      throw new Error(`Too many bits allocated (limit 256): ${allocatedBitsSize}`)
    }

    this.writeToFile(this.outputInternalDirectory + 'data_mapped.json', bitAllocations);
  }

  private generateAnimations(): void {
    const b = (name: string, valueType: number, saved: number, defaultValue: number, networkSynced: number) => {
      return `
  - name: ${name}
    valueType: ${valueType}
    saved: ${saved}
    defaultValue: ${defaultValue}
    networkSynced: ${networkSynced}`;
    };

    const c = (input: string) => {
      const data = JSON.parse(this.getFile(input));
      const chunks: Array<string> = [];
      const overflows: Array<string> = [];

      for (const d of data) {
        if (!d.startName.includes('Overflow')) {
          if (!chunks.includes(d.startName)) {
            chunks.push(d.startName);
          }
          if (!chunks.includes(d.endName)) {
            chunks.push(d.endName);
          }
        }
        else if (!overflows.includes(d.startName)) {
          overflows.push(d.startName)
        }
      }

      return chunks.map((chunk) => {
        return {
          name: chunk,
          valueType: 0,
          saved: 0,
          defaultValue: 0,
          networkSynced: 1
        }
      }).concat(overflows.map((overflow) => {
        return {
          name: overflow,
          valueType: 1,
          saved: 0,
          defaultValue: 0,
          networkSynced: 1
        }
      }));
    };


    const outputPath = this.outputExternalDirectory + 'vrchat/VRCExpressionParameters.asset';
    const outputMetaPath = this.outputExternalDirectory + 'vrchat/VRCExpressionParameters.asset.meta';

    this.copyFile(this.templateDirectory + "animator_controller_base.controller.meta", outputMetaPath);
    this.replaceInFile(outputMetaPath, '__[REPLACEME]__', this.generateGuid());

    this.copyFile(this.templateDirectory + 'vrc_expression_parameters.asset', outputPath);

    for (const row of c(this.outputInternalDirectory + 'data_mapped.json')) {
      this.appendToFile(outputPath, b(row.name, row.valueType, row.saved, row.defaultValue, row.networkSynced));
    }
  }

  private generateVrcExpressionParamters(): void {
    function mapJsonConfig(inputPath: string, that: any): Record<string, ShaderData> {
      const data = JSON.parse(that.getFile(inputPath));

      const groupedData: Record<string, ShaderData> = {};

      for (const item of data) {
        const startShader: string = `${item.startName}_start`;
        const endShader: string = `${item.endName}_end`;

        if (!groupedData[startShader]) {
          groupedData[startShader] = { objectNames: [], shaderParameters: new Set<string>() };
        }
        if (!groupedData[endShader]) {
          groupedData[endShader] = { objectNames: [], shaderParameters: new Set<string>() };
        }

        groupedData[startShader]!.objectNames.push(...item.objectNames);
        groupedData[endShader]!.objectNames.push(...item.objectNames);
        item.shaderParameters.forEach((param: string) => {
          groupedData[startShader]!.shaderParameters.add(param);
          groupedData[endShader]!.shaderParameters.add(param);
        });
      }

      for (const shader in groupedData) {
        groupedData[shader]!.shaderParameters = new Set([...groupedData[shader]!.shaderParameters]);
      }

      return groupedData;
    }

    function generateFloatCurve(value: number, attribute: string, path: string): string {
      return `
      - serializedVersion: 2
        curve:
          serializedVersion: 2
          m_Curve:
          - serializedVersion: 3
            time: 0
            value: ${value}
            inSlope: 0
            outSlope: 0
            tangentMode: 136
            weightedMode: 0
            inWeight: 0.33333334
            outWeight: 0.33333334
          m_PreInfinity: 2
          m_PostInfinity: 2
          m_RotationOrder: 4
        attribute: material.${attribute}
        path: ${path}
        classID: 23
        script: {fileID: 0}
        flags: 16`;
    }

    function generateGenericBinding(pathId: number, attributeId: number): string {
      return `
        - serializedVersion: 2
          path: ${pathId}
          attribute: ${attributeId}
          script: {fileID: 0}
          typeID: 23
          customType: 22
          isPPtrCurve: 0
          isIntCurve: 0
          isSerializeReferenceCurve: 0`;
    }

    function generateEditorCurves(value: number, attribute: string, path: string): string {
      return `
      - serializedVersion: 2
        curve:
          serializedVersion: 2
          m_Curve:
          - serializedVersion: 3
            time: 0
            value: ${value}
            inSlope: 0
            outSlope: 0
            tangentMode: 136
            weightedMode: 0
            inWeight: 0.33333334
            outWeight: 0.33333334
          m_PreInfinity: 2
          m_PostInfinity: 2
          m_RotationOrder: 4
        attribute: material.${attribute}
        path: ${path}
        classID: 23
        script: {fileID: 0}
        flags: 16`;
    }

    function generateAnimationClip(name: string, floatCurves: string, genericBindings: string, editorCurves: string): string {
      return `
    AnimationClip:
      m_ObjectHideFlags: 0
      m_CorrespondingSourceObject: {fileID: 0}
      m_PrefabInstance: {fileID: 0}
      m_PrefabAsset: {fileID: 0}
      m_Name: ${name}
      serializedVersion: 7
      m_Legacy: 0
      m_Compressed: 0
      m_UseHighQualityCurve: 1
      m_RotationCurves: []
      m_CompressedRotationCurves: []
      m_EulerCurves: []
      m_PositionCurves: []
      m_ScaleCurves: []
      m_FloatCurves: ${floatCurves}
      m_PPtrCurves: []
      m_SampleRate: 60
      m_WrapMode: 0
      m_Bounds:
        m_Center: {x: 0, y: 0, z: 0}
        m_Extent: {x: 0, y: 0, z: 0}
      m_ClipBindingConstant:
        genericBindings: ${genericBindings}
        pptrCurveMapping: []
      m_AnimationClipSettings:
        serializedVersion: 2
        m_AdditiveReferencePoseClip: {fileID: 0}
        m_AdditiveReferencePoseTime: 0
        m_StartTime: 0
        m_StopTime: 0
        m_OrientationOffsetY: 0
        m_Level: 0
        m_CycleOffset: 0
        m_HasAdditiveReferencePose: 0
        m_LoopTime: 0
        m_LoopBlend: 0
        m_LoopBlendOrientation: 0
        m_LoopBlendPositionY: 0
        m_LoopBlendPositionXZ: 0
        m_KeepOriginalOrientation: 0
        m_KeepOriginalPositionY: 1
        m_KeepOriginalPositionXZ: 0
        m_HeightFromFeet: 0
        m_Mirror: 0
      m_EditorCurves: ${editorCurves}
      m_EulerEditorCurves: []
      m_HasGenericRootTransform: 0
      m_HasMotionFloatCurves: 0
      m_Events: []`;
    }

    const data: Record<string, ShaderData> = mapJsonConfig(this.outputInternalDirectory + 'data_mapped.json', this);

    for (const [key, value] of Object.entries(data)) {
      const nameBase: string = key.split(key.includes("_start") ? "_start" : "_end").slice(0, -1).join("_");

      ['Start', 'End'].forEach((suffix: string) => {
        const defaultValue: number = suffix === 'Start' ? 0 : 255;
        const attributeId: number = this.generateUniqueId();
        const pathId: number = this.generateUniqueId();
        const outputPath: string = `${this.outputExternalDirectory}animations/${nameBase}_${suffix}.anim`;
        const outputMetaPath: string = `${this.outputExternalDirectory}animations/${nameBase}_${suffix}.anim.meta`;
        const floatCurves: string = value.objectNames.flatMap((path: string) => Array.from(value.shaderParameters).map((attribute: string) => generateFloatCurve(defaultValue, attribute, path))).join("");
        const genericBindings: string = new Array(value.objectNames.length * value.shaderParameters.size).fill(generateGenericBinding(pathId, attributeId)).join("");
        const editorCurves: string = value.objectNames.flatMap((path: string) => Array.from(value.shaderParameters).map((attribute: string) => generateEditorCurves(defaultValue, attribute, path))).join("");

        this.copyFile(this.templateDirectory + "animation_base.anim", outputPath);
        this.appendToFile(outputPath, generateAnimationClip(`${nameBase}_${suffix}`, floatCurves, genericBindings, editorCurves));

        this.copyFile(this.templateDirectory + "animation_base.anim.meta", outputMetaPath);
        this.replaceInFile(outputMetaPath, '__[REPLACEME]__', this.generateGuid());
      });
    }
  }

  private generateAnimatorController(): void {
    function mapJsonConfig(input_path: string, that: any) {
      const data: Array<{ startName: string, endName: string }> = JSON.parse(that.getFile(input_path));
      const uniqueNames: Set<string> = new Set();

      for (const item of data) {
        uniqueNames.add(item.startName);
        uniqueNames.add(item.endName);
      }

      const uniqueNameList: Array<string> = Array.from(uniqueNames).sort();

      const animatorData: D = {
        'name': uniqueNameList,
        'animator_state_machine_id': new Array(uniqueNameList.length).fill(that.generateUniqueId()),
        'animator_state_id': new Array(uniqueNameList.length).fill(that.generateUniqueId()),
        'animator_state_transition_id': new Array(uniqueNameList.length).fill(that.generateUniqueId()),
        'blend_tree_id': new Array(uniqueNameList.length).fill(that.generateUniqueId()),
        'min_threshold': new Array(uniqueNameList.length).fill(0),
        'max_threshold': new Array(uniqueNameList.length).fill(255),
      };

      return animatorData;
    }

    function generateAnimatorParameter(name: string): string {
      const template = `
  - m_Name: ${name}
    m_Type: 1
    m_DefaultFloat: 0
    m_DefaultInt: 0
    m_DefaultBool: 0
    m_Controller: {fileID: 9100000}`;
      return template;
    }

    function generateAnimatorLayer(name: string, animatorStateMachineId: string): string {
      const template = `
  - serializedVersion: 5
    m_Name: ${name}
    m_StateMachine: {fileID: ${animatorStateMachineId}}
    m_Mask: {fileID: 0}
    m_Motions: []
    m_Behaviours: []
    m_BlendingMode: 0
    m_SyncedLayerIndex: -1
    m_DefaultWeight: 1
    m_IKPass: 0
    m_SyncedLayerAffectsTiming: 0
    m_Controller: {fileID: 9100000}`;
      return template;
    }

    function generateAnimatorController(animatorParamaters: string, animatorLayers: string) {
      const template = `
--- !u!91 &9100000
AnimatorController:
  m_ObjectHideFlags: 0
  m_CorrespondingSourceObject: {fileID: 0}
  m_PrefabInstance: {fileID: 0}
  m_PrefabAsset: {fileID: 0}
  m_Name: FX
  serializedVersion: 5
  m_AnimatorParameters:${animatorParamaters}
  m_AnimatorLayers:${animatorLayers}`;
      return template;
    }

    function generateAnimatorState(animatorStateId: string, animatorStateTransitionId: string, blendTreeId: string) {
      const template = `
--- !u!1102 &${animatorStateId}
AnimatorState:
  serializedVersion: 6
  m_ObjectHideFlags: 1
  m_CorrespondingSourceObject: {fileID: 0}
  m_PrefabInstance: {fileID: 0}
  m_PrefabAsset: {fileID: 0}
  m_Name: Blend Tree
  m_Speed: 1
  m_CycleOffset: 0
  m_Transitions:
  - {fileID: ${animatorStateTransitionId}}
  m_StateMachineBehaviours: []
  m_Position: {x: 50, y: 50, z: 0}
  m_IKOnFeet: 0
  m_WriteDefaultValues: 1
  m_Mirror: 0
  m_SpeedParameterActive: 0
  m_MirrorParameterActive: 0
  m_CycleOffsetParameterActive: 0
  m_TimeParameterActive: 0
  m_Motion: {fileID: ${blendTreeId}}
  m_Tag: 
  m_SpeedParameter: 
  m_MirrorParameter: 
  m_CycleOffsetParameter: 
  m_TimeParameter: `
      return template;
    }

    function generateAnimatorStateMachine(name: string, animatorStateMachineId: string, animatorStateId: string) {
      const template = `
--- !u!1107 &${animatorStateMachineId}
AnimatorStateMachine:
  serializedVersion: 6
  m_ObjectHideFlags: 1
  m_CorrespondingSourceObject: {fileID: 0}
  m_PrefabInstance: {fileID: 0}
  m_PrefabAsset: {fileID: 0}
  m_Name: ${name}
  m_ChildStates:
  - serializedVersion: 1
    m_State: {fileID: ${animatorStateId}}
    m_Position: {x: 300, y: 120, z: 0}
  m_ChildStateMachines: []
  m_AnyStateTransitions: []
  m_EntryTransitions: []
  m_StateMachineTransitions: {}
  m_StateMachineBehaviours: []
  m_AnyStatePosition: {x: 50, y: 20, z: 0}
  m_EntryPosition: {x: 50, y: 120, z: 0}
  m_ExitPosition: {x: 600, y: 120, z: 0}
  m_ParentStateMachinePosition: {x: 600, y: 20, z: 0}
  m_DefaultState: {fileID: ${animatorStateId}}`
      return template;
    }

    function generateBlendTree(name: string, blendTreeId: string, motionStartGuid: string, motionEndGuid: string, minThreshold: string, maxThreshold: string) {
      const template = `
--- !u!206 &${blendTreeId}
BlendTree:
  m_ObjectHideFlags: 1
  m_CorrespondingSourceObject: {fileID: 0}
  m_PrefabInstance: {fileID: 0}
  m_PrefabAsset: {fileID: 0}
  m_Name: Blend Tree
  m_Childs:
  - serializedVersion: 2
    m_Motion: {fileID: 7400000, guid: ${motionStartGuid}, type: 2}
    m_Threshold: ${minThreshold}
    m_Position: {x: 0, y: 0}
    m_TimeScale: 1
    m_CycleOffset: 0
    m_DirectBlendParameter: {name}
    m_Mirror: 0
  - serializedVersion: 2
    m_Motion: {fileID: 7400000, guid: ${motionEndGuid}, type: 2}
    m_Threshold: ${maxThreshold}
    m_Position: {x: 0, y: 0}
    m_TimeScale: 1
    m_CycleOffset: 0
    m_DirectBlendParameter: ${name}
    m_Mirror: 0
  m_BlendParameter: ${name}
  m_BlendParameterY: ${name}
  m_MinThreshold: ${minThreshold}
  m_MaxThreshold: ${maxThreshold}
  m_UseAutomaticThresholds: 0
  m_NormalizedBlendValues: 0
  m_BlendType: 0`
      return template;
    }

    function generateAnimatorStateTransition(animatorStateTransitionId: string) {
      const template = `
    --- !u!1101 &${animatorStateTransitionId}
    AnimatorStateTransition:
      m_ObjectHideFlags: 1
      m_CorrespondingSourceObject: {fileID: 0}
      m_PrefabInstance: {fileID: 0}
      m_PrefabAsset: {fileID: 0}
      m_Name: 
      m_Conditions: []
      m_DstStateMachine: {fileID: 0}
      m_DstState: {fileID: 0}
      m_Solo: 0
      m_Mute: 0
      m_IsExit: 1
      serializedVersion: 3
      m_TransitionDuration: 0.25
      m_TransitionOffset: 0
      m_ExitTime: 0.75
      m_HasExitTime: 1
      m_HasFixedDuration: 1
      m_InterruptionSource: 0
      m_OrderedInterruption: 1
      m_CanTransitionToSelf: 1`;
      return template;
    }

    const animatiorControllerOutputPath: string = this.outputExternalDirectory + "FX.controller";
    const animatiorControllerMetaOutputPath: string = this.outputExternalDirectory + "FX.controller.meta";


    this.copyFile(this.templateDirectory + "animator_controller_base.controller.meta", animatiorControllerMetaOutputPath);
    this.replaceInFile(animatiorControllerMetaOutputPath, '__[REPLACEME]__', this.generateGuid());

    this.copyFile(this.templateDirectory + "animator_controller_base.controller", animatiorControllerOutputPath);
    const jsonData = mapJsonConfig(this.outputInternalDirectory + "data_mapped.json", this);


    const animatorParameters: string = jsonData['name'].map((name: string) => generateAnimatorParameter(name)).join("");
    const animatorLayers: string = jsonData['name'].map((name: string, index: number) => generateAnimatorLayer(name, jsonData['animator_state_machine_id'][index]!)).join("");

    this.appendToFile(animatiorControllerOutputPath, generateAnimatorController(animatorParameters, animatorLayers));


    const animationNames: Array<string> = this.getFileNamesInDir(this.outputExternalDirectory + 'animations').filter((v: string) => v.includes('.meta'));

    for (let i = 0; i < jsonData['name'].length; i++) {
      const name: string = jsonData['name'][i]!;
      const animatorStateMachineId: string = jsonData['animator_state_machine_id'][i]!;
      const animatorStateId: string = jsonData['animator_state_id'][i]!;
      const animatorStateTransitionId: string = jsonData['animator_state_transition_id'][i]!;
      const blendTreeId: string = jsonData['blend_tree_id'][i]!;
      const minT: string = jsonData['min_threshold'][i]!;
      const maxT: string = jsonData['max_threshold'][i]!;
      const foundString: Array<string> = animationNames.filter((v) => v.includes(v));
      const motionStartGuid: string = this.findInFile(`${this.outputExternalDirectory}animations/${foundString.find(v => v.includes('_Start'))}`, /guid: ([a-f0-9]+)/g);
      const motionEndGuid: string = this.findInFile(`${this.outputExternalDirectory}animations/${foundString.find(v => v.includes('_End'))}`, /guid: ([a-f0-9]+)/g);

      this.appendToFile(animatiorControllerOutputPath, generateAnimatorStateMachine(name, animatorStateMachineId, animatorStateId));
      this.appendToFile(animatiorControllerOutputPath, generateAnimatorState(animatorStateId, animatorStateTransitionId, blendTreeId));
      this.appendToFile(animatiorControllerOutputPath, generateAnimatorStateTransition(animatorStateTransitionId));
      this.appendToFile(animatiorControllerOutputPath, generateBlendTree(name, blendTreeId, motionStartGuid, motionEndGuid, minT, maxT));
    }
  }

  private generateShadersAndMaterials(): void {
    const data: Array<Array<string>> = JSON.parse(this.getFile(this.outputInternalDirectory + 'data_game_object_shader_parameter_map.json'));
    for (const [index, [key, values]] of Object.entries(data).entries()) {
      const shaderProperties: Array<string> = [];
      const shaderVariables: Array<string> = [];
      const matFloats: Array<string> = [];
      const propertiesLines: Array<string> = key.split(", ");

      for (let i = 0; i < propertiesLines.length; i++) {
        const prop: string = propertiesLines[i]!;
        shaderProperties.push(`_${prop} ("${prop}", Range(0,255)) = 0`);
        shaderVariables.push(`float _${prop};`);
        matFloats.push(`- _${prop}: 0`);

        if (prop.includes('First')) {
          const text = prop.replace('First', '');
          shaderProperties.push(`_Index${text} ("Index${text}", Range(0,15)) = 0`);
          shaderVariables.push(`float _Index${text};`);
          matFloats.push(`- _Index${text}: 0`);
        }
      }

      const shaderPropertiesString = shaderProperties.sort().join("\n        ");
      const shaderVariablesString = shaderVariables.sort().join("\n        ");
      const matFloatsString = matFloats.sort().join("\n    ");

      const shaderFilePath: string = this.outputExternalDirectory + `/materials/shader_${index + 1}.shader`;
      const shaderMetaFilePath: string = this.outputExternalDirectory + `/materials/shader_${index + 1}.shader.meta`;
      const shaderGuid: string = this.generateGuid();

      this.copyFile(this.templateDirectory + 'shader_base.shader', shaderFilePath);
      this.replaceInFile(shaderFilePath, '__[REPLACEME_PROPERTIES]__', shaderPropertiesString);
      this.replaceInFile(shaderFilePath, '__[REPLACEME_VARIABLES]__', shaderVariablesString);

      this.copyFile(this.templateDirectory + "shader_base.shader.meta", shaderMetaFilePath);
      this.replaceInFile(shaderMetaFilePath, '__[REPLACEME]__', shaderGuid);

      for (const mat_name of values.map((s: string) => s.replace('/', '_'))) {
        const matFilePath: string = this.outputExternalDirectory + `/materials/${mat_name}.mat`;
        const matFileMetaPath: string = this.outputExternalDirectory + `/ materials / ${mat_name}.mat.meta`;

        this.copyFile(this.templateDirectory + 'shader_material_base.mat', matFilePath);
        this.replaceInFile(matFilePath, '__[REPLACEME_MATERIAL_NAME]__', mat_name);
        this.replaceInFile(matFilePath, '__[SHADER_GUID]__', shaderGuid);
        this.replaceInFile(matFilePath, '__[REPLACEME_FLOATS]__', matFloatsString);

        this.copyFile(this.templateDirectory + 'shader_material_base.mat.meta', matFileMetaPath);
        this.replaceInFile(matFileMetaPath, '__[REPLACEME]__', this.generateGuid());
      }
    }
  }

  private readonly templateDirectory: string = './configurations/templates/';
  private readonly userInputDirectory: string = './configurations/user_defined_data/';
  private readonly outputInternalDirectory: string = './configurations/auto_generated_files_internal/';
  private readonly outputExternalDirectory: string = './configurations/auto_generated_files_external/';
  private readonly bitIndexToEightBitName: Array<string> = [
    '0_MSBEightBit',
    '0_MSBMiddleEightBit',
    '0_LSBMiddleEightBit',
    '0_LSBEightBit',
    '1_MSBEightBit',
    '1_MSBMiddleEightBit',
    '1_LSBMiddleEightBit',
    '1_LSBEightBit',
    '2_MSBEightBit',
    '2_MSBMiddleEightBit',
    '2_LSBMiddleEightBit',
    '2_LSBEightBit',
    '3_MSBEightBit',
    '3_MSBMiddleEightBit',
    '3_LSBMiddleEightBit',
    '3_LSBEightBit',
    '4_MSBEightBit',
    '4_MSBMiddleEightBit',
    '4_LSBMiddleEightBit',
    '4_LSBEightBit',
    '5_MSBEightBit',
    '5_MSBMiddleEightBit',
    '5_LSBMiddleEightBit',
    '5_LSBEightBit',
    '6_MSBEightBit',
    '6_MSBMiddleEightBit',
    '6_LSBMiddleEightBit',
    '6_LSBEightBit',
    '7_MSBEightBit',
    '7_MSBMiddleEightBit',
    '7_LSBMiddleEightBit',
    '7_LSBEightBit'
  ];
}


interface Entry {
  objectNames: string[];
  shaderParameters: string[];
}

interface GameObjectToShaders {
  [key: string]: Set<Set<string>>;
}

interface ShaderToGameObjectMap {
  [key: string]: string[];
}

interface ShaderData {
  objectNames: string[];
  shaderParameters: Set<string>;
}

interface D {
  name: Array<string>;
  animator_state_machine_id: Array<string>;
  animator_state_id: Array<string>;
  animator_state_transition_id: Array<string>;
  blend_tree_id: Array<string>;
  min_threshold: Array<string>;
  max_threshold: Array<string>;
}