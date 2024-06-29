import { FileReference } from "./fileReference";
import { XYZ } from "./xYZ";

export interface ChildState {
  serializedVersion: number;
  m_State: FileReference;
  m_Position: XYZ;
}