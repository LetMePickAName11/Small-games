import { FileReference } from "./fileReference";

export interface AnimationParamter {
  m_Name: string;
  m_Type: number;
  m_DefaultFloat: number;
  m_DefaultInt: number;
  m_DefaultBool: number;
  m_Controller: FileReference;
}