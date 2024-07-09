import { Color } from "./color";
import { MTexEnvs } from "./mTexEnvs";

export interface MSavedProperty {
  serializedVersion: number;
  m_TexEnvs: Array<{[key in string]: MTexEnvs}>;
  m_Ints: Array<{[key in string]: number}>;
  m_Floats: Array<{[key in string]: number}>;
  m_Colors: Array<{[key in string]: Color}>;
}