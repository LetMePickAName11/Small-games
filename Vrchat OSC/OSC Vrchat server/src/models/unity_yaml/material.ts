import { FileReference } from "./fileReference";
import { MSavedProperty } from "./mSavedProperty";
import { MScript } from "./mScript";

export interface Material {
  Material: {
    serializedVersion: number;
    m_ObjectHideFlags: number;
    m_CorrespondingSourceObject: FileReference;
    m_PrefabInstance: FileReference;
    m_PrefabAsset: FileReference;
    m_Name: string;
    m_Shader: MScript;
    m_Parent: FileReference;
    m_ModifiedSerializedProperties: number;
    m_ValidKeywords: Array<string>;
    m_InvalidKeywords: Array<string>;
    m_LightmapFlags: number;
    m_EnableInstancingVariants: number;
    m_DoubleSidedGI: number;
    m_CustomRenderQueue: number;
    stringTagMap: any;
    disabledShaderPasses: Array<any>;
    m_LockedProperties: any;
    m_SavedProperties: Array<MSavedProperty>;
    m_BuildTextureStacks: Array<any>;
  }
}