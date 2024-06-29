export interface UnityShaderMetadata {
  fileFormatVersion: number;
  guid: string;
  ShaderImporter: any;
  externalObjects: any;
  defaultTextures: Array<DefaultTextures>;
  nonModifiableTextures: Array<any>;
  userData: any;
  assetBundleName: string; 
  assetBundleVariant: any;
}

export interface DefaultTextures {
  [key: string]: { instanceID: 0 };
}
