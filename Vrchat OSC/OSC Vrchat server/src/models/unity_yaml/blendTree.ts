import { FileReference } from "./fileReference";
import { MChild } from "./mChild";

export interface BlendTree {
  BlendTree: {
    m_ObjectHideFlags: number;
    m_CorrespondingSourceObject: FileReference;
    m_PrefabInstance: FileReference;
    m_PrefabAsset: FileReference;
    m_Name: string;
    m_Childs: Array<MChild>;
    m_BlendParameter: string;
    m_BlendParameterY: string;
    m_MinThreshold: number;
    m_MaxThreshold: number;
    m_UseAutomaticThresholds: number;
    m_NormalizedBlendValues: number;
    m_BlendType: number;
  }
}