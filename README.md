# extFs api

## extFs.mkdirSync()
```
/**
 * @param {String} toPath 需要创建文件夹的完整路径
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
 * @param  {Array}          data       删除的文件列表
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
 * @param  {Array}          data       删除的文件列表
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
 * @param  {Array}          data       删除的文件列表
 */
extFs.readFilePaths(iPath, filter)
```

```
/**
 * @param {Array}           files
 * @param {Function|Regex}  filter
 * 
 * @return {Promsie}        then(list)
 * @param  {Array}          data       删除的文件列表
 */
extFs.readFilePaths(files, filter)
```
