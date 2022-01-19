"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

window.SBDL = function () {
  'use strict';
  /**
   * An error where the project cannot be loaded as the desired type, but it is likely that this project is of another format.
   */

  var ProjectFormatError =
  /*#__PURE__*/
  function (_Error) {
    _inherits(ProjectFormatError, _Error);

    function ProjectFormatError(message, probableType) {
      var _this;

      _classCallCheck(this, ProjectFormatError);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(ProjectFormatError).call(this, message + ' (probably a .' + probableType + ')'));
      _this.probableType = probableType;
      return _this;
    }

    return ProjectFormatError;
  }(_wrapNativeSuper(Error));

  var SB_MAGIC = 'ScratchV0';
  var ZIP_MAGIC = 'PK';
  var fetchQueue = {
    concurrentRequests: 0,
    maxConcurrentRequests: 30,
    queue: [],
    add: function add(url) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        _this2.queue.push({
          url: url,
          resolve: resolve,
          reject: reject
        });

        if (_this2.concurrentRequests < _this2.maxConcurrentRequests) {
          _this2.processNext();
        }
      });
    },
    processNext: function processNext() {
      var _this3 = this;

      if (this.queue.length === 0) {
        return;
      }

      var request = this.queue.shift();
      this.concurrentRequests++;
      window.fetch(request.url).then(function (r) {
        _this3.concurrentRequests--;

        _this3.processNext();

        request.resolve(r);
      })["catch"](function (err) {
        _this3.concurrentRequests--;

        _this3.processNext();

        request.reject(err);
      });
    }
  };

  function fetch(url) {
    return fetchQueue.add(url);
  } // Customizable hooks that can be overridden by other scripts to measure progress.


  var progressHooks = {
    // Indicates a loader has just started
    start: function start() {},
    // Indicates a new task has started.
    newTask: function newTask() {},
    // Indicates a task has finished
    finishTask: function finishTask() {}
  };

  function checkMagic(buffer, magic) {
    var header = new Uint8Array(buffer.slice(0, magic.length));

    for (var i = 0; i < magic.length; i++) {
      if (header[i] !== magic.charCodeAt(i)) {
        return false;
      }
    }

    return true;
  } // Sorts a list of files in-place.


  function sortFiles(files) {
    files.sort(function (a, b) {
      var nameA = a.path;
      var nameB = b.path; // project.json always the top

      if (nameA === "project.json") {
        return -1;
      } else if (nameB === "project.json") {
        return 1;
      }

      var valueA = +nameA.split('.').shift() || 0;
      var valueB = +nameB.split('.').shift() || 0;

      if (valueA < valueB) {
        return -1;
      } else if (valueA > valueB) {
        return 1;
      } // Fallback to just a string compare


      return nameA.localeCompare(nameB);
    });
  } // Loads a Scratch 1 project


  function loadScratch1Project(id) {
    var PROJECTS_API = 'https://projects.scratch.mit.edu/internalapi/project/$id/get/';
    var result = {
      title: id.toString(),
      extension: 'sb',
      // Scratch 1 projects load as buffers because they use a custom format that I don't want to implement.
      // The API only responds with the full file.
      type: 'buffer',
      buffer: null
    };
    return fetch(PROJECTS_API.replace('$id', id)).then(function (data) {
      return data.arrayBuffer();
    }).then(function (buffer) {
      if (!checkMagic(buffer, SB_MAGIC)) {
        throw new Error('Project is not a valid .sb file (failed magic check)');
      }

      result.buffer = buffer;
      return result;
    });
  } // Loads a Scratch 2 project


  function loadScratch2Project(id) {
    var PROJECTS_API = 'https://projects.scratch.mit.edu/internalapi/project/$id/get/'; // Scratch 2 projects can either by stored as JSON (project.json) or binary (sb2 file)
    // JSON example: https://scratch.mit.edu/projects/15832807 (most Scratch 2 projects are like this)
    // Binary example: https://scratch.mit.edu/projects/250740608

    progressHooks.start();
    progressHooks.newTask();
    var blob; // The fetch routine is rather complicated because we have to determine which type of project we are looking at.

    return fetch(PROJECTS_API.replace('$id', id)).then(function (request) {
      if (request.status !== 200) {
        throw new Error('Returned status code: ' + request.status);
      }

      return request.blob();
    }).then(function (b) {
      blob = b;
      return new Promise(function (resolve, reject) {
        var fileReader = new FileReader();

        fileReader.onload = function () {
          return resolve(fileReader.result);
        };

        fileReader.onerror = function () {
          return reject(new Error('Cannot read blob as text'));
        };

        fileReader.readAsText(blob);
      });
    }).then(function (text) {
      var projectData;

      try {
        projectData = JSON.parse(text);
      } catch (e) {
        return loadScratch2BinaryProject(id, blob);
      }

      return loadScratch2JSONProject(id, projectData);
    }).then(function (result) {
      progressHooks.finishTask();
      return result;
    });
  } // Loads a Scratch 2 binary-type project


  function loadScratch2BinaryProject(id, blob) {
    return new Promise(function (resolve, reject) {
      var fileReader = new FileReader();

      fileReader.onload = function () {
        if (!checkMagic(fileReader.result, ZIP_MAGIC)) {
          if (checkMagic(fileReader.result, SB_MAGIC)) {
            reject(new ProjectFormatError('File is not a valid .sb2 (failed magic check)', 'sb'));
          }

          reject(new Error('File is not a valid .sb2 (failed magic check)'));
          return;
        }

        resolve({
          title: id.toString(),
          extension: 'sb2',
          type: 'buffer',
          buffer: fileReader.result
        });
      };

      fileReader.onerror = function () {
        return reject(new Error('Cannot read blob as array buffer'));
      };

      fileReader.readAsArrayBuffer(blob);
    });
  } // Loads a Scratch 2 JSON-type project


  function loadScratch2JSONProject(id, projectData) {
    var ASSETS_API = 'https://cdn.assets.scratch.mit.edu/internalapi/asset/$path/get/';
    var IMAGE_EXTENSIONS = ['svg', 'png', 'jpg', 'jpeg', 'bmp', 'gif'];
    var SOUND_EXTENSIONS = ['wav', 'mp3'];
    var result = {
      title: id.toString(),
      extension: 'sb2',
      files: [],
      type: 'zip'
    }; // sb2 files have two ways of storing references to files.
    // In the online editor they use md5 hashes which point to an API destination.
    // In the offline editor they use separate accumulative file IDs for images and sounds.
    // The files served from the Scratch API don't contain the file IDs we need to export a valid .sb2, so we must create those ourselves.

    var soundAccumulator = 0;
    var imageAccumulator = 0; // Gets the md5 and extension of an object.

    function md5Of(thing) {
      // Search for any of the possible md5 attributes, falling back to just stringifying the input.
      return thing.md5 || thing.baseLayerMD5 || thing.penLayerMD5 || thing.toString();
    }

    function claimAccumulatedID(extension) {
      if (IMAGE_EXTENSIONS.includes(extension)) {
        return imageAccumulator++;
      } else if (SOUND_EXTENSIONS.includes(extension)) {
        return soundAccumulator++;
      } else {
        throw new Error('unknown extension: ' + extension);
      }
    }

    function addAsset(asset) {
      progressHooks.newTask();
      var md5 = asset.md5;
      var extension = asset.extension;
      var accumulator = claimAccumulatedID(extension);
      var path = accumulator + '.' + extension; // Update IDs in all references to match the accumulator
      // Downloaded projects usually use -1 for all of these, but sometimes they exist and are just wrong since we're redoing them all.

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = asset.references[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var reference = _step.value;

          if ('baseLayerID' in reference) {
            reference.baseLayerID = accumulator;
          }

          if ('soundID' in reference) {
            reference.soundID = accumulator;
          }

          if ('penLayerID' in reference) {
            reference.penLayerID = accumulator;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return fetch(ASSETS_API.replace('$path', md5)).then(function (request) {
        return request.arrayBuffer();
      }).then(function (buffer) {
        result.files.push({
          path: path,
          data: buffer
        });
        progressHooks.finishTask();
      });
    } // Processes a list of assets
    // Finds and groups duplicate assets.


    function processAssets(assets) {
      // Records a list of all unique asset md5s and stores all references to an asset.
      var hashToAssetMap = Object.create(null);
      var allAssets = [];
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = assets[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var data = _step2.value;
          var md5ext = md5Of(data);

          if (!(md5ext in hashToAssetMap)) {
            var asset = {
              md5: md5ext,
              extension: md5ext.split('.').pop(),
              references: []
            };
            hashToAssetMap[md5ext] = asset;
            allAssets.push(asset);
          }

          hashToAssetMap[md5ext].references.push(data);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
            _iterator2["return"]();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return allAssets;
    }

    var children = projectData.children.filter(function (c) {
      return !c.listName && !c.target;
    });
    var targets = [].concat.apply([], [projectData, children]);
    var costumes = [].concat.apply([], targets.map(function (c) {
      return c.costumes || [];
    }));
    var sounds = [].concat.apply([], targets.map(function (c) {
      return c.sounds || [];
    }));
    var assets = processAssets([].concat.apply([], [costumes, sounds, projectData]));
    return Promise.all(assets.map(function (a) {
      return addAsset(a);
    })).then(function () {
      // We must add the project JSON at the end because it was probably changed during the loading from updating asset IDs
      result.files.push({
        path: 'project.json',
        data: JSON.stringify(projectData)
      });
      sortFiles(result.files);
      return result;
    });
  } // Loads a Scratch 3 project


  function loadScratch3Project(id) {
    var PROJECTS_API = 'https://projects.scratch.mit.edu/$id';
    var ASSETS_API = 'https://assets.scratch.mit.edu/internalapi/asset/$path/get/';
    var result = {
      title: id.toString(),
      extension: 'sb3',
      files: [],
      type: 'zip'
    };

    function addFile(data) {
      progressHooks.newTask();
      var path = data.md5ext || data.assetId + '.' + data.dataFormat;
      return fetch(ASSETS_API.replace('$path', path)).then(function (request) {
        return request.arrayBuffer();
      }).then(function (buffer) {
        result.files.push({
          path: path,
          data: buffer
        });
        progressHooks.finishTask();
      });
    } // Removes assets with the same ID


    function dedupeAssets(assets) {
      var result = [];
      var knownIds = new Set();
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = assets[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var i = _step3.value;
          var _id = i.assetId;

          if (knownIds.has(_id)) {
            continue;
          }

          knownIds.add(_id);
          result.push(i);
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
            _iterator3["return"]();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      return result;
    }

    progressHooks.start();
    progressHooks.newTask();
    return fetch(PROJECTS_API.replace('$id', id)).then(function (request) {
      return request.json();
    }).then(function (projectData) {
      if (typeof projectData.objName === 'string') {
        throw new ProjectFormatError('Not a Scratch 3 project (found objName)', 'sb2');
      }

      if (!Array.isArray(projectData.targets)) {
        throw new Error('Not a Scratch 3 project, missing targets');
      }

      result.files.push({
        path: 'project.json',
        data: JSON.stringify(projectData)
      });
      var targets = projectData.targets;
      var costumes = [].concat.apply([], targets.map(function (t) {
        return t.costumes || [];
      }));
      var sounds = [].concat.apply([], targets.map(function (t) {
        return t.sounds || [];
      }));
      var assets = dedupeAssets([].concat.apply([], [costumes, sounds]));
      return Promise.all(assets.map(function (a) {
        return addFile(a);
      }));
    }).then(function () {
      sortFiles(result.files);
      progressHooks.finishTask();
      return result;
    });
  } // Adds a list of files to a JSZip archive.
  // This is a convenience method to make the library less painful to use. It's not used by SBDL internally.
  // If a 'zip' type result is returned, pass result.files into here to get a Blob out.
  // progressCallback (optional) will be called when the progress changes


  function createArchive(files, progressCallback) {
    var zip = new JSZip();

    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      var path = file.path;
      var data = file.data;
      zip.file(path, data);
    }

    return zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE'
    }, function (metadata) {
      if (progressCallback) {
        progressCallback(metadata.percent / 100);
      }
    });
  } // Loads a project, automatically choses the loader


  function loadProject(id, type) {
    var loaders = {
      sb: loadScratch1Project,
      sb2: loadScratch2Project,
      sb3: loadScratch3Project
    };
    type = type.toString();

    if (!(type in loaders)) {
      return Promise.reject(new Error('Unknown type: ' + type));
    }

    return loaders[type](id);
  }

  return {
    loadScratch1Project: loadScratch1Project,
    loadScratch2Project: loadScratch2Project,
    loadScratch3Project: loadScratch3Project,
    loadProject: loadProject,
    createArchive: createArchive,
    progressHooks: progressHooks
  };
}();