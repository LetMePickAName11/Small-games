import { FileReference } from "./fileReference";

export interface EditorCurve {
  serializedVersion: number;
  curve: {
    serializedVersion: number;
    m_Curve: {
      serializedVersion: number;
      time: number;
      value: number;
      inSlope: number;
      outSlope: number;
      tangentMode: number;
      weightedMode: number;
      inWeight: number;
      outWeight: number;
    },
    m_PreInfinity: number;
    m_PostInfinity: number;
    m_RotationOrder: number;
  },
  attribute: string;
  path: string,
  classID: number;
  script: FileReference
  flags: number;
};