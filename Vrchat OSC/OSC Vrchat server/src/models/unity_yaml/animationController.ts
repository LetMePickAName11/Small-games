import { AnimationLayer } from "./animationLayer";
import { FileReference } from "./fileReference";

export interface AnimationController {
  m_ObjectHideFlags: number;
  m_CorrespondingSourceObject: FileReference;
  m_PrefabInstance: FileReference;
  m_PrefabAsset: FileReference;
  m_Name: string;
  serializedVersion: number;
  m_AnimatorParameters: Array<any>;
  m_AnimatorLayers: Array<AnimationLayer>;
}