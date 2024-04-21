import json

bit_index_to_eight_bit_name = [
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
]

# Load the configuration from JSON file
with open('../configurations/data.json', 'r') as file:
    bit_allocation_config = json.load(file)

start_index = 0
bit_allocations = []

# Iterate and create the bit allocations
for bit_allocation in bit_allocation_config:
    range_ = {'start': start_index, 'end': start_index + bit_allocation['size']}
    res = {
        **bit_allocation,
        'range': range_,
        'startName': bit_index_to_eight_bit_name[(range_['start'] - range_['start'] % 8) // 8],
        'endName': bit_index_to_eight_bit_name[(range_['start'] - range_['start'] % 8) // 8 + 1],
        'bitIndex': range_['start'] % 16
    }
    start_index += bit_allocation['size']
    bit_allocations.append(res)

# Function to get the allocated bits size
def get_allocated_bits_size(bit_allocations):
    return sum(ba['size'] for ba in bit_allocations)

allocated_bits_size = get_allocated_bits_size(bit_allocations)
overflow_bits = allocated_bits_size % 8
overflow_number = 1

# Handle overflow bits
if overflow_bits != 0:
    for i in range(len(bit_allocations) - overflow_bits, len(bit_allocations)):
        bit_allocations[i]['startName'] = f"Overflow_bit_{overflow_number}"
        bit_allocations[i]['endName'] = f"Overflow_bit_{overflow_number}"
        overflow_number += 1

# Check for allocation limit
if allocated_bits_size > 256:
    print(f"Too many bits allocated (limit 256): {allocated_bits_size}")
    raise ValueError(f"Too many bits allocated (limit 256): {allocated_bits_size}")

# Write the output to a JSON file
with open("../auto_generated_files/data_mapped.json", "w") as file:
    json.dump(bit_allocations, file, indent=2)