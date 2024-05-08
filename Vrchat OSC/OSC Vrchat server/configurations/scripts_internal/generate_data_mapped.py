from shared_functions import read_json, create_and_write_to_file
from shared_constants import USER_INPUT_DIRECTORY, OUTPUT_INTERNAL_DIRECTORY

BIT_INDEX_TO_EIGHT_BIT_NAME = [
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

start_index = 0
bit_allocations = []

# Iterate and create the bit allocations
for bit_allocation in read_json(USER_INPUT_DIRECTORY + 'data.json'):
    range_ = {'start': start_index, 'end': start_index + bit_allocation['size']}
    res = {
        **bit_allocation,
        'range': range_,
        'startName': BIT_INDEX_TO_EIGHT_BIT_NAME[(range_['start'] - range_['start'] % 8) // 8],
        'endName': BIT_INDEX_TO_EIGHT_BIT_NAME[(range_['start'] - range_['start'] % 8) // 8 + 1],
        'bitIndex': range_['start'] % 16
    }
    start_index += bit_allocation['size']
    bit_allocations.append(res)

allocated_bits_size = sum(ba['size'] for ba in bit_allocations)
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
create_and_write_to_file(OUTPUT_INTERNAL_DIRECTORY + 'data_mapped.json', bit_allocations)