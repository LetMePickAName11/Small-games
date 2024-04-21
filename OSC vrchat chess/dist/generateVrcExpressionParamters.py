import json

def create_file(template_path, filename):
    # Read the template content
    with open(template_path, 'r') as file:
        content = file.read()
    
    # Write the modified content to new files
    with open(filename, 'w') as file:
      file.write(content)

def append_to_file(filename, text_to_append):
    # Open the file in append mode and write the text
    with open(filename, 'a') as file:
        file.write(text_to_append)

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

def read_json_config():
    with open('auto_generated_files/data_mapped.json', 'r') as file:
        data = json.load(file)
    
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

    result = [
        [
            chunk,
            VALUETYPEDICTIONARY['int'],
            SAVEDDICTIONARY['false'],
            0,
            NETWORKSYNCEDDICTIONARY['true']
        ]
        for chunk in chunks
    ] + [
        [
            overflow,
            VALUETYPEDICTIONARY['boolean'],
            SAVEDDICTIONARY['false'],
            0,
            NETWORKSYNCEDDICTIONARY['true']
        ]
        for overflow in overflows
    ]

    return result

# VRCExpressionParameters
VALUETYPEDICTIONARY = {
  'int': 0,
  'float': 1,
  'boolean': 2
}
SAVEDDICTIONARY = {
  'false': 0,
  'true': 1
}
NETWORKSYNCEDDICTIONARY = {
  'false': 0,
  'true': 1
}


create_file('templates/VRCExpressionParameters.asset', 'auto_generated_files/VRCExpressionParameters.asset')

for row in read_json_config():
    append_to_file('auto_generated_files/VRCExpressionParameters.asset', generate_vrc_expression_paramter_string(row[0], row[1], row[2], row[3], row[4]))