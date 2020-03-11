"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.home = void 0;

var _axios = _interopRequireDefault(require("axios"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var home = function home(req, res) {
  res.render("home", {
    pageTitle: "MaskUp"
  });
};

exports.home = home;