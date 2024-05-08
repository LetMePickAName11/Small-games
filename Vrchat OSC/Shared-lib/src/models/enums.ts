export const EightBitChunkName = {
  'BitChunk0': 'BitChunk0',
  'BitChunk1': 'BitChunk1',
  'BitChunk2': 'BitChunk2',
  'BitChunk3': 'BitChunk3',
  'BitChunk4': 'BitChunk4',
  'BitChunk5': 'BitChunk5',
  'BitChunk6': 'BitChunk6',
  'BitChunk7': 'BitChunk7',
  'BitChunk8': 'BitChunk8',
  'BitChunk9': 'BitChunk9',
  'BitChunk10': 'BitChunk10',
  'BitChunk11': 'BitChunk11',
  'BitChunk12': 'BitChunk12',
  'BitChunk13': 'BitChunk13',
  'BitChunk14': 'BitChunk14',
  'BitChunk15': 'BitChunk15',
  'BitChunk16': 'BitChunk16',
  'BitChunk17': 'BitChunk17',
  'BitChunk18': 'BitChunk18',
  'BitChunk19': 'BitChunk19',
  'BitChunk20': 'BitChunk20',
  'BitChunk21': 'BitChunk21',
  'BitChunk22': 'BitChunk22',
  'BitChunk23': 'BitChunk23',
  'BitChunk24': 'BitChunk24',
  'BitChunk25': 'BitChunk25',
  'BitChunk26': 'BitChunk26',
  'BitChunk27': 'BitChunk27',
  'BitChunk28': 'BitChunk28',
  'BitChunk29': 'BitChunk29',
  'BitChunk30': 'BitChunk30',
  'BitChunk31': 'BitChunk31'
} as const;

export const BitAllocationType = {
  'Int': 'i',
  'Bool': 'i'
} as const;

export const WebsocketName = {
  'client_send_mock_osc_input': 'mock_osc_input',
  'client_send_input_configuration_update': 'input_configuration_update',
  'client_send_configuration_update': 'configuration_update',
  'client_send_pause_game': 'pause_game',
  'client_send_reset_game': 'reset_game',
  'client_recieve_debug_info': 'debug_info',
  'client_recieve_osc_input': 'osc_input',
  'client_recieve_configurations': 'configurations',
  'client_recieve_game_state': 'game_state',
  'client_recieve_input_configurations': 'input_configurations',
  'client_request_debug_info': 'debug_info',
  'client_request_configurations': 'configurations',
  'client_request_input_configurations': 'input_configurations',
  'client_request_game_state': 'game_state',
  'server_send_debug_info': 'debug_info',
  'server_send_configurations': 'configurations',
  'server_send_input_configurations': 'input_configurations',
  'server_send_game_state': 'game_state',
  'server_send_osc_input': 'osc_input',
  'server_recieve_mock_osc_input': 'mock_osc_input',
  'server_recieve_input_configuration_update': 'input_configuration_update',
  'server_recieve_configuration_update': 'configuration_update',
  'server_recieve_pause_game': 'pause_game',
  'server_recieve_reset_game': 'reset_game',
  'server_recieve_debug_info': 'debug_info',
  'server_recieve_configurations': 'configurations',
  'server_recieve_input_configurations': 'input_configurations',
  'server_recieve_game_state': 'game_state'
} as const;

export type EightBitChunkNames = (typeof EightBitChunkName)[keyof typeof EightBitChunkName];
export type BitAllocationTypes = (typeof BitAllocationType)[keyof typeof BitAllocationType];
export type WebsocketNames = (typeof WebsocketName)[keyof typeof WebsocketName];