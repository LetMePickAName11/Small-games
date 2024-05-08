import json
import random
import uuid
import os
import re

def copy_file(original_path, output_path):
    with open(original_path, 'r') as file:
        content = file.read()

    with open(output_path, 'w') as file:
      file.write(content)

def append_to_file(path, text):
    with open(path, 'a') as file:
        file.write(text)

def create_and_write_to_file(path, obj):
    with open(path, "w") as file:
        json.dump(obj, file, indent=2)

def replace_placeholder(file_path, text, placeholder, overwrite_count = -1):
    with open(file_path, 'r') as file:
        content = file.read()

    updated_content = content.replace(placeholder, text, overwrite_count)

    with open(file_path, 'w') as file:
        file.write(updated_content)

def read_json(path):
    with open(path, 'r') as file:
        data = json.load(file)
    return data

def get_text_from_file(path, regex):
    with open(path, 'r') as file:
        content = file.read()
    return re.search(regex, content).group(1)

def get_file_names_in_dir(path):
    return os.listdir(path)

def generate_unique_id():
    return random.randint(100000000, 999999999)

def generate_guid():
    return f"{uuid.uuid4()}".replace('-', '')
