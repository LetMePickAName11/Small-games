from shared_functions import read_json, copy_file, replace_placeholder, generate_guid
from shared_constants import TEMPLATE_DIRECTORY, OUTPUT_EXTERNAL_DIRECTORY, OUTPUT_INTERNAL_DIRECTORY

for index, (key, values) in enumerate(read_json(OUTPUT_INTERNAL_DIRECTORY + 'data_game_object_shader_parameter_map.json').items()):
    shader_properties = []
    shader_variables = []
    mat_floats = []
    properties_lines = key.split(", ")

    for i, prop in enumerate(properties_lines):
        shader_properties.append(f'_{prop} ("{prop}", Range(0,255)) = 0')
        shader_variables.append(f'float _{prop};')
        mat_floats.append(f'- _{prop}: 0')

        if 'First' in prop:
            text = prop.replace('First', '')
            shader_properties.append(f'_Index{text} ("Index{text}", Range(0,15)) = 0')
            shader_variables.append(f'float _Index{text};')
            mat_floats.append(f'- _Index{text}: 0')

    shader_properties_string = "\n        ".join(sorted(shader_properties))
    shader_variables_string = "\n        ".join(sorted(shader_variables))
    mat_floats_string = "\n    ".join(sorted(mat_floats))

    shader_file_path = OUTPUT_EXTERNAL_DIRECTORY + f'/materials/shader_{index + 1}.shader'
    shader_meta_file_path = OUTPUT_EXTERNAL_DIRECTORY + f'/materials/shader_{index + 1}.shader.meta'
    shader_guid = generate_guid()
    # Create shader file
    copy_file(TEMPLATE_DIRECTORY + 'shader_base.shader', shader_file_path)
    replace_placeholder(shader_file_path, shader_properties_string, '__[REPLACEME_PROPERTIES]__')
    replace_placeholder(shader_file_path, shader_variables_string, '__[REPLACEME_VARIABLES]__')
    # Create shader meta file
    copy_file(TEMPLATE_DIRECTORY + "shader_base.shader.meta", shader_meta_file_path)
    replace_placeholder(shader_meta_file_path, shader_guid, '__[REPLACEME]__')

    for mat_name in list(map(lambda s: s.replace('/', '_'), values)):
        mat_file_path = OUTPUT_EXTERNAL_DIRECTORY + f'/materials/{mat_name}.mat'
        mat_file_meta_path = OUTPUT_EXTERNAL_DIRECTORY + f'/materials/{mat_name}.mat.meta'
        
        # Create shader material file
        copy_file(TEMPLATE_DIRECTORY + 'shader_material_base.mat', mat_file_path)
        replace_placeholder(mat_file_path, mat_name,'__[REPLACEME_MATERIAL_NAME]__')
        replace_placeholder(mat_file_path, shader_guid,'__[SHADER_GUID]__')
        replace_placeholder(mat_file_path, mat_floats_string,'__[REPLACEME_FLOATS]__')
        # Create shader material meta file
        copy_file(TEMPLATE_DIRECTORY + 'shader_material_base.mat.meta', mat_file_meta_path)
        replace_placeholder(mat_file_meta_path, generate_guid(), '__[REPLACEME]__')