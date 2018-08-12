const path = require('path');
const fs = require('fs');
const expect = require('chai').expect;
const extFs = require('../index.js');
const util = require('yyl-util');

const FRAG_PATH = path.join(__dirname, '__frag');
const fn = {
  frag: {
    build() {
      if (fs.existsSync(FRAG_PATH)) {
        return extFs.removeFiles(FRAG_PATH);
      } else {
        return extFs.mkdirSync(FRAG_PATH);
      }
    },
    destroy() {
      return extFs.removeFiles(FRAG_PATH, true);
    },
    here(f, done) {
      new util.Promise((next) => {
        fn.frag.build().then(() => {
          next();
        });
      }).then((next) => {
        f(next);
      }).then(() => {
        fn.frag.destroy().then(() => {
          done();
        });
      }).start();
    }
  },
  mkFilesSync: function(list) {
    list.forEach((iPath) => {
      extFs.mkdirSync(path.dirname(iPath));
      fs.writeFileSync(iPath, '');
    });
  }
};

const TEST_CTRL = {
  MKDIR: true,
  REMOVE: true,
  COPY: true,
  READ: true
};

if (TEST_CTRL.MKDIR) {
  describe('extFs.mkdirSync() usage test', () => {
    const testPaths = [
      'a/b/c/d',
      'a/b/c/d/e/'
    ].map((iPath) => {
      return path.join(FRAG_PATH, iPath);
    });
    it('frag build', function(done) {
      this.timeout(0);
      fn.frag.build().then(() => {
        done();
      });
    });
    testPaths.forEach((iPath) => {
      it(`extFs.mkdirSync(${iPath})`, function(done) {
        this.timeout(0);

        extFs.mkdirSync(iPath);
        expect(fs.existsSync(iPath)).to.equal(true);
        done();
      });
    });

    it('frag destroy', function(done) {
      this.timeout(0);
      fn.frag.destroy().then(() => {
        done();
      });
    });
  });

  describe('extFs.mkdirSync() log test', () => {
    it('new mkdir log test', function(done) {
      this.timeout(0);
      new util.Promise((next) => {
        fn.frag.build().then(() => {
          next();
        });
      }).then((next) => {
        const fPath = path.join(FRAG_PATH, 'a/b/c');
        extFs.mkdirSync(fPath).then((list) => {
          expect(list.length).to.equal(3);
          next();
        });
      }).then((next) => {
        const fPath = path.join(FRAG_PATH, 'a/b');
        extFs.mkdirSync(fPath).then((list) => {
          expect(list.length).to.equal(0);
          next();
        });
      }).then((next) => {
        const fPath = path.join(FRAG_PATH, 'a/b/c/d');
        extFs.mkdirSync(fPath).then((list) => {
          expect(list.length).to.equal(1);
          next();
        });
      }).then(() => {
        fn.frag.destroy().then(() => {
          done();
        });
      }).start();
    });
  });
}

if (TEST_CTRL.REMOVE) {
  describe('extFs.removeFiles() usage', () => {
    it('extFs.removeFiles(isPath)', function(done) {
      this.timeout(0);
      fn.frag.here((next) => {
        fn.mkFilesSync([
          'a/b/c/hello.js'
        ].map((name) => {
          return path.join(FRAG_PATH, name);
        }));
        const tPath = path.join(FRAG_PATH, 'a');
        const rPath = path.join(tPath, 'b');
        extFs.removeFiles(
          tPath
        ).then(() => {
          expect(fs.existsSync(rPath)).to.equal(false);
          next();
        });
      }, done);
    });

    it('extFs.removeFiles(isFile)', function(done) {
      this.timeout(0);
      fn.frag.here((next) => {
        fn.mkFilesSync([
          'a/hello.js'
        ].map((name) => {
          return path.join(FRAG_PATH, name);
        }));
        const rPath = path.join(FRAG_PATH, 'a/hello.js');
        const pPath = path.join(FRAG_PATH, 'a');
        extFs.removeFiles(
          rPath
        ).then(() => {
          expect(fs.existsSync(rPath)).to.equal(false);
          expect(fs.existsSync(pPath)).to.equal(true);
          next();
        });
      }, done);
    });

    it('extFs.removeFiles(pathList)', function(done) {
      this.timeout(0);
      fn.frag.here((next) => {
        // prepare
        const pathList = [
          'pathA/child',
          'pathB/child/hello'
        ].map((name) => {
          return path.join(FRAG_PATH, name);
        });

        pathList.forEach((iPath) => {
          extFs.mkdirSync(iPath);
        });

        const fileList = [
          'fileA/a.js',
          'fileB/to/b.js'
        ].map((name) => {
          return path.join(FRAG_PATH, name);
        });

        const rList = [
          'pathA',
          'pathB/child',
          'fileA',
          'fileB'
        ].map((name) => path.join(FRAG_PATH, name));

        fn.mkFilesSync(fileList);

        // run
        extFs.removeFiles(rList).then(() => {
          pathList.concat(fileList).forEach((iPath) => {
            expect(fs.existsSync(iPath)).to.equal(false);
          });
          next();
        });
      }, done);
    });

    it('extFs.removeFiles(isPath, filter:function)', function(done) {
      this.timeout(0);
      fn.frag.here((next) => {
        fn.mkFilesSync([
          'path/to/a.js',
          'path/to/b.js'
        ].map((name) => {
          return path.join(FRAG_PATH, name);
        }));

        extFs.removeFiles(path.join(FRAG_PATH, 'path'), (iPath) => {
          return /a\.js/.test(iPath);
        }).then(() => {
          expect(fs.existsSync(path.join(FRAG_PATH, 'path/to/b.js')))
            .to.equal(true);
          next();
        });
      }, done);
    });

    it('extFs.removeFiles(isPath, filter:regexp)', function(done) {
      this.timeout(0);
      fn.frag.here((next) => {
        fn.mkFilesSync([
          'path/to/a.js',
          'path/to/b.js'
        ].map((name) => {
          return path.join(FRAG_PATH, name);
        }));

        extFs.removeFiles(path.join(FRAG_PATH, 'path'), /a\.js/).then(() => {
          expect(fs.existsSync(path.join(FRAG_PATH, 'path/to/a.js')))
            .to.equal(true);
          next();
        });
      }, done);
    });

    it('extFs.removeFiles(isPath, filter, includeSelf)', function(done) {
      this.timeout(0);
      fn.frag.here((next) => {
        fn.mkFilesSync([
          'path/to/a.js',
          'path/to/b.js'
        ].map((name) => {
          return path.join(FRAG_PATH, name);
        }));

        extFs.removeFiles(path.join(FRAG_PATH, 'path'), null, true).then(() => {
          expect(fs.existsSync(path.join(FRAG_PATH, 'path')))
            .to.equal(false);
          next();
        });
      }, done);
    });

    it('extFs.removeFiles(isPath, includeSelf)', function(done) {
      this.timeout(0);
      fn.frag.here((next) => {
        fn.mkFilesSync([
          'path/to/a.js',
          'path/to/b.js'
        ].map((name) => {
          return path.join(FRAG_PATH, name);
        }));

        extFs.removeFiles(path.join(FRAG_PATH, 'path'), true).then(() => {
          expect(fs.existsSync(path.join(FRAG_PATH, 'path')))
            .to.equal(false);
          next();
        });
      }, done);
    });

    it('extFs.removeFiles(isPath).then(data)', function(done) {
      this.timeout(0);
      fn.frag.here((next) => {
        const pathList = [
          'path/to/A',
          'path/to/B'
        ].map((name) => path.join(FRAG_PATH, name));
        const fileList = [
          'file/to/A.js',
          'file/to/B.js'
        ].map((name) => path.join(FRAG_PATH, name));

        pathList.forEach((iPath) => {
          extFs.mkdirSync(iPath);
        });

        fn.mkFilesSync(fileList);

        extFs.removeFiles(FRAG_PATH).then((data) => {
          expect(data.length).to.equal(8);
          next();
        });
      }, done);
    });
  });
}

if (TEST_CTRL.COPY) {
  describe('extFs.copyFiles() usage', () => {
    it('extFs.copyFiles(fromPath, toPath)', function(done) {
      this.timeout(0);
      fn.frag.here((next) => {
        fn.mkFilesSync([
          'A/to/path/hello.js',
          'A/to/path/hello2.js'
        ].map((name) => path.join(FRAG_PATH, name)));

        extFs.copyFiles(
          path.join(FRAG_PATH, 'A'),
          path.join(FRAG_PATH, 'B')
        ).then(() => {
          const rPaths = [
            'B/to/path/hello.js',
            'B/to/path/hello2.js'
          ].map((name) => path.join(FRAG_PATH, name));
          rPaths.forEach((iPath) => {
            expect(fs.existsSync(iPath)).to.equal(true);
          });
          next();
        });
      }, done);
    });

    it('extFs.copyFiles(fromFile, toFile)', function(done) {
      this.timeout(0);
      fn.frag.here((next) => {
        fn.mkFilesSync([
          'A/to/path/hello.js'
        ].map((name) => path.join(FRAG_PATH, name)));

        extFs.copyFiles(
          path.join(FRAG_PATH, 'A/to/path/hello.js'),
          path.join(FRAG_PATH, 'B/to/path/hello.js')
        ).then(() => {
          const rPaths = [
            'B/to/path/hello.js'
          ].map((name) => path.join(FRAG_PATH, name));
          rPaths.forEach((iPath) => {
            expect(fs.existsSync(iPath)).to.equal(true);
          });
          next();
        });
      }, done);
    });

    it('extFs.copyFiles(fromFile, toFileArr)', function(done) {
      this.timeout(0);
      fn.frag.here((next) => {
        fn.mkFilesSync([
          'A/to/path/hello.js'
        ].map((name) => path.join(FRAG_PATH, name)));

        extFs.copyFiles(
          path.join(FRAG_PATH, 'A/to/path/hello.js'),
          [
            path.join(FRAG_PATH, 'B/to/path/hello.js'),
            path.join(FRAG_PATH, 'C/to/path/hello.js')
          ]
        ).then(() => {
          const rPaths = [
            'B/to/path/hello.js',
            'C/to/path/hello.js'
          ].map((name) => path.join(FRAG_PATH, name));
          rPaths.forEach((iPath) => {
            expect(fs.existsSync(iPath)).to.equal(true);
          });
          next();
        });
      }, done);
    });

    it('extFs.copyFiles(copyMap: {path: path})', function(done) {
      this.timeout(0);
      fn.frag.here((next) => {
        fn.mkFilesSync([
          'A/to/path/hello.js'
        ].map((name) => path.join(FRAG_PATH, name)));

        const copyMap = {};

        copyMap[
          path.join(FRAG_PATH, 'A/to/path/hello.js')
        ] = path.join(FRAG_PATH, 'B/to/path/hello.js');

        extFs.copyFiles(copyMap).then(() => {
          const rPaths = [
            'B/to/path/hello.js'
          ].map((name) => path.join(FRAG_PATH, name));
          rPaths.forEach((iPath) => {
            expect(fs.existsSync(iPath)).to.equal(true);
          });
          next();
        });
      }, done);
    });

    it('extFs.copyFiles(copyMap: {path: [path]})', function(done) {
      this.timeout(0);
      fn.frag.here((next) => {
        fn.mkFilesSync([
          'A/to/path/hello.js'
        ].map((name) => path.join(FRAG_PATH, name)));

        const copyMap = {};

        copyMap[path.join(FRAG_PATH, 'A/to/path/hello.js')] = [
          path.join(FRAG_PATH, 'B/to/path/hello.js'),
          path.join(FRAG_PATH, 'C/to/path/hello.js')
        ];

        extFs.copyFiles(copyMap).then(() => {
          const rPaths = [
            'B/to/path/hello.js',
            'C/to/path/hello.js'
          ].map((name) => path.join(FRAG_PATH, name));
          rPaths.forEach((iPath) => {
            expect(fs.existsSync(iPath)).to.equal(true);
          });
          next();
        });
      }, done);
    });

    it('extFs.copyFiles(fromPath, toPath, filter:function)', function(done) {
      this.timeout(0);
      fn.frag.here((next) => {
        fn.mkFilesSync([
          'A/to/path/hello.js',
          'A/to/path/hello2.js'
        ].map((name) => path.join(FRAG_PATH, name)));

        const fromPath = path.join(FRAG_PATH, 'A');
        const toPath = path.join(FRAG_PATH, 'B');
        extFs.copyFiles(fromPath, toPath, (iPath) => {
          return /hello\.js/.test(iPath) || fs.statSync(iPath).isDirectory();
        }).then(() => {
          const rPaths = [
            'B/to/path/hello.js'
          ].map((name) => path.join(FRAG_PATH, name));
          const nPaths = [
            'B/to/path/hello2.js'
          ].map((name) => path.join(FRAG_PATH, name));
          rPaths.forEach((iPath) => {
            expect(fs.existsSync(iPath)).to.equal(true);
          });
          nPaths.forEach((iPath) => {
            expect(fs.existsSync(iPath)).to.equal(false);
          });
          next();
        });
      }, done);
    });

    it('extFs.copyFiles(fromPath, toPath, filter:regex)', function(done) {
      this.timeout(0);
      fn.frag.here((next) => {
        fn.mkFilesSync([
          'A/to/path/hello.js',
          'A/to/path/hello2.js'
        ].map((name) => path.join(FRAG_PATH, name)));

        const fromPath = path.join(FRAG_PATH, 'A');
        const toPath = path.join(FRAG_PATH, 'B');
        extFs.copyFiles(fromPath, toPath, /hello2\.js/).then(() => {
          const rPaths = [
            'B/to/path/hello.js'
          ].map((name) => path.join(FRAG_PATH, name));
          const nPaths = [
            'B/to/path/hello2.js'
          ].map((name) => path.join(FRAG_PATH, name));
          rPaths.forEach((iPath) => {
            expect(fs.existsSync(iPath)).to.equal(true);
          });
          nPaths.forEach((iPath) => {
            expect(fs.existsSync(iPath)).to.equal(false);
          });
          next();
        });
      }, done);
    });

    it('extFs.copyFiles(fromPath, toPath).then(data)', function(done) {
      this.timeout(0);
      fn.frag.here((NEXT) => {
        const fromPath = path.join(FRAG_PATH, 'A');
        const toPath = path.join(FRAG_PATH, 'B');

        new util.Promise((next) => {
          fn.mkFilesSync([
            'A/to/path/hello.js',
            'A/to/path/hello2.js'
          ].map((name) => path.join(FRAG_PATH, name)));

          extFs.copyFiles(fromPath, toPath).then((data) => {
            expect(data.update.length).to.equal(0);
            expect(data.add.length).to.equal(2);

            next();
          });
        }).then(() => {
          fn.mkFilesSync([
            'A/to/path/hello3.js'
          ].map((name) => path.join(FRAG_PATH, name)));

          extFs.copyFiles(fromPath, toPath).then((data) => {
            expect(data.update.length).to.equal(2);
            expect(data.add.length).to.equal(1);
            NEXT();
          });
        }).start();
      }, done);
    });
  });
}

if (TEST_CTRL.READ) {
  describe('extFs.readFilePaths() usage', () => {
    it ('extFs.readFilePaths(iPath)', function(done) {
      this.timeout(0);
      fn.frag.here((next) => {
        fn.mkFilesSync([
          'A/to/path/hello.js',
          'A/to/path/hello2.js'
        ].map((name) => path.join(FRAG_PATH, name)));

        extFs.readFilePaths(path.join(FRAG_PATH)).then((data) => {
          expect(data.length).to.equal(2);
          next();
        });
      }, done);
    });

    it ('extFs.readFilePaths(iPath, filter:function)', function(done) {
      this.timeout(0);
      fn.frag.here((next) => {
        fn.mkFilesSync([
          'A/to/path/hello.js',
          'A/to/path/hello2.js'
        ].map((name) => path.join(FRAG_PATH, name)));

        extFs.readFilePaths(path.join(FRAG_PATH), (iPath) => {
          return /hello2\.js/.test(iPath);
        }).then((data) => {
          expect(data.length).to.equal(1);
          expect(data[0]).to.equal(path.join(FRAG_PATH, 'A/to/path/hello2.js'));
          next();
        });
      }, done);
    });

    it ('extFs.readFilePaths(iPath, filter:regex)', function(done) {
      this.timeout(0);
      fn.frag.here((next) => {
        fn.mkFilesSync([
          'A/to/path/hello.js',
          'A/to/path/hello2.js'
        ].map((name) => path.join(FRAG_PATH, name)));

        extFs.readFilePaths(path.join(FRAG_PATH), /hello\.js/).then((data) => {
          expect(data.length).to.equal(1);
          expect(data[0]).to.equal(path.join(FRAG_PATH, 'A/to/path/hello2.js'));
          next();
        });
      }, done);
    });

    it ('extFs.readFilePaths(iPath, filter:regex, reverse)', function(done) {
      this.timeout(0);
      fn.frag.here((next) => {
        fn.mkFilesSync([
          'A/to/path/hello.js',
          'A/to/path/hello2.js'
        ].map((name) => path.join(FRAG_PATH, name)));

        extFs.readFilePaths(path.join(FRAG_PATH), /hello2\.js/, true).then((data) => {
          expect(data.length).to.equal(1);
          expect(data[0]).to.equal(path.join(FRAG_PATH, 'A/to/path/hello2.js'));
          next();
        });
      }, done);
    });
  });
}
