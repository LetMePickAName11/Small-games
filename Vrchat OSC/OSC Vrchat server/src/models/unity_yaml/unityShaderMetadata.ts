export interface UnityShaderMetadata {
  fileFormatVersion: number;
  guid: string;
  ShaderImporter: {
    externalObjects: any;
    defaultTextures: Array<DefaultTextures>;
    nonModifiableTextures: Array<any>;
    userData: any;
    assetBundleName: string | null;
    assetBundleVariant: any;
  }
}

export interface DefaultTextures {
  [key: string]: { instanceID: 0 };
}
