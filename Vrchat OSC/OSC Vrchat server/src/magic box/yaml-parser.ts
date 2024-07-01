export class YamlParser {
  constructor(fileHeader: string | null) {
    this.settings.fileHeader = fileHeader;
  }

  public parseDocumentless(data: Object | Array<Object>, includeHeader: boolean): string {
    const yamlLines: Array<string> = [];

    if (includeHeader) {
      yamlLines.push(this.settings.fileHeader!);
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
      yamlLines.push(this.settings.fileHeader!);
    }

    documents.forEach((document: YamlDocument) => {
      // Add document start marker
      yamlLines.push(`\n${document.tag} &${document.anchor}`);
      // Parse the object into YAML lines
      yamlLines.push(...this.iterateDocument(document.data));
    });

    return yamlLines.join('');
  }

  public iterateDocument(documentObject: object | Array<object>): Array<string> {
    const result: Array<string> = [];
    let lineTokens: Array<YamlLineToken> = [];

    if (Array.isArray(documentObject)) {
      documentObject.forEach((element) => {
        lineTokens.concat(Object.entries(element).map(([key, value]: [string, any]) => this.GenerateToken(key, value, 0)));
      });
    }
    else {
      lineTokens = Object.entries(documentObject).map(([key, value]: [string, any]) => this.GenerateToken(key, value, 0));
    }

    lineTokens.forEach((token: YamlLineToken) => {
      this.TokenToLine(token, result);
    });

    return result;
  }

  private GenerateToken(key: string, value: any, indentation: number, preFix: string = '', isArrayElement: boolean = false): YamlLineToken {
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
      val = Object.entries(value).map(([nestedKey, nestedValue]: [string, any]) => this.GenerateToken(nestedKey, nestedValue, indentation + 2));
    }

    if (type === 'array') {
      val = [];
      value.forEach((element: any) => {
        val.push(Object.entries(element).map(([nestedKey, nestedValue]: [string, any], index: number) => this.GenerateToken(nestedKey, nestedValue, index === 0 ? indentation : indentation + 2, index === 0 ? '- ' : '', true)));
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
    let preFix = `\n${' '.repeat(token.indentation)}${token.preFix}`;

    if (token.type === 'primitive') {
      if (token.isArrayElement && Number.isInteger(Number(token.key))) {
        yamlLines.push(`${preFix}${token.value}`);
      }
      else {
        yamlLines.push(`${preFix}${token.key}: ${token.value}`);
      }
    }
    else if (token.type === 'empty') {
      yamlLines.push(`${preFix}${token.key}: `);
    }
    else if (token.type === 'emptyArray') {
      yamlLines.push(`${preFix}${token.key}: []`);
    }
    else if (token.type === 'emptyObject') {
      yamlLines.push(`${preFix}${token.key}: {}`);
    }
    else if (token.type === 'object') {
      yamlLines.push(`${preFix}${token.key}: `);

      token.value.forEach((element: YamlLineToken) => {
        this.TokenToLine(element, yamlLines);
      });
    }
    else if (token.type === 'array') {
      yamlLines.push(`${preFix}${token.key}: `);

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

  private readonly settings: { indentationLevel: number; fileHeader: string | null; } = { indentationLevel: 2, fileHeader: null };
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

export interface YamlDocument { tag: UnityYamlTag, anchor: number, data: object | Array<object> }
export type UnityYamlTag = '--- !u!74' | '--- !u!91' | '--- !u!114' | '--- !u!206' | '--- !u!1101' | '--- !u!1102' | '--- !u!1107';