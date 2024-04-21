from shared_functions import read_json, copy_file, append_to_file, replace_placeholder, generate_guid
from shared_constants import TEMPLATE_DIRECTORY, OUTPUT_EXTERNAL_DIRECTORY, OUTPUT_INTERNAL_DIRECTORY

def generate_vrc_expression_paramter_string(name, value_type, saved, default_value, network_synced):
    template = """
  - name: {name}
    valueType: {value_type}
    saved: {saved}
    defaultValue: {default_value}
    networkSynced: {network_synced}"""
    return template.format(
        name=name,
        value_type=value_type,
        saved=saved,
        default_value=default_value,
        network_synced=network_synced
    )

def map_json_config(input):
    data = read_json(input)
    
    chunks = []
    overflows = []
    for d in data:        
        if "Overflow" not in d['startName']:
          if d['startName'] not in chunks:
              chunks.append(d['startName'])
          if d['endName'] not in chunks:
              chunks.append(d['endName'])
        else:
            if d['startName'] not in overflows:
              overflows.append(d['startName'])

    return [[ chunk, 0, 0, 0, 1] for chunk in chunks] + [[overflow, 1, 0, 0, 1] for overflow in overflows]


output_path = OUTPUT_EXTERNAL_DIRECTORY + 'vrchat/VRCExpressionParameters.asset'
output_meta_path = OUTPUT_EXTERNAL_DIRECTORY + 'vrchat/VRCExpressionParameters.asset.meta'
# generate meta file
copy_file(TEMPLATE_DIRECTORY + "animator_controller_base.controller.meta", output_meta_path)
replace_placeholder(output_meta_path, generate_guid())
# generate vrcexpressionparameters file
copy_file(TEMPLATE_DIRECTORY + 'vrc_expression_parameters.asset', output_path)

for row in map_json_config(OUTPUT_INTERNAL_DIRECTORY + 'data_mapped.json'):
    append_to_file(output_path, generate_vrc_expression_paramter_string(row[0], row[1], row[2], row[3], row[4]))