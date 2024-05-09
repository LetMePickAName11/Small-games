// @ts-ignore
import fs from 'fs-extra';

export class FileService {
  public static getFile(path: string): string {
    return fs.readFileSync(path, 'utf8');
  }

  public static writeToFile(path: string, val: string | object): void {
    const content = typeof val === 'string' ? val : JSON.stringify(val, null, 2);
    fs.ensureFileSync(path);
    fs.outputFileSync(path, content);
  }

  public static copyFile(sourcePath: string, destinationPath: string): void {
    fs.copySync(sourcePath, destinationPath);
  }

  public static appendToFile(path: string, data: string): void {
    fs.appendFileSync(path, data);
  }

  public static getFileNamesInDir(directoryPath: string): Array<string> {
    return fs.readdirSync(directoryPath);
  }

  public static clearDirectory(directoryPath: string): void {
    fs.removeSync(directoryPath);
    fs.ensureDirSync(directoryPath)
  }

  public static findInFile(path: string, regex: RegExp): string {
    const data = FileService.getFile(path);
    const matches = data.match(regex) || [];

    if (matches.length > 1) {
      throw Error(`Too many matches in findInFile ${path} | ${regex}`);
    }

    return matches.pop()!;
  }

  public static replaceInFile(path: string, placeholder: string, replacement: string): void {
    const content = this.getFile(path).replace(placeholder, replacement);
    fs.outputFileSync(path, content);
  }
}