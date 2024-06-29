import { Curve } from "./curvet";
import { FileReference } from "./fileReference";

export interface MEditorCurves {
  serializedVersion: number;
  curve: Curve;
  attribute: string;
  path: string;
  classID: number;
  script: FileReference;
  flags: number;
}