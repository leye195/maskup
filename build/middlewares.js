"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.localMiddleware = void 0;

var _moment = _interopRequireDefault(require("moment"));

var _dotenv = _interopRequireDefault(require("dotenv"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

_dotenv["default"].config();

var KEY = process.env.MAP_API;
var days = {
  1: {
    day: "월",
    target: "1,6"
  },
  2: {
    day: "화",
    target: "2,7"
  },
  3: {
    day: "수",
    target: "3,8"
  },
  4: {
    day: "목",
    target: "4,9"
  },
  5: {
    day: "금",
    target: "5,0"
  },
  6: {
    day: "토",
    target: "전체"
  },
  7: {
    day: "일",
    target: "전체"
  }
};

var localMiddleware = function localMiddleware(req, res, next) {
  var today = (0, _moment["default"])();
  res.locals.siteTitle = "MaskUp";
  res.locals.api = KEY;
  res.locals.today = days[today.day()]; //console.log(today.day());

  next();
};

exports.localMiddleware = localMiddleware;