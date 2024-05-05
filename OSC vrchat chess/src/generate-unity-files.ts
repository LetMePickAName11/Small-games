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

  private replaceInFile(path: string, placeholder: string, replacement: string, overwriteCount: number = -1): void {
    let content = this.getFile(path);
    const replaceFunction = (match: string) => {
      if (overwriteCount !== -1 && overwriteCount-- <= 0) {
        return match; // no replacement since count limit reached
      }
      return replacement;
    };
    content = content.replace(new RegExp(placeholder, 'g'), replaceFunction);
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
    const game_object_to_shaders: GameObjectToShaders = {};
    const shader_to_game_object_map: ShaderToGameObjectMap = {};

    // Read the JSON data from the file
    const entries: Entry[] = JSON.parse(this.getFile(this.outputInternalDirectory + 'data_mapped.json'));

    // First, map each game object to all its shader parameters
    for (const entry of entries) {
      const objectNames: Array<string> = entry.objectNames;
      const shaderParameters = new Set<string>(entry.shaderParameters);

      for (const objectName of objectNames) {
        if (!(objectName in game_object_to_shaders)) {
          game_object_to_shaders[objectName] = new Set<Set<string>>();
        }
        game_object_to_shaders[objectName]!.add(shaderParameters);
      }
    }

    // Now, map sets of shader parameters to game objects, ensuring uniqueness
    for (const [objectName, shaders] of Object.entries(game_object_to_shaders)) {
      // Combine all shader sets for this object into one key
      const combinedShaderKey = Array.from(shaders).reduce((acc, cur) => new Set([...acc, ...cur]), new Set<string>());
      const combinedShaderKeyString = Array.from(combinedShaderKey).sort().join(', ');

      if (!(combinedShaderKeyString in shader_to_game_object_map)) {
        shader_to_game_object_map[combinedShaderKeyString] = [];
      }
      shader_to_game_object_map[combinedShaderKeyString]!.push(objectName);
    }

    // Convert shader set keys to a sorted, comma-separated string for JSON serialization
    const finalMap = Object.fromEntries(
      Object.entries(shader_to_game_object_map).map(([key, value]) => [key, value.sort()])
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
        'end': startIndex + bitAllocations.length
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
    const b = (name: string, value_type: number, saved: number, default_value: number, network_synced: number) => {
      return `
  - name: ${name}
    valueType: ${value_type}
    saved: ${saved}
    defaultValue: ${default_value}
    networkSynced: ${network_synced}`;
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


    const output_path = this.outputExternalDirectory + 'vrchat/VRCExpressionParameters.asset'
    const output_meta_path = this.outputExternalDirectory + 'vrchat/VRCExpressionParameters.asset.meta'

    this.copyFile(this.templateDirectory + "animator_controller_base.controller.meta", output_meta_path)
    this.replaceInFile(output_meta_path, this.generateGuid(), '__[REPLACEME]__')

    this.copyFile(this.templateDirectory + 'vrc_expression_parameters.asset', output_path)

    for (const row of c(this.outputInternalDirectory + 'data_mapped.json')) {
      this.appendToFile(output_path, b(row.name, row.valueType, row.saved, row.defaultValue, row.networkSynced));
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
      const name_base: string = key.split(key.includes("_start") ? "_start" : "_end").slice(0, -1).join("_");

      ['Start', 'End'].forEach(suffix => {
        const default_value: number = suffix === 'Start' ? 0 : 255;
        const attribute_id: number = this.generateUniqueId();
        const path_id: number = this.generateUniqueId();
        const output_path: string = `${this.outputExternalDirectory}animations/${name_base}_${suffix}.anim`;
        const output_meta_path: string = `${this.outputExternalDirectory}animations/${name_base}_{suffix}.anim.meta`;
        const float_curves: string = value.objectNames.flatMap((path: string) => Array.from(value.shaderParameters).map((attribute: string) => generateFloatCurve(default_value, attribute, path))).join("");
        const generic_bindings: string = new Array(value.objectNames.length * value.shaderParameters.size).fill(generateGenericBinding(path_id, attribute_id)).join("");
        const editor_curves: string = value.objectNames.flatMap((path: string) => Array.from(value.shaderParameters).map((attribute: string) => generateEditorCurves(default_value, attribute, path))).join("");

        this.copyFile(this.templateDirectory + "animation_base.anim", output_path);
        this.appendToFile(output_path, generateAnimationClip(`${name_base}_${suffix}`, float_curves, generic_bindings, editor_curves));

        this.copyFile(this.templateDirectory + "animation_base.anim.meta", output_meta_path);
        this.replaceInFile(output_meta_path, this.generateGuid(), '__[REPLACEME]__');
      });
    }
  }

  private generateAnimatorController(): void {
    function map_json_config(input_path: string, that: any) {
      const data: Array<{ startName: string, endName: string }> = JSON.parse(that.getFile(input_path));
      const unique_names: Set<string> = new Set();

      for (const item of data) {
        unique_names.add(item.startName);
        unique_names.add(item.endName);
      }

      const unique_name_list: Array<string> = Array.from(unique_names).sort();

      const animator_data: D = {
        'name': unique_name_list,
        'animator_state_machine_id': new Array(unique_name_list.length).fill(that.generate_unique_id()),
        'animator_state_id': new Array(unique_name_list.length).fill(that.generate_unique_id()),
        'animator_state_transition_id': new Array(unique_name_list.length).fill(that.generate_unique_id()),
        'blend_tree_id': new Array(unique_name_list.length).fill(that.generate_unique_id()),
        'min_threshold': new Array(unique_name_list.length).fill(0),
        'max_threshold': new Array(unique_name_list.length).fill(255),
      };

      return animator_data;
    }

    function generate_animator_parameter(name: string): string {
      const template = `
  - m_Name: ${name}
    m_Type: 1
    m_DefaultFloat: 0
    m_DefaultInt: 0
    m_DefaultBool: 0
    m_Controller: {fileID: 9100000}`;
      return template;
    }

    function generate_animator_layer(name: string, animator_state_machine_id: string): string {
      const template = `
  - serializedVersion: 5
    m_Name: ${name}
    m_StateMachine: {fileID: ${animator_state_machine_id}}
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

    function generate_animator_controller(animator_paramaters: string, animator_layers: string) {
      const template = `
--- !u!91 &9100000
AnimatorController:
  m_ObjectHideFlags: 0
  m_CorrespondingSourceObject: {fileID: 0}
  m_PrefabInstance: {fileID: 0}
  m_PrefabAsset: {fileID: 0}
  m_Name: FX
  serializedVersion: 5
  m_AnimatorParameters:${animator_paramaters}
  m_AnimatorLayers:${animator_layers}`;
      return template;
    }

    function generate_animator_state(animator_state_id: string, animator_state_transition_id: string, blend_tree_id: string) {
      const template = `
--- !u!1102 &${animator_state_id}
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
  - {fileID: ${animator_state_transition_id}}
  m_StateMachineBehaviours: []
  m_Position: {x: 50, y: 50, z: 0}
  m_IKOnFeet: 0
  m_WriteDefaultValues: 1
  m_Mirror: 0
  m_SpeedParameterActive: 0
  m_MirrorParameterActive: 0
  m_CycleOffsetParameterActive: 0
  m_TimeParameterActive: 0
  m_Motion: {fileID: ${blend_tree_id}}
  m_Tag: 
  m_SpeedParameter: 
  m_MirrorParameter: 
  m_CycleOffsetParameter: 
  m_TimeParameter: `
      return template;
    }

    function generate_animator_state_machine(name: string, animator_state_machine_id: string, animator_state_id: string) {
      const template = `
--- !u!1107 &${animator_state_machine_id}
AnimatorStateMachine:
  serializedVersion: 6
  m_ObjectHideFlags: 1
  m_CorrespondingSourceObject: {fileID: 0}
  m_PrefabInstance: {fileID: 0}
  m_PrefabAsset: {fileID: 0}
  m_Name: ${name}
  m_ChildStates:
  - serializedVersion: 1
    m_State: {fileID: ${animator_state_id}}
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
  m_DefaultState: {fileID: ${animator_state_id}}`
      return template;
    }

    function generate_blend_tree(name: string, blend_tree_id: string, motion_start_guid: string, motion_end_guid: string, min_threshold: string, max_threshold: string) {
      const template = `
--- !u!206 &${blend_tree_id}
BlendTree:
  m_ObjectHideFlags: 1
  m_CorrespondingSourceObject: {fileID: 0}
  m_PrefabInstance: {fileID: 0}
  m_PrefabAsset: {fileID: 0}
  m_Name: Blend Tree
  m_Childs:
  - serializedVersion: 2
    m_Motion: {fileID: 7400000, guid: ${motion_start_guid}, type: 2}
    m_Threshold: ${min_threshold}
    m_Position: {x: 0, y: 0}
    m_TimeScale: 1
    m_CycleOffset: 0
    m_DirectBlendParameter: {name}
    m_Mirror: 0
  - serializedVersion: 2
    m_Motion: {fileID: 7400000, guid: ${motion_end_guid}, type: 2}
    m_Threshold: ${max_threshold}
    m_Position: {x: 0, y: 0}
    m_TimeScale: 1
    m_CycleOffset: 0
    m_DirectBlendParameter: ${name}
    m_Mirror: 0
  m_BlendParameter: ${name}
  m_BlendParameterY: ${name}
  m_MinThreshold: ${min_threshold}
  m_MaxThreshold: ${max_threshold}
  m_UseAutomaticThresholds: 0
  m_NormalizedBlendValues: 0
  m_BlendType: 0`
      return template;
    }

    function generate_animator_state_transition(animator_state_transition_id: string) {
      const template = `
    --- !u!1101 &${animator_state_transition_id}
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

    const animatior_controller_output_path: string = this.outputExternalDirectory + "FX.controller";
    const animatior_controller_meta_output_path: string = this.outputExternalDirectory + "FX.controller.meta";


    this.copyFile(this.templateDirectory + "animator_controller_base.controller.meta", animatior_controller_meta_output_path);
    this.replaceInFile(animatior_controller_meta_output_path, this.generateGuid(), '__[REPLACEME]__');

    this.copyFile(this.templateDirectory + "animator_controller_base.controller", animatior_controller_output_path);
    const json_data = map_json_config(this.outputInternalDirectory + "data_mapped.json", this);


    const animator_parameters: string = json_data['name'].map((name: string) => generate_animator_parameter(name)).join("");
    const animator_layers: string = json_data['name'].map((name: string, index: number) => generate_animator_layer(name, json_data['animator_state_machine_id'][index]!)).join("");

    this.appendToFile(animatior_controller_output_path, generate_animator_controller(animator_parameters, animator_layers));


    const animation_names: Array<string> = this.getFileNamesInDir(this.outputExternalDirectory + 'animations').filter((v: string) => v.includes('.meta'));

    for (let i = 0; i < json_data['name'].length; i++) {
      const name: string = json_data['name'][i]!;
      const animator_state_machine_id: string = json_data['animator_state_machine_id'][i]!;
      const animator_state_id: string = json_data['animator_state_id'][i]!;
      const animator_state_transition_id: string = json_data['animator_state_transition_id'][i]!;
      const blend_tree_id: string = json_data['blend_tree_id'][i]!;
      const minT: string = json_data['min_threshold'][i]!;
      const maxT: string = json_data['max_threshold'][i]!;
      const found_string: Array<string> = animation_names.filter((v) => v.includes(v));
      const motion_start_guid: string = this.findInFile(`${this.outputExternalDirectory}animations/${found_string.find(v => v.includes('_Start'))}`, /guid: ([a-f0-9]+)/g);
      const motion_end_guid: string = this.findInFile(`${this.outputExternalDirectory}animations/${found_string.find(v => v.includes('_End'))}`, /guid: ([a-f0-9]+)/g);

      this.appendToFile(animatior_controller_output_path, generate_animator_state_machine(name, animator_state_machine_id, animator_state_id));
      this.appendToFile(animatior_controller_output_path, generate_animator_state(animator_state_id, animator_state_transition_id, blend_tree_id));
      this.appendToFile(animatior_controller_output_path, generate_animator_state_transition(animator_state_transition_id));
      this.appendToFile(animatior_controller_output_path, generate_blend_tree(name, blend_tree_id, motion_start_guid, motion_end_guid, minT, maxT));
    }
  }

  private generateShadersAndMaterials(): void {
    const data = JSON.parse(this.getFile(this.outputInternalDirectory + 'data_game_object_shader_parameter_map.json'));
    for (const [key, values] of data.entries()) {
      const shader_properties: Array<string> = [];
      const shader_variables: Array<string> = [];
      const mat_floats: Array<string> = [];
      const properties_lines: Array<string> = key.split(", ");

      for(let i = 0; i < properties_lines.length; i++){
        const prop: string = properties_lines[i]!;
        shader_properties.push(`_${prop} ("${prop}", Range(0,255)) = 0`);
        shader_variables.push(`float _${prop};`);
        mat_floats.push(`- _${prop}: 0`);

        if (prop.includes('First')) {
          const text = prop.replace('First', '');
          shader_properties.push(`_Index${text} ("Index${text}", Range(0,15)) = 0`);
          shader_variables.push(`float _Index${text};`);
          mat_floats.push(`- _Index${text}: 0`);
        }

        const shader_properties_string = shader_properties.sort().join("\n        ");
        const shader_variables_string = shader_variables.sort().join("\n        ");
        const mat_floats_string = mat_floats.sort().join("\n    ");

        const shader_file_path: string = this.outputExternalDirectory + `/materials/shader_${i + 1}.shader`;
        const shader_meta_file_path: string = this.outputExternalDirectory + `/materials/shader_${i + 1}.shader.meta`;
        const shader_guid: string = this.generateGuid();

        this.copyFile(this.templateDirectory + 'shader_base.shader', shader_file_path);
        this.replaceInFile(shader_file_path, shader_properties_string, '__[REPLACEME_PROPERTIES]__');
        this.replaceInFile(shader_file_path, shader_variables_string, '__[REPLACEME_VARIABLES]__');

        this.copyFile(this.templateDirectory + "shader_base.shader.meta", shader_meta_file_path);
        this.replaceInFile(shader_meta_file_path, shader_guid, '__[REPLACEME]__');

        for (const mat_name of values.map((s: string) => s.replace('/', '_'))) {
          const mat_file_path: string = this.outputExternalDirectory + `/materials/${mat_name}.mat`;
          const mat_file_meta_path: string = this.outputExternalDirectory + `/ materials / ${mat_name}.mat.meta`;

          this.copyFile(this.templateDirectory + 'shader_material_base.mat', mat_file_path);
          this.replaceInFile(mat_file_path, mat_name, '__[REPLACEME_MATERIAL_NAME]__');
          this.replaceInFile(mat_file_path, shader_guid, '__[SHADER_GUID]__');
          this.replaceInFile(mat_file_path, mat_floats_string, '__[REPLACEME_FLOATS]__');

          this.copyFile(this.templateDirectory + 'shader_material_base.mat.meta', mat_file_meta_path);
          this.replaceInFile(mat_file_meta_path, this.generateGuid(), '__[REPLACEME]__');
        }
      }
    }
  }

  private readonly templateDirectory: string = '../configurations/templates/';
  private readonly userInputDirectory: string = '../configurations/user_defined_data/';
  private readonly outputInternalDirectory: string = '../configurations/auto_generated_files_internal/';
  private readonly outputExternalDirectory: string = '../configurations/auto_generated_files_external/';
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