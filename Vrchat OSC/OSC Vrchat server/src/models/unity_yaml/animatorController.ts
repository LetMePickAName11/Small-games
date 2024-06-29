
import { AnimationLayer } from "./animationLayer";
import { AnimationParamter } from "./animationParamter";
import { FileReference } from "./fileReference";

export interface AnimatorController {
  m_ObjectHideFlags: number;
  m_CorrespondingSourceObject: FileReference;
  m_PrefabInstance: FileReference;
  m_PrefabAsset: FileReference;
  m_Name: string;
  serializedVersion: number;
  m_AnimatorParameters: Array<AnimationParamter>;
  m_AnimatorLayers: Array<AnimationLayer>;
}