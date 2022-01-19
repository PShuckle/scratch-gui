"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var _seleniumWebdriver = _interopRequireWildcard(require("selenium-webdriver"));

var _chrome = _interopRequireDefault(require("selenium-webdriver/chrome.js"));

var _chromedriver = _interopRequireDefault(require("chromedriver"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// const {
//     By
// } = webdriver;
var downloadProjects = function downloadProjects() {
  var chromeCapabilities, driver, searchURL, buttons, nextButton, i, text, projectURLs, projects, _i, href, downloadButtons, generateSb3Button, _i2, url, script;

  return regeneratorRuntime.async(function downloadProjects$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          chromeCapabilities = _seleniumWebdriver["default"].Capabilities.chrome();
          chromeCapabilities.set('goog:chromeOptions', {
            'args': ['disable-infobars'],
            'prefs': {
              'download': {
                'default_directory': "C:\\Users\\nicho\\Downloads\\scratch-downloads",
                'prompt_for_download': 'false'
              },
              'profile.default_content_setting_values.automatic_downloads': 1
            }
          });
          driver = new _seleniumWebdriver["default"].Builder().withCapabilities(chromeCapabilities).build();

          if (!(process.argv[2] == 'search')) {
            _context.next = 56;
            break;
          }

          searchURL = 'https://scratch.mit.edu/search/projects?q=' + process.argv[3];
          _context.next = 7;
          return regeneratorRuntime.awrap(driver.get(searchURL));

        case 7:
          _context.next = 9;
          return regeneratorRuntime.awrap(driver.findElements(_seleniumWebdriver.By.className('button')));

        case 9:
          buttons = _context.sent;
          i = 0;

        case 11:
          if (!(i < buttons.length)) {
            _context.next = 19;
            break;
          }

          _context.next = 14;
          return regeneratorRuntime.awrap(buttons[i].getAttribute('innerText'));

        case 14:
          text = _context.sent;

          if (text == 'Load More') {
            nextButton = buttons[i];
          }

        case 16:
          i++;
          _context.next = 11;
          break;

        case 19:
          projectURLs = [];
          _context.next = 22;
          return regeneratorRuntime.awrap(driver.findElements(_seleniumWebdriver.By.className('thumbnail-image')));

        case 22:
          projects = _context.sent;

        case 23:
          if (!(projects.length < process.argv[4])) {
            _context.next = 30;
            break;
          }

          nextButton.click();
          _context.next = 27;
          return regeneratorRuntime.awrap(driver.findElements(_seleniumWebdriver.By.className('thumbnail-image')));

        case 27:
          projects = _context.sent;
          _context.next = 23;
          break;

        case 30:
          _i = 0;

        case 31:
          if (!(_i < projects.length)) {
            _context.next = 39;
            break;
          }

          _context.next = 34;
          return regeneratorRuntime.awrap(projects[_i].getAttribute('href'));

        case 34:
          href = _context.sent;
          // projectURLs.push(href.match(/\d+/)[0]);
          projectURLs.push(href.substring(0, href.length - 1));

        case 36:
          _i++;
          _context.next = 31;
          break;

        case 39:
          _context.next = 41;
          return regeneratorRuntime.awrap(driver.get("C:\\Users\\nicho\\Documents\\Development\\srs-chatbot-2021\\scratch-gui\\src\\lib\\project-scraper\\index.html"));

        case 41:
          _context.next = 43;
          return regeneratorRuntime.awrap(driver.findElements(_seleniumWebdriver.By.className('download-button')));

        case 43:
          downloadButtons = _context.sent;
          generateSb3Button = downloadButtons[2];
          _i2 = 0;

        case 46:
          if (!(_i2 < projectURLs.length)) {
            _context.next = 55;
            break;
          }

          url = projectURLs[_i2];
          script = "document.getElementById('project-select').setAttribute('value', '" + url + "');";
          _context.next = 51;
          return regeneratorRuntime.awrap(driver.executeScript(script));

        case 51:
          generateSb3Button.click(); // download(url, 'sb3');

        case 52:
          _i2++;
          _context.next = 46;
          break;

        case 55:
          ;

        case 56:
        case "end":
          return _context.stop();
      }
    }
  });
};

downloadProjects();