export interface Configuration {
  size: number;
  type: "i" | "b";
  name: string;
  objectNames: Array<string>;
  shaderParameters: Array<string>;
  range: {
    start: number;
    end: number;
  };
  startName: string;
  endName: string;
  bitIndex: number
}