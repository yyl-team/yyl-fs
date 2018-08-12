const fs = require('fs');
const path = require('path');

const fn = {
  type: function(obj) {
    let type;
    const toString = Object.prototype.toString;
    if (obj === null) {
      type = String(obj);
    } else {
      type = toString.call(obj).toLowerCase();
      type = type.substring(8, type.length - 1);
    }
    return type;
  },
  isIgnore: function (iPath, filter) {
    let ignore = false;
    if (filter) {
      if (fn.type(filter) === 'function') {
        ignore = !filter(iPath);
      } else if (fn.type(filter) === 'regexp') {
        ignore = iPath.match(filter);
      }
    }
    return ignore;
  }
};
const extFs = {
  mkdirSync(toFile) {
    const tPath = toFile.replace(/[/\\]$/, '');
    const r = [];
    (function deep(iPath) {
      if (fs.existsSync(iPath) || /[/\\]$/.test(iPath)) {
        return;
      } else {
        deep(path.dirname(iPath));
        fs.mkdirSync(iPath);
        r.push(iPath);
      }
    })(tPath);
    return Promise.resolve(r);
  },
  copyFiles(fromPath, toPath, filter) {
    let copyMap = {};
    let iFilter;
    if (typeof fromPath === 'object') {
      copyMap = Object.assign(copyMap, fromPath);
      iFilter = toPath;
    } else {
      if (fn.type(toPath) === 'array') {
        copyMap[fromPath] = toPath;
      } else {
        copyMap[fromPath] = [toPath];
      }
      iFilter = filter;
    }

    // 数据格式化 转成 {from: [toFile]} 格式
    Object.keys(copyMap).forEach((key) => {
      if (!fs.existsSync(key)) {
        delete copyMap[key];
        return;
      }
      if (fn.type(copyMap[key]) !== 'array') {
        copyMap[key] = [copyMap[key]];
      }
    });


    const copyFile = (fromFile, toFile) => {
      const r = {
        add: [],
        update: []
      };

      if (fn.isIgnore(fromFile, iFilter)) {
        return Promise.resolve(r);
      }


      // build dir and log
      if (fs.existsSync(toFile)) {
        r.update.push(toFile);
      } else {
        extFs.mkdirSync(path.dirname(toFile));
        r.add.push(toFile);
      }

      const runner = (next, reject) => {
        const rStream = fs.createReadStream(fromFile);
        const wStream = fs.createWriteStream(toFile);
        rStream.pipe(wStream);
        wStream.on('finish', () => {
          next(r);
        });
        wStream.on('error', (er) => {
          reject(er);
        });
      };
      return new Promise(runner);
    };

    const copyPath = (fromPath, toPath) => {
      const r = {
        add: [],
        update: []
      };
      if (fn.isIgnore(fromPath, iFilter)) {
        return Promise.resolve(r);
      }

      if (!fs.existsSync(toPath)) {
        extFs.mkdirSync(toPath);
      }

      const runner = (next, reject) => {
        const dirMap = {};
        const dirs = fs.readdirSync(fromPath).map((name) => {
          const iPath = path.join(fromPath, name);
          dirMap[iPath] = path.join(toPath, name);
          return iPath;
        });

        let padding = dirs.length;
        const paddingCheck = () => {
          if (!padding) {
            next(r);
          }
        };

        dirs.forEach((iPath) => {
          const stat = fs.statSync(iPath);
          let handle = null;
          if (stat.isDirectory()) {
            handle = copyPath;
          } else {
            handle = copyFile;
          }
          handle(iPath, dirMap[iPath]).then((data) => {
            r.update = r.update.concat(data.update);
            r.add = r.add.concat(data.add);
            padding--;
            paddingCheck();
          }).catch((er) => {
            reject(er);
          });
        });

        paddingCheck();
      };

      return new Promise(runner);
    };

    const runner = (next, reject) => {
      let r = {
        add: [],
        update: []
      };
      let padding = Object.keys(copyMap).length;
      const paddingCheck = function() {
        if (!padding) {
          next(r);
        }
      };


      Object.keys(copyMap).forEach((key) => {
        const fromStat = fs.statSync(key);
        let handle = null;
        if (fromStat.isDirectory()) { // 文件夹
          handle = copyPath;
        } else { //文件
          handle = copyFile;
        }

        const arr = [];
        copyMap[key].forEach((toFile) => {
          arr.push(handle(key, toFile));
        });
        Promise.all(arr).then((values) => {
          values.map((data) => {
            r.add = r.add.concat(data.add);
            r.update = r.update.concat(data.update);
          });
          padding--;
          paddingCheck();
        }).catch((er) => {
          reject(er);
        });
      });

      paddingCheck();
    };

    return new Promise(runner);
  },
  removeFiles(fromPath, filter, includeSelf) {
    let list = [];
    let iFilter = null;
    let includeMe = false;
    if (fn.type(fromPath) === 'array') {
      list = fromPath;
    } else {
      list = [fromPath];
    }

    if (filter === true) { // removeFiles(fromPath, includeSelf);
      includeMe = filter;
      iFilter = null;
    } else {
      includeMe = includeSelf;
      iFilter = filter;
    }

    const rmPath = (rPath) => {
      let r = [];
      if (
        !fs.existsSync(rPath) ||
        fn.isIgnore(rPath, iFilter)
      ) {
        return Promise.resolve(r);
      }

      const runner = (next) => {
        const dirs = fs.readdirSync(rPath).map((name) => {
          return path.join(rPath, name);
        });
        let padding = dirs.length;
        const paddingCheck = () => {
          if (!padding) {
            fs.rmdir(rPath, (er) => {
              if (!er) {
                r.push(rPath);
              }
              next(r);
            });
          }
        };

        dirs.forEach((iPath) => {
          const stat = fs.statSync(iPath);
          let handle = null;

          if (stat.isDirectory()) {
            handle = rmPath;
          } else {
            handle = rmFile;
          }
          handle(iPath).then((data) => {
            r = r.concat(data);
            padding--;
            paddingCheck();
          });
        });
        paddingCheck();
      };

      return new Promise(runner);
    };

    const rmFile = (rPath) => {
      const r = [];
      if (
        !fs.existsSync(rPath) ||
        fn.isIgnore(rPath, iFilter)
      ) {
        return Promise.resolve(r);
      }

      const runner = (next) => {
        fs.unlink(rPath, (er) => {
          if (!er) {
            r.push(rPath);
          }
          next(r);
        });
      };

      return new Promise(runner);
    };

    const runner = (next, reject) => {
      let padding = list.length;
      let r = [];
      const paddingCheck = () => {
        if (!padding) {
          return next(r);
        }
      };
      list.forEach((iPath) => {
        if (!fs.existsSync(iPath)) {
          padding--;
          return paddingCheck();
        }
        const stat = fs.statSync(iPath);
        let handle = null;
        if (stat.isDirectory()) {
          handle = rmPath;
        } else {
          handle = rmFile;
        }

        handle(iPath).then((data) => {
          r = r.concat(data);
          padding--;
          if (handle === rmPath && !includeMe) {
            extFs.mkdirSync(iPath);
            r.splice(r.indexOf(iPath), 1);
          }
          paddingCheck();
        }).catch((er) => {
          reject(er);
        });
      });
    };

    return new Promise(runner);
  },
  readFilePaths(fromPath, filter, reverse) {
    let targetPaths;
    if (fn.type(fromPath) === 'array') {
      targetPaths = fromPath;
    } else {
      targetPaths = [fromPath];
    }



    const readPath = (iPath) => {
      let r = [];

      if (!fs.existsSync(iPath)) {
        return Promise.resolve(r);
      }


      const runner = (next, reject) => {
        const stat = fs.statSync(iPath);
        if (stat.isDirectory()) {
          const rPaths = fs.readdirSync(iPath).map((name) => path.join(iPath, name));


          let padding = rPaths.length;
          const paddingCheck = () => {
            if (!padding) {
              next(r);
            }
          };

          rPaths.forEach((iiPath) => {
            readPath(iiPath).then((data) => {
              r = r.concat(data);
              padding--;
              paddingCheck();
            }).catch((er) => {
              reject(er);
            });
          });
          paddingCheck();
        } else {
          let isIgnore = fn.isIgnore(iPath, filter);
          if (reverse) {
            isIgnore = !isIgnore;
          }
          if (!isIgnore) {
            r.push(iPath);
          }
          return next(r);
        }
      };

      return new Promise(runner);
    };

    const runner = (next, reject) => {
      let r = [];
      let padding = targetPaths.length;
      const paddingCheck = () => {
        if (!padding) {
          next(r);
        }
      };

      targetPaths.forEach((iPath) => {
        readPath(iPath).then((data) => {
          r = r.concat(data);
          padding--;
          paddingCheck();
        }).catch((er) => {
          reject(er);
        });
      });

      paddingCheck();
    };

    return new Promise(runner);
  }
};

module.exports = extFs;
