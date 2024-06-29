import { FileReference } from "./fileReference";

export interface GenericBinding {
  serializedVersion: number;
  path: number;
  attribute: number;
  script: FileReference;
  typeID: number;
  customType: number;
  isPPtrCurve: number;
  isIntCurve: number;
  isSerializeReferenceCurve: number;
}