from shared_functions import read_json, create_and_write_to_file
from shared_constants import OUTPUT_INTERNAL_DIRECTORY

def map_game_objects_to_shader_parameters():
    # Initialize an empty dictionary to store the mapping
    game_object_shader_map = {}
    # Iterate through each entry in the JSON data
    for entry in read_json(OUTPUT_INTERNAL_DIRECTORY + 'data_mapped.json'):
        object_names = entry['objectNames']
        shader_parameters = set(entry['shaderParameters'])  # Convert to set to avoid duplicates

        # Map each object to its shader parameters
        for name in object_names:
            if name in game_object_shader_map:
                # Update existing set of shader parameters with new parameters
                game_object_shader_map[name].update(shader_parameters)
            else:
                # Create new set of shader parameters for this object
                game_object_shader_map[name] = shader_parameters.copy()

    # Convert sets to lists for output
    for key in game_object_shader_map:
        game_object_shader_map[key] = list(game_object_shader_map[key])

    return game_object_shader_map

create_and_write_to_file(OUTPUT_INTERNAL_DIRECTORY + 'data_game_object_shader_parameter_map.json', map_game_objects_to_shader_parameters())