import { FileReference } from "./fileReference";

export interface AnimatorStateTransition {
  AnimatorStateTransition: {
    m_ObjectHideFlags: number;
    m_CorrespondingSourceObject: FileReference;
    m_PrefabInstance: FileReference;
    m_PrefabAsset: FileReference;
    m_Name: string;
    m_Conditions: Array<any>;
    m_DstStateMachine: FileReference;
    m_DstState: FileReference;
    m_Solo: number;
    m_Mute: number;
    m_IsExit: number;
    serializedVersion: number;
    m_TransitionDuration: number;
    m_TransitionOffset: number;
    m_ExitTime: number;
    m_HasExitTime: number;
    m_HasFixedDuration: number;
    m_InterruptionSource: number;
    m_OrderedInterruption: number;
    m_CanTransitionToSelf: number;
  }
}