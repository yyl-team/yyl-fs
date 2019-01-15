# extFs api

## extFs.mkdirSync()
```
/**
 * @param  {String} toPath      需要创建文件夹的完整路径
 *
 * @return {Promise} then(data)
 * @param  {Array}   data       总共创建多少个 文件夹
 */
extFs.mkdirSync(toPath);
```

## extFs.copyFiles()
```
/**
 * @param  {String}         fromPath
 * @param  {String}         toPath
 * @param  {Regex|Function} filter
 *
 * @return {Promsie}        then(data)
 * @param  {Object}         data
 * @param  {Array}          data.add    新增的文件列表
 * @param  {Array}          data.update 本身已存在文件列表
 **/
extFs.copyFiles(fromPath, toPath, filter)
```

```
/**
 * @param  {Object}         map {fromPath: toPath}
 * @param  {String}         fromPath
 * @param  {String}         toPath
 * @param  {Regex|Function} filter
 *
 * @return {Promsie}        then(data)
 * @param  {Object}         data
 * @param  {Array}          data.add    新增的文件列表
 * @param  {Array}          data.update 本身已存在文件列表
 **/
extFs.copyFiles(map, filter)
```

## extFs.removeFiles()
```
/**
 * @param {String}          iPath
 * @param {Function|Regex}  filter
 * @param {Boolean}         includeSelf 是否包含自身(对文件夹有效)
 * 
 * @return {Promsie}        then(list)
 * @param  {Array}          list       删除的文件列表
 */
extFs.removeFiles(iPath, filter, includeSelf)
```

```
/**
 * @param {Array}           files
 * @param {Function|Regex}  filter
 * @param {Boolean}         includeSelf 是否包含自身(对文件夹有效)
 * 
 * @return {Promsie}        then(list)
 * @param  {Array}          list       删除的文件列表
 */
extFs.removeFiles(files, filter, includeSelf)
```

## exgFs.readFilePaths()
```
/**
 * @param {String}          iPath
 * @param {Function|Regex}  filter
 * 
 * @return {Promsie}        then(list)
 * @param  {Array}          list      删除的文件列表
 */
extFs.readFilePaths(iPath, filter)
```

```
/**
 * @param {Array}           files
 * @param {Function|Regex}  filter
 * @param {Boolean}         reverse filter 结果取反
 * 
 * @return {Promsie}        then(list)
 * @param  {Array}          list       删除的文件列表
 */
extFs.readFilePaths(files, filter, reverse)
```

### extFs.readFilesSync(iPath, filter);
```
/**
 * 获取目录下所有文件路径
 * @param  {String}          iPath                文件目录
 * @param  {Function}        callback(err, files) 复制成功回调函数
 *                           -err   [string]      错误信息
 *                           -files [array]       复制成功的文件列表
 * @param  {Regex|Function}  filter               文件过滤正则
 *                           filter(filePath)     文件过滤函数 返回 true 则加入到返回列表
 * @param  {String}          -filePath            文件目录
 * @param  {Regex}           ignoreFilter         跳过搜索的目录 regex
 * @return {Array}           files                文件列表
 */
extFs.readFilesSync(iPath, filter, reverse);
```
