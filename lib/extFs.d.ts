declare const extFs:IExtFs;

interface IExtFs {
  mkdirSync(toFile: string): Promise<any>;
  copyFiles(fromPath: string, toPath: string[], filter?: any): Promise<any>;
  copyFiles(op: object, filter?: any): Promise<any>;
  
  removeFiles(iPath: string | string[], filter?: any): Promise<any>;

  readFilePaths(iPath: string | string[], filter?: any, reverse?: boolean): Promise<any>;

  readFilesSync(iPath: string, filter?: any, ignoreFilter?: any): string[];
}
export = extFs;