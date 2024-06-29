import { NativeFormatImporter } from "./nativeFormatImporter"

export interface UnityMetadata {
  fileFormatVersion: number;
  guid: string;
  NativeFormatImporter: NativeFormatImporter;
}