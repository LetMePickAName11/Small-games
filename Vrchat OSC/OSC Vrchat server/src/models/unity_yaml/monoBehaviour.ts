
import { FileReference } from "./fileReference";
import { MScript } from "./mScript";
import { MonoBehaviourParamter } from "./monoBehaviourParamter";

export interface MonoBehaviour {
  MonoBehaviour: {
    m_ObjectHideFlags: number;
    m_CorrespondingSourceObject: FileReference;
    m_PrefabInstance: FileReference;
    m_PrefabAsset: FileReference;
    m_GameObject: FileReference;
    m_Enabled: number;
    m_EditorHideFlags: number;
    m_Script: MScript;
    m_Name: string;
    m_EditorClassIdentifier: any;
    parameters: Array<MonoBehaviourParamter>;
  }
}

