from shared_functions import read_json, generate_unique_id, generate_guid, copy_file, append_to_file, replace_placeholder
from shared_constants import TEMPLATE_DIRECTORY, OUTPUT_EXTERNAL_DIRECTORY, OUTPUT_INTERNAL_DIRECTORY

def map_json_config(input_path):
    data = read_json(input_path)
    
    grouped_data = {}
    for item in data:
        start_shader = f"{item['startName']}_start"
        end_shader = f"{item['endName']}_end"

        # Ensure grouped_data entries for shaders are initialized with sets for shader_parameters
        if start_shader not in grouped_data:
            grouped_data[start_shader] = {'game_objects': [], 'shader_parameters': set()}
        if end_shader not in grouped_data:
            grouped_data[end_shader] = {'game_objects': [], 'shader_parameters': set()}

        # Append objects and add shader parameters ensuring uniqueness
        grouped_data[start_shader]['game_objects'].extend(item['objectNames'])
        grouped_data[end_shader]['game_objects'].extend(item['objectNames'])
        grouped_data[start_shader]['shader_parameters'].update(item['shaderParameters'])
        grouped_data[end_shader]['shader_parameters'].update(item['shaderParameters'])

    # Convert shader_parameters sets back to lists for output consistency
    for shader in grouped_data:
        grouped_data[shader]['shader_parameters'] = list(grouped_data[shader]['shader_parameters'])

    return grouped_data

def generate_float_curve(value, attribute, path):
    template = """
  - serializedVersion: 2
    curve:
      serializedVersion: 2
      m_Curve:
      - serializedVersion: 3
        time: 0
        value: {value}
        inSlope: 0
        outSlope: 0
        tangentMode: 136
        weightedMode: 0
        inWeight: 0.33333334
        outWeight: 0.33333334
      m_PreInfinity: 2
      m_PostInfinity: 2
      m_RotationOrder: 4
    attribute: material.{attribute}
    path: {path}
    classID: 23
    script: {{fileID: 0}}
    flags: 16"""
    return template.format(value=value, attribute=attribute, path=path)

def generate_generic_binding(path_id, attribute_id):
    template = """
    - serializedVersion: 2
      path: {path_id}
      attribute: {attribute_id}
      script: {{fileID: 0}}
      typeID: 23
      customType: 22
      isPPtrCurve: 0
      isIntCurve: 0
      isSerializeReferenceCurve: 0"""
    return template.format(path_id=path_id, attribute_id=attribute_id)

def generate_editor_curves(value, attribute, path):
    template = """
  - serializedVersion: 2
    curve:
      serializedVersion: 2
      m_Curve:
      - serializedVersion: 3
        time: 0
        value: {value}
        inSlope: 0
        outSlope: 0
        tangentMode: 136
        weightedMode: 0
        inWeight: 0.33333334
        outWeight: 0.33333334
      m_PreInfinity: 2
      m_PostInfinity: 2
      m_RotationOrder: 4
    attribute: material.{attribute}
    path: {path}
    classID: 23
    script: {{fileID: 0}}
    flags: 16"""
    return template.format(value=value, attribute=attribute, path=path)

def generate_animation_clip(name, float_curves, generic_bindings, editor_curves):
    template = """
AnimationClip:
  m_ObjectHideFlags: 0
  m_CorrespondingSourceObject: {{fileID: 0}}
  m_PrefabInstance: {{fileID: 0}}
  m_PrefabAsset: {{fileID: 0}}
  m_Name: {name}
  serializedVersion: 7
  m_Legacy: 0
  m_Compressed: 0
  m_UseHighQualityCurve: 1
  m_RotationCurves: []
  m_CompressedRotationCurves: []
  m_EulerCurves: []
  m_PositionCurves: []
  m_ScaleCurves: []
  m_FloatCurves:{float_curves}
  m_PPtrCurves: []
  m_SampleRate: 60
  m_WrapMode: 0
  m_Bounds:
    m_Center: {{x: 0, y: 0, z: 0}}
    m_Extent: {{x: 0, y: 0, z: 0}}
  m_ClipBindingConstant:
    genericBindings:{generic_bindings}
    pptrCurveMapping: []
  m_AnimationClipSettings:
    serializedVersion: 2
    m_AdditiveReferencePoseClip: {{fileID: 0}}
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
  m_EditorCurves:{editor_curves}
  m_EulerEditorCurves: []
  m_HasGenericRootTransform: 0
  m_HasMotionFloatCurves: 0
  m_Events: []"""
    return template.format(name=name, float_curves=float_curves, generic_bindings=generic_bindings, editor_curves=editor_curves)


# TODO does not handle overflow bits correctly at the moment. Currently it simply treats it as a chunk
for key, value in map_json_config(OUTPUT_INTERNAL_DIRECTORY + 'data_mapped.json').items():
    name_base = '_'.join(key.split('_start' if '_start' in key else '_end')[:-1])

    for suffix in ['Start', 'End']:
        attribute_id = generate_unique_id()
        path_id = generate_unique_id()
        output_path = f"{OUTPUT_EXTERNAL_DIRECTORY}animations/{name_base}_{suffix}.anim" 
        output_meta_path = f"{OUTPUT_EXTERNAL_DIRECTORY}animations/{name_base}_{suffix}.anim.meta"
        float_curves = "".join(generate_float_curve(255, attribute, path) for path in value['game_objects'] for attribute in value['shader_parameters'])
        generic_bindings = "".join(generate_generic_binding(path_id, attribute_id) for _ in value['game_objects'] for _ in value['shader_parameters'])
        editor_curves = "".join(generate_editor_curves(255, attribute, path) for path in value['game_objects'] for attribute in value['shader_parameters'])

        # Generate animation file
        copy_file(TEMPLATE_DIRECTORY + "animation_base.anim", output_path)
        append_to_file(output_path, generate_animation_clip(name_base, float_curves, generic_bindings, editor_curves))
        
        # Generate animation meta file
        copy_file(TEMPLATE_DIRECTORY + "animation_base.anim.meta", output_meta_path)
        replace_placeholder(output_meta_path, generate_guid())