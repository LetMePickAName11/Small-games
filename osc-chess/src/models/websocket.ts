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
  'server_recieve_reset_game';

export const WebsocketNames = {
  'client_send_mock_osc_input': 'client_send_mock_osc_input' as WebsocketNames,
  'client_send_input_configuration_update': 'client_send_input_configuration_update' as WebsocketNames,
  'client_send_configuration_update': 'client_send_configuration_update' as WebsocketNames,
  'client_send_pause_game': 'client_send_pause_game' as WebsocketNames,
  'client_send_reset_game': 'client_send_reset_game' as WebsocketNames,
  'client_recieve_debug_info': 'client_recieve_debug_info' as WebsocketNames,
  'client_recieve_osc_input': 'client_recieve_osc_input' as WebsocketNames,
  'client_recieve_configurations': 'client_recieve_configurations' as WebsocketNames,
  'client_recieve_game_state': 'client_recieve_game_state' as WebsocketNames,
  'client_recieve_input_configurations': 'client_recieve_input_configurations' as WebsocketNames,
  'client_request_debug_info': 'client_request_debug_info' as WebsocketNames,
  'client_request_configurations': 'client_request_configurations' as WebsocketNames,
  'client_request_input_configurations': 'client_request_input_configurations' as WebsocketNames,
  'client_request_game_state': 'client_request_game_state' as WebsocketNames,
  'server_send_debug_info': 'server_send_debug_info' as WebsocketNames,
  'server_send_configurations': 'server_send_configurations' as WebsocketNames,
  'server_send_input_configurations': 'server_send_input_configurations' as WebsocketNames,
  'server_send_game_state': 'server_send_game_state' as WebsocketNames,
  'server_send_osc_input': 'server_send_osc_input' as WebsocketNames,
  'server_recieve_mock_osc_input': 'server_recieve_mock_osc_input' as WebsocketNames,
  'server_recieve_input_configuration_update': 'server_recieve_input_configuration_update' as WebsocketNames,
  'server_recieve_configuration_update': 'server_recieve_configuration_update' as WebsocketNames,
  'server_recieve_pause_game': 'server_recieve_pause_game' as WebsocketNames,
  'server_recieve_reset_game': 'server_recieve_reset_game' as WebsocketNames,
};