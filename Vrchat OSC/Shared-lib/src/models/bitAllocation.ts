import { BitAllocationTypes } from "./enums";

export interface BitAllocation {
  range: {
    start: number;
    end: number;
  };
  size: number;
  type: BitAllocationTypes;
  name: string; // paramater name
  startName: string;
  endName: string;
  bitIndex: number;
  objectNames: Array<string>; // Unity object name which properties will be updated via generated animations
  shaderParameters: Array<string>; // Shader paramter names [firstBits, lastBits]
}