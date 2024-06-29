import { FileReference } from "./fileReference";

export interface AnimationLayer {
  serializedVersion: number;
  m_Name: string;
  m_StateMachine: FileReference;
  m_Mask: FileReference;
  m_Motions: Array<any>;
  m_Behaviours: Array<any>;
  m_BlendingMode: number;
  m_SyncedLayerIndex: number;
  m_DefaultWeight: number;
  m_IKPass: number;
  m_SyncedLayerAffectsTiming: number;
  m_Controller: FileReference;
}