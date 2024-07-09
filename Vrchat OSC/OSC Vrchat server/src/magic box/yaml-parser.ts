import { FileReference } from "../models/unity_yaml/fileReference";

export class YamlParser {
  constructor(fileHeader: string | null) {
    this._settings.fileHeader = fileHeader;
  }

  public parseDocumentless(data: Object | Array<Object>, includeHeader: boolean): string {
    const yamlLines: Array<string> = [];

    if (includeHeader) {
      yamlLines.push(this._settings.fileHeader!);
    }

    // Parse the object into YAML lines
    yamlLines.push(...this.iterateDocument(data));

    // Remove first line skipping
    if (yamlLines[0]?.includes('\n')) {
      yamlLines[0] = yamlLines[0].slice(1);
    }

    return yamlLines.join('');
  }

  public parseDocuments(documents: Array<YamlDocument>, includeHeader: boolean): string {
    const yamlLines: Array<string> = [];

    if (includeHeader) {
      yamlLines.push(this._settings.fileHeader!);
    }

    documents.forEach((document: YamlDocument) => {
      // Add document start marker
      yamlLines.push(`\r\n${document.tag} &${document.anchor}`);
      // Parse the object into YAML lines
      yamlLines.push(...this.iterateDocument(document.data));
    });

    return yamlLines.join('');
  }

  public parseYamlString(yamlString: string): Array<YamlDocument> {
    const result: Array<YamlDocument> = [];
    // Remove yaml file header info
    while (yamlString[0] === '%') {
      yamlString = yamlString.split('\r\n').slice(1).join('\r\n');
    }

    const documentInfo = yamlString.split(/(--- !u![0-9]+ &[0-9]+)(?: stripped){0,1}/).map(ys => ys.trim()).filter(ys => ys !== '');

    for (let i = 0; i < documentInfo.length - 1; i += 2) {
      const tag: UnityYamlTag = documentInfo[i]!.split('&')[0]?.trimEnd() as UnityYamlTag;
      const anchorId: string = documentInfo[i]!.split('&')[1]!;
      const documentData: Array<string> = documentInfo[i + 1]!.split('\r\n');

      const objectBuilder: Record<string, any> = {};
      let skipLine: boolean = false;
      let lines = [];

      // Merge weird inline objects that span two lines?!
      for (let j = 0; j < documentData.length; j++) {
        if (skipLine === true) {
          skipLine = false;
          continue;
        }

        let currentLine = documentData[j]!;

        if (currentLine.slice(-1) === ',') {
          skipLine = true;
          currentLine = `${currentLine.trimEnd()} ${documentData[j + 1]!.trimStart()}`;
        }

        lines.push(currentLine);
      }

      let parentStack: Array<any> = [];

      for (let j = 0; j < lines.length; j++) {
        const currentLine = lines[j]!;
        const nextLine = lines[j + 1]! ?? '';
        let val;
        let key;

        const a = {
          ...this.trimStartAndCount(currentLine),
          isArrayElement: false
        };
        const b = this.trimStartAndCount(nextLine);

        if (b.trimmedString[0] === '-') {
          b.amountTrimmed += 2;
        }
        // If array element
        if (a.trimmedString[0] === '-') {
          a.trimmedString = a.trimmedString.substring(2);
          a.amountTrimmed += 2;
          a.isArrayElement = true;
          // if inline object
          if (a.trimmedString.slice(-1) === '}') {
            val = a.trimmedString.match(/\{(.*)\}/)![0];
            key = a.trimmedString.replace(val, '').replace(':', '').trim();
          } // else if key value pair
          else if (a.trimmedString.includes(':')) {
            val = a.trimmedString.split(':')[1]!.trim();
            key = a.trimmedString.split(':')[0]!.trim();
          } // else if value
          else {
            val = a.trimmedString.trim();
          }
        }
        else if (a.trimmedString.slice(-1) === '}') {
          val = a.trimmedString.match(/\{(.*)\}/)![0];
          key = a.trimmedString.replace(val, '').replace(':', '').trim();
        } // else if key value pair
        else {
          val = a.trimmedString.split(':')[1]!.trim();
          key = a.trimmedString.split(':')[0]!.trim();
        }

        if (val === '{}') {
          val = {}
        }
        else if (val === '[]') {
          val = [];
        }
        else if (val[val.length - 1] === '}') {
          val = val.replace(/[{}]/g, '').split(',').reduce((acc: Record<string, any>, cv: string) => {
            const [key, val] = cv.split(':').map(str => str.trim());
            acc[key!] = val!;
            return acc;
          }, {});
        }

        const parent = parentStack.reduce((acc, cv) => {
          if (Array.isArray(acc)) {
            return acc[acc.length - 1][cv]
          };
          return acc[cv]
        }, objectBuilder);


        if (b.amountTrimmed > a.amountTrimmed) {
          const val = b.trimmedString[0] === '-' ? [] : {};

          if (Array.isArray(parent)) {
            if (a.isArrayElement) {
              parent.push({ [key!]: val })
            }
            else {
              parent[parent.length - 1][key!] = val;
            }
          }
          else {
            parent[key!] = val
          }

          parentStack.push(key!);
          continue;
        }
        if (b.amountTrimmed < a.amountTrimmed) {
          let difference = a.amountTrimmed - b.amountTrimmed;
          while (difference !== 0) {
            difference -= 2;
            parentStack.pop();
          }
        }

        if (Array.isArray(parent)) {
          if (key === undefined || key === '') {
            parent.push(val);
          }
          else if (a.isArrayElement) {
            parent.push({ [key!]: val });
          }
          else {
            parent[parent.length - 1][key!] = val;
          }
        }
        else {
          parent[key!] = val;
        }
      }

      result.push({ tag: tag, anchor: anchorId, data: objectBuilder });
    }

    return result;
  }

  private trimStartAndCount(input: string): { trimmedString: string, amountTrimmed: number } {
    const originalLength = input.length;
    const trimmedString = input.trimStart();
    const amountTrimmed = originalLength - trimmedString.length;

    return { trimmedString, amountTrimmed };
  }

  private iterateDocument(documentObject: object | Array<object>): Array<string> {
    const result: Array<string> = [];
    let lineTokens: Array<YamlLineToken> = [];

    if (Array.isArray(documentObject)) {
      documentObject.forEach((element) => {
        lineTokens.concat(Object.entries(element).map(([key, value]: [string, any]) => this.generateToken(key, value, 0)));
      });
    }
    else {
      lineTokens = Object.entries(documentObject).map(([key, value]: [string, any]) => this.generateToken(key, value, 0));
    }

    lineTokens.forEach((token: YamlLineToken) => {
      this.TokenToLine(token, result);
    });

    return result;
  }

  private generateToken(key: string, value: any, indentation: number, preFix: string = '', isArrayElement: boolean = false): YamlLineToken {
    let type: YamlDataType;
    let val: any = value;

    if (value === undefined || value === null) {
      type = 'empty';
    }
    else if (Array.isArray(value)) {
      type = value.length === 0 ? 'emptyArray' : 'array';
    }
    else if (typeof value === 'object') {
      type = (Object.keys(value).length === 0 && value.constructor === Object) ? 'emptyObject' : 'object';
    }
    else {
      type = 'primitive';
    }

    if (type === 'object') {
      val = Object.entries(value).map(([nestedKey, nestedValue]: [string, any]) => {
        const nestedIndentation: number = preFix === '- ' ? indentation + 4 : indentation + 2;
        return this.generateToken(nestedKey, nestedValue, nestedIndentation)
      });
    }

    if (type === 'array') {
      val = [];
      value.forEach((element: any) => {
        val.push(Object.entries(element).map(([nestedKey, nestedValue]: [string, any], index: number) => {
          const nestedIndentation: number = index === 0 ? indentation : indentation + 2;
          const nestedPrefix: string = index === 0 ? '- ' : '';

          return this.generateToken(nestedKey, nestedValue, nestedIndentation, nestedPrefix, true)
        }));
      });
    }

    return {
      type: type,
      key: key,
      value: val,
      indentation: indentation,
      preFix: preFix,
      isArrayElement: isArrayElement
    }
  }

  private TokenToLine(token: YamlLineToken, yamlLines: Array<string>): void {
    let preFix = `\r\n${' '.repeat(token.indentation)}${token.preFix}`;

    if (token.type === 'primitive') {
      if (token.isArrayElement && Number.isInteger(Number(token.key))) {
        yamlLines.push(`${preFix}${token.value}`);
      }
      else {
        yamlLines.push(`${preFix}${token.key}: ${token.value}`);
      }
    }
    else if (token.type === 'empty') {
      yamlLines.push(`${preFix}${token.key}:`);
    }
    else if (token.type === 'emptyArray') {
      yamlLines.push(`${preFix}${token.key}: []`);
    }
    else if (token.type === 'emptyObject') {
      yamlLines.push(`${preFix}${token.key}: {}`);
    }
    else if (token.type === 'object') {
      yamlLines.push(`${preFix}${token.key}:`);

      token.value.forEach((element: YamlLineToken) => {
        this.TokenToLine(element, yamlLines);
      });
    }
    else if (token.type === 'array') {
      yamlLines.push(`${preFix}${token.key}:`);

      token.value.forEach((element: Array<YamlLineToken>) => {
        element.forEach((elm: YamlLineToken) => {
          this.TokenToLine(elm, yamlLines);
        });
      });
    }
    else {
      throw Error(`Missing YamlLineToken type: ${token.type}`);
    }
  }

  private readonly _settings: { indentationLevel: number; fileHeader: string | null; } = { indentationLevel: 2, fileHeader: null };
}

type YamlDataType = 'object' | 'array' | 'primitive' | 'emptyObject' | 'emptyArray' | 'empty';

interface YamlLineToken {
  type: YamlDataType;
  key: string;
  value: any | Array<YamlLineToken>;
  indentation: number;
  preFix: string;
  isArrayElement: boolean;
}

export interface YamlDocument { tag: UnityYamlTag, anchor: string, data: object | Array<object> }
export type UnityYamlTag = '--- !u!1' | '--- !u!21' | '--- !u!23' | '--- !u!74' | '--- !u!91' | '--- !u!114' | '--- !u!206' | '--- !u!1001' | '--- !u!1101' | '--- !u!1102' | '--- !u!1107';

export interface GameObject {
  GameObject: {
    m_ObjectHideFlags: number;
    m_CorrespondingSourceObject: FileReference;
    m_PrefabInstance: FileReference;
    m_PrefabAsset: FileReference;
    serializedVersion: number;
    m_Component: Array<{ component: FileReference }>;
    m_Layer: number;
    m_Name: string;
    m_TagString: string;
    m_Icon: FileReference;
    m_NavMeshLayer: number;
    m_StaticEditorFlags: number;
    m_IsActive: number;
  }
}

export interface MeshRenderer {
  MeshRenderer: {
    m_ObjectHideFlags: number;
    m_CorrespondingSourceObject: FileReference;
    m_PrefabInstance: FileReference;
    m_PrefabAsset: FileReference;
    m_GameObject: FileReference;
    m_Enabled: number;
    m_CastShadows: number;
    m_ReceiveShadows: number;
    m_DynamicOccludee: number;
    m_StaticShadowCaster: number;
    m_MotionVectors: number;
    m_LightProbeUsage: number;
    m_ReflectionProbeUsage: number;
    m_RayTracingMode: number;
    m_RayTraceProcedural: number;
    m_RenderingLayerMask: number;
    m_RendererPriority: number;
    m_Materials: Array<{ fileID: number, guid: string, type: number }>;
    m_StaticBatchInfo: {
      firstSubMesh: number;
      subMeshCount: number;
    };
    m_StaticBatchRoot: FileReference;
    m_ProbeAnchor: FileReference;
    m_LightProbeVolumeOverride: FileReference;
    m_ScaleInLightmap: number;
    m_ReceiveGI: number;
    m_PreserveUVs: number;
    m_IgnoreNormalsForChartDetection: number;
    m_ImportantGI: number;
    m_StitchLightmapSeams: number;
    m_SelectedEditorRenderState: number;
    m_MinimumChartSize: number;
    m_AutoUVMaxDistance: number;
    m_AutoUVMaxAngle: number;
    m_LightmapParameters: FileReference;
    m_SortingLayerID: number;
    m_SortingLayer: number;
    m_SortingOrder: number;
    m_AdditionalVertexStreams: FileReference;
  }
}

export interface PrefabInstance {

}