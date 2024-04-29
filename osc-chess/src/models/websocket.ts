export type WebSockNamesOut = 'getconfigurations' | 'getgamestate' | 'getinputs' | 'mockinput' | 'updateconfigurations' | 'updateinputs' | 'pausegame' | 'resetgame';
export type WebSockNamesIn = 'inputupdated' | 'gamestateupdated' | 'configurationupdated';


export const WebSockNamesOut = {
  'getconfigurations': 'getconfigurations' as WebSockNamesOut,
  'getgamestate': 'getgamestate' as WebSockNamesOut,
  'getinputs': 'getinputs' as WebSockNamesOut,
  'mockinput': 'mockinput' as WebSockNamesOut,
  'updateconfigurations': 'updateconfigurations' as WebSockNamesOut,
  'updateinputs': 'updateinputs' as WebSockNamesOut,
  'pausegame': 'pausegame' as WebSockNamesOut,
  'resetgame': 'resetgame' as WebSockNamesOut,
};

export const WebSockNamesIn = {
  'inputupdated': 'inputupdated' as WebSockNamesOut,
  'gamestateupdated': 'gamestateupdated' as WebSockNamesOut,
  'configurationupdated': 'configurationupdated' as WebSockNamesOut
};