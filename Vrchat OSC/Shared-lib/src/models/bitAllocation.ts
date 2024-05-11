export interface BitAllocation {
  range: {
    start: number;
    end: number;
  };
  size: number;
  name: string; // paramater name
  lsbName: string;
  msbName: string;
  bitIndex: number;
  objectNames: Array<string>; // Unity object name which properties will be updated via generated animations
  shaderParameters: Array<string>; // Shader paramter names. Will be split into MSB and LSB
}