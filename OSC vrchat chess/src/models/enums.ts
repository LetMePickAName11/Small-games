export const enum ChessIndexName {
  Empty_1 = "Empty_1",
  Rook_White_1 = "Rook_White_1",
  Knight_White_1 = "Knight_White_1",
  Bishop_White_1 = "Bishop_White_1",
  Queen_White_1 = "Queen_White_1",
  King_White_1 = "King_White_1",
  Bishop_White_2 = "Bishop_White_2",
  Knight_White_2 = "Knight_White_2",
  Rook_White_2 = "Rook_White_2",
  Pawn_White_1 = "Pawn_White_1",
  Pawn_White_2 = "Pawn_White_2",
  Pawn_White_3 = "Pawn_White_3",
  Pawn_White_4 = "Pawn_White_4",
  Pawn_White_5 = "Pawn_White_5",
  Pawn_White_6 = "Pawn_White_6",
  Pawn_White_7 = "Pawn_White_7",
  Pawn_White_8 = "Pawn_White_8",
  Pawn_Black_1 = "Pawn_Black_1",
  Pawn_Black_2 = "Pawn_Black_2",
  Pawn_Black_3 = "Pawn_Black_3",
  Pawn_Black_4 = "Pawn_Black_4",
  Pawn_Black_5 = "Pawn_Black_5",
  Pawn_Black_6 = "Pawn_Black_6",
  Pawn_Black_7 = "Pawn_Black_7",
  Pawn_Black_8 = "Pawn_Black_8",
  Rook_Black_1 = "Rook_Black_1",
  Knight_Black_1 = "Knight_Black_1",
  Bishop_Black_1 = "Bishop_Black_1",
  Queen_Black_1 = "Queen_Black_1",
  King_Black_1 = "King_Black_1",
  Bishop_Black_2 = "Bishop_Black_2",
  Knight_Black_2 = "Knight_Black_2",
  Rook_Black_2 = "Rook_Black_2",
}

export const enum EightBitChunkName {
  '0_MSBEightBit' = '0_MSBEightBit',
  '0_MSBMiddleEightBit' = '0_MSBMiddleEightBit',
  '0_LSBMiddleEightBit' = '0_LSBMiddleEightBit',
  '0_LSBEightBit' = '0_LSBEightBit',
  '1_MSBEightBit' = '1_MSBEightBit',
  '1_MSBMiddleEightBit' = '1_MSBMiddleEightBit',
  '1_LSBMiddleEightBit' = '1_LSBMiddleEightBit',
  '1_LSBEightBit' = '1_LSBEightBit',
  '2_MSBEightBit' = '2_MSBEightBit',
  '2_MSBMiddleEightBit' = '2_MSBMiddleEightBit',
  '2_LSBMiddleEightBit' = '2_LSBMiddleEightBit',
  '2_LSBEightBit' = '2_LSBEightBit',
  '3_MSBEightBit' = '3_MSBEightBit',
  '3_MSBMiddleEightBit' = '3_MSBMiddleEightBit',
  '3_LSBMiddleEightBit' = '3_LSBMiddleEightBit',
  '3_LSBEightBit' = '3_LSBEightBit',
  '4_MSBEightBit' = '4_MSBEightBit',
  '4_MSBMiddleEightBit' = '4_MSBMiddleEightBit',
  '4_LSBMiddleEightBit' = '4_LSBMiddleEightBit',
  '4_LSBEightBit' = '4_LSBEightBit',
  '5_MSBEightBit' = '5_MSBEightBit',
  '5_MSBMiddleEightBit' = '5_MSBMiddleEightBit',
  '5_LSBMiddleEightBit' = '5_LSBMiddleEightBit',
  '5_LSBEightBit' = '5_LSBEightBit',
  '6_MSBEightBit' = '6_MSBEightBit',
  '6_MSBMiddleEightBit' = '6_MSBMiddleEightBit',
  '6_LSBMiddleEightBit' = '6_LSBMiddleEightBit',
  '6_LSBEightBit' = '6_LSBEightBit',
  '7_MSBEightBit' = '7_MSBEightBit',
  '7_MSBMiddleEightBit' = '7_MSBMiddleEightBit',
  '7_LSBMiddleEightBit' = '7_LSBMiddleEightBit',
  '7_LSBEightBit' = '7_LSBEightBit',
}

export const enum BitAllocationType {
  Int = 'i',
  Bool = 'i'
}

export type WebsocketNames = 
  'client_send_mock_osc_input' |
  'client_send_input_configuration_update' |
  'client_send_configuration_update' |
  'client_send_pause_game' |
  'client_send_reset_game' |

  'client_recieve_debug_info' |
  'client_recieve_osc_input' |
  'client_recieve_configurations' |
  'client_recieve_game_state' |
  'client_recieve_input_configurations' |

  'client_request_debug_info' |
  'client_request_configurations' |
  'client_request_input_configurations' |
  'client_request_game_state' |

  'server_send_debug_info' |
  'server_send_configurations' |
  'server_send_input_configurations' |
  'server_send_game_state' |
  'server_send_osc_input' |

  'server_recieve_mock_osc_input' |
  'server_recieve_input_configuration_update' |
  'server_recieve_configuration_update' |
  'server_recieve_pause_game' |
  'server_recieve_reset_game' |  
  'server_recieve_debug_info' |
  'server_recieve_configurations' |
  'server_recieve_input_configurations' |
  'server_recieve_game_state';

  export const WebsocketNames = {
  'client_send_mock_osc_input': 'mock_osc_input' as WebsocketNames,
  'client_send_input_configuration_update': 'input_configuration_update' as WebsocketNames,
  'client_send_configuration_update': 'configuration_update' as WebsocketNames,
  'client_send_pause_game': 'pause_game' as WebsocketNames,
  'client_send_reset_game': 'reset_game' as WebsocketNames,
  'client_recieve_debug_info': 'debug_info' as WebsocketNames,
  'client_recieve_osc_input': 'osc_input' as WebsocketNames,
  'client_recieve_configurations': 'configurations' as WebsocketNames,
  'client_recieve_game_state': 'game_state' as WebsocketNames,
  'client_recieve_input_configurations': 'input_configurations' as WebsocketNames,
  'client_request_debug_info': 'debug_info' as WebsocketNames,
  'client_request_configurations': 'configurations' as WebsocketNames,
  'client_request_input_configurations': 'input_configurations' as WebsocketNames,
  'client_request_game_state': 'game_state' as WebsocketNames,
  'server_send_debug_info': 'debug_info' as WebsocketNames,
  'server_send_configurations': 'configurations' as WebsocketNames,
  'server_send_input_configurations': 'input_configurations' as WebsocketNames,
  'server_send_game_state': 'game_state' as WebsocketNames,
  'server_send_osc_input': 'osc_input' as WebsocketNames,
  'server_recieve_mock_osc_input': 'mock_osc_input' as WebsocketNames,
  'server_recieve_input_configuration_update': 'input_configuration_update' as WebsocketNames,
  'server_recieve_configuration_update': 'configuration_update' as WebsocketNames,
  'server_recieve_pause_game': 'pause_game' as WebsocketNames,
  'server_recieve_reset_game': 'reset_game' as WebsocketNames,
  'server_recieve_debug_info': 'debug_info' as WebsocketNames,
  'server_recieve_configurations': 'configurations' as WebsocketNames,
  'server_recieve_input_configurations': 'input_configurations' as WebsocketNames,
  'server_recieve_game_state': 'game_state' as WebsocketNames,
};