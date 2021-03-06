'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _isObject2 = require('lodash/isObject');

var _isObject3 = _interopRequireDefault(_isObject2);

var _isArray2 = require('lodash/isArray');

var _isArray3 = _interopRequireDefault(_isArray2);

var _forEach2 = require('lodash/forEach');

var _forEach3 = _interopRequireDefault(_forEach2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _objectUnfreeze = require('object-unfreeze');

var _objectUnfreeze2 = _interopRequireDefault(_objectUnfreeze);

var _isIterable = require('./isIterable');

var _isIterable2 = _interopRequireDefault(_isIterable);

var _parseStyleName = require('./parseStyleName');

var _parseStyleName2 = _interopRequireDefault(_parseStyleName);

var _generateAppendClassName = require('./generateAppendClassName');

var _generateAppendClassName2 = _interopRequireDefault(_generateAppendClassName);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var linkArray = function linkArray(array, styles, configuration) {
  (0, _forEach3.default)(array, function (value, index) {
    if (_react2.default.isValidElement(value)) {
      // eslint-disable-next-line no-use-before-define
      array[index] = linkElement(_react2.default.Children.only(value), styles, configuration);
    } else if ((0, _isArray3.default)(value)) {
      array[index] = linkArray(value, styles, configuration);
    }
  });

  return array;
};

var linkElement = function linkElement(element, styles, configuration) {
  var appendClassName = void 0;
  var elementShallowCopy = void 0;

  elementShallowCopy = element;

  if (Array.isArray(elementShallowCopy)) {
    return elementShallowCopy.map(function (arrayElement) {
      return linkElement(arrayElement, styles, configuration);
    });
  }

  var elementIsFrozen = Object.isFrozen && Object.isFrozen(elementShallowCopy);
  var propsFrozen = Object.isFrozen && Object.isFrozen(elementShallowCopy.props);
  var propsNotExtensible = Object.isExtensible && !Object.isExtensible(elementShallowCopy.props);

  if (elementIsFrozen) {
    // https://github.com/facebook/react/blob/v0.13.3/src/classic/element/ReactElement.js#L131
    elementShallowCopy = (0, _objectUnfreeze2.default)(elementShallowCopy);
    elementShallowCopy.props = (0, _objectUnfreeze2.default)(elementShallowCopy.props);
  } else if (propsFrozen || propsNotExtensible) {
    elementShallowCopy.props = (0, _objectUnfreeze2.default)(elementShallowCopy.props);
  }

  var styleNames = (0, _parseStyleName2.default)(elementShallowCopy.props.styleName || '', configuration.allowMultiple);

  var _elementShallowCopy$p = elementShallowCopy.props,
      children = _elementShallowCopy$p.children,
      restProps = _objectWithoutProperties(_elementShallowCopy$p, ['children']);

  if (_react2.default.isValidElement(children)) {
    elementShallowCopy.props.children = linkElement(_react2.default.Children.only(children), styles, configuration);
  } else if ((0, _isArray3.default)(children) || (0, _isIterable2.default)(children)) {
    elementShallowCopy.props.children = linkArray((0, _objectUnfreeze2.default)(children), styles, configuration);
  }

  (0, _forEach3.default)(restProps, function (propValue, propName) {
    if (_react2.default.isValidElement(propValue)) {
      elementShallowCopy.props[propName] = linkElement(_react2.default.Children.only(propValue), styles, configuration);
    } else if ((0, _isArray3.default)(propValue)) {
      elementShallowCopy.props[propName] = linkArray(propValue, styles, configuration);
    }
  });

  if (styleNames.length) {
    appendClassName = (0, _generateAppendClassName2.default)(styles, styleNames, configuration.handleNotFoundStyleName);

    if (appendClassName) {
      if (elementShallowCopy.props.className) {
        appendClassName = elementShallowCopy.props.className + ' ' + appendClassName;
      }

      elementShallowCopy.props.className = appendClassName;
    }
  }

  delete elementShallowCopy.props.styleName;

  if (elementIsFrozen) {
    Object.freeze(elementShallowCopy.props);
    Object.freeze(elementShallowCopy);
  } else if (propsFrozen) {
    Object.freeze(elementShallowCopy.props);
  }

  if (propsNotExtensible) {
    Object.preventExtensions(elementShallowCopy.props);
  }

  return elementShallowCopy;
};

/**
 * @param {ReactElement} element
 * @param {Object} styles CSS modules class map.
 * @param {CSSModules~Options} configuration
 */

exports.default = function (element) {
  var styles = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var configuration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  // @see https://github.com/gajus/react-css-modules/pull/30
  if (!(0, _isObject3.default)(element)) {
    return element;
  }

  return linkElement(element, styles, configuration);
};

module.exports = exports['default'];