import { ChildState } from "./childState";
import { FileReference } from "./fileReference";
import { XYZ } from "./xYZ";

export interface AnimatorStateMachine {
  AnimatorStateMachine: {
    serializedVersion: number;
    m_ObjectHideFlags: number;
    m_CorrespondingSourceObject: FileReference;
    m_PrefabInstance: FileReference;
    m_PrefabAsset: FileReference;
    m_Name: string;
    m_ChildStates: Array<ChildState>;
    m_ChildStateMachines: Array<any>;
    m_AnyStateTransitions: Array<any>;
    m_EntryTransitions: Array<any>;
    m_StateMachineTransitions: object;
    m_StateMachineBehaviours: Array<any>;
    m_AnyStatePosition: XYZ;
    m_EntryPosition: XYZ;
    m_ExitPosition: XYZ;
    m_ParentStateMachinePosition: XYZ;
    m_DefaultState: FileReference;
  }
}