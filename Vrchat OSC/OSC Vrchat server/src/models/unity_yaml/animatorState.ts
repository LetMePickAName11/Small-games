import { FileReference } from "./fileReference";
import { XYZ } from "./xYZ";

export interface AnimatorState {
  AnimatorState: {
    serializedVersion: number;
    m_ObjectHideFlags: number;
    m_CorrespondingSourceObject: FileReference;
    m_PrefabInstance: FileReference;
    m_PrefabAsset: FileReference;
    m_Name: string;
    m_Speed: number;
    m_CycleOffset: number;
    m_Transitions: Array<FileReference>;
    m_StateMachineBehaviours: Array<any>;
    m_Position: XYZ;
    m_IKOnFeet: number;
    m_WriteDefaultValues: number;
    m_Mirror: number;
    m_SpeedParameterActive: number;
    m_MirrorParameterActive: number;
    m_CycleOffsetParameterActive: number;
    m_TimeParameterActive: number;
    m_Motion: FileReference;
    m_Tag: any;
    m_SpeedParameter: any;
    m_MirrorParameter: any;
    m_CycleOffsetParameter: any;
    m_TimeParameter: any;
  }
}