import { EditorCurve } from "./editorCurve";
import { FileReference } from "./fileReference";
import { FloatCurve } from "./floatCurve";
import { MAnimationClipSettings } from "./mAnimationClipSettings";
import { MBounds } from "./mBounds";
import { MClipBindingConstant } from "./mClipBindingConstant";

export interface AnimationClip {
  AnimationClip: {
    m_ObjectHideFlags: number;
    m_CorrespondingSourceObject: FileReference;
    m_PrefabInstance: FileReference;
    m_PrefabAsset: FileReference;
    m_Name: string;
    serializedVersion: number;
    m_Legacy: number;
    m_Compressed: number;
    m_UseHighQualityCurve: number;
    m_RotationCurves: Array<any>;
    m_CompressedRotationCurves: Array<any>;
    m_EulerCurves: Array<any>;
    m_PositionCurves: Array<any>;
    m_ScaleCurves: Array<any>;
    m_FloatCurves: Array<FloatCurve>;
    m_PPtrCurves: Array<any>;
    m_SampleRate: number;
    m_WrapMode: number;
    m_Bounds: MBounds;
    m_ClipBindingConstant: MClipBindingConstant;
    m_AnimationClipSettings: MAnimationClipSettings;
    m_EditorCurves: Array<EditorCurve>;
    m_EulerEditorCurves: Array<any>;
    m_HasGenericRootTransform: number;
    m_HasMotionFloatCurves: number;
    m_Events: Array<any>;
  }
}
