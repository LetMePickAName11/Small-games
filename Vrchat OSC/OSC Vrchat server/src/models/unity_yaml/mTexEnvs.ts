import { FileReference } from "./fileReference";
import { XY } from "./xY";

export interface MTexEnvs {
  m_Texture: FileReference;
  m_Scale: XY;
  m_Offset: XY;
}