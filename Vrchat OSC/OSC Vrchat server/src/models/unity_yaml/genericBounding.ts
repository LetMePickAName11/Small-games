import { FileReference } from "./fileReference";

export interface GenericBinding {
  serializedVersion: number;
  path: string;
  attribute: string;
  script: FileReference;
  typeID: number;
  customType: number;
  isPPtrCurve: number;
  isIntCurve: number;
  isSerializeReferenceCurve: number;
}