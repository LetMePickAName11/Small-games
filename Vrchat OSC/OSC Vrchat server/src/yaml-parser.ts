export class YamlParser {
  constructor(fileHeader: string | null) {
    this.settings.fileHeader = fileHeader;
  }

  public parseDocumentless(data: Object | Array<Object>, includeHeader: boolean): string {
    const yamlLines: Array<string> = [];

    if (includeHeader) {
      yamlLines.push(this.settings.fileHeader!);
    }

    const indentation: YamlRecursionData = {
      number: 0,
      isArrayElement: false,
      isFirstElement: false
    };

    // Parse the object into YAML lines
    this.iterateDocument(data, yamlLines, indentation);

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

    const indentation: YamlRecursionData = {
      number: 0,
      isArrayElement: false,
      isFirstElement: false
    };

    documents.forEach((document: YamlDocument) => {
      // Add document start marker
      yamlLines.push(`\n${document.tag} &${document.anchor}`);
      // Parse the object into YAML lines
      this.iterateDocument(document.data, yamlLines, indentation);
    });

    return yamlLines.join('');
  }

  private iterateDocument(value: object | Array<object>, data: Array<string>, recursionData: YamlRecursionData): void {
    if (Array.isArray(value) && value.length !== 0) {
      // If the value is an array, set the flag and iterate over each element
      recursionData.isArrayElement = true;
      value.forEach((element) => {
        recursionData.isFirstElement = true;
        this.iterateDocument(element, data, recursionData);
      });
      // Reset the flags after processing the array
      recursionData.isArrayElement = false;
      recursionData.isFirstElement = false;
      return;
    }

    for (const [childKey, childValue] of Object.entries(value)) {
      let indentation: string = '';
      let elementPrefix: string = '';
      let line: string = '';

      if (childValue !== null && childValue !== undefined && typeof childValue === 'object' && childValue.length !== 0 && !(Object.keys(childValue).length === 0 && childValue.constructor === Object)) {
        // For nested objects, increase the indentation and add the key
        indentation = ' '.repeat(recursionData.number);
        line = `${childKey}:`;
        data.push(`\n${indentation}${elementPrefix}${line}`);

        // Recurse into the nested object
        recursionData.number += this.settings.indentationLevel;
        recursionData.isArrayElement = false;

        this.iterateDocument(childValue, data, recursionData);
        // Restore the previous indentation level
        recursionData.number -= this.settings.indentationLevel;
        continue;
      }

      // For primitive and object values, calculate the correct indentation and format the line
      if (typeof value === 'object') {
        indentation = ' '.repeat(recursionData.number - (recursionData.isArrayElement && recursionData.isFirstElement ? 2 : 0));
        elementPrefix = recursionData.isArrayElement && recursionData.isFirstElement ? '- ' : '';
        if (Array.isArray(childValue)) {
          line = `${childKey}: []`
        }
        else if (childValue === null || childValue === undefined ) {
          line = `${childKey}: `;
        }
        else if((Object.keys(childValue).length === 0 && childValue.constructor === Object)){
          line = `${childKey}: {}`;
        }
        else {
          line = `${childKey}: ${childValue}`;
        }
      } 
      else {
        indentation = ' '.repeat(recursionData.number - (recursionData.isArrayElement ? 2 : 0));
        elementPrefix = recursionData.isArrayElement ? '- ' : '';
        line = `${childValue}`;
      }
      // Reset the first element flag after the first iteration
      if (recursionData.isFirstElement) {
        recursionData.isFirstElement = false;
      }
      // Add the formatted line to the data array
      data.push(`\n${indentation}${elementPrefix}${line}`);
    }
  }

  private readonly settings: { indentationLevel: number; fileHeader: string | null; } = { indentationLevel: 2, fileHeader: null };
}


export interface YamlRecursionData {
  number: number;
  isArrayElement: boolean;
  isFirstElement: boolean;
}

export interface YamlDocument { tag: UnityYamlTag, anchor: number, data: object | Array<object> }

export type UnityYamlTag = '--- !u!74' | '--- !u!91' | '--- !u!114' | '--- !u!206' | '--- !u!1101' | '--- !u!1102' | '--- !u!1107';