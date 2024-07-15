export interface BitAllocation {
  range: {
    start: number;
    end: number;
  };
  name: string;
  size: number;
  bitStartIndex: number;
  bitChunks: Array<string>;
  objectNames: Array<string>;
  shaderParameters: Array<string>;
  type: 'Shader' | 'Default';
  defaultValue: number;
}