import { MCurve } from "./mCurve";

export interface Curve {
  serializedVersion: number;
  m_Curve: Array<MCurve>;
  m_PreInfinity: number;
  m_PostInfinity: number;
  m_RotationOrder: number;
}