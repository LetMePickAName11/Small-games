import { FileReference } from "./fileReference";

export interface MAnimationClipSettings {
  serializedVersion: number;
  m_AdditiveReferencePoseClip: FileReference;
  m_AdditiveReferencePoseTime: number;
  m_StartTime: number;
  m_StopTime: number;
  m_OrientationOffsetY: number;
  m_Level: number;
  m_CycleOffset: number;
  m_HasAdditiveReferencePose: number;
  m_LoopTime: number;
  m_LoopBlend: number;
  m_LoopBlendOrientation: number;
  m_LoopBlendPositionY: number;
  m_LoopBlendPositionXZ: number;
  m_KeepOriginalOrientation: number;
  m_KeepOriginalPositionY: number;
  m_KeepOriginalPositionXZ: number;
  m_HeightFromFeet: number;
  m_Mirror: number;
}