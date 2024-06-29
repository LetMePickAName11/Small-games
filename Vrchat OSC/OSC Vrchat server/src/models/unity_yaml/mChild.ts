import { Motion } from "./motion";
import { XY } from "./xY";

export interface MChild {
  serializedVersion: number;
  m_Motion: Motion;
  m_Threshold: number;
  m_Position: XY;
  m_TimeScale: number;
  m_CycleOffset: number;
  m_DirectBlendParameter: string
  m_Mirror: number;
}