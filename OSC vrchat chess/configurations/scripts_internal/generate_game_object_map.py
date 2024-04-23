from shared_functions import read_json, create_and_write_to_file
from shared_constants import OUTPUT_INTERNAL_DIRECTORY

def map_game_objects_to_shader_parameters():
    game_object_to_shaders = {}
    shader_to_game_object_map = {}

    # Read the JSON data from the file
    entries = read_json(OUTPUT_INTERNAL_DIRECTORY + 'data_mapped.json')
    
    # First, map each game object to all its shader parameters
    for entry in entries:
        object_names = entry['objectNames']
        shader_parameters = frozenset(entry['shaderParameters'])
        
        for object_name in object_names:
            if object_name not in game_object_to_shaders:
                game_object_to_shaders[object_name] = set()
            game_object_to_shaders[object_name].add(shader_parameters)

    # Now, map sets of shader parameters to game objects, ensuring uniqueness
    for object_name, shaders in game_object_to_shaders.items():
        # Combine all shader sets for this object into one key
        combined_shader_key = frozenset.union(*shaders)
        if combined_shader_key not in shader_to_game_object_map:
            shader_to_game_object_map[combined_shader_key] = []
        shader_to_game_object_map[combined_shader_key].append(object_name)

    # Convert frozenset keys to a sorted, comma-separated string for JSON serialization
    final_map = {', '.join(sorted(key)): sorted(value) for key, value in shader_to_game_object_map.items()}
    
    return final_map

create_and_write_to_file(OUTPUT_INTERNAL_DIRECTORY + 'data_game_object_shader_parameter_map.json', map_game_objects_to_shader_parameters())