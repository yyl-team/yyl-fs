# extFs api

```typescript
declare const extFs:IExtFs;

interface ICopyLogs {
  add: string[]
  update: string[]
}

type TFilter = RegExp | ((curPath: string) => boolean)

interface IExtFs {
  /**
   * 创建文件夹
   * @param toFile 待创建文件夹
   */
  mkdirSync(toFile: string): Promise<string[]>;

  /**
   * 复制文件
   * @param fromPath 待复制文件目录
   * @param toPath 文件目标目录
   * @param filter 过滤
   */
  copyFiles(fromPath: string, toPath: string[], filter?: TFilter): Promise<ICopyLogs>;
  /**
   * 复制文件
   * @param op 复制 map
   * @param filter 过滤
   */
  copyFiles(op: {[fromPath: string]: string | string[]}, filter?: TFilter): Promise<ICopyLogs>;
  
  /**
   * 删除文件
   * @param iPath 目标路径
   * @param filter 过滤规则
   * @param includeSelf 包括自身 
   */
  removeFiles(iPath: string | string[], filter?: TFilter, includeSelf?: boolean): Promise<string[]>;
  /**
   * 删除文件
   * @param iPath 模板路径
   * @param includeSelf 包括自身 
   */
  removeFiles(iPath: string | string[], includeSelf: boolean): Promise<string[]>;

  /**
   * 读取文件目录
   * @param iPath 目标路径
   * @param filter 过滤规则
   * @param reverse 取反
   */
  readFilePaths(iPath: string | string[], filter?: any, reverse?: boolean): Promise<string[]>;

  /**
   * 读取文件目录
   * @param iPath 目标路径
   * @param filter 过滤规则
   * @param ignoreFilter 取反
   */
  readFilesSync(iPath: string, filter?: any, ignoreFilter?: any): string[];
}
export = extFs;
```