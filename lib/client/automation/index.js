// NOTE: We should have the capability to initialize scripts with different contexts.
// This is required for iframes without the src attribute because Hammerhead does not
// inject scripts into such iframes. So, we wrap all scripts in initialization functions.
(function () {
    function initTestCafeAutomation(window, isIFrameWithoutSrc) {
        var document = window.document;

        (function (hammerhead, testCafeCore, testCafeUI) {
    var hammerhead__default = 'default' in hammerhead ? hammerhead['default'] : hammerhead;
    var testCafeCore__default = 'default' in testCafeCore ? testCafeCore['default'] : testCafeCore;
    testCafeUI = testCafeUI && Object.prototype.hasOwnProperty.call(testCafeUI, 'default') ? testCafeUI['default'] : testCafeUI;

    var Promise = hammerhead__default.Promise;
    var messageSandbox = hammerhead__default.eventSandbox.message;
    var DEFAULT_MAX_SCROLL_MARGIN = 50;
    var SCROLL_MARGIN_INCREASE_STEP = 20;
    var SCROLL_REQUEST_CMD = 'automation|scroll|request';
    var SCROLL_RESPONSE_CMD = 'automation|scroll|response';
    // Setup cross-iframe interaction
    messageSandbox.on(messageSandbox.SERVICE_MSG_RECEIVED_EVENT, function (e) {
        if (e.message.cmd === SCROLL_REQUEST_CMD) {
            var _a = e.message, offsetX = _a.offsetX, offsetY = _a.offsetY, maxScrollMargin = _a.maxScrollMargin;
            var element = testCafeCore.domUtils.findIframeByWindow(e.source);
            var scroll_1 = new ScrollAutomation(element, { offsetX: offsetX, offsetY: offsetY });
            scroll_1.maxScrollMargin = maxScrollMargin;
            scroll_1
                .run()
                .then(function () { return messageSandbox.sendServiceMsg({ cmd: SCROLL_RESPONSE_CMD }, e.source); });
        }
    });
    var ScrollAutomation = /** @class */ (function () {
        function ScrollAutomation(element, scrollOptions) {
            this.element = element;
            this.offsetX = scrollOptions.offsetX;
            this.offsetY = scrollOptions.offsetY;
            this.scrollToCenter = scrollOptions.scrollToCenter;
            this.skipParentFrames = scrollOptions.skipParentFrames;
            this.raiseEvents = scrollOptions.raiseEvents;
            this.maxScrollMargin = { left: DEFAULT_MAX_SCROLL_MARGIN, top: DEFAULT_MAX_SCROLL_MARGIN };
            this.scrollWasPerformed = false;
        }
        ScrollAutomation.prototype._isScrollValuesChanged = function (scrollElement, originalScroll) {
            return testCafeCore.styleUtils.getScrollLeft(scrollElement) !== originalScroll.left
                || testCafeCore.styleUtils.getScrollTop(scrollElement) !== originalScroll.top;
        };
        ScrollAutomation.prototype._setScroll = function (element, _a) {
            var _this = this;
            var left = _a.left, top = _a.top;
            var scrollElement = testCafeCore.domUtils.isHtmlElement(element) ? testCafeCore.domUtils.findDocument(element) : element;
            var originalScroll = {
                left: testCafeCore.styleUtils.getScrollLeft(scrollElement),
                top: testCafeCore.styleUtils.getScrollTop(scrollElement)
            };
            left = Math.max(left, 0);
            top = Math.max(top, 0);
            var scrollPromise = testCafeCore.scrollController.waitForScroll(scrollElement);
            testCafeCore.styleUtils.setScrollLeft(scrollElement, left);
            testCafeCore.styleUtils.setScrollTop(scrollElement, top);
            if (!this._isScrollValuesChanged(scrollElement, originalScroll)) {
                scrollPromise.cancel();
                return Promise.resolve();
            }
            scrollPromise = scrollPromise.then(function () {
                _this.scrollWasPerformed = _this.scrollWasPerformed || _this._isScrollValuesChanged(scrollElement, originalScroll);
            });
            return scrollPromise;
        };
        ScrollAutomation.prototype._getScrollToPoint = function (elementDimensions, _a, maxScrollMargin) {
            var x = _a.x, y = _a.y;
            var horizontalCenter = Math.floor(elementDimensions.width / 2);
            var verticalCenter = Math.floor(Math.floor(elementDimensions.height / 2));
            var leftScrollMargin = this.scrollToCenter ? horizontalCenter : Math.min(maxScrollMargin.left, horizontalCenter);
            var topScrollMargin = this.scrollToCenter ? verticalCenter : Math.min(maxScrollMargin.top, verticalCenter);
            var needForwardScrollLeft = x >= elementDimensions.scroll.left + elementDimensions.width - leftScrollMargin;
            var needBackwardScrollLeft = x <= elementDimensions.scroll.left + leftScrollMargin;
            var needForwardScrollTop = y >= elementDimensions.scroll.top + elementDimensions.height - topScrollMargin;
            var needBackwardScrollTop = y <= elementDimensions.scroll.top + topScrollMargin;
            var left = elementDimensions.scroll.left;
            var top = elementDimensions.scroll.top;
            if (needForwardScrollLeft)
                left = x - elementDimensions.width + leftScrollMargin;
            else if (needBackwardScrollLeft)
                left = x - leftScrollMargin;
            if (needForwardScrollTop)
                top = y - elementDimensions.height + topScrollMargin;
            else if (needBackwardScrollTop)
                top = y - topScrollMargin;
            return { left: left, top: top };
        };
        ScrollAutomation.prototype._getScrollToFullChildView = function (parentDimensions, childDimensions, maxScrollMargin) {
            var fullViewScrollLeft = null;
            var fullViewScrollTop = null;
            var canShowFullElementWidth = parentDimensions.width >= childDimensions.width;
            var canShowFullElementHeight = parentDimensions.height >= childDimensions.height;
            var relativePosition = testCafeCore.positionUtils.calcRelativePosition(childDimensions, parentDimensions);
            if (canShowFullElementWidth) {
                var availableLeftScrollMargin = parentDimensions.width - childDimensions.width;
                var leftScrollMargin = Math.min(maxScrollMargin.left, availableLeftScrollMargin);
                if (this.scrollToCenter)
                    leftScrollMargin = availableLeftScrollMargin / 2;
                if (relativePosition.left < leftScrollMargin) {
                    fullViewScrollLeft = Math.round(parentDimensions.scroll.left + relativePosition.left -
                        leftScrollMargin);
                }
                else if (relativePosition.right < leftScrollMargin) {
                    fullViewScrollLeft = Math.round(parentDimensions.scroll.left +
                        Math.min(relativePosition.left, -relativePosition.right) +
                        leftScrollMargin);
                }
            }
            if (canShowFullElementHeight) {
                var availableTopScrollMargin = parentDimensions.height - childDimensions.height;
                var topScrollMargin = Math.min(maxScrollMargin.top, availableTopScrollMargin);
                if (this.scrollToCenter)
                    topScrollMargin = availableTopScrollMargin / 2;
                if (relativePosition.top < topScrollMargin)
                    fullViewScrollTop = Math.round(parentDimensions.scroll.top + relativePosition.top - topScrollMargin);
                else if (relativePosition.bottom < topScrollMargin) {
                    fullViewScrollTop = Math.round(parentDimensions.scroll.top +
                        Math.min(relativePosition.top, -relativePosition.bottom) +
                        topScrollMargin);
                }
            }
            return {
                left: fullViewScrollLeft,
                top: fullViewScrollTop
            };
        };
        ScrollAutomation._getChildPoint = function (parentDimensions, childDimensions, offsets) {
            return {
                x: childDimensions.left - parentDimensions.left + parentDimensions.scroll.left +
                    childDimensions.border.left + offsets.x,
                y: childDimensions.top - parentDimensions.top + parentDimensions.scroll.top +
                    childDimensions.border.top + offsets.y
            };
        };
        ScrollAutomation.prototype._getScrollPosition = function (parentDimensions, childDimensions, offsets, maxScrollMargin) {
            var childPoint = ScrollAutomation._getChildPoint(parentDimensions, childDimensions, offsets);
            var scrollToPoint = this._getScrollToPoint(parentDimensions, childPoint, maxScrollMargin);
            var scrollToFullView = this._getScrollToFullChildView(parentDimensions, childDimensions, maxScrollMargin);
            var left = Math.max(scrollToFullView.left === null ? scrollToPoint.left : scrollToFullView.left, 0);
            var top = Math.max(scrollToFullView.top === null ? scrollToPoint.top : scrollToFullView.top, 0);
            return { left: left, top: top };
        };
        ScrollAutomation._getChildPointAfterScroll = function (parentDimensions, childDimensions, currentScroll, offsets) {
            var x = Math.round(childDimensions.left + parentDimensions.scroll.left - currentScroll.left + offsets.x);
            var y = Math.round(childDimensions.top + parentDimensions.scroll.top - currentScroll.top + offsets.y);
            return { x: x, y: y };
        };
        ScrollAutomation.prototype._isChildFullyVisible = function (parentDimensions, childDimensions, offsets) {
            var _a = ScrollAutomation._getChildPointAfterScroll(parentDimensions, childDimensions, parentDimensions.scroll, offsets), x = _a.x, y = _a.y;
            var zeroMargin = { left: 0, top: 0 };
            var _b = this._getScrollPosition(parentDimensions, childDimensions, offsets, zeroMargin), left = _b.left, top = _b.top;
            return !this._isTargetElementObscuredInPoint(x, y) &&
                left === parentDimensions.scroll.left && top === parentDimensions.scroll.top;
        };
        ScrollAutomation.prototype._scrollToChild = function (parent, child, offsets) {
            var parentDimensions = testCafeCore.positionUtils.getClientDimensions(parent);
            var childDimensions = testCafeCore.positionUtils.getClientDimensions(child);
            var windowWidth = testCafeCore.styleUtils.getInnerWidth(window);
            var windowHeight = testCafeCore.styleUtils.getInnerHeight(window);
            var scrollPos = parentDimensions.scroll;
            var needScroll = !this._isChildFullyVisible(parentDimensions, childDimensions, offsets);
            while (needScroll) {
                scrollPos = this._getScrollPosition(parentDimensions, childDimensions, offsets, this.maxScrollMargin);
                var _a = ScrollAutomation._getChildPointAfterScroll(parentDimensions, childDimensions, scrollPos, offsets), x = _a.x, y = _a.y;
                var isTargetObscured = this._isTargetElementObscuredInPoint(x, y);
                this.maxScrollMargin.left += SCROLL_MARGIN_INCREASE_STEP;
                if (this.maxScrollMargin.left >= windowWidth) {
                    this.maxScrollMargin.left = DEFAULT_MAX_SCROLL_MARGIN;
                    this.maxScrollMargin.top += SCROLL_MARGIN_INCREASE_STEP;
                }
                needScroll = isTargetObscured && this.maxScrollMargin.top < windowHeight;
            }
            this.maxScrollMargin = { left: DEFAULT_MAX_SCROLL_MARGIN, top: DEFAULT_MAX_SCROLL_MARGIN };
            return this._setScroll(parent, scrollPos);
        };
        ScrollAutomation.prototype._scrollElement = function () {
            if (!testCafeCore.styleUtils.hasScroll(this.element))
                return Promise.resolve();
            var elementDimensions = testCafeCore.positionUtils.getClientDimensions(this.element);
            var scroll = this._getScrollToPoint(elementDimensions, { x: this.offsetX, y: this.offsetY }, this.maxScrollMargin);
            return this._setScroll(this.element, scroll);
        };
        ScrollAutomation.prototype._scrollParents = function () {
            var _this = this;
            var parents = testCafeCore.styleUtils.getScrollableParents(this.element);
            var currentChild = this.element;
            var currentOffsetX = this.offsetX - Math.round(testCafeCore.styleUtils.getScrollLeft(currentChild));
            var currentOffsetY = this.offsetY - Math.round(testCafeCore.styleUtils.getScrollTop(currentChild));
            var childDimensions = null;
            var parentDimensions = null;
            var scrollParentsPromise = testCafeCore.promiseUtils.times(parents.length, function (i) {
                return _this
                    ._scrollToChild(parents[i], currentChild, { x: currentOffsetX, y: currentOffsetY })
                    .then(function () {
                    childDimensions = testCafeCore.positionUtils.getClientDimensions(currentChild);
                    parentDimensions = testCafeCore.positionUtils.getClientDimensions(parents[i]);
                    currentOffsetX += childDimensions.left - parentDimensions.left + parentDimensions.border.left;
                    currentOffsetY += childDimensions.top - parentDimensions.top + parentDimensions.border.top;
                    currentChild = parents[i];
                });
            });
            return scrollParentsPromise
                .then(function () {
                if (window.top !== window && !_this.skipParentFrames) {
                    return testCafeCore.sendRequestToFrame({
                        cmd: SCROLL_REQUEST_CMD,
                        offsetX: currentOffsetX,
                        offsetY: currentOffsetY,
                        maxScrollMargin: _this.maxScrollMargin
                    }, SCROLL_RESPONSE_CMD, window.parent);
                }
                return Promise.resolve();
            });
        };
        ScrollAutomation._getFixedAncestorOrSelf = function (element) {
            return testCafeCore.domUtils.findParent(element, true, testCafeCore.styleUtils.isFixedElement);
        };
        ScrollAutomation.prototype._isTargetElementObscuredInPoint = function (x, y) {
            var elementInPoint = testCafeCore.positionUtils.getElementFromPoint(x, y);
            if (!elementInPoint)
                return false;
            var fixedElement = ScrollAutomation._getFixedAncestorOrSelf(elementInPoint);
            return fixedElement && !fixedElement.contains(this.element);
        };
        ScrollAutomation.prototype.run = function () {
            var _this = this;
            return this
                ._scrollElement()
                .then(function () { return _this._scrollParents(); })
                .then(function () { return _this.scrollWasPerformed; });
        };
        return ScrollAutomation;
    }());

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var browserUtils = hammerhead__default.utils.browser;
    function getAutomationPoint(element, offsetX, offsetY) {
        var roundFn = browserUtils.isFirefox ? Math.ceil : Math.round;
        var elementOffset = testCafeCore.positionUtils.getOffsetPosition(element, roundFn);
        var left = element === document.documentElement ? 0 : elementOffset.left;
        var top = element === document.documentElement ? 0 : elementOffset.top;
        return {
            x: left + offsetX,
            y: top + offsetY
        };
    }

    function convertToClient(element, point) {
        var elementScroll = testCafeCore.styleUtils.getElementScroll(element);
        if (!/html/i.test(element.tagName) && testCafeCore.styleUtils.hasScroll(element)) {
            point.x -= elementScroll.left;
            point.y -= elementScroll.top;
        }
        return testCafeCore.positionUtils.offsetToClientCoords(point);
    }

    function getDevicePoint(clientPoint) {
        if (!clientPoint)
            return null;
        var screenLeft = window.screenLeft || window.screenX;
        var screenTop = window.screenTop || window.screenY;
        var x = screenLeft + clientPoint.x;
        var y = screenTop + clientPoint.y;
        return { x: x, y: y };
    }

    function calcOffset(size) {
        var offset = size / 2;
        return offset < 1 ? 0 : Math.round(offset);
    }
    function getDefaultAutomationOffsets(element) {
        var rect = testCafeCore.positionUtils.getElementRectangle(element);
        var offsetX = calcOffset(rect.width);
        var offsetY = calcOffset(rect.height);
        return { offsetX: offsetX, offsetY: offsetY };
    }
    function getOffsetOptions(element, offsetX, offsetY) {
        var defaultOffsets = getDefaultAutomationOffsets(element);
        offsetX = typeof offsetX === 'number' ? Math.round(offsetX) : defaultOffsets.offsetX;
        offsetY = typeof offsetY === 'number' ? Math.round(offsetY) : defaultOffsets.offsetY;
        if (offsetX > 0 && offsetY > 0)
            return { offsetX: offsetX, offsetY: offsetY };
        var dimensions = testCafeCore.positionUtils.getClientDimensions(element);
        var width = Math.round(Math.max(element.scrollWidth, dimensions.width));
        var height = Math.round(Math.max(element.scrollHeight, dimensions.height));
        var maxX = dimensions.scrollbar.right + dimensions.border.left + dimensions.border.right + width;
        var maxY = dimensions.scrollbar.bottom + dimensions.border.top + dimensions.border.bottom + height;
        return {
            offsetX: offsetX < 0 ? maxX + offsetX : offsetX,
            offsetY: offsetY < 0 ? maxY + offsetY : offsetY
        };
    }

    var domUtils = testCafeCore__default.domUtils;
    var cursorUI = window.top === window ? testCafeUI.cursorUI : testCafeUI.iframeCursorUI;
    // NOTE: the default position should be outside of the page (GH-794)
    var cursor = {
        x: -1,
        y: -1,
        currentActiveWindow: window.top,
        _ensureActiveWindow: function () {
            if (this.currentActiveWindow === window || this.currentActiveWindow === window.parent)
                return;
            var activeFrame = domUtils.findIframeByWindow(this.currentActiveWindow);
            if (!activeFrame || !domUtils.isElementInDocument(activeFrame))
                this.currentActiveWindow = window;
        },
        get active() {
            this._ensureActiveWindow();
            return this.currentActiveWindow === window;
        },
        set activeWindow(win) {
            this.currentActiveWindow = win;
        },
        get activeWindow() {
            this._ensureActiveWindow();
            return this.currentActiveWindow;
        },
        get position() {
            return { x: this.x, y: this.y };
        },
        get visible() {
            return window.top === window && cursorUI.isVisible();
        },
        move: function (newX, newY) {
            this.x = newX;
            this.y = newY;
            return cursorUI.move(this.x, this.y);
        },
        hide: function () {
            if (this.visible)
                cursorUI.hide();
        },
        show: function () {
            if (window.top === window)
                cursorUI.show();
        },
        leftButtonDown: function () {
            return cursorUI.leftButtonDown();
        },
        rightButtonDown: function () {
            return cursorUI.rightButtonDown();
        },
        buttonUp: function () {
            return cursorUI.buttonUp();
        }
    };

    var browserUtils$1 = hammerhead__default.utils.browser;
    var Promise$1 = hammerhead__default.Promise;
    var nativeMethods = hammerhead__default.nativeMethods;
    var positionUtils = testCafeCore__default.positionUtils;
    var domUtils$1 = testCafeCore__default.domUtils;
    function getElementFromPoint(x, y, underTopShadowUIElement) {
        var topElement = null;
        return testCafeUI.hide(underTopShadowUIElement)
            .then(function () {
            topElement = positionUtils.getElementFromPoint(x, y);
            return testCafeUI.show(underTopShadowUIElement);
        })
            .then(function () { return topElement; });
    }
    function ensureImageMap(imgElement, areaElement) {
        var mapElement = domUtils$1.closest(areaElement, 'map');
        return mapElement && mapElement.name === imgElement.useMap.substring(1) ? areaElement : imgElement;
    }
    function findElementOrNonEmptyChildFromPoint(x, y, element) {
        var topElement = positionUtils.getElementFromPoint(x, y);
        var isNonEmptyChild = domUtils$1.containsElement(element, topElement) &&
            nativeMethods.nodeTextContentGetter.call(topElement).length;
        if (topElement && topElement === element || isNonEmptyChild)
            return topElement;
        return null;
    }
    function correctTopElementByExpectedElement(topElement, expectedElement) {
        var expectedElementDefined = expectedElement && domUtils$1.isDomElement(expectedElement);
        if (!expectedElementDefined || !topElement || topElement === expectedElement)
            return topElement;
        var isTREFElement = domUtils$1.getTagName(expectedElement) === 'tref';
        // NOTE: 'document.elementFromPoint' can't find these types of elements
        if (isTREFElement)
            return expectedElement;
        // NOTE: T299665 - Incorrect click automation for images with an associated map element in Firefox
        // All browsers return the <area> element from document.getElementFromPoint, but
        // Firefox returns the <img> element. We should accomplish this for Firefox as well.
        var isImageMapArea = domUtils$1.getTagName(expectedElement) === 'area' && domUtils$1.isImgElement(topElement);
        if (browserUtils$1.isFirefox && isImageMapArea)
            return ensureImageMap(topElement, expectedElement);
        // NOTE: try to find a multi-line link by its rectangle (T163678)
        var isLinkOrChildExpected = domUtils$1.isAnchorElement(expectedElement) ||
            domUtils$1.getParents(expectedElement, 'a').length;
        var isTopElementChildOfLink = isLinkOrChildExpected &&
            domUtils$1.containsElement(expectedElement, topElement) &&
            nativeMethods.nodeTextContentGetter.call(topElement).length;
        var shouldSearchForMultilineLink = isLinkOrChildExpected && !isTopElementChildOfLink &&
            nativeMethods.nodeTextContentGetter.call(expectedElement).length;
        if (!shouldSearchForMultilineLink)
            return topElement;
        var linkRect = expectedElement.getBoundingClientRect();
        return findElementOrNonEmptyChildFromPoint(linkRect.right - 1, linkRect.top + 1, expectedElement) ||
            findElementOrNonEmptyChildFromPoint(linkRect.left + 1, linkRect.bottom - 1, expectedElement) ||
            topElement;
    }
    function fromPoint(x, y, expectedElement) {
        var isInIframe = window !== window.top;
        var foundElement = null;
        return getElementFromPoint(x, y)
            .then(function (topElement) {
            foundElement = topElement;
            // NOTE: when trying to get an element by elementFromPoint in iframe and the target
            // element is under any of shadow-ui elements, you will get null (only in IE).
            // In this case, you should hide a top window's shadow-ui root to obtain an element.
            var resChain = Promise$1.resolve(topElement);
            if (!foundElement && isInIframe && x > 0 && y > 0) {
                resChain = resChain
                    .then(function () { return getElementFromPoint(x, y, true); })
                    .then(function (element) {
                    foundElement = element;
                    return element;
                });
            }
            return resChain
                .then(function (element) { return correctTopElementByExpectedElement(element, expectedElement); })
                .then(function (correctedElement) {
                return { element: correctedElement, corrected: correctedElement !== foundElement };
            });
        });
    }
    function underCursor() {
        var cursorPosition = cursor.position;
        return fromPoint(cursorPosition.x, cursorPosition.y).then(function (_a) {
            var element = _a.element;
            return element;
        });
    }

    var ERROR_TYPES = {
        elementIsInvisibleError: 'elementIsInvisibleError',
        foundElementIsNotTarget: 'foundElementIsNotTarget'
    };

    var ACTION_STEP_DELAY_DEFAULT = 10;
    var MAX_MOUSE_ACTION_STEP_DELAY = 400;
    var MAX_KEY_ACTION_STEP_DELAY = 200;
    // We use an exponential function to calculate the cursor
    // speed according to general test speed
    // cursorSpeed = (maxSpeed * k) ^ speed / k
    var MAX_CURSOR_SPEED = 100; // pixels/ms
    var MAX_DRAGGING_SPEED = 4; // pixels/ms
    var CURSOR_FACTOR = 4;
    var AutomationSettings = /** @class */ (function () {
        function AutomationSettings(speed) {
            this.speedFactor = speed || 1;
        }
        Object.defineProperty(AutomationSettings.prototype, "mouseActionStepDelay", {
            get: function () {
                return this.speedFactor === 1 ? ACTION_STEP_DELAY_DEFAULT : (1 - this.speedFactor) * MAX_MOUSE_ACTION_STEP_DELAY;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AutomationSettings.prototype, "keyActionStepDelay", {
            get: function () {
                return this.speedFactor === 1 ? ACTION_STEP_DELAY_DEFAULT : (1 - this.speedFactor) * MAX_KEY_ACTION_STEP_DELAY;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AutomationSettings.prototype, "cursorSpeed", {
            get: function () {
                return Math.pow(MAX_CURSOR_SPEED * CURSOR_FACTOR, this.speedFactor) / CURSOR_FACTOR;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AutomationSettings.prototype, "draggingSpeed", {
            get: function () {
                return Math.pow(MAX_DRAGGING_SPEED * CURSOR_FACTOR, this.speedFactor) / CURSOR_FACTOR;
            },
            enumerable: true,
            configurable: true
        });
        return AutomationSettings;
    }());

    // -------------------------------------------------------------
    // WARNING: this file is used by both the client and the server.
    // Do not use any browser or node-specific API!
    // -------------------------------------------------------------
    var Assignable = /** @class */ (function () {
        function Assignable() {
        }
        Assignable.prototype._getAssignableProperties = function () {
            throw new Error('Not implemented');
        };
        Assignable.prototype._assignFrom = function (obj, validate, initOptions) {
            if (initOptions === void 0) { initOptions = {}; }
            if (!obj)
                return;
            var props = this._getAssignableProperties();
            for (var i = 0; i < props.length; i++) {
                var _a = props[i], name_1 = _a.name, type = _a.type, required = _a.required, init = _a.init, defaultValue = _a.defaultValue;
                var path = name_1.split('.');
                var lastIdx = path.length - 1;
                var last = path[lastIdx];
                var srcObj = obj;
                var destObj = this;
                for (var j = 0; j < lastIdx && srcObj && destObj; j++) {
                    srcObj = srcObj[path[j]];
                    destObj = destObj[path[j]];
                }
                if (destObj && 'defaultValue' in props[i])
                    destObj[name_1] = defaultValue;
                if (srcObj && destObj) {
                    var srcVal = srcObj[last];
                    if (srcVal !== void 0 || required) {
                        if (validate && type)
                            type(name_1, srcVal);
                        destObj[last] = init ? init(name_1, srcVal, initOptions) : srcVal;
                    }
                }
            }
        };
        return Assignable;
    }());

    // -------------------------------------------------------------
    // WARNING: this file is used by both the client and the server.
    // Do not use any browser or node-specific API!
    // -------------------------------------------------------------
    function createIntegerValidator(ErrorCtor) {
        return function (name, val) {
            var valType = typeof val;
            if (valType !== 'number')
                throw new ErrorCtor(name, valType);
            var isInteger = !isNaN(val) &&
                isFinite(val) &&
                val === Math.floor(val);
            if (!isInteger)
                throw new ErrorCtor(name, val);
        };
    }
    function createPositiveIntegerValidator(ErrorCtor) {
        var integerValidator = createIntegerValidator(ErrorCtor);
        return function (name, val) {
            integerValidator(name, val);
            if (val < 0)
                throw new ErrorCtor(name, val);
        };
    }
    function createBooleanValidator(ErrorCtor) {
        return function (name, val) {
            var valType = typeof val;
            if (valType !== 'boolean')
                throw new ErrorCtor(name, valType);
        };
    }
    function createSpeedValidator(ErrorCtor) {
        return function (name, val) {
            var valType = typeof val;
            if (valType !== 'number')
                throw new ErrorCtor(name, valType);
            if (isNaN(val) || val < 0.01 || val > 1)
                throw new ErrorCtor(name, val);
        };
    }

    // -------------------------------------------------------------
    // WARNING: this file is used by both the client and the server.
    // Do not use any browser or node-specific API!
    // -------------------------------------------------------------
    var TEST_RUN_ERRORS = {
        uncaughtErrorOnPage: 'E1',
        uncaughtErrorInTestCode: 'E2',
        uncaughtNonErrorObjectInTestCode: 'E3',
        uncaughtErrorInClientFunctionCode: 'E4',
        uncaughtErrorInCustomDOMPropertyCode: 'E5',
        unhandledPromiseRejection: 'E6',
        uncaughtException: 'E7',
        missingAwaitError: 'E8',
        actionIntegerOptionError: 'E9',
        actionPositiveIntegerOptionError: 'E10',
        actionBooleanOptionError: 'E11',
        actionSpeedOptionError: 'E12',
        actionOptionsTypeError: 'E14',
        actionBooleanArgumentError: 'E15',
        actionStringArgumentError: 'E16',
        actionNullableStringArgumentError: 'E17',
        actionStringOrStringArrayArgumentError: 'E18',
        actionStringArrayElementError: 'E19',
        actionIntegerArgumentError: 'E20',
        actionRoleArgumentError: 'E21',
        actionPositiveIntegerArgumentError: 'E22',
        actionSelectorError: 'E23',
        actionElementNotFoundError: 'E24',
        actionElementIsInvisibleError: 'E26',
        actionSelectorMatchesWrongNodeTypeError: 'E27',
        actionAdditionalElementNotFoundError: 'E28',
        actionAdditionalElementIsInvisibleError: 'E29',
        actionAdditionalSelectorMatchesWrongNodeTypeError: 'E30',
        actionElementNonEditableError: 'E31',
        actionElementNotTextAreaError: 'E32',
        actionElementNonContentEditableError: 'E33',
        actionElementIsNotFileInputError: 'E34',
        actionRootContainerNotFoundError: 'E35',
        actionIncorrectKeysError: 'E36',
        actionCannotFindFileToUploadError: 'E37',
        actionUnsupportedDeviceTypeError: 'E38',
        actionIframeIsNotLoadedError: 'E39',
        actionElementNotIframeError: 'E40',
        actionInvalidScrollTargetError: 'E41',
        currentIframeIsNotLoadedError: 'E42',
        currentIframeNotFoundError: 'E43',
        currentIframeIsInvisibleError: 'E44',
        nativeDialogNotHandledError: 'E45',
        uncaughtErrorInNativeDialogHandler: 'E46',
        setTestSpeedArgumentError: 'E47',
        setNativeDialogHandlerCodeWrongTypeError: 'E48',
        clientFunctionExecutionInterruptionError: 'E49',
        domNodeClientFunctionResultError: 'E50',
        invalidSelectorResultError: 'E51',
        cannotObtainInfoForElementSpecifiedBySelectorError: 'E52',
        externalAssertionLibraryError: 'E53',
        pageLoadError: 'E54',
        windowDimensionsOverflowError: 'E55',
        forbiddenCharactersInScreenshotPathError: 'E56',
        invalidElementScreenshotDimensionsError: 'E57',
        roleSwitchInRoleInitializerError: 'E58',
        assertionExecutableArgumentError: 'E59',
        assertionWithoutMethodCallError: 'E60',
        assertionUnawaitedPromiseError: 'E61',
        requestHookNotImplementedError: 'E62',
        requestHookUnhandledError: 'E63',
        uncaughtErrorInCustomClientScriptCode: 'E64',
        uncaughtErrorInCustomClientScriptCodeLoadedFromModule: 'E65',
        uncaughtErrorInCustomScript: 'E66',
        uncaughtTestCafeErrorInCustomScript: 'E67',
        childWindowIsNotLoadedError: 'E68',
        childWindowNotFoundError: 'E69',
        cannotSwitchToWindowError: 'E70',
        closeChildWindowError: 'E71',
        childWindowClosedBeforeSwitchingError: 'E72'
    };

    // Base
    //--------------------------------------------------------------------
    var TestRunErrorBase = /** @class */ (function () {
        function TestRunErrorBase(code) {
            this.code = code;
            this.isTestCafeError = true;
            this.callsite = null;
        }
        return TestRunErrorBase;
    }());
    var ActionOptionErrorBase = /** @class */ (function (_super) {
        __extends(ActionOptionErrorBase, _super);
        function ActionOptionErrorBase(code, optionName, actualValue) {
            var _this = _super.call(this, code) || this;
            _this.optionName = optionName;
            _this.actualValue = actualValue;
            return _this;
        }
        return ActionOptionErrorBase;
    }(TestRunErrorBase));
    var ActionArgumentErrorBase = /** @class */ (function (_super) {
        __extends(ActionArgumentErrorBase, _super);
        function ActionArgumentErrorBase(code, argumentName, actualValue) {
            var _this = _super.call(this, code) || this;
            _this.argumentName = argumentName;
            _this.actualValue = actualValue;
            return _this;
        }
        return ActionArgumentErrorBase;
    }(TestRunErrorBase));
    // Synchronization errors
    //--------------------------------------------------------------------
    var MissingAwaitError = /** @class */ (function (_super) {
        __extends(MissingAwaitError, _super);
        function MissingAwaitError(callsite) {
            var _this = _super.call(this, TEST_RUN_ERRORS.missingAwaitError) || this;
            _this.callsite = callsite;
            return _this;
        }
        return MissingAwaitError;
    }(TestRunErrorBase));
    // Client function errors
    //--------------------------------------------------------------------
    var ClientFunctionExecutionInterruptionError = /** @class */ (function (_super) {
        __extends(ClientFunctionExecutionInterruptionError, _super);
        function ClientFunctionExecutionInterruptionError(instantiationCallsiteName) {
            var _this = _super.call(this, TEST_RUN_ERRORS.clientFunctionExecutionInterruptionError) || this;
            _this.instantiationCallsiteName = instantiationCallsiteName;
            return _this;
        }
        return ClientFunctionExecutionInterruptionError;
    }(TestRunErrorBase));
    var DomNodeClientFunctionResultError = /** @class */ (function (_super) {
        __extends(DomNodeClientFunctionResultError, _super);
        function DomNodeClientFunctionResultError(instantiationCallsiteName) {
            var _this = _super.call(this, TEST_RUN_ERRORS.domNodeClientFunctionResultError) || this;
            _this.instantiationCallsiteName = instantiationCallsiteName;
            return _this;
        }
        return DomNodeClientFunctionResultError;
    }(TestRunErrorBase));
    // Selector errors
    //--------------------------------------------------------------------
    var SelectorErrorBase = /** @class */ (function (_super) {
        __extends(SelectorErrorBase, _super);
        function SelectorErrorBase(code, _a) {
            var apiFnChain = _a.apiFnChain, apiFnIndex = _a.apiFnIndex;
            var _this = _super.call(this, code) || this;
            _this.apiFnChain = apiFnChain;
            _this.apiFnIndex = apiFnIndex;
            return _this;
        }
        return SelectorErrorBase;
    }(TestRunErrorBase));
    var InvalidSelectorResultError = /** @class */ (function (_super) {
        __extends(InvalidSelectorResultError, _super);
        function InvalidSelectorResultError() {
            return _super.call(this, TEST_RUN_ERRORS.invalidSelectorResultError) || this;
        }
        return InvalidSelectorResultError;
    }(TestRunErrorBase));
    var CannotObtainInfoForElementSpecifiedBySelectorError = /** @class */ (function (_super) {
        __extends(CannotObtainInfoForElementSpecifiedBySelectorError, _super);
        function CannotObtainInfoForElementSpecifiedBySelectorError(callsite, apiFnArgs) {
            var _this = _super.call(this, TEST_RUN_ERRORS.cannotObtainInfoForElementSpecifiedBySelectorError, apiFnArgs) || this;
            _this.callsite = callsite;
            return _this;
        }
        return CannotObtainInfoForElementSpecifiedBySelectorError;
    }(SelectorErrorBase));
    // Page errors
    //--------------------------------------------------------------------
    var PageLoadError = /** @class */ (function (_super) {
        __extends(PageLoadError, _super);
        function PageLoadError(errMsg, url) {
            var _this = _super.call(this, TEST_RUN_ERRORS.pageLoadError) || this;
            _this.url = url;
            _this.errMsg = errMsg;
            return _this;
        }
        return PageLoadError;
    }(TestRunErrorBase));
    // Uncaught errors
    //--------------------------------------------------------------------
    var UncaughtErrorOnPage = /** @class */ (function (_super) {
        __extends(UncaughtErrorOnPage, _super);
        function UncaughtErrorOnPage(errStack, pageDestUrl) {
            var _this = _super.call(this, TEST_RUN_ERRORS.uncaughtErrorOnPage) || this;
            _this.errStack = errStack;
            _this.pageDestUrl = pageDestUrl;
            return _this;
        }
        return UncaughtErrorOnPage;
    }(TestRunErrorBase));
    var UncaughtErrorInTestCode = /** @class */ (function (_super) {
        __extends(UncaughtErrorInTestCode, _super);
        function UncaughtErrorInTestCode(err, callsite) {
            var _this = _super.call(this, TEST_RUN_ERRORS.uncaughtErrorInTestCode) || this;
            _this.errMsg = String(err.rawMessage || err);
            _this.callsite = err.callsite || callsite;
            _this.originError = err;
            return _this;
        }
        return UncaughtErrorInTestCode;
    }(TestRunErrorBase));
    var UncaughtNonErrorObjectInTestCode = /** @class */ (function (_super) {
        __extends(UncaughtNonErrorObjectInTestCode, _super);
        function UncaughtNonErrorObjectInTestCode(obj) {
            var _this = _super.call(this, TEST_RUN_ERRORS.uncaughtNonErrorObjectInTestCode) || this;
            _this.objType = typeof obj;
            _this.objStr = String(obj);
            return _this;
        }
        return UncaughtNonErrorObjectInTestCode;
    }(TestRunErrorBase));
    var UncaughtErrorInClientFunctionCode = /** @class */ (function (_super) {
        __extends(UncaughtErrorInClientFunctionCode, _super);
        function UncaughtErrorInClientFunctionCode(instantiationCallsiteName, err) {
            var _this = _super.call(this, TEST_RUN_ERRORS.uncaughtErrorInClientFunctionCode) || this;
            _this.errMsg = String(err);
            _this.instantiationCallsiteName = instantiationCallsiteName;
            return _this;
        }
        return UncaughtErrorInClientFunctionCode;
    }(TestRunErrorBase));
    var UncaughtErrorInCustomDOMPropertyCode = /** @class */ (function (_super) {
        __extends(UncaughtErrorInCustomDOMPropertyCode, _super);
        function UncaughtErrorInCustomDOMPropertyCode(instantiationCallsiteName, err, prop) {
            var _this = _super.call(this, TEST_RUN_ERRORS.uncaughtErrorInCustomDOMPropertyCode, err, prop) || this;
            _this.errMsg = String(err);
            _this.property = prop;
            _this.instantiationCallsiteName = instantiationCallsiteName;
            return _this;
        }
        return UncaughtErrorInCustomDOMPropertyCode;
    }(TestRunErrorBase));
    var UnhandledPromiseRejectionError = /** @class */ (function (_super) {
        __extends(UnhandledPromiseRejectionError, _super);
        function UnhandledPromiseRejectionError(err) {
            var _this = _super.call(this, TEST_RUN_ERRORS.unhandledPromiseRejection) || this;
            _this.errMsg = String(err);
            return _this;
        }
        return UnhandledPromiseRejectionError;
    }(TestRunErrorBase));
    var UncaughtExceptionError = /** @class */ (function (_super) {
        __extends(UncaughtExceptionError, _super);
        function UncaughtExceptionError(err) {
            var _this = _super.call(this, TEST_RUN_ERRORS.uncaughtException) || this;
            _this.errMsg = String(err);
            return _this;
        }
        return UncaughtExceptionError;
    }(TestRunErrorBase));
    var UncaughtErrorInCustomClientScriptCode = /** @class */ (function (_super) {
        __extends(UncaughtErrorInCustomClientScriptCode, _super);
        function UncaughtErrorInCustomClientScriptCode(err) {
            var _this = _super.call(this, TEST_RUN_ERRORS.uncaughtErrorInCustomClientScriptCode) || this;
            _this.errMsg = String(err);
            return _this;
        }
        return UncaughtErrorInCustomClientScriptCode;
    }(TestRunErrorBase));
    var UncaughtErrorInCustomClientScriptLoadedFromModule = /** @class */ (function (_super) {
        __extends(UncaughtErrorInCustomClientScriptLoadedFromModule, _super);
        function UncaughtErrorInCustomClientScriptLoadedFromModule(err, moduleName) {
            var _this = _super.call(this, TEST_RUN_ERRORS.uncaughtErrorInCustomClientScriptCodeLoadedFromModule) || this;
            _this.errMsg = String(err);
            _this.moduleName = moduleName;
            return _this;
        }
        return UncaughtErrorInCustomClientScriptLoadedFromModule;
    }(TestRunErrorBase));
    // Assertion errors
    //--------------------------------------------------------------------
    var ExternalAssertionLibraryError = /** @class */ (function (_super) {
        __extends(ExternalAssertionLibraryError, _super);
        function ExternalAssertionLibraryError(err, callsite) {
            var _this = _super.call(this, TEST_RUN_ERRORS.externalAssertionLibraryError) || this;
            _this.errMsg = String(err);
            _this.callsite = callsite;
            return _this;
        }
        return ExternalAssertionLibraryError;
    }(TestRunErrorBase));
    var AssertionExecutableArgumentError = /** @class */ (function (_super) {
        __extends(AssertionExecutableArgumentError, _super);
        function AssertionExecutableArgumentError(argumentName, argumentValue, err, isAPIError) {
            var _this = _super.call(this, TEST_RUN_ERRORS.assertionExecutableArgumentError, argumentName, argumentValue) || this;
            _this.errMsg = isAPIError ? err.rawMessage : err.message;
            _this.originError = err;
            return _this;
        }
        return AssertionExecutableArgumentError;
    }(ActionArgumentErrorBase));
    var AssertionWithoutMethodCallError = /** @class */ (function (_super) {
        __extends(AssertionWithoutMethodCallError, _super);
        function AssertionWithoutMethodCallError(callsite) {
            var _this = _super.call(this, TEST_RUN_ERRORS.assertionWithoutMethodCallError) || this;
            _this.callsite = callsite;
            return _this;
        }
        return AssertionWithoutMethodCallError;
    }(TestRunErrorBase));
    var AssertionUnawaitedPromiseError = /** @class */ (function (_super) {
        __extends(AssertionUnawaitedPromiseError, _super);
        function AssertionUnawaitedPromiseError(callsite) {
            var _this = _super.call(this, TEST_RUN_ERRORS.assertionUnawaitedPromiseError) || this;
            _this.callsite = callsite;
            return _this;
        }
        return AssertionUnawaitedPromiseError;
    }(TestRunErrorBase));
    // Action parameters errors
    //--------------------------------------------------------------------
    // Options errors
    var ActionIntegerOptionError = /** @class */ (function (_super) {
        __extends(ActionIntegerOptionError, _super);
        function ActionIntegerOptionError(optionName, actualValue) {
            return _super.call(this, TEST_RUN_ERRORS.actionIntegerOptionError, optionName, actualValue) || this;
        }
        return ActionIntegerOptionError;
    }(ActionOptionErrorBase));
    var ActionPositiveIntegerOptionError = /** @class */ (function (_super) {
        __extends(ActionPositiveIntegerOptionError, _super);
        function ActionPositiveIntegerOptionError(optionName, actualValue) {
            return _super.call(this, TEST_RUN_ERRORS.actionPositiveIntegerOptionError, optionName, actualValue) || this;
        }
        return ActionPositiveIntegerOptionError;
    }(ActionOptionErrorBase));
    var ActionBooleanOptionError = /** @class */ (function (_super) {
        __extends(ActionBooleanOptionError, _super);
        function ActionBooleanOptionError(optionName, actualValue) {
            return _super.call(this, TEST_RUN_ERRORS.actionBooleanOptionError, optionName, actualValue) || this;
        }
        return ActionBooleanOptionError;
    }(ActionOptionErrorBase));
    var ActionBooleanArgumentError = /** @class */ (function (_super) {
        __extends(ActionBooleanArgumentError, _super);
        function ActionBooleanArgumentError(argumentName, actualValue) {
            return _super.call(this, TEST_RUN_ERRORS.actionBooleanArgumentError, argumentName, actualValue) || this;
        }
        return ActionBooleanArgumentError;
    }(ActionArgumentErrorBase));
    var ActionSpeedOptionError = /** @class */ (function (_super) {
        __extends(ActionSpeedOptionError, _super);
        function ActionSpeedOptionError(optionName, actualValue) {
            return _super.call(this, TEST_RUN_ERRORS.actionSpeedOptionError, optionName, actualValue) || this;
        }
        return ActionSpeedOptionError;
    }(ActionOptionErrorBase));
    var ActionOptionsTypeError = /** @class */ (function (_super) {
        __extends(ActionOptionsTypeError, _super);
        function ActionOptionsTypeError(actualType) {
            var _this = _super.call(this, TEST_RUN_ERRORS.actionOptionsTypeError) || this;
            _this.actualType = actualType;
            return _this;
        }
        return ActionOptionsTypeError;
    }(TestRunErrorBase));
    // Arguments errors
    var ActionStringArgumentError = /** @class */ (function (_super) {
        __extends(ActionStringArgumentError, _super);
        function ActionStringArgumentError(argumentName, actualValue) {
            return _super.call(this, TEST_RUN_ERRORS.actionStringArgumentError, argumentName, actualValue) || this;
        }
        return ActionStringArgumentError;
    }(ActionArgumentErrorBase));
    var ActionNullableStringArgumentError = /** @class */ (function (_super) {
        __extends(ActionNullableStringArgumentError, _super);
        function ActionNullableStringArgumentError(argumentName, actualValue) {
            return _super.call(this, TEST_RUN_ERRORS.actionNullableStringArgumentError, argumentName, actualValue) || this;
        }
        return ActionNullableStringArgumentError;
    }(ActionArgumentErrorBase));
    var ActionIntegerArgumentError = /** @class */ (function (_super) {
        __extends(ActionIntegerArgumentError, _super);
        function ActionIntegerArgumentError(argumentName, actualValue) {
            return _super.call(this, TEST_RUN_ERRORS.actionIntegerArgumentError, argumentName, actualValue) || this;
        }
        return ActionIntegerArgumentError;
    }(ActionArgumentErrorBase));
    var ActionRoleArgumentError = /** @class */ (function (_super) {
        __extends(ActionRoleArgumentError, _super);
        function ActionRoleArgumentError(argumentName, actualValue) {
            return _super.call(this, TEST_RUN_ERRORS.actionRoleArgumentError, argumentName, actualValue) || this;
        }
        return ActionRoleArgumentError;
    }(ActionArgumentErrorBase));
    var ActionPositiveIntegerArgumentError = /** @class */ (function (_super) {
        __extends(ActionPositiveIntegerArgumentError, _super);
        function ActionPositiveIntegerArgumentError(argumentName, actualValue) {
            return _super.call(this, TEST_RUN_ERRORS.actionPositiveIntegerArgumentError, argumentName, actualValue) || this;
        }
        return ActionPositiveIntegerArgumentError;
    }(ActionArgumentErrorBase));
    var ActionStringOrStringArrayArgumentError = /** @class */ (function (_super) {
        __extends(ActionStringOrStringArrayArgumentError, _super);
        function ActionStringOrStringArrayArgumentError(argumentName, actualValue) {
            return _super.call(this, TEST_RUN_ERRORS.actionStringOrStringArrayArgumentError, argumentName, actualValue) || this;
        }
        return ActionStringOrStringArrayArgumentError;
    }(ActionArgumentErrorBase));
    var ActionStringArrayElementError = /** @class */ (function (_super) {
        __extends(ActionStringArrayElementError, _super);
        function ActionStringArrayElementError(argumentName, actualValue, elementIndex) {
            var _this = _super.call(this, TEST_RUN_ERRORS.actionStringArrayElementError, argumentName, actualValue) || this;
            _this.elementIndex = elementIndex;
            return _this;
        }
        return ActionStringArrayElementError;
    }(ActionArgumentErrorBase));
    var SetTestSpeedArgumentError = /** @class */ (function (_super) {
        __extends(SetTestSpeedArgumentError, _super);
        function SetTestSpeedArgumentError(argumentName, actualValue) {
            return _super.call(this, TEST_RUN_ERRORS.setTestSpeedArgumentError, argumentName, actualValue) || this;
        }
        return SetTestSpeedArgumentError;
    }(ActionArgumentErrorBase));
    var ActionUnsupportedDeviceTypeError = /** @class */ (function (_super) {
        __extends(ActionUnsupportedDeviceTypeError, _super);
        function ActionUnsupportedDeviceTypeError(argumentName, argumentValue) {
            return _super.call(this, TEST_RUN_ERRORS.actionUnsupportedDeviceTypeError, argumentName, argumentValue) || this;
        }
        return ActionUnsupportedDeviceTypeError;
    }(ActionArgumentErrorBase));
    // Selector errors
    var ActionSelectorError = /** @class */ (function (_super) {
        __extends(ActionSelectorError, _super);
        function ActionSelectorError(selectorName, err, isAPIError) {
            var _this = _super.call(this, TEST_RUN_ERRORS.actionSelectorError) || this;
            _this.selectorName = selectorName;
            _this.errMsg = isAPIError ? err.rawMessage : err.message;
            _this.originError = err;
            return _this;
        }
        return ActionSelectorError;
    }(TestRunErrorBase));
    // Action execution errors
    //--------------------------------------------------------------------
    var ActionElementNotFoundError = /** @class */ (function (_super) {
        __extends(ActionElementNotFoundError, _super);
        function ActionElementNotFoundError(apiFnArgs) {
            return _super.call(this, TEST_RUN_ERRORS.actionElementNotFoundError, apiFnArgs) || this;
        }
        return ActionElementNotFoundError;
    }(SelectorErrorBase));
    var ActionElementIsInvisibleError = /** @class */ (function (_super) {
        __extends(ActionElementIsInvisibleError, _super);
        function ActionElementIsInvisibleError() {
            return _super.call(this, TEST_RUN_ERRORS.actionElementIsInvisibleError) || this;
        }
        return ActionElementIsInvisibleError;
    }(TestRunErrorBase));
    var ActionSelectorMatchesWrongNodeTypeError = /** @class */ (function (_super) {
        __extends(ActionSelectorMatchesWrongNodeTypeError, _super);
        function ActionSelectorMatchesWrongNodeTypeError(nodeDescription) {
            var _this = _super.call(this, TEST_RUN_ERRORS.actionSelectorMatchesWrongNodeTypeError) || this;
            _this.nodeDescription = nodeDescription;
            return _this;
        }
        return ActionSelectorMatchesWrongNodeTypeError;
    }(TestRunErrorBase));
    var ActionAdditionalElementNotFoundError = /** @class */ (function (_super) {
        __extends(ActionAdditionalElementNotFoundError, _super);
        function ActionAdditionalElementNotFoundError(argumentName, apiFnArgs) {
            var _this = _super.call(this, TEST_RUN_ERRORS.actionAdditionalElementNotFoundError, apiFnArgs) || this;
            _this.argumentName = argumentName;
            return _this;
        }
        return ActionAdditionalElementNotFoundError;
    }(SelectorErrorBase));
    var ActionAdditionalElementIsInvisibleError = /** @class */ (function (_super) {
        __extends(ActionAdditionalElementIsInvisibleError, _super);
        function ActionAdditionalElementIsInvisibleError(argumentName) {
            var _this = _super.call(this, TEST_RUN_ERRORS.actionAdditionalElementIsInvisibleError) || this;
            _this.argumentName = argumentName;
            return _this;
        }
        return ActionAdditionalElementIsInvisibleError;
    }(TestRunErrorBase));
    var ActionAdditionalSelectorMatchesWrongNodeTypeError = /** @class */ (function (_super) {
        __extends(ActionAdditionalSelectorMatchesWrongNodeTypeError, _super);
        function ActionAdditionalSelectorMatchesWrongNodeTypeError(argumentName, nodeDescription) {
            var _this = _super.call(this, TEST_RUN_ERRORS.actionAdditionalSelectorMatchesWrongNodeTypeError) || this;
            _this.argumentName = argumentName;
            _this.nodeDescription = nodeDescription;
            return _this;
        }
        return ActionAdditionalSelectorMatchesWrongNodeTypeError;
    }(TestRunErrorBase));
    var ActionElementNonEditableError = /** @class */ (function (_super) {
        __extends(ActionElementNonEditableError, _super);
        function ActionElementNonEditableError() {
            return _super.call(this, TEST_RUN_ERRORS.actionElementNonEditableError) || this;
        }
        return ActionElementNonEditableError;
    }(TestRunErrorBase));
    var ActionElementNotTextAreaError = /** @class */ (function (_super) {
        __extends(ActionElementNotTextAreaError, _super);
        function ActionElementNotTextAreaError() {
            return _super.call(this, TEST_RUN_ERRORS.actionElementNotTextAreaError) || this;
        }
        return ActionElementNotTextAreaError;
    }(TestRunErrorBase));
    var ActionElementNonContentEditableError = /** @class */ (function (_super) {
        __extends(ActionElementNonContentEditableError, _super);
        function ActionElementNonContentEditableError(argumentName) {
            var _this = _super.call(this, TEST_RUN_ERRORS.actionElementNonContentEditableError) || this;
            _this.argumentName = argumentName;
            return _this;
        }
        return ActionElementNonContentEditableError;
    }(TestRunErrorBase));
    var ActionRootContainerNotFoundError = /** @class */ (function (_super) {
        __extends(ActionRootContainerNotFoundError, _super);
        function ActionRootContainerNotFoundError() {
            return _super.call(this, TEST_RUN_ERRORS.actionRootContainerNotFoundError) || this;
        }
        return ActionRootContainerNotFoundError;
    }(TestRunErrorBase));
    var ActionIncorrectKeysError = /** @class */ (function (_super) {
        __extends(ActionIncorrectKeysError, _super);
        function ActionIncorrectKeysError(argumentName) {
            var _this = _super.call(this, TEST_RUN_ERRORS.actionIncorrectKeysError) || this;
            _this.argumentName = argumentName;
            return _this;
        }
        return ActionIncorrectKeysError;
    }(TestRunErrorBase));
    var ActionCannotFindFileToUploadError = /** @class */ (function (_super) {
        __extends(ActionCannotFindFileToUploadError, _super);
        function ActionCannotFindFileToUploadError(filePaths, scannedFilePaths) {
            var _this = _super.call(this, TEST_RUN_ERRORS.actionCannotFindFileToUploadError) || this;
            _this.filePaths = filePaths;
            _this.scannedFilePaths = scannedFilePaths;
            return _this;
        }
        return ActionCannotFindFileToUploadError;
    }(TestRunErrorBase));
    var ActionElementIsNotFileInputError = /** @class */ (function (_super) {
        __extends(ActionElementIsNotFileInputError, _super);
        function ActionElementIsNotFileInputError() {
            return _super.call(this, TEST_RUN_ERRORS.actionElementIsNotFileInputError) || this;
        }
        return ActionElementIsNotFileInputError;
    }(TestRunErrorBase));
    var ActionInvalidScrollTargetError = /** @class */ (function (_super) {
        __extends(ActionInvalidScrollTargetError, _super);
        function ActionInvalidScrollTargetError(scrollTargetXValid, scrollTargetYValid) {
            var _this = _super.call(this, TEST_RUN_ERRORS.actionInvalidScrollTargetError) || this;
            if (!scrollTargetXValid) {
                if (!scrollTargetYValid)
                    _this.properties = 'scrollTargetX and scrollTargetY properties';
                else
                    _this.properties = 'scrollTargetX property';
            }
            else
                _this.properties = 'scrollTargetY property';
            return _this;
        }
        return ActionInvalidScrollTargetError;
    }(TestRunErrorBase));
    var UncaughtErrorInCustomScript = /** @class */ (function (_super) {
        __extends(UncaughtErrorInCustomScript, _super);
        function UncaughtErrorInCustomScript(err, expression, line, column, callsite) {
            var _this = _super.call(this, TEST_RUN_ERRORS.uncaughtErrorInCustomScript) || this;
            _this.callsite = callsite;
            _this.expression = expression;
            _this.line = line;
            _this.column = column;
            _this.originError = err;
            _this.errMsg = err.message || String(err);
            return _this;
        }
        return UncaughtErrorInCustomScript;
    }(TestRunErrorBase));
    var UncaughtTestCafeErrorInCustomScript = /** @class */ (function (_super) {
        __extends(UncaughtTestCafeErrorInCustomScript, _super);
        function UncaughtTestCafeErrorInCustomScript(err, expression, line, column, callsite) {
            var _this = _super.call(this, TEST_RUN_ERRORS.uncaughtTestCafeErrorInCustomScript) || this;
            _this.callsite = callsite;
            _this.expression = expression;
            _this.line = line;
            _this.column = column;
            _this.originError = err;
            _this.errCallsite = err.callsite;
            return _this;
        }
        return UncaughtTestCafeErrorInCustomScript;
    }(TestRunErrorBase));
    var WindowDimensionsOverflowError = /** @class */ (function (_super) {
        __extends(WindowDimensionsOverflowError, _super);
        function WindowDimensionsOverflowError(callsite) {
            var _this = _super.call(this, TEST_RUN_ERRORS.windowDimensionsOverflowError) || this;
            _this.callsite = callsite;
            return _this;
        }
        return WindowDimensionsOverflowError;
    }(TestRunErrorBase));
    var InvalidElementScreenshotDimensionsError = /** @class */ (function (_super) {
        __extends(InvalidElementScreenshotDimensionsError, _super);
        function InvalidElementScreenshotDimensionsError(width, height) {
            var _this = _super.call(this, TEST_RUN_ERRORS.invalidElementScreenshotDimensionsError) || this;
            var widthIsInvalid = width <= 0;
            var heightIsInvalid = height <= 0;
            if (widthIsInvalid) {
                if (heightIsInvalid) {
                    _this.verb = 'are';
                    _this.dimensions = 'width and height';
                }
                else {
                    _this.verb = 'is';
                    _this.dimensions = 'width';
                }
            }
            else {
                _this.verb = 'is';
                _this.dimensions = 'height';
            }
            return _this;
        }
        return InvalidElementScreenshotDimensionsError;
    }(TestRunErrorBase));
    var ForbiddenCharactersInScreenshotPathError = /** @class */ (function (_super) {
        __extends(ForbiddenCharactersInScreenshotPathError, _super);
        function ForbiddenCharactersInScreenshotPathError(screenshotPath, forbiddenCharsList) {
            var _this = _super.call(this, TEST_RUN_ERRORS.forbiddenCharactersInScreenshotPathError) || this;
            _this.screenshotPath = screenshotPath;
            _this.forbiddenCharsList = forbiddenCharsList;
            return _this;
        }
        return ForbiddenCharactersInScreenshotPathError;
    }(TestRunErrorBase));
    var RoleSwitchInRoleInitializerError = /** @class */ (function (_super) {
        __extends(RoleSwitchInRoleInitializerError, _super);
        function RoleSwitchInRoleInitializerError(callsite) {
            var _this = _super.call(this, TEST_RUN_ERRORS.roleSwitchInRoleInitializerError) || this;
            _this.callsite = callsite;
            return _this;
        }
        return RoleSwitchInRoleInitializerError;
    }(TestRunErrorBase));
    // Iframe errors
    var ActionElementNotIframeError = /** @class */ (function (_super) {
        __extends(ActionElementNotIframeError, _super);
        function ActionElementNotIframeError() {
            return _super.call(this, TEST_RUN_ERRORS.actionElementNotIframeError) || this;
        }
        return ActionElementNotIframeError;
    }(TestRunErrorBase));
    var ActionIframeIsNotLoadedError = /** @class */ (function (_super) {
        __extends(ActionIframeIsNotLoadedError, _super);
        function ActionIframeIsNotLoadedError() {
            return _super.call(this, TEST_RUN_ERRORS.actionIframeIsNotLoadedError) || this;
        }
        return ActionIframeIsNotLoadedError;
    }(TestRunErrorBase));
    var CurrentIframeIsNotLoadedError = /** @class */ (function (_super) {
        __extends(CurrentIframeIsNotLoadedError, _super);
        function CurrentIframeIsNotLoadedError() {
            return _super.call(this, TEST_RUN_ERRORS.currentIframeIsNotLoadedError) || this;
        }
        return CurrentIframeIsNotLoadedError;
    }(TestRunErrorBase));
    var ChildWindowNotFoundError = /** @class */ (function (_super) {
        __extends(ChildWindowNotFoundError, _super);
        function ChildWindowNotFoundError() {
            return _super.call(this, TEST_RUN_ERRORS.childWindowNotFoundError) || this;
        }
        return ChildWindowNotFoundError;
    }(TestRunErrorBase));
    var ChildWindowIsNotLoadedError = /** @class */ (function (_super) {
        __extends(ChildWindowIsNotLoadedError, _super);
        function ChildWindowIsNotLoadedError() {
            return _super.call(this, TEST_RUN_ERRORS.childWindowIsNotLoadedError) || this;
        }
        return ChildWindowIsNotLoadedError;
    }(TestRunErrorBase));
    var CannotSwitchToWindowError = /** @class */ (function (_super) {
        __extends(CannotSwitchToWindowError, _super);
        function CannotSwitchToWindowError() {
            return _super.call(this, TEST_RUN_ERRORS.cannotSwitchToWindowError) || this;
        }
        return CannotSwitchToWindowError;
    }(TestRunErrorBase));
    var CloseChildWindowError = /** @class */ (function (_super) {
        __extends(CloseChildWindowError, _super);
        function CloseChildWindowError() {
            return _super.call(this, TEST_RUN_ERRORS.closeChildWindowError) || this;
        }
        return CloseChildWindowError;
    }(TestRunErrorBase));
    var CurrentIframeNotFoundError = /** @class */ (function (_super) {
        __extends(CurrentIframeNotFoundError, _super);
        function CurrentIframeNotFoundError() {
            return _super.call(this, TEST_RUN_ERRORS.currentIframeNotFoundError) || this;
        }
        return CurrentIframeNotFoundError;
    }(TestRunErrorBase));
    var CurrentIframeIsInvisibleError = /** @class */ (function (_super) {
        __extends(CurrentIframeIsInvisibleError, _super);
        function CurrentIframeIsInvisibleError() {
            return _super.call(this, TEST_RUN_ERRORS.currentIframeIsInvisibleError) || this;
        }
        return CurrentIframeIsInvisibleError;
    }(TestRunErrorBase));
    // Native dialog errors
    var NativeDialogNotHandledError = /** @class */ (function (_super) {
        __extends(NativeDialogNotHandledError, _super);
        function NativeDialogNotHandledError(dialogType, url) {
            var _this = _super.call(this, TEST_RUN_ERRORS.nativeDialogNotHandledError) || this;
            _this.dialogType = dialogType;
            _this.pageUrl = url;
            return _this;
        }
        return NativeDialogNotHandledError;
    }(TestRunErrorBase));
    var UncaughtErrorInNativeDialogHandler = /** @class */ (function (_super) {
        __extends(UncaughtErrorInNativeDialogHandler, _super);
        function UncaughtErrorInNativeDialogHandler(dialogType, errMsg, url) {
            var _this = _super.call(this, TEST_RUN_ERRORS.uncaughtErrorInNativeDialogHandler) || this;
            _this.dialogType = dialogType;
            _this.errMsg = errMsg;
            _this.pageUrl = url;
            return _this;
        }
        return UncaughtErrorInNativeDialogHandler;
    }(TestRunErrorBase));
    var SetNativeDialogHandlerCodeWrongTypeError = /** @class */ (function (_super) {
        __extends(SetNativeDialogHandlerCodeWrongTypeError, _super);
        function SetNativeDialogHandlerCodeWrongTypeError(actualType) {
            var _this = _super.call(this, TEST_RUN_ERRORS.setNativeDialogHandlerCodeWrongTypeError) || this;
            _this.actualType = actualType;
            return _this;
        }
        return SetNativeDialogHandlerCodeWrongTypeError;
    }(TestRunErrorBase));
    var RequestHookUnhandledError = /** @class */ (function (_super) {
        __extends(RequestHookUnhandledError, _super);
        function RequestHookUnhandledError(err, hookClassName, methodName) {
            var _this = _super.call(this, TEST_RUN_ERRORS.requestHookUnhandledError) || this;
            _this.errMsg = String(err);
            _this.hookClassName = hookClassName;
            _this.methodName = methodName;
            return _this;
        }
        return RequestHookUnhandledError;
    }(TestRunErrorBase));
    var RequestHookNotImplementedMethodError = /** @class */ (function (_super) {
        __extends(RequestHookNotImplementedMethodError, _super);
        function RequestHookNotImplementedMethodError(methodName, hookClassName) {
            var _this = _super.call(this, TEST_RUN_ERRORS.requestHookNotImplementedError) || this;
            _this.methodName = methodName;
            _this.hookClassName = hookClassName;
            return _this;
        }
        return RequestHookNotImplementedMethodError;
    }(TestRunErrorBase));
    var ChildWindowClosedBeforeSwitchingError = /** @class */ (function (_super) {
        __extends(ChildWindowClosedBeforeSwitchingError, _super);
        function ChildWindowClosedBeforeSwitchingError() {
            return _super.call(this, TEST_RUN_ERRORS.childWindowClosedBeforeSwitchingError) || this;
        }
        return ChildWindowClosedBeforeSwitchingError;
    }(TestRunErrorBase));

    // -------------------------------------------------------------
    var integerOption = createIntegerValidator(ActionIntegerOptionError);
    var positiveIntegerOption = createPositiveIntegerValidator(ActionPositiveIntegerOptionError);
    var booleanOption = createBooleanValidator(ActionBooleanOptionError);
    var speedOption = createSpeedValidator(ActionSpeedOptionError);
    // Actions
    var ActionOptions = /** @class */ (function (_super) {
        __extends(ActionOptions, _super);
        function ActionOptions(obj, validate) {
            var _this = _super.call(this) || this;
            _this.speed = null;
            _this._assignFrom(obj, validate);
            return _this;
        }
        ActionOptions.prototype._getAssignableProperties = function () {
            return [
                { name: 'speed', type: speedOption }
            ];
        };
        return ActionOptions;
    }(Assignable));
    // Offset
    var OffsetOptions = /** @class */ (function (_super) {
        __extends(OffsetOptions, _super);
        function OffsetOptions(obj, validate) {
            var _this = _super.call(this) || this;
            _this.offsetX = null;
            _this.offsetY = null;
            _this._assignFrom(obj, validate);
            return _this;
        }
        OffsetOptions.prototype._getAssignableProperties = function () {
            return _super.prototype._getAssignableProperties.call(this).concat([
                { name: 'offsetX', type: integerOption },
                { name: 'offsetY', type: integerOption }
            ]);
        };
        return OffsetOptions;
    }(ActionOptions));
    var ScrollOptions = /** @class */ (function (_super) {
        __extends(ScrollOptions, _super);
        function ScrollOptions(obj, validate) {
            var _this = _super.call(this) || this;
            _this.scrollToCenter = false;
            _this.skipParentFrames = false;
            _this._assignFrom(obj, validate);
            return _this;
        }
        ScrollOptions.prototype._getAssignableProperties = function () {
            return _super.prototype._getAssignableProperties.call(this).concat([
                { name: 'scrollToCenter', type: booleanOption },
                { name: 'skipParentFrames', type: booleanOption }
            ]);
        };
        return ScrollOptions;
    }(OffsetOptions));
    // Element Screenshot
    var ElementScreenshotOptions = /** @class */ (function (_super) {
        __extends(ElementScreenshotOptions, _super);
        function ElementScreenshotOptions(obj, validate) {
            var _this = _super.call(this) || this;
            _this.scrollTargetX = null;
            _this.scrollTargetY = null;
            _this.includeMargins = false;
            _this.includeBorders = true;
            _this.includePaddings = true;
            _this.crop = {
                left: null,
                right: null,
                top: null,
                bottom: null
            };
            _this._assignFrom(obj, validate);
            return _this;
        }
        ElementScreenshotOptions.prototype._getAssignableProperties = function () {
            return _super.prototype._getAssignableProperties.call(this).concat([
                { name: 'scrollTargetX', type: integerOption },
                { name: 'scrollTargetY', type: integerOption },
                { name: 'crop.left', type: integerOption },
                { name: 'crop.right', type: integerOption },
                { name: 'crop.top', type: integerOption },
                { name: 'crop.bottom', type: integerOption },
                { name: 'includeMargins', type: booleanOption },
                { name: 'includeBorders', type: booleanOption },
                { name: 'includePaddings', type: booleanOption }
            ]);
        };
        return ElementScreenshotOptions;
    }(ActionOptions));
    // Mouse
    var MouseOptions = /** @class */ (function (_super) {
        __extends(MouseOptions, _super);
        function MouseOptions(obj, validate) {
            var _this = _super.call(this) || this;
            _this.modifiers = {
                ctrl: false,
                alt: false,
                shift: false,
                meta: false
            };
            _this._assignFrom(obj, validate);
            return _this;
        }
        MouseOptions.prototype._getAssignableProperties = function () {
            return _super.prototype._getAssignableProperties.call(this).concat([
                { name: 'modifiers.ctrl', type: booleanOption },
                { name: 'modifiers.alt', type: booleanOption },
                { name: 'modifiers.shift', type: booleanOption },
                { name: 'modifiers.meta', type: booleanOption }
            ]);
        };
        return MouseOptions;
    }(OffsetOptions));
    // Click
    var ClickOptions = /** @class */ (function (_super) {
        __extends(ClickOptions, _super);
        function ClickOptions(obj, validate) {
            var _this = _super.call(this) || this;
            _this.caretPos = null;
            _this._assignFrom(obj, validate);
            return _this;
        }
        ClickOptions.prototype._getAssignableProperties = function () {
            return _super.prototype._getAssignableProperties.call(this).concat([
                { name: 'caretPos', type: positiveIntegerOption }
            ]);
        };
        return ClickOptions;
    }(MouseOptions));
    // Move
    var MoveOptions = /** @class */ (function (_super) {
        __extends(MoveOptions, _super);
        function MoveOptions(obj, validate) {
            var _this = _super.call(this) || this;
            _this.speed = null;
            _this.minMovingTime = null;
            _this.holdLeftButton = false;
            _this.skipScrolling = false;
            _this.skipDefaultDragBehavior = false;
            _this._assignFrom(obj, validate);
            return _this;
        }
        MoveOptions.prototype._getAssignableProperties = function () {
            return _super.prototype._getAssignableProperties.call(this).concat([
                { name: 'speed' },
                { name: 'minMovingTime' },
                { name: 'holdLeftButton' },
                { name: 'skipScrolling', type: booleanOption },
                { name: 'skipDefaultDragBehavior', type: booleanOption }
            ]);
        };
        return MoveOptions;
    }(MouseOptions));
    // Type
    var TypeOptions = /** @class */ (function (_super) {
        __extends(TypeOptions, _super);
        function TypeOptions(obj, validate) {
            var _this = _super.call(this) || this;
            _this.replace = false;
            _this.paste = false;
            _this._assignFrom(obj, validate);
            return _this;
        }
        TypeOptions.prototype._getAssignableProperties = function () {
            return _super.prototype._getAssignableProperties.call(this).concat([
                { name: 'replace', type: booleanOption },
                { name: 'paste', type: booleanOption }
            ]);
        };
        return TypeOptions;
    }(ClickOptions));
    // DragToElement
    var DragToElementOptions = /** @class */ (function (_super) {
        __extends(DragToElementOptions, _super);
        function DragToElementOptions(obj, validate) {
            var _this = _super.call(this, obj, validate) || this;
            _this.destinationOffsetX = null;
            _this.destinationOffsetY = null;
            _this._assignFrom(obj, validate);
            return _this;
        }
        DragToElementOptions.prototype._getAssignableProperties = function () {
            return _super.prototype._getAssignableProperties.call(this).concat([
                { name: 'destinationOffsetX', type: integerOption },
                { name: 'destinationOffsetY', type: integerOption }
            ]);
        };
        return DragToElementOptions;
    }(MouseOptions));
    //ResizeToFitDevice
    var ResizeToFitDeviceOptions = /** @class */ (function (_super) {
        __extends(ResizeToFitDeviceOptions, _super);
        function ResizeToFitDeviceOptions(obj, validate) {
            var _this = _super.call(this) || this;
            _this.portraitOrientation = false;
            _this._assignFrom(obj, validate);
            return _this;
        }
        ResizeToFitDeviceOptions.prototype._getAssignableProperties = function () {
            return [
                { name: 'portraitOrientation', type: booleanOption }
            ];
        };
        return ResizeToFitDeviceOptions;
    }(Assignable));
    //Assertion
    var AssertionOptions = /** @class */ (function (_super) {
        __extends(AssertionOptions, _super);
        function AssertionOptions(obj, validate) {
            var _this = _super.call(this) || this;
            _this.timeout = void 0;
            _this.allowUnawaitedPromise = false;
            _this._assignFrom(obj, validate);
            return _this;
        }
        AssertionOptions.prototype._getAssignableProperties = function () {
            return [
                { name: 'timeout', type: positiveIntegerOption },
                { name: 'allowUnawaitedPromise', type: booleanOption }
            ];
        };
        return AssertionOptions;
    }(Assignable));

    function getPointsDistance(start, end) {
        return Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
    }
    function findLineAndRectSideIntersection(startLinePoint, endLinePoint, rectSide) {
        var intersectionX = null;
        var haveIntersectionInBounds = null;
        if (rectSide.isHorizontal) {
            intersectionX = testCafeCore.positionUtils.getLineXByYCoord(startLinePoint, endLinePoint, rectSide.y1);
            haveIntersectionInBounds = intersectionX && intersectionX >= rectSide.x1 && intersectionX <= rectSide.x2;
            return haveIntersectionInBounds ? { x: intersectionX, y: rectSide.y1 } : null;
        }
        var intersectionY = testCafeCore.positionUtils.getLineYByXCoord(startLinePoint, endLinePoint, rectSide.x1);
        haveIntersectionInBounds = intersectionY && intersectionY >= rectSide.y1 && intersectionY <= rectSide.y2;
        return haveIntersectionInBounds ? { x: rectSide.x1, y: intersectionY } : null;
    }
    function getLineRectIntersection (startLinePoint, endLinePoint, rect) {
        var res = [];
        var intersection = null;
        var rectLines = [
            { x1: rect.left, y1: rect.top, x2: rect.left, y2: rect.bottom, isHorizontal: false },
            { x1: rect.right, y1: rect.top, x2: rect.right, y2: rect.bottom, isHorizontal: false },
            { x1: rect.left, y1: rect.top, x2: rect.right, y2: rect.top, isHorizontal: true },
            { x1: rect.left, y1: rect.bottom, x2: rect.right, y2: rect.bottom, isHorizontal: true } // bottom-side
        ];
        for (var i = 0; i < rectLines.length; i++) {
            intersection = findLineAndRectSideIntersection(startLinePoint, endLinePoint, rectLines[i]);
            if (intersection)
                res.push(intersection);
        }
        if (!res.length)
            return null;
        if (res.length === 1)
            return res[0];
        // NOTE: if a line and rect have two intersection points, we return the nearest to startLinePoint
        return getPointsDistance(startLinePoint, res[0]) < getPointsDistance(startLinePoint, res[1]) ? res[0] : res[1];
    }

    var Promise$2 = hammerhead__default.Promise;
    var nativeMethods$1 = hammerhead__default.nativeMethods;
    function nextTick () {
        return new Promise$2(function (resolve) { return nativeMethods$1.setTimeout.call(window, resolve, 0); });
    }

    var DragAndDropState = /** @class */ (function () {
        function DragAndDropState() {
            this.enabled = false;
            this.dropAllowed = false;
            this.element = null;
            this.dataTransfer = null;
            this.dataStore = null;
        }
        return DragAndDropState;
    }());

    var browserUtils$2 = hammerhead__default.utils.browser;
    var MoveEventSequenceBase = /** @class */ (function () {
        function MoveEventSequenceBase(_a) {
            var moveEvent = _a.moveEvent;
            this.dragAndDropMode = false;
            this.dropAllowed = false;
            this.moveEvent = moveEvent;
        }
        MoveEventSequenceBase.prototype.setup = function () {
            this.dragAndDropMode = false;
            this.dropAllowed = false;
        };
        MoveEventSequenceBase.prototype.leaveElement = function ( /* currentElement, prevElement, commonAncestor, options */) {
        };
        MoveEventSequenceBase.prototype.move = function ( /* element, options */) {
        };
        MoveEventSequenceBase.prototype.enterElement = function ( /* currentElement, prevElement, commonAncestor, options */) {
        };
        MoveEventSequenceBase.prototype.dragAndDrop = function ( /* dragElement, currentElement, prevElement, options, dragDataStore */) {
        };
        MoveEventSequenceBase.prototype.teardown = function ( /* currentElement, eventOptions, prevElement */) {
        };
        MoveEventSequenceBase.prototype.run = function (currentElement, prevElement, options, dragElement, dragDataStore) {
            // NOTE: if last hovered element was in an iframe that has been removed, IE
            // raises an exception when we try to compare it with the current element
            var prevElementInDocument = prevElement && testCafeCore.domUtils.isElementInDocument(prevElement);
            var prevElementInRemovedIframe = prevElement && testCafeCore.domUtils.isElementInIframe(prevElement) &&
                !testCafeCore.domUtils.getIframeByElement(prevElement);
            if (!prevElementInDocument || prevElementInRemovedIframe)
                prevElement = null;
            var elementChanged = currentElement !== prevElement;
            var commonAncestor = elementChanged ? testCafeCore.domUtils.getCommonAncestor(currentElement, prevElement) : null;
            this.setup();
            if (elementChanged && !!prevElement)
                this.leaveElement(currentElement, prevElement, commonAncestor, options);
            if (browserUtils$2.isIE)
                this.move(currentElement, options);
            if (elementChanged && testCafeCore.domUtils.isElementInDocument(currentElement))
                this.enterElement(currentElement, prevElement, commonAncestor, options);
            if (!browserUtils$2.isIE)
                this.move(currentElement, options);
            this.dragAndDrop(dragElement, currentElement, prevElement, options, dragDataStore);
            this.teardown(currentElement, options, prevElement);
            var dragAndDropMode = this.dragAndDropMode;
            var dropAllowed = this.dropAllowed;
            this.dragAndDropMode = false;
            this.dropAllowed = false;
            return { dragAndDropMode: dragAndDropMode, dropAllowed: dropAllowed };
        };
        return MoveEventSequenceBase;
    }());

    var eventSimulator = hammerhead__default.eventSandbox.eventSimulator;
    var extend = hammerhead__default.utils.extend;
    var nativeMethods$2 = hammerhead__default.nativeMethods;
    var MoveBehaviour = /** @class */ (function () {
        function MoveBehaviour() {
        }
        MoveBehaviour.leaveElement = function (currentElement, prevElement, commonAncestor, options) {
            eventSimulator.mouseout(prevElement, extend({ relatedTarget: currentElement }, options));
            var currentParent = prevElement;
            while (currentParent && currentParent !== commonAncestor) {
                eventSimulator.mouseleave(currentParent, extend({ relatedTarget: currentElement }, options));
                currentParent = nativeMethods$2.nodeParentNodeGetter.call(currentParent);
            }
        };
        MoveBehaviour.enterElement = function (currentElement, prevElement, commonAncestor, options) {
            eventSimulator.mouseover(currentElement, extend({ relatedTarget: prevElement }, options));
            var currentParent = currentElement;
            var mouseenterElements = [];
            while (currentParent && currentParent !== commonAncestor) {
                mouseenterElements.push(currentParent);
                currentParent = nativeMethods$2.nodeParentNodeGetter.call(currentParent);
            }
            mouseenterElements.reverse();
            for (var i = 0; i < mouseenterElements.length; i++)
                eventSimulator.mouseenter(mouseenterElements[i], extend({ relatedTarget: prevElement }, options));
        };
        MoveBehaviour.move = function (moveEvent, element, options) {
            eventSimulator[moveEvent](element, options);
        };
        return MoveBehaviour;
    }());
    var DragAndDropBehavior = /** @class */ (function () {
        function DragAndDropBehavior() {
        }
        DragAndDropBehavior.dragAndDrop = function (dragElement, currentElement, prevElement, options) {
            eventSimulator.drag(dragElement, options);
            var currentElementChanged = currentElement !== prevElement;
            if (currentElementChanged) {
                if (testCafeCore.domUtils.isElementInDocument(currentElement)) {
                    options.relatedTarget = prevElement;
                    eventSimulator.dragenter(currentElement, options);
                }
                if (prevElement) {
                    options.relatedTarget = currentElement;
                    eventSimulator.dragleave(prevElement, options);
                }
            }
            return !eventSimulator.dragover(currentElement, options);
        };
        return DragAndDropBehavior;
    }());

    var eventSimulator$1 = hammerhead__default.eventSandbox.eventSimulator;
    var TOUCH_MOVE_EVENT_NAME = 'touchmove';
    var MoveEventSequence = /** @class */ (function (_super) {
        __extends(MoveEventSequence, _super);
        function MoveEventSequence(options) {
            var _this = _super.call(this, options) || this;
            _this.holdLeftButton = options.holdLeftButton;
            return _this;
        }
        MoveEventSequence.prototype.leaveElement = function (currentElement, prevElement, commonAncestor, options) {
            MoveBehaviour.leaveElement(currentElement, prevElement, commonAncestor, options);
        };
        MoveEventSequence.prototype.enterElement = function (currentElement, prevElement, commonAncestor, options) {
            MoveBehaviour.enterElement(currentElement, prevElement, commonAncestor, options);
        };
        MoveEventSequence.prototype.move = function (element, options) {
            if (this._needEmulateMoveEvent())
                MoveBehaviour.move(this.moveEvent, element, options);
        };
        MoveEventSequence.prototype.teardown = function (currentElement, eventOptions, prevElement) {
            // NOTE: we need to add an extra 'mousemove' if the element was changed because sometimes
            // the client script requires several 'mousemove' events for an element (T246904)
            if (this._needEmulateMoveEvent() && testCafeCore.domUtils.isElementInDocument(currentElement) && currentElement !== prevElement)
                eventSimulator$1[this.moveEvent](currentElement, eventOptions);
        };
        MoveEventSequence.prototype._needEmulateMoveEvent = function () {
            return this.moveEvent !== TOUCH_MOVE_EVENT_NAME || this.holdLeftButton;
        };
        return MoveEventSequence;
    }(MoveEventSequenceBase));

    var DragAndDropMoveEventSequence = /** @class */ (function (_super) {
        __extends(DragAndDropMoveEventSequence, _super);
        function DragAndDropMoveEventSequence() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        DragAndDropMoveEventSequence.prototype.setup = function () {
            _super.prototype.setup.call(this);
            this.dragAndDropMode = true;
        };
        DragAndDropMoveEventSequence.prototype.dragAndDrop = function (dragElement, currentElement, prevElement, options) {
            this.dropAllowed = DragAndDropBehavior.dragAndDrop(dragElement, currentElement, prevElement, options);
        };
        return DragAndDropMoveEventSequence;
    }(MoveEventSequenceBase));

    var eventSimulator$2 = hammerhead__default.eventSandbox.eventSimulator;
    var DragAndDropFirstMoveEventSequence = /** @class */ (function (_super) {
        __extends(DragAndDropFirstMoveEventSequence, _super);
        function DragAndDropFirstMoveEventSequence() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        DragAndDropFirstMoveEventSequence.prototype.setup = function () {
            _super.prototype.setup.call(this);
            this.dragAndDropMode = true;
        };
        DragAndDropFirstMoveEventSequence.prototype.leaveElement = function (currentElement, prevElement, commonAncestor, options) {
            MoveBehaviour.leaveElement(currentElement, prevElement, commonAncestor, options);
        };
        DragAndDropFirstMoveEventSequence.prototype.move = function (element, option) {
            MoveBehaviour.move(this.moveEvent, element, option);
        };
        DragAndDropFirstMoveEventSequence.prototype.enterElement = function (currentElement, prevElement, commonAncestor, options) {
            MoveBehaviour.enterElement(currentElement, prevElement, commonAncestor, options);
        };
        DragAndDropFirstMoveEventSequence.prototype.dragAndDrop = function (dragElement, currentElement, prevElement, options, dragDataStore) {
            var dragAllowed = eventSimulator$2.dragstart(dragElement, options);
            dragDataStore.setReadOnlyMode();
            if (!dragAllowed) {
                this.dragAndDropMode = false;
                return;
            }
            this.dropAllowed = DragAndDropBehavior.dragAndDrop(dragElement, currentElement, prevElement, options);
        };
        DragAndDropFirstMoveEventSequence.prototype.run = function (currentElement, prevElement, options, dragElement, dragDataStore) {
            return _super.prototype.run.call(this, currentElement, null, options, dragElement, dragDataStore);
        };
        return DragAndDropFirstMoveEventSequence;
    }(MoveEventSequenceBase));

    function createEventSequence(dragAndDropEnabled, firstMovingStepOccured, options) {
        if (!dragAndDropEnabled)
            return new MoveEventSequence(options);
        if (firstMovingStepOccured)
            return new DragAndDropMoveEventSequence(options);
        return new DragAndDropFirstMoveEventSequence(options);
    }

    var lastHoveredElement = null;
    var lastHoveredElementHolder = {
        get: function () {
            return lastHoveredElement;
        },
        set: function (element) {
            lastHoveredElement = element;
        }
    };

    var Promise$3 = hammerhead__default.Promise;
    var nativeMethods$3 = hammerhead__default.nativeMethods;
    var featureDetection = hammerhead__default.utils.featureDetection;
    var htmlUtils = hammerhead__default.utils.html;
    var urlUtils = hammerhead__default.utils.url;
    var eventSimulator$3 = hammerhead__default.eventSandbox.eventSimulator;
    var messageSandbox$1 = hammerhead__default.eventSandbox.message;
    var DataTransfer = hammerhead__default.eventSandbox.DataTransfer;
    var DragDataStore = hammerhead__default.eventSandbox.DragDataStore;
    var positionUtils$1 = testCafeCore__default.positionUtils;
    var domUtils$2 = testCafeCore__default.domUtils;
    var styleUtils = testCafeCore__default.styleUtils;
    var eventUtils = testCafeCore__default.eventUtils;
    var promiseUtils = testCafeCore__default.promiseUtils;
    var sendRequestToFrame = testCafeCore__default.sendRequestToFrame;
    var MOVE_REQUEST_CMD = 'automation|move|request';
    var MOVE_RESPONSE_CMD = 'automation|move|response';
    // Setup cross-iframe interaction
    messageSandbox$1.on(messageSandbox$1.SERVICE_MSG_RECEIVED_EVENT, function (e) {
        if (e.message.cmd === MOVE_REQUEST_CMD) {
            if (e.source.parent === window)
                MoveAutomation.onMoveToIframeRequest(e);
            else {
                hammerhead__default.on(hammerhead__default.EVENTS.beforeUnload, function () { return messageSandbox$1.sendServiceMsg({ cmd: MOVE_RESPONSE_CMD }, e.source); });
                MoveAutomation.onMoveOutRequest(e);
            }
        }
    });
    // Utils
    function findDraggableElement(element) {
        var parentNode = element;
        while (parentNode) {
            if (parentNode.draggable)
                return parentNode;
            parentNode = nativeMethods$3.nodeParentNodeGetter.call(parentNode);
        }
        return null;
    }
    var MoveAutomation = /** @class */ (function () {
        function MoveAutomation(element, moveOptions) {
            this.touchMode = featureDetection.isTouchDevice;
            this.moveEvent = this.touchMode ? 'touchmove' : 'mousemove';
            this.holdLeftButton = moveOptions.holdLeftButton;
            this.dragElement = null;
            this.dragAndDropState = new DragAndDropState();
            this.automationSettings = new AutomationSettings(moveOptions.speed);
            var target = MoveAutomation.getTarget(element, moveOptions.offsetX, moveOptions.offsetY);
            this.element = target.element;
            this.offsetX = target.offsetX;
            this.offsetY = target.offsetY;
            this.speed = moveOptions.speed;
            this.cursorSpeed = this.holdLeftButton ? this.automationSettings.draggingSpeed : this.automationSettings.cursorSpeed;
            this.minMovingTime = moveOptions.minMovingTime || null;
            this.modifiers = moveOptions.modifiers || {};
            this.skipScrolling = moveOptions.skipScrolling;
            this.skipDefaultDragBehavior = moveOptions.skipDefaultDragBehavior;
            this.endPoint = null;
            // moving state
            this.movingTime = null;
            this.x = null;
            this.y = null;
            this.startTime = null;
            this.endTime = null;
            this.distanceX = null;
            this.distanceY = null;
            this.firstMovingStepOccured = false;
        }
        MoveAutomation.getTarget = function (el, offsetX, offsetY) {
            // NOTE: if the target point (considering offsets) is out of
            // the element change the target element to the document element
            var relateToDocument = !positionUtils$1.containsOffset(el, offsetX, offsetY);
            var relatedPoint = relateToDocument ? getAutomationPoint(el, offsetX, offsetY) : { x: offsetX, y: offsetY };
            return {
                element: relateToDocument ? document.documentElement : el,
                offsetX: relatedPoint.x,
                offsetY: relatedPoint.y
            };
        };
        MoveAutomation.onMoveToIframeRequest = function (e) {
            var iframePoint = {
                x: e.message.endX,
                y: e.message.endY
            };
            var iframeWin = e.source;
            var iframe = domUtils$2.findIframeByWindow(iframeWin);
            var iframeBorders = styleUtils.getBordersWidth(iframe);
            var iframePadding = styleUtils.getElementPadding(iframe);
            var iframeRectangle = positionUtils$1.getIframeClientCoordinates(iframe);
            var iframePointRelativeToParent = positionUtils$1.getIframePointRelativeToParentFrame(iframePoint, iframeWin);
            var cursorPosition = cursor.position;
            var intersectionPoint = positionUtils$1.isInRectangle(cursorPosition, iframeRectangle) ? cursorPosition :
                getLineRectIntersection(cursorPosition, iframePointRelativeToParent, iframeRectangle);
            var intersectionRelatedToIframe = {
                x: intersectionPoint.x - iframeRectangle.left,
                y: intersectionPoint.y - iframeRectangle.top
            };
            var moveOptions = new MoveOptions({
                modifiers: e.message.modifiers,
                offsetX: intersectionRelatedToIframe.x + iframeBorders.left + iframePadding.left,
                offsetY: intersectionRelatedToIframe.y + iframeBorders.top + iframePadding.top,
                speed: e.message.speed,
                // NOTE: we should not perform scrolling because the active window was
                // already scrolled to the target element before the request (GH-847)
                skipScrolling: true
            }, false);
            var moveAutomation = new MoveAutomation(iframe, moveOptions);
            var responseMsg = {
                cmd: MOVE_RESPONSE_CMD,
                x: intersectionRelatedToIframe.x,
                y: intersectionRelatedToIframe.y
            };
            if (cursor.activeWindow !== iframeWin) {
                moveAutomation
                    .run()
                    .then(function () {
                    cursor.activeWindow = iframeWin;
                    messageSandbox$1.sendServiceMsg(responseMsg, iframeWin);
                });
            }
            else
                messageSandbox$1.sendServiceMsg(responseMsg, iframeWin);
        };
        MoveAutomation.onMoveOutRequest = function (e) {
            var parentWin = e.source;
            var iframeRectangle = {
                left: e.message.left,
                right: e.message.right,
                top: e.message.top,
                bottom: e.message.bottom
            };
            if (!e.message.iframeUnderCursor) {
                var _a = e.message, startX = _a.startX, startY = _a.startY;
                var clientX = startX - iframeRectangle.left;
                var clientY = startY - iframeRectangle.top;
                // NOTE: We should not emulate mouseout and mouseleave if iframe was reloaded.
                var element = lastHoveredElementHolder.get();
                if (element) {
                    eventSimulator$3.mouseout(element, { clientX: clientX, clientY: clientY, relatedTarget: null });
                    eventSimulator$3.mouseleave(element, { clientX: clientX, clientY: clientY, relatedTarget: null });
                }
                messageSandbox$1.sendServiceMsg({ cmd: MOVE_RESPONSE_CMD }, parentWin);
                return;
            }
            var cursorPosition = cursor.position;
            var startPoint = {
                x: iframeRectangle.left + cursorPosition.x,
                y: iframeRectangle.top + cursorPosition.y
            };
            var endPoint = { x: e.message.endX, y: e.message.endY };
            var intersectionPoint = getLineRectIntersection(startPoint, endPoint, iframeRectangle);
            // NOTE: We should not move the cursor out of the iframe if
            // the cursor path does not intersect with the iframe borders.
            if (!intersectionPoint) {
                messageSandbox$1.sendServiceMsg({
                    cmd: MOVE_RESPONSE_CMD,
                    x: iframeRectangle.left,
                    y: iframeRectangle.top
                }, parentWin);
                return;
            }
            var moveOptions = new MoveOptions({
                modifiers: e.message.modifiers,
                offsetX: intersectionPoint.x - iframeRectangle.left,
                offsetY: intersectionPoint.y - iframeRectangle.top,
                speed: e.message.speed,
                // NOTE: we should not perform scrolling because the active window was
                // already scrolled to the target element before the request (GH-847)
                skipScrolling: true
            }, false);
            var moveAutomation = new MoveAutomation(document.documentElement, moveOptions);
            moveAutomation
                .run()
                .then(function () {
                var responseMsg = {
                    cmd: MOVE_RESPONSE_CMD,
                    x: intersectionPoint.x,
                    y: intersectionPoint.y
                };
                cursor.activeWindow = parentWin;
                messageSandbox$1.sendServiceMsg(responseMsg, parentWin);
            });
        };
        MoveAutomation.prototype._getTargetClientPoint = function () {
            var scroll = styleUtils.getElementScroll(this.element);
            if (domUtils$2.isHtmlElement(this.element)) {
                return {
                    x: Math.floor(this.offsetX - scroll.left),
                    y: Math.floor(this.offsetY - scroll.top)
                };
            }
            var clientPosition = positionUtils$1.getClientPosition(this.element);
            var isDocumentBody = this.element.tagName && domUtils$2.isBodyElement(this.element);
            return {
                x: Math.floor(isDocumentBody ? clientPosition.x + this.offsetX : clientPosition.x + this.offsetX -
                    scroll.left),
                y: Math.floor(isDocumentBody ? clientPosition.y + this.offsetY : clientPosition.y + this.offsetY -
                    scroll.top)
            };
        };
        MoveAutomation.prototype._emulateEvents = function (currentElement) {
            var button = this.holdLeftButton ? eventUtils.BUTTONS_PARAMETER.leftButton : eventUtils.BUTTONS_PARAMETER.noButton;
            var devicePoint = getDevicePoint({ x: this.x, y: this.y });
            var eventOptions = {
                clientX: this.x,
                clientY: this.y,
                screenX: devicePoint.x,
                screenY: devicePoint.y,
                buttons: button,
                ctrl: this.modifiers.ctrl,
                alt: this.modifiers.alt,
                shift: this.modifiers.shift,
                meta: this.modifiers.meta,
                dataTransfer: this.dragAndDropState.dataTransfer
            };
            var eventSequenceOptions = { moveEvent: this.moveEvent, holdLeftButton: this.holdLeftButton };
            var eventSequence = createEventSequence(this.dragAndDropState.enabled, this.firstMovingStepOccured, eventSequenceOptions);
            var _a = eventSequence.run(currentElement, lastHoveredElementHolder.get(), eventOptions, this.dragElement, this.dragAndDropState.dataStore), dragAndDropMode = _a.dragAndDropMode, dropAllowed = _a.dropAllowed;
            this.firstMovingStepOccured = true;
            this.dragAndDropState.enabled = dragAndDropMode;
            this.dragAndDropState.dropAllowed = dropAllowed;
            lastHoveredElementHolder.set(currentElement);
        };
        MoveAutomation.prototype._movingStep = function () {
            var _this = this;
            if (this.touchMode && !this.holdLeftButton) {
                this.x = this.endPoint.x;
                this.y = this.endPoint.y;
            }
            else if (!this.startTime) {
                this.startTime = nativeMethods$3.dateNow();
                this.endTime = this.startTime + this.movingTime;
                // NOTE: the mousemove event can't be simulated at the point where the cursor
                // was located at the start. Therefore, we add a minimal distance 1 px.
                this.x += this.distanceX > 0 ? 1 : -1;
                this.y += this.distanceY > 0 ? 1 : -1;
            }
            else {
                var currentTime = Math.min(nativeMethods$3.dateNow(), this.endTime);
                var progress = (currentTime - this.startTime) / (this.endTime - this.startTime);
                this.x = Math.floor(this.startPoint.x + this.distanceX * progress);
                this.y = Math.floor(this.startPoint.y + this.distanceY * progress);
            }
            return cursor
                .move(this.x, this.y)
                .then(underCursor)
                // NOTE: in touch mode, events are simulated for the element for which mousedown was simulated (GH-372)
                .then(function (topElement) {
                var currentElement = _this.holdLeftButton && _this.touchMode ? _this.dragElement : topElement;
                // NOTE: it can be null in IE
                if (!currentElement)
                    return null;
                return _this._emulateEvents(currentElement);
            })
                .then(nextTick);
        };
        MoveAutomation.prototype._isMovingFinished = function () {
            return this.x === this.endPoint.x && this.y === this.endPoint.y;
        };
        MoveAutomation.prototype._move = function () {
            var _this = this;
            this.startPoint = cursor.position;
            this.x = this.startPoint.x;
            this.y = this.startPoint.y;
            this.distanceX = this.endPoint.x - this.startPoint.x;
            this.distanceY = this.endPoint.y - this.startPoint.y;
            this.movingTime = Math.max(Math.abs(this.distanceX), Math.abs(this.distanceY)) / this.cursorSpeed;
            if (this.minMovingTime)
                this.movingTime = Math.max(this.movingTime, this.minMovingTime);
            return promiseUtils.whilst(function () { return !_this._isMovingFinished(); }, function () { return _this._movingStep(); });
        };
        MoveAutomation.prototype._scroll = function () {
            if (this.skipScrolling)
                return Promise$3.resolve();
            var scrollOptions = new ScrollOptions({ offsetX: this.offsetX, offsetY: this.offsetY }, false);
            var scrollAutomation = new ScrollAutomation(this.element, scrollOptions);
            return scrollAutomation.run();
        };
        MoveAutomation.prototype._moveToCurrentFrame = function () {
            if (cursor.active)
                return Promise$3.resolve();
            var _a = cursor.position, x = _a.x, y = _a.y;
            var activeWindow = cursor.activeWindow;
            var iframe = null;
            var iframeUnderCursor = null;
            var iframeRectangle = null;
            var msg = {
                cmd: MOVE_REQUEST_CMD,
                startX: x,
                startY: y,
                endX: this.endPoint.x,
                endY: this.endPoint.y,
                modifiers: this.modifiers,
                speed: this.speed
            };
            if (activeWindow.parent === window) {
                iframe = domUtils$2.findIframeByWindow(activeWindow);
                iframeRectangle = positionUtils$1.getIframeClientCoordinates(iframe);
                msg.left = iframeRectangle.left;
                msg.top = iframeRectangle.top;
                msg.right = iframeRectangle.right;
                msg.bottom = iframeRectangle.bottom;
            }
            return underCursor()
                .then(function (topElement) {
                iframeUnderCursor = topElement === iframe;
                if (activeWindow.parent === window)
                    msg.iframeUnderCursor = iframeUnderCursor;
                return sendRequestToFrame(msg, MOVE_RESPONSE_CMD, activeWindow);
            })
                .then(function (message) {
                cursor.activeWindow = window;
                if (iframeUnderCursor || window.top !== window)
                    return cursor.move(message.x, message.y);
                return null;
            });
        };
        MoveAutomation.prototype.run = function () {
            var _this = this;
            return underCursor()
                .then(function (topElement) {
                _this.dragElement = _this.holdLeftButton ? topElement : null;
                var draggable = findDraggableElement(_this.dragElement);
                // NOTE: we should skip simulating drag&drop's native behavior if the mousedown event was prevented (GH - 2529)
                if (draggable && featureDetection.hasDataTransfer && !_this.skipDefaultDragBehavior) {
                    _this.dragAndDropState.enabled = true;
                    _this.dragElement = draggable;
                    _this.dragAndDropState.element = _this.dragElement;
                    _this.dragAndDropState.dataStore = new DragDataStore();
                    _this.dragAndDropState.dataTransfer = new DataTransfer(_this.dragAndDropState.dataStore);
                    var isLink = domUtils$2.isAnchorElement(_this.dragElement);
                    if (isLink || domUtils$2.isImgElement(_this.dragElement)) {
                        var srcAttr = isLink ? 'href' : 'src';
                        var parsedUrl = urlUtils.parseProxyUrl(_this.dragElement[srcAttr]);
                        var src = parsedUrl ? parsedUrl.destUrl : _this.dragElement[srcAttr];
                        var outerHTML = htmlUtils.cleanUpHtml(nativeMethods$3.elementOuterHTMLGetter.call(_this.dragElement));
                        _this.dragAndDropState.dataTransfer.setData('text/plain', src);
                        _this.dragAndDropState.dataTransfer.setData('text/uri-list', src);
                        _this.dragAndDropState.dataTransfer.setData('text/html', outerHTML);
                    }
                }
                return _this._scroll();
            })
                .then(function () {
                var _a = _this._getTargetClientPoint(), x = _a.x, y = _a.y;
                var windowWidth = styleUtils.getWidth(window);
                var windowHeight = styleUtils.getHeight(window);
                if (x >= 0 && x <= windowWidth && y >= 0 && y <= windowHeight) {
                    _this.endPoint = { x: x, y: y };
                    return _this
                        ._moveToCurrentFrame()
                        .then(function () { return _this._move(); });
                }
                return null;
            })
                .then(function () { return _this.dragAndDropState; });
        };
        return MoveAutomation;
    }());

    var extend$1 = hammerhead__default.utils.extend;
    var ElementState = /** @class */ (function () {
        function ElementState(_a) {
            var _b = _a.element, element = _b === void 0 ? null : _b, _c = _a.clientPoint, clientPoint = _c === void 0 ? null : _c, _d = _a.screenPoint, screenPoint = _d === void 0 ? null : _d, _e = _a.isTarget, isTarget = _e === void 0 ? false : _e, _f = _a.inMoving, inMoving = _f === void 0 ? false : _f;
            this.element = element;
            this.clientPoint = clientPoint;
            this.screenPoint = screenPoint;
            this.isTarget = isTarget;
            this.inMoving = inMoving;
            this.devicePoint = getDevicePoint(clientPoint);
        }
        return ElementState;
    }());
    var VisibleElementAutomation = /** @class */ (function (_super) {
        __extends(VisibleElementAutomation, _super);
        function VisibleElementAutomation(element, offsetOptions) {
            var _this = _super.call(this) || this;
            _this.TARGET_ELEMENT_FOUND_EVENT = 'automation|target-element-found-event';
            _this.element = element;
            _this.options = offsetOptions;
            _this.automationSettings = new AutomationSettings(offsetOptions.speed);
            return _this;
        }
        VisibleElementAutomation.prototype._getElementForEvent = function (eventArgs) {
            var _a = eventArgs.point, x = _a.x, y = _a.y;
            var expectedElement = testCafeCore.positionUtils.containsOffset(this.element, this.options.offsetX, this.options.offsetY) ? this.element : null;
            return fromPoint(x, y, expectedElement).then(function (_a) {
                var element = _a.element;
                return element;
            });
        };
        VisibleElementAutomation.prototype._moveToElement = function () {
            var _this = this;
            var moveOptions = new MoveOptions(extend$1({ skipScrolling: true }, this.options), false);
            var moveAutomation = new MoveAutomation(this.element, moveOptions);
            return moveAutomation
                .run()
                .then(function () { return testCafeCore.delay(_this.automationSettings.mouseActionStepDelay); });
        };
        VisibleElementAutomation.prototype._scrollToElement = function () {
            var _this = this;
            var scrollOptions = new ScrollOptions(this.options);
            var scrollAutomation = new ScrollAutomation(this.element, scrollOptions);
            var wasScrolled = false;
            return scrollAutomation
                .run()
                .then(function (scrollWasPerformed) {
                wasScrolled = scrollWasPerformed;
                return testCafeCore.delay(_this.automationSettings.mouseActionStepDelay);
            })
                .then(underCursor)
                .then(function (currentElement) {
                var elementUnderCursorContainsTarget = !!currentElement && testCafeCore.domUtils.contains(_this.element, currentElement);
                if (!elementUnderCursorContainsTarget || !wasScrolled)
                    return null;
                var prevElement = lastHoveredElementHolder.get();
                var commonAncestor = testCafeCore.domUtils.getCommonAncestor(currentElement, prevElement);
                var clientPosition = testCafeCore.positionUtils.getClientPosition(currentElement);
                var devicePoint = getDevicePoint({ x: clientPosition.x, y: clientPosition.y });
                var options = {
                    clientX: clientPosition.x,
                    clientY: clientPosition.y,
                    screenX: devicePoint.x,
                    screenY: devicePoint.y,
                    ctrl: false,
                    alt: false,
                    shift: false,
                    meta: false,
                    buttons: testCafeCore.eventUtils.BUTTONS_PARAMETER.leftButton
                };
                MoveBehaviour.leaveElement(currentElement, prevElement, commonAncestor, options);
                MoveBehaviour.enterElement(currentElement, prevElement, commonAncestor, options);
                lastHoveredElementHolder.set(currentElement);
                return wasScrolled;
            });
        };
        VisibleElementAutomation.prototype._getElementOffset = function () {
            var defaultOffsets = getOffsetOptions(this.element);
            var _a = this.options, offsetX = _a.offsetX, offsetY = _a.offsetY;
            offsetX = offsetX || offsetX === 0 ? offsetX : defaultOffsets.offsetX;
            offsetY = offsetY || offsetY === 0 ? offsetY : defaultOffsets.offsetY;
            return { offsetX: offsetX, offsetY: offsetY };
        };
        VisibleElementAutomation.prototype._wrapAction = function (action) {
            var _this = this;
            var _a = this._getElementOffset(), offsetX = _a.offsetX, offsetY = _a.offsetY;
            var screenPointBeforeAction = getAutomationPoint(this.element, offsetX, offsetY);
            var clientPositionBeforeAction = testCafeCore.positionUtils.getClientPosition(this.element);
            return action()
                .then(function () {
                var screenPointAfterAction = getAutomationPoint(_this.element, offsetX, offsetY);
                var clientPositionAfterAction = testCafeCore.positionUtils.getClientPosition(_this.element);
                var clientPoint = convertToClient(_this.element, screenPointAfterAction);
                var expectedElement = testCafeCore.positionUtils.containsOffset(_this.element, offsetX, offsetY) ? _this.element : null;
                return fromPoint(clientPoint.x, clientPoint.y, expectedElement)
                    .then(function (_a) {
                    var element = _a.element, corrected = _a.corrected;
                    var foundElement = element;
                    if (!foundElement)
                        return new ElementState({});
                    var isTarget = !expectedElement || corrected || foundElement === _this.element;
                    if (!isTarget) {
                        // NOTE: perform an operation with searching in dom only if necessary
                        isTarget = testCafeCore.arrayUtils.indexOf(testCafeCore.domUtils.getParents(foundElement), _this.element) > -1;
                    }
                    var offsetPositionChanged = screenPointBeforeAction.x !== screenPointAfterAction.x ||
                        screenPointBeforeAction.y !== screenPointAfterAction.y;
                    var clientPositionChanged = clientPositionBeforeAction.x !== clientPositionAfterAction.x ||
                        clientPositionBeforeAction.y !== clientPositionAfterAction.y;
                    // NOTE: We consider the element moved if its offset position and client position
                    // are changed both. If only client position was changed it means the page was
                    // scrolled and the element keeps its position on the page. If only offset position was
                    // changed it means the element is fixed on the page (it can be implemented via script).
                    var targetElementIsMoving = offsetPositionChanged && clientPositionChanged;
                    return new ElementState({
                        element: element,
                        clientPoint: clientPoint,
                        screenPoint: screenPointAfterAction,
                        isTarget: isTarget,
                        inMoving: targetElementIsMoving
                    });
                });
            });
        };
        VisibleElementAutomation._checkElementState = function (state, useStrictElementCheck) {
            if (!state.element)
                throw new Error(ERROR_TYPES.elementIsInvisibleError);
            if (useStrictElementCheck && (!state.isTarget || state.inMoving))
                throw new Error(ERROR_TYPES.foundElementIsNotTarget);
        };
        VisibleElementAutomation.prototype._ensureElement = function (useStrictElementCheck, skipCheckAfterMoving) {
            var _this = this;
            return this
                ._wrapAction(function () { return _this._scrollToElement(); })
                .then(function (state) { return VisibleElementAutomation._checkElementState(state, useStrictElementCheck); })
                .then(function () { return _this._wrapAction(function () { return _this._moveToElement(); }); })
                .then(function (state) {
                if (!skipCheckAfterMoving)
                    VisibleElementAutomation._checkElementState(state, useStrictElementCheck);
                return state;
            })
                .then(function (state) {
                _this.emit(_this.TARGET_ELEMENT_FOUND_EVENT, { element: state.element });
                return {
                    element: state.element,
                    clientPoint: state.clientPoint,
                    screenPoint: state.screenPoint,
                    devicePoint: state.devicePoint
                };
            });
        };
        return VisibleElementAutomation;
    }(testCafeCore.serviceUtils.EventEmitter));

    var Promise$4 = hammerhead__default.Promise;
    var nativeMethods$4 = hammerhead__default.nativeMethods;
    var browserUtils$3 = hammerhead__default.utils.browser;
    var focusBlurSandbox = hammerhead__default.eventSandbox.focusBlur;
    var contentEditable = testCafeCore__default.contentEditable;
    var textSelection = testCafeCore__default.textSelection;
    var domUtils$3 = testCafeCore__default.domUtils;
    var styleUtils$1 = testCafeCore__default.styleUtils;
    function setCaretPosition(element, caretPos) {
        var isTextEditable = domUtils$3.isTextEditableElement(element);
        var isContentEditable = domUtils$3.isContentEditableElement(element);
        if (isTextEditable || isContentEditable) {
            if (isContentEditable && isNaN(parseInt(caretPos, 10)))
                textSelection.setCursorToLastVisiblePosition(element);
            else {
                var position = isNaN(parseInt(caretPos, 10)) ? domUtils$3.getElementValue(element).length : caretPos;
                textSelection.select(element, position, position);
            }
        }
        else {
            // NOTE: if focus is called for a non-contentEditable element (like 'img' or 'button') inside
            // a contentEditable parent, we should try to set the right window selection. Generally, we can't
            // set the right window selection object because after the selection setup, the window.getSelection
            // method returns a different object, which depends on the browser.
            var contentEditableParent = contentEditable.findContentEditableParent(element);
            if (contentEditableParent)
                textSelection.setCursorToLastVisiblePosition(contentEditable.findContentEditableParent(contentEditableParent));
        }
    }
    function focusAndSetSelection(element, simulateFocus, caretPos) {
        return new Promise$4(function (resolve) {
            var activeElement = domUtils$3.getActiveElement();
            var isTextEditable = domUtils$3.isTextEditableElement(element);
            var labelWithForAttr = domUtils$3.closest(element, 'label[for]');
            var isElementFocusable = domUtils$3.isElementFocusable(element);
            var shouldFocusByRelatedElement = !isElementFocusable && labelWithForAttr;
            var isContentEditable = domUtils$3.isContentEditableElement(element);
            var elementForFocus = isContentEditable ? contentEditable.findContentEditableParent(element) : element;
            // NOTE: in WebKit, if selection was never set in an input element, the focus method selects all the
            // text in this element. So, we should call select before focus to set the caret to the first symbol.
            if (simulateFocus && browserUtils$3.isWebKit && isTextEditable)
                textSelection.select(element, 0, 0);
            // NOTE: we should call focus for the element related with a 'label' that has the 'for' attribute
            if (shouldFocusByRelatedElement) {
                if (simulateFocus)
                    focusByLabel(labelWithForAttr);
                resolve();
                return;
            }
            var focusWithSilentMode = !simulateFocus;
            var focusForMouseEvent = true;
            var preventScrolling = false;
            if (!isElementFocusable && !isContentEditable) {
                var curDocument = domUtils$3.findDocument(elementForFocus);
                var curActiveElement = nativeMethods$4.documentActiveElementGetter.call(curDocument);
                var isActiveElementBody = domUtils$3.isBodyElement(curActiveElement);
                var focusableParent = domUtils$3.isBodyElement(elementForFocus) ?
                    elementForFocus : domUtils$3.getFocusableParent(elementForFocus);
                // NOTE: we should not call focus or blur if action element is
                // not focusable and is child of active element (gh-889)
                var elementChildOfActiveElement = curActiveElement && !isActiveElementBody &&
                    domUtils$3.containsElement(curActiveElement, elementForFocus);
                if (elementChildOfActiveElement || isActiveElementBody && domUtils$3.isBodyElement(focusableParent)) {
                    resolve();
                    return;
                }
                elementForFocus = focusableParent || curDocument.body;
                preventScrolling = true;
            }
            focusBlurSandbox.focus(elementForFocus, function () {
                // NOTE: if a different element was focused in the focus event handler, we should not set selection
                if (simulateFocus && !isContentEditable && element !== domUtils$3.getActiveElement()) {
                    resolve();
                    return;
                }
                setCaretPosition(element, caretPos);
                // NOTE: we can't avoid the element being focused because the setSelection method leads to focusing.
                // So, we just focus the previous active element without handlers if we don't need focus here
                if (!simulateFocus && domUtils$3.getActiveElement() !== activeElement)
                    focusBlurSandbox.focus(activeElement, resolve, true, true);
                else
                    resolve();
            }, focusWithSilentMode, focusForMouseEvent, false, preventScrolling);
        });
    }
    function getElementBoundToLabel(element) {
        var labelWithForAttr = domUtils$3.closest(element, 'label[for]');
        var control = labelWithForAttr && (labelWithForAttr.control || document.getElementById(labelWithForAttr.htmlFor));
        var isControlVisible = control && styleUtils$1.isElementVisible(control);
        return isControlVisible ? control : null;
    }
    function focusByLabel(label) {
        if (domUtils$3.isElementFocusable(label))
            focusBlurSandbox.focus(label, testCafeCore__default.noop, false, true);
        else
            focusByRelatedElement(label);
    }
    function focusByRelatedElement(element) {
        var elementForFocus = getElementBoundToLabel(element);
        if (!elementForFocus || domUtils$3.getActiveElement() === elementForFocus)
            return;
        focusBlurSandbox.focus(elementForFocus, testCafeCore__default.noop, false, true);
    }

    var browserUtils$4 = hammerhead__default.utils.browser;
    var eventSimulator$4 = hammerhead__default.eventSandbox.eventSimulator;
    var listeners = hammerhead__default.eventSandbox.listeners;
    var domUtils$4 = testCafeCore__default.domUtils;
    var styleUtils$2 = testCafeCore__default.styleUtils;
    var selectElementUI = testCafeUI.selectElement;
    var ElementClickCommand = /** @class */ (function () {
        function ElementClickCommand(eventState, eventArgs) {
            this.eventState = eventState;
            this.eventArgs = eventArgs;
        }
        ElementClickCommand.prototype.run = function () {
            if (this.eventState.clickElement)
                eventSimulator$4.click(this.eventState.clickElement, this.eventArgs.options);
            if (!domUtils$4.isElementFocusable(this.eventArgs.element))
                focusByRelatedElement(this.eventArgs.element);
        };
        return ElementClickCommand;
    }());
    var LabelElementClickCommand = /** @class */ (function (_super) {
        __extends(LabelElementClickCommand, _super);
        function LabelElementClickCommand(eventState, eventArgs) {
            var _this = _super.call(this, eventState, eventArgs) || this;
            _this.label = _this.eventArgs.element;
            _this.input = getElementBoundToLabel(_this.eventArgs.element);
            return _this;
        }
        LabelElementClickCommand.prototype.run = function () {
            var _this = this;
            var focusRaised = false;
            var ensureFocusRaised = function (e) {
                focusRaised = e.target === _this.input;
            };
            listeners.addInternalEventListener(window, ['focus'], ensureFocusRaised);
            _super.prototype.run.call(this);
            listeners.removeInternalEventListener(window, ['focus'], ensureFocusRaised);
            if (domUtils$4.isElementFocusable(this.label) && !focusRaised)
                this._ensureBoundElementFocusRaised();
        };
        LabelElementClickCommand.prototype._ensureBoundElementFocusRaised = function () {
            eventSimulator$4.focus(this.input);
        };
        return LabelElementClickCommand;
    }(ElementClickCommand));
    var SelectElementClickCommand = /** @class */ (function (_super) {
        __extends(SelectElementClickCommand, _super);
        function SelectElementClickCommand(eventState, eventArgs) {
            return _super.call(this, eventState, eventArgs) || this;
        }
        SelectElementClickCommand.prototype.run = function () {
            _super.prototype.run.call(this);
            this._toggleSelectOptionList();
        };
        SelectElementClickCommand.prototype._toggleSelectOptionList = function () {
            // NOTE: Emulating the click event on the 'select' element doesn't expand the
            // dropdown with options (except chrome), therefore we should emulate it.
            var element = this.eventArgs.element;
            var isSelectWithDropDown = styleUtils$2.getSelectElementSize(element) === 1;
            if (isSelectWithDropDown && this.eventState.simulateDefaultBehavior !== false) {
                if (selectElementUI.isOptionListExpanded(element))
                    selectElementUI.collapseOptionList();
                else
                    selectElementUI.expandOptionList(element);
            }
        };
        return SelectElementClickCommand;
    }(ElementClickCommand));
    var OptionElementClickCommand = /** @class */ (function (_super) {
        __extends(OptionElementClickCommand, _super);
        function OptionElementClickCommand(eventState, eventArgs) {
            return _super.call(this, eventState, eventArgs) || this;
        }
        OptionElementClickCommand.prototype.run = function () {
            return this.eventArgs.element;
        };
        return OptionElementClickCommand;
    }(ElementClickCommand));
    var LabelledCheckboxElementClickCommand = /** @class */ (function (_super) {
        __extends(LabelledCheckboxElementClickCommand, _super);
        function LabelledCheckboxElementClickCommand(eventState, eventArgs) {
            var _this = _super.call(this, eventState, eventArgs) || this;
            _this.checkbox = _this.input;
            return _this;
        }
        LabelledCheckboxElementClickCommand.prototype.run = function () {
            var changed = false;
            var onChange = function () {
                changed = true;
            };
            listeners.addInternalEventListener(window, ['change'], onChange);
            _super.prototype.run.call(this);
            listeners.removeInternalEventListener(window, ['change'], onChange);
            if (browserUtils$4.isChrome && !changed)
                this._ensureCheckboxStateChanged();
        };
        LabelledCheckboxElementClickCommand.prototype._ensureCheckboxStateChanged = function () {
            this.checkbox.checked = !this.checkbox.checked;
            eventSimulator$4.change(this.checkbox);
        };
        return LabelledCheckboxElementClickCommand;
    }(LabelElementClickCommand));
    function createClickCommand (eventState, eventArgs) {
        var elementBoundToLabel = getElementBoundToLabel(eventArgs.element);
        var isSelectElement = domUtils$4.isSelectElement(eventArgs.element);
        var isOptionElement = domUtils$4.isOptionElement(eventArgs.element);
        var isLabelElement = domUtils$4.isLabelElement(eventArgs.element) && elementBoundToLabel;
        var isLabelledCheckbox = elementBoundToLabel && domUtils$4.isCheckboxElement(elementBoundToLabel);
        if (isSelectElement)
            return new SelectElementClickCommand(eventState, eventArgs);
        if (isOptionElement)
            return new OptionElementClickCommand(eventState, eventArgs);
        if (isLabelledCheckbox)
            return new LabelledCheckboxElementClickCommand(eventState, eventArgs);
        if (isLabelElement)
            return new LabelElementClickCommand(eventState, eventArgs);
        return new ElementClickCommand(eventState, eventArgs);
    }

    var Promise$5 = hammerhead__default.Promise;
    var extend$2 = hammerhead__default.utils.extend;
    var browserUtils$5 = hammerhead__default.utils.browser;
    var featureDetection$1 = hammerhead__default.utils.featureDetection;
    var eventSimulator$5 = hammerhead__default.eventSandbox.eventSimulator;
    var listeners$1 = hammerhead__default.eventSandbox.listeners;
    var domUtils$5 = testCafeCore__default.domUtils;
    var eventUtils$1 = testCafeCore__default.eventUtils;
    var arrayUtils = testCafeCore__default.arrayUtils;
    var delay = testCafeCore__default.delay;
    var ClickAutomation = /** @class */ (function (_super) {
        __extends(ClickAutomation, _super);
        function ClickAutomation(element, clickOptions) {
            var _this = _super.call(this, element, clickOptions) || this;
            _this.modifiers = clickOptions.modifiers;
            _this.caretPos = clickOptions.caretPos;
            _this.targetElementParentNodes = [];
            _this.activeElementBeforeMouseDown = null;
            _this.mouseDownElement = null;
            _this.eventState = {
                mousedownPrevented: false,
                blurRaised: false,
                simulateDefaultBehavior: true,
                clickElement: null
            };
            return _this;
        }
        ClickAutomation.prototype._bindMousedownHandler = function () {
            var _this = this;
            var onmousedown = function (e) {
                _this.eventState.mousedownPrevented = e.defaultPrevented;
                eventUtils$1.preventDefault(e);
                eventUtils$1.unbind(_this.element, 'mousedown', onmousedown);
            };
            eventUtils$1.bind(this.element, 'mousedown', onmousedown);
        };
        ClickAutomation.prototype._bindBlurHandler = function (element) {
            var _this = this;
            var onblur = function () {
                _this.eventState.blurRaised = true;
                eventUtils$1.unbind(element, 'blur', onblur, true);
            };
            eventUtils$1.bind(element, 'blur', onblur, true);
        };
        ClickAutomation.prototype._raiseTouchEvents = function (eventArgs) {
            if (featureDetection$1.isTouchDevice) {
                eventSimulator$5.touchstart(eventArgs.element, eventArgs.options);
                eventSimulator$5.touchend(eventArgs.element, eventArgs.options);
            }
        };
        ClickAutomation.prototype._mousedown = function (eventArgs) {
            var _this = this;
            this.targetElementParentNodes = domUtils$5.getParents(eventArgs.element);
            this.mouseDownElement = eventArgs.element;
            return cursor.leftButtonDown()
                .then(function () {
                _this._raiseTouchEvents(eventArgs);
                var activeElement = domUtils$5.getActiveElement();
                _this.activeElementBeforeMouseDown = activeElement;
                // NOTE: In WebKit and IE, the mousedown event opens the select element's dropdown;
                // therefore, we should prevent mousedown and hide the dropdown (B236416).
                var needCloseSelectDropDown = (browserUtils$5.isWebKit || browserUtils$5.isIE) &&
                    domUtils$5.isSelectElement(_this.mouseDownElement);
                if (needCloseSelectDropDown)
                    _this._bindMousedownHandler();
                _this._bindBlurHandler(activeElement);
                _this.eventState.simulateDefaultBehavior = eventSimulator$5.mousedown(eventArgs.element, eventArgs.options);
                if (_this.eventState.simulateDefaultBehavior === false)
                    _this.eventState.simulateDefaultBehavior = needCloseSelectDropDown && !_this.eventState.mousedownPrevented;
                return _this._ensureActiveElementBlur(activeElement);
            })
                .then(function () { return _this._focus(eventArgs); });
        };
        ClickAutomation.prototype._ensureActiveElementBlur = function (element) {
            var _this = this;
            // NOTE: In some cases, mousedown may lead to active element change (browsers raise blur).
            // We simulate the blur event if the active element was changed after the mousedown, and
            // the blur event does not get raised automatically (B239273, B253520)
            return new Promise$5(function (resolve) {
                var simulateBlur = domUtils$5.getActiveElement() !== element && !_this.eventState.blurRaised;
                if (!simulateBlur) {
                    resolve();
                    return;
                }
                if (browserUtils$5.isIE && browserUtils$5.version < 12) {
                    // NOTE: In whatever way an element is blurred from the client script, the
                    // blur event is raised asynchronously in IE (in MSEdge focus/blur is sync)
                    nextTick()
                        .then(function () {
                        if (!_this.eventState.blurRaised)
                            eventSimulator$5.blur(element);
                        resolve();
                    });
                }
                else {
                    eventSimulator$5.blur(element);
                    resolve();
                }
            });
        };
        ClickAutomation.prototype._focus = function (eventArgs) {
            if (this.eventState.simulateDefaultBehavior === false)
                return Promise$5.resolve();
            // NOTE: If a target element is a contentEditable element, we need to call focusAndSetSelection directly for
            // this element. Otherwise, if the element obtained by elementFromPoint is a child of the contentEditable
            // element, a selection position may be calculated incorrectly (by using the caretPos option).
            var elementForFocus = domUtils$5.isContentEditableElement(this.element) ? this.element : eventArgs.element;
            // NOTE: IE doesn't perform focus if active element has been changed while executing mousedown
            var simulateFocus = !browserUtils$5.isIE || this.activeElementBeforeMouseDown === domUtils$5.getActiveElement();
            return focusAndSetSelection(elementForFocus, simulateFocus, this.caretPos);
        };
        ClickAutomation._getElementForClick = function (mouseDownElement, topElement, mouseDownElementParentNodes) {
            var topElementParentNodes = domUtils$5.getParents(topElement);
            var areElementsSame = domUtils$5.isTheSameNode(topElement, mouseDownElement);
            // NOTE: Mozilla Firefox always skips click, if an element under cursor has been changed after mousedown.
            if (browserUtils$5.isFirefox)
                return areElementsSame ? mouseDownElement : null;
            if (!areElementsSame) {
                if (mouseDownElement.contains(topElement) && !domUtils$5.isEditableFormElement(topElement))
                    return mouseDownElement;
                if (topElement.contains(mouseDownElement))
                    return topElement;
                // NOTE: If elements are not in the parent-child relationships,
                // non-ff browsers raise the `click` event for their common parent.
                return arrayUtils.getCommonElement(topElementParentNodes, mouseDownElementParentNodes);
            }
            // NOTE: In case the target element and the top element are the same,
            // non-FF browsers are dispatching the `click` event if the target
            // element hasn't changed its position in the DOM after mousedown.
            return arrayUtils.equals(mouseDownElementParentNodes, topElementParentNodes) ? mouseDownElement : null;
        };
        ClickAutomation.prototype._mouseup = function (eventArgs) {
            var _this = this;
            return cursor
                .buttonUp()
                .then(function () { return _this._getElementForEvent(eventArgs); })
                .then(function (element) {
                eventArgs.element = element;
                _this.eventState.clickElement = ClickAutomation._getElementForClick(_this.mouseDownElement, element, _this.targetElementParentNodes);
                var timeStamp = {};
                var getTimeStamp = function (e) {
                    timeStamp = e.timeStamp;
                    listeners$1.removeInternalEventListener(window, ['mouseup'], getTimeStamp);
                };
                if (!browserUtils$5.isIE)
                    listeners$1.addInternalEventListener(window, ['mouseup'], getTimeStamp);
                eventSimulator$5.mouseup(element, eventArgs.options);
                return { timeStamp: timeStamp };
            });
        };
        ClickAutomation.prototype._click = function (eventArgs) {
            var clickCommand = createClickCommand(this.eventState, eventArgs);
            clickCommand.run();
            return eventArgs;
        };
        ClickAutomation.prototype.run = function (useStrictElementCheck) {
            var _this = this;
            var eventArgs = null;
            return this
                ._ensureElement(useStrictElementCheck)
                .then(function (_a) {
                var element = _a.element, clientPoint = _a.clientPoint, screenPoint = _a.screenPoint, devicePoint = _a.devicePoint;
                eventArgs = {
                    point: clientPoint,
                    screenPoint: screenPoint,
                    element: element,
                    options: extend$2({
                        clientX: clientPoint.x,
                        clientY: clientPoint.y,
                        screenX: devicePoint.x,
                        screenY: devicePoint.y
                    }, _this.modifiers)
                };
                // NOTE: we should raise mouseup event with 'mouseActionStepDelay' after we trigger
                // mousedown event regardless of how long mousedown event handlers were executing
                return Promise$5.all([delay(_this.automationSettings.mouseActionStepDelay), _this._mousedown(eventArgs)]);
            })
                .then(function () { return _this._mouseup(eventArgs); })
                .then(function (_a) {
                var timeStamp = _a.timeStamp;
                eventArgs.options.timeStamp = timeStamp;
                return _this._click(eventArgs);
            });
        };
        return ClickAutomation;
    }(VisibleElementAutomation));

    var Promise$6 = hammerhead__default.Promise;
    var browserUtils$6 = hammerhead__default.utils.browser;
    var featureDetection$2 = hammerhead__default.utils.featureDetection;
    var eventSimulator$6 = hammerhead__default.eventSandbox.eventSimulator;
    var focusBlurSandbox$1 = hammerhead__default.eventSandbox.focusBlur;
    var nativeMethods$5 = hammerhead__default.nativeMethods;
    var domUtils$6 = testCafeCore__default.domUtils;
    var styleUtils$3 = testCafeCore__default.styleUtils;
    var delay$1 = testCafeCore__default.delay;
    var selectElementUI$1 = testCafeUI.selectElement;
    var FOCUS_DELAY = featureDetection$2.isTouchDevice ? 0 : 160;
    var SelectChildClickAutomation = /** @class */ (function () {
        function SelectChildClickAutomation(element, clickOptions) {
            this.element = element;
            this.modifiers = clickOptions.modifiers;
            this.caretPos = clickOptions.caretPos;
            this.offsetX = clickOptions.offsetX;
            this.offsetY = clickOptions.offsetY;
            this.speed = clickOptions.speed;
            this.automationSettings = new AutomationSettings(clickOptions.speed);
            this.parentSelect = domUtils$6.getSelectParent(this.element);
            this.optionListExpanded = this.parentSelect ? selectElementUI$1.isOptionListExpanded(this.parentSelect) : false;
            this.childIndex = null;
            this.clickCausesChange = false;
            if (this.parentSelect) {
                var isOption = domUtils$6.isOptionElement(this.element);
                var selectedIndex = this.parentSelect.selectedIndex;
                this.childIndex = isOption ? domUtils$6.getElementIndexInParent(this.parentSelect, this.element) :
                    domUtils$6.getElementIndexInParent(this.parentSelect, this.element);
                var parent_1 = nativeMethods$5.nodeParentNodeGetter.call(this.element);
                var parentOptGroup = domUtils$6.isOptionGroupElement(parent_1) ? parent_1 : null;
                var isDisabled = this.element.disabled || parentOptGroup && parentOptGroup.disabled;
                this.clickCausesChange = isOption && !isDisabled && this.childIndex !== selectedIndex;
            }
            this.eventsArgs = {
                options: this.modifiers,
                element: this.element
            };
        }
        SelectChildClickAutomation.prototype._calculateEventArguments = function () {
            var childElement = this.optionListExpanded ? selectElementUI$1.getEmulatedChildElement(this.element) : this.element;
            var parentSelectSize = styleUtils$3.getSelectElementSize(this.parentSelect) > 1;
            return {
                options: this.modifiers,
                element: browserUtils$6.isIE && parentSelectSize ? this.parentSelect : childElement
            };
        };
        SelectChildClickAutomation.prototype._getMoveArguments = function () {
            var element = null;
            var offsetX = null;
            var offsetY = null;
            if (this.optionListExpanded) {
                element = selectElementUI$1.getEmulatedChildElement(this.element);
                var moveActionOffsets = getDefaultAutomationOffsets(element);
                offsetX = moveActionOffsets.offsetX;
                offsetY = moveActionOffsets.offsetY;
            }
            else {
                element = document.documentElement;
                var elementCenter = selectElementUI$1.getSelectChildCenter(this.element);
                offsetX = elementCenter.x;
                offsetY = elementCenter.y;
            }
            return { element: element, offsetX: offsetX, offsetY: offsetY, speed: this.speed };
        };
        SelectChildClickAutomation.prototype._move = function (_a) {
            var _this = this;
            var element = _a.element, offsetX = _a.offsetX, offsetY = _a.offsetY, speed = _a.speed;
            var moveOptions = new MoveOptions({
                offsetX: offsetX,
                offsetY: offsetY,
                speed: speed,
                modifiers: this.modifiers
            }, false);
            var moveAutomation = new MoveAutomation(element, moveOptions);
            return moveAutomation
                .run()
                .then(function () { return delay$1(_this.automationSettings.mouseActionStepDelay); });
        };
        SelectChildClickAutomation.prototype._mousedown = function () {
            var _this = this;
            if (browserUtils$6.isFirefox) {
                eventSimulator$6.mousedown(this.eventsArgs.element, this.eventsArgs.options);
                if (this.clickCausesChange)
                    this.parentSelect.selectedIndex = this.childIndex;
                return this._focus();
            }
            if (browserUtils$6.isIE) {
                eventSimulator$6.mousedown(this.eventsArgs.element, this.eventsArgs.options);
                return this._focus();
            }
            // NOTE: In Chrome, document.activeElement is 'select' after mousedown. But we need to
            // raise blur and change the event for a previously active element during focus raising.
            // That's why we should change the event order and raise focus before mousedown.
            return this
                ._focus()
                .then(function () { return delay$1(FOCUS_DELAY); })
                .then(function () {
                eventSimulator$6.mousedown(_this.eventsArgs.element, _this.eventsArgs.options);
                if (_this.clickCausesChange)
                    _this.parentSelect.selectedIndex = _this.childIndex;
            });
        };
        SelectChildClickAutomation.prototype._focus = function () {
            var _this = this;
            return new Promise$6(function (resolve) {
                focusBlurSandbox$1.focus(_this.parentSelect, resolve, false, true);
            });
        };
        SelectChildClickAutomation.prototype._mouseup = function () {
            var elementForMouseupEvent = browserUtils$6.isIE ? this.parentSelect : this.eventsArgs.element;
            eventSimulator$6.mouseup(elementForMouseupEvent, this.eventsArgs.options);
            if (browserUtils$6.isIE && this.clickCausesChange)
                this.parentSelect.selectedIndex = this.childIndex;
            var simulateInputEventOnValueChange = browserUtils$6.isFirefox || browserUtils$6.isSafari ||
                browserUtils$6.isChrome && browserUtils$6.version >= 53;
            var simulateChangeEventOnValueChange = simulateInputEventOnValueChange || browserUtils$6.isIE;
            if (simulateInputEventOnValueChange && this.clickCausesChange)
                eventSimulator$6.input(this.parentSelect);
            if (simulateChangeEventOnValueChange && this.clickCausesChange)
                eventSimulator$6.change(this.parentSelect);
            return Promise$6.resolve();
        };
        SelectChildClickAutomation.prototype._click = function () {
            eventSimulator$6.click(this.eventsArgs.element, this.eventsArgs.options);
        };
        SelectChildClickAutomation.prototype.run = function () {
            var _this = this;
            if (!this.parentSelect) {
                eventSimulator$6.click(this.eventsArgs.element, this.eventsArgs.options);
                return Promise$6.resolve();
            }
            if (!this.optionListExpanded)
                selectElementUI$1.scrollOptionListByChild(this.element);
            var moveArguments = this._getMoveArguments();
            this.eventsArgs = this._calculateEventArguments();
            if (styleUtils$3.getSelectElementSize(this.parentSelect) <= 1) {
                return this
                    ._move(moveArguments)
                    .then(function () { return _this._click(); });
            }
            return this
                ._move(moveArguments)
                .then(function () { return _this._mousedown(); })
                .then(function () { return _this._mouseup(); })
                .then(function () { return _this._click(); });
        };
        return SelectChildClickAutomation;
    }());

    var featureDetection$3 = hammerhead__default.utils.featureDetection;
    var browserUtils$7 = hammerhead__default.utils.browser;
    var eventSimulator$7 = hammerhead__default.eventSandbox.eventSimulator;
    var eventUtils$2 = testCafeCore__default.eventUtils;
    var delay$2 = testCafeCore__default.delay;
    var FIRST_CLICK_DELAY = featureDetection$3.isTouchDevice ? 0 : 160;
    var DblClickAutomation = /** @class */ (function (_super) {
        __extends(DblClickAutomation, _super);
        function DblClickAutomation(element, clickOptions) {
            var _this = _super.call(this, element, clickOptions) || this;
            _this.modifiers = clickOptions.modifiers;
            _this.caretPos = clickOptions.caretPos;
            _this.speed = clickOptions.speed;
            _this.automationSettings = new AutomationSettings(_this.speed);
            _this.offsetX = clickOptions.offsetX;
            _this.offsetY = clickOptions.offsetY;
            _this.eventArgs = null;
            _this.eventState = {
                dblClickElement: null
            };
            return _this;
        }
        DblClickAutomation.prototype._firstClick = function (useStrictElementCheck) {
            var _this = this;
            // NOTE: we should always perform click with the highest speed
            var clickOptions = new ClickOptions(this.options);
            clickOptions.speed = 1;
            var clickAutomation = new ClickAutomation(this.element, clickOptions);
            clickAutomation.on(clickAutomation.TARGET_ELEMENT_FOUND_EVENT, function (e) { return _this.emit(_this.TARGET_ELEMENT_FOUND_EVENT, e); });
            return clickAutomation.run(useStrictElementCheck)
                .then(function (clickEventArgs) {
                return delay$2(FIRST_CLICK_DELAY).then(function () { return clickEventArgs; });
            });
        };
        DblClickAutomation.prototype._secondClick = function (eventArgs) {
            var _this = this;
            //NOTE: we should not call focus after the second mousedown (except in IE) because of the native browser behavior
            if (browserUtils$7.isIE)
                eventUtils$2.bind(document, 'focus', eventUtils$2.preventDefault, true);
            var clickOptions = new ClickOptions({
                offsetX: eventArgs.screenPoint.x,
                offsetY: eventArgs.screenPoint.y,
                caretPos: this.caretPos,
                modifiers: this.modifiers,
                speed: 1
            });
            var clickAutomation = new ClickAutomation(document.documentElement, clickOptions);
            return clickAutomation.run()
                .then(function (clickEventArgs) {
                // NOTE: We should raise the `dblclick` event on an element that
                // has been actually clicked during the second click automation.
                _this.eventState.dblClickElement = clickAutomation.eventState.clickElement;
                if (browserUtils$7.isIE)
                    eventUtils$2.unbind(document, 'focus', eventUtils$2.preventDefault, true);
                return clickEventArgs;
            });
        };
        DblClickAutomation.prototype._dblClick = function (eventArgs) {
            if (this.eventState.dblClickElement)
                eventSimulator$7.dblclick(this.eventState.dblClickElement, eventArgs.options);
        };
        DblClickAutomation.prototype.run = function (useStrictElementCheck) {
            var _this = this;
            // NOTE: If the target element is out of viewport the firstClick sub-automation raises an error
            return this
                ._firstClick(useStrictElementCheck)
                .then(function (eventArgs) { return _this._secondClick(eventArgs); })
                .then(function (eventArgs) { return _this._dblClick(eventArgs); });
        };
        return DblClickAutomation;
    }(VisibleElementAutomation));

    var MIN_MOVING_TIME = 25;
    var Promise$7 = hammerhead__default.Promise;
    var extend$3 = hammerhead__default.utils.extend;
    var featureDetection$4 = hammerhead__default.utils.featureDetection;
    var eventSimulator$8 = hammerhead__default.eventSandbox.eventSimulator;
    var focusBlurSandbox$2 = hammerhead__default.eventSandbox.focusBlur;
    var DragAutomationBase = /** @class */ (function (_super) {
        __extends(DragAutomationBase, _super);
        function DragAutomationBase(element, mouseOptions) {
            var _this = _super.call(this, element, mouseOptions) || this;
            _this.modifiers = mouseOptions.modifiers;
            _this.speed = mouseOptions.speed;
            _this.offsetX = mouseOptions.offsetX;
            _this.offsetY = mouseOptions.offsetY;
            _this.endPoint = null;
            _this.simulateDefaultBehavior = true;
            _this.downEvent = featureDetection$4.isTouchDevice ? 'touchstart' : 'mousedown';
            _this.upEvent = featureDetection$4.isTouchDevice ? 'touchend' : 'mouseup';
            _this.dragAndDropState = null;
            return _this;
        }
        DragAutomationBase.prototype._getEndPoint = function () {
            throw new Error('Not implemented');
        };
        DragAutomationBase.prototype._mousedown = function (eventArgs) {
            var _this = this;
            return cursor
                .leftButtonDown()
                .then(function () {
                _this.simulateDefaultBehavior = eventSimulator$8[_this.downEvent](eventArgs.element, eventArgs.options);
                return _this._focus(eventArgs);
            });
        };
        DragAutomationBase.prototype._focus = function (eventArgs) {
            var _this = this;
            return new Promise$7(function (resolve) {
                // NOTE: If the target element is a child of a contentEditable element, we need to call focus for its parent
                var elementForFocus = testCafeCore.domUtils.isContentEditableElement(_this.element) ?
                    testCafeCore.contentEditable.findContentEditableParent(_this.element) : eventArgs.element;
                focusBlurSandbox$2.focus(elementForFocus, resolve, false, true);
            });
        };
        DragAutomationBase.prototype._getDestination = function () {
            throw new Error('Not implemented');
        };
        DragAutomationBase.prototype._drag = function () {
            var _this = this;
            var _a = this._getDestination(), element = _a.element, offsets = _a.offsets, endPoint = _a.endPoint;
            this.endPoint = endPoint;
            var dragOptions = new MoveOptions({
                offsetX: offsets.offsetX,
                offsetY: offsets.offsetY,
                modifiers: this.modifiers,
                speed: this.speed,
                minMovingTime: MIN_MOVING_TIME,
                holdLeftButton: true,
                skipDefaultDragBehavior: this.simulateDefaultBehavior === false
            }, false);
            var moveAutomation = new MoveAutomation(element, dragOptions);
            return moveAutomation
                .run()
                .then(function (dragAndDropState) {
                _this.dragAndDropState = dragAndDropState;
                return testCafeCore.delay(_this.automationSettings.mouseActionStepDelay);
            });
        };
        DragAutomationBase.prototype._mouseup = function () {
            var _this = this;
            return cursor
                .buttonUp()
                .then(function () {
                var point = testCafeCore.positionUtils.offsetToClientCoords(_this.endPoint);
                var topElement = null;
                var options = extend$3({
                    clientX: point.x,
                    clientY: point.y
                }, _this.modifiers);
                return fromPoint(point.x, point.y)
                    .then(function (_a) {
                    var element = _a.element;
                    topElement = element;
                    if (!topElement)
                        return topElement;
                    if (_this.dragAndDropState.enabled) {
                        options.dataTransfer = _this.dragAndDropState.dataTransfer;
                        if (_this.dragAndDropState.dropAllowed)
                            eventSimulator$8.drop(topElement, options);
                        eventSimulator$8.dragend(_this.dragAndDropState.element, options);
                        _this.dragAndDropState.dataStore.setProtectedMode();
                    }
                    else
                        eventSimulator$8[_this.upEvent](topElement, options);
                    return fromPoint(point.x, point.y);
                })
                    .then(function (_a) {
                    var element = _a.element;
                    //B231323
                    if (topElement && element === topElement && !_this.dragAndDropState.enabled)
                        eventSimulator$8.click(topElement, options);
                });
            });
        };
        DragAutomationBase.prototype.run = function (useStrictElementCheck) {
            var _this = this;
            var eventArgs = null;
            return this
                ._ensureElement(useStrictElementCheck)
                .then(function (_a) {
                var element = _a.element, clientPoint = _a.clientPoint;
                eventArgs = {
                    point: clientPoint,
                    element: element,
                    options: extend$3({
                        clientX: clientPoint.x,
                        clientY: clientPoint.y
                    }, _this.modifiers)
                };
                // NOTE: we should raise start drag with 'mouseActionStepDelay' after we trigger
                // mousedown event regardless of how long mousedown event handlers were executing
                return Promise$7.all([testCafeCore.delay(_this.automationSettings.mouseActionStepDelay), _this._mousedown(eventArgs)]);
            })
                .then(function () { return _this._drag(); })
                .then(function () { return _this._mouseup(); });
        };
        return DragAutomationBase;
    }(VisibleElementAutomation));

    var styleUtils$4 = testCafeCore__default.styleUtils;
    var DragToOffsetAutomation = /** @class */ (function (_super) {
        __extends(DragToOffsetAutomation, _super);
        function DragToOffsetAutomation(element, offsetX, offsetY, mouseOptions) {
            var _this = _super.call(this, element, mouseOptions) || this;
            _this.dragOffsetX = offsetX;
            _this.dragOffsetY = offsetY;
            return _this;
        }
        DragToOffsetAutomation.prototype._getDestination = function () {
            var startPoint = getAutomationPoint(this.element, this.offsetX, this.offsetY);
            var maxX = styleUtils$4.getWidth(document);
            var maxY = styleUtils$4.getHeight(document);
            var endPoint = {
                x: startPoint.x + this.dragOffsetX,
                y: startPoint.y + this.dragOffsetY
            };
            endPoint = {
                x: Math.min(Math.max(0, endPoint.x), maxX),
                y: Math.min(Math.max(0, endPoint.y), maxY)
            };
            var element = document.documentElement;
            var offsets = {
                offsetX: endPoint.x,
                offsetY: endPoint.y
            };
            return { element: element, offsets: offsets, endPoint: endPoint };
        };
        return DragToOffsetAutomation;
    }(DragAutomationBase));

    var positionUtils$2 = testCafeCore__default.positionUtils;
    var DragToElementAutomation = /** @class */ (function (_super) {
        __extends(DragToElementAutomation, _super);
        function DragToElementAutomation(element, destinationElement, dragToElementOptions) {
            var _this = _super.call(this, element, dragToElementOptions) || this;
            _this.destinationElement = destinationElement;
            _this.destinationOffsetX = dragToElementOptions.destinationOffsetX;
            _this.destinationOffsetY = dragToElementOptions.destinationOffsetY;
            return _this;
        }
        DragToElementAutomation.prototype._getDestination = function () {
            var element = this.destinationElement;
            var elementRect = positionUtils$2.getElementRectangle(element);
            var offsets = getOffsetOptions(element, this.destinationOffsetX, this.destinationOffsetY);
            var endPoint = {
                x: elementRect.left + offsets.offsetX,
                y: elementRect.top + offsets.offsetY
            };
            return { element: element, offsets: offsets, endPoint: endPoint };
        };
        return DragToElementAutomation;
    }(DragAutomationBase));

    var HoverAutomation = /** @class */ (function (_super) {
        __extends(HoverAutomation, _super);
        function HoverAutomation(element, hoverOptions) {
            return _super.call(this, element, hoverOptions) || this;
        }
        HoverAutomation.prototype.run = function (useStrictElementCheck) {
            return this._ensureElement(useStrictElementCheck, true);
        };
        return HoverAutomation;
    }(VisibleElementAutomation));

    var browserUtils$8 = hammerhead__default.utils.browser;
    var eventSandbox = hammerhead__default.sandbox.event;
    var eventSimulator$9 = hammerhead__default.eventSandbox.eventSimulator;
    var listeners$2 = hammerhead__default.eventSandbox.listeners;
    var nativeMethods$6 = hammerhead__default.nativeMethods;
    var domUtils$7 = testCafeCore__default.domUtils;
    var contentEditable$1 = testCafeCore__default.contentEditable;
    var textSelection$1 = testCafeCore__default.textSelection;
    var WHITE_SPACES_RE = / /g;
    function _getSelectionInElement(element) {
        var currentSelection = textSelection$1.getSelectionByElement(element);
        var isInverseSelection = textSelection$1.hasInverseSelectionContentEditable(element);
        if (textSelection$1.hasElementContainsSelection(element))
            return contentEditable$1.getSelection(element, currentSelection, isInverseSelection);
        // NOTE: if we type text to an element that doesn't contain selection we
        // assume the selectionStart and selectionEnd positions are null in this
        // element. So we calculate the necessary start and end nodes and offsets
        return {
            startPos: contentEditable$1.calculateNodeAndOffsetByPosition(element, 0),
            endPos: contentEditable$1.calculateNodeAndOffsetByPosition(element, 0)
        };
    }
    function _updateSelectionAfterDeletionContent(element, selection) {
        var startNode = selection.startPos.node;
        var startParent = nativeMethods$6.nodeParentNodeGetter.call(startNode);
        var hasStartParent = startParent && startNode.parentElement;
        var browserRequiresSelectionUpdating = browserUtils$8.isChrome && browserUtils$8.version < 58 || browserUtils$8.isSafari;
        if (browserRequiresSelectionUpdating || !hasStartParent || !domUtils$7.isElementContainsNode(element, startNode)) {
            selection = _getSelectionInElement(element);
            if (textSelection$1.hasInverseSelectionContentEditable(element)) {
                selection = {
                    startPos: selection.endPos,
                    endPos: selection.startPos
                };
            }
        }
        selection.endPos.offset = selection.startPos.offset;
        return selection;
    }
    function _typeTextInElementNode(elementNode, text, offset) {
        var nodeForTyping = document.createTextNode(text);
        var textLength = text.length;
        var selectPosition = { node: nodeForTyping, offset: textLength };
        var parent = nativeMethods$6.nodeParentNodeGetter.call(elementNode);
        if (domUtils$7.getTagName(elementNode) === 'br')
            parent.insertBefore(nodeForTyping, elementNode);
        else if (offset > 0)
            elementNode.insertBefore(nodeForTyping, elementNode.childNodes[offset]);
        else
            elementNode.appendChild(nodeForTyping);
        textSelection$1.selectByNodesAndOffsets(selectPosition, selectPosition);
    }
    function _typeTextInChildTextNode(element, selection, text) {
        var startNode = selection.startPos.node;
        // NOTE: startNode could be moved or deleted on textInput event. Need ensure startNode.
        if (!domUtils$7.isElementContainsNode(element, startNode)) {
            selection = _excludeInvisibleSymbolsFromSelection(_getSelectionInElement(element));
            startNode = selection.startPos.node;
        }
        var startOffset = selection.startPos.offset;
        var endOffset = selection.endPos.offset;
        var nodeValue = startNode.nodeValue;
        var selectPosition = { node: startNode, offset: startOffset + text.length };
        startNode.nodeValue = nodeValue.substring(0, startOffset) + text +
            nodeValue.substring(endOffset, nodeValue.length);
        textSelection$1.selectByNodesAndOffsets(selectPosition, selectPosition);
    }
    function _excludeInvisibleSymbolsFromSelection(selection) {
        var startNode = selection.startPos.node;
        var startOffset = selection.startPos.offset;
        var endOffset = selection.endPos.offset;
        var firstNonWhitespaceSymbolIndex = contentEditable$1.getFirstNonWhitespaceSymbolIndex(startNode.nodeValue);
        var lastNonWhitespaceSymbolIndex = contentEditable$1.getLastNonWhitespaceSymbolIndex(startNode.nodeValue);
        if (startOffset < firstNonWhitespaceSymbolIndex && startOffset !== 0) {
            selection.startPos.offset = firstNonWhitespaceSymbolIndex;
            selection.endPos.offset = endOffset + firstNonWhitespaceSymbolIndex - startOffset;
        }
        else if (endOffset > lastNonWhitespaceSymbolIndex && endOffset !== startNode.nodeValue.length) {
            selection.startPos.offset = startNode.nodeValue.length;
            selection.endPos.offset = endOffset + startNode.nodeValue.length - startOffset;
        }
        return selection;
    }
    // NOTE: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/beforeinput_event
    // The `beforeInput` event is supported only in Chrome-based browsers and Safari
    // The order of events differs in Chrome and Safari:
    // In Chrome: `beforeinput` occurs before `textInput`
    // In Safari: `beforeinput` occurs after `textInput`
    function simulateBeforeInput(element, text, needSimulate) {
        if (needSimulate)
            return eventSimulator$9.beforeInput(element, text);
        return true;
    }
    // NOTE: Typing can be prevented in Chrome/Edge but can not be prevented in IE11 or Firefox
    // Firefox does not support TextInput event
    // Safari supports the TextInput event but has a bug: e.data is added to the node value.
    // So in Safari we need to call preventDefault in the last textInput handler but not prevent the Input event
    function simulateTextInput(element, text) {
        var forceInputInSafari;
        function onSafariTextInput(e) {
            e.preventDefault();
            forceInputInSafari = true;
        }
        function onSafariPreventTextInput(e) {
            if (e.type === 'textInput')
                forceInputInSafari = false;
        }
        if (browserUtils$8.isSafari) {
            listeners$2.addInternalEventListener(window, ['textInput'], onSafariTextInput);
            eventSandbox.on(eventSandbox.EVENT_PREVENTED_EVENT, onSafariPreventTextInput);
        }
        var isInputEventRequired = browserUtils$8.isFirefox || eventSimulator$9.textInput(element, text) || forceInputInSafari;
        if (browserUtils$8.isSafari) {
            listeners$2.removeInternalEventListener(window, ['textInput'], onSafariTextInput);
            eventSandbox.off(eventSandbox.EVENT_PREVENTED_EVENT, onSafariPreventTextInput);
        }
        return isInputEventRequired || browserUtils$8.isIE11;
    }
    function _typeTextToContentEditable(element, text) {
        var currentSelection = _getSelectionInElement(element);
        var startNode = currentSelection.startPos.node;
        var endNode = currentSelection.endPos.node;
        var needProcessInput = true;
        var needRaiseInputEvent = true;
        var textInputData = text;
        text = text.replace(WHITE_SPACES_RE, String.fromCharCode(160));
        // NOTE: some browsers raise the 'input' event after the element
        // content is changed, but in others we should do it manually.
        var onInput = function () {
            needRaiseInputEvent = false;
        };
        // NOTE: IE11 raises the 'textinput' event many times after the element changed.
        // The 'textinput' should be called only once
        function onTextInput(event, dispatched, preventEvent) {
            preventEvent();
        }
        // NOTE: IE11 does not raise input event when type to contenteditable
        var beforeContentChanged = function () {
            needProcessInput = simulateTextInput(element, textInputData);
            needRaiseInputEvent = needProcessInput && !browserUtils$8.isIE11;
            listeners$2.addInternalEventListener(window, ['input'], onInput);
            listeners$2.addInternalEventListener(window, ['textinput'], onTextInput);
        };
        var afterContentChanged = function () {
            nextTick()
                .then(function () {
                if (needRaiseInputEvent)
                    eventSimulator$9.input(element);
                listeners$2.removeInternalEventListener(window, ['input'], onInput);
                listeners$2.removeInternalEventListener(window, ['textinput'], onTextInput);
            });
        };
        if (!startNode || !endNode || !domUtils$7.isContentEditableElement(startNode) ||
            !domUtils$7.isContentEditableElement(endNode))
            return;
        if (!domUtils$7.isTheSameNode(startNode, endNode)) {
            textSelection$1.deleteSelectionContents(element);
            // NOTE: after deleting the selection contents we should refresh the stored startNode because
            // contentEditable element's content could change and we can no longer find parent elements
            // of the nodes. In MSEdge, 'parentElement' for the deleted element isn't undefined
            currentSelection = _updateSelectionAfterDeletionContent(element, currentSelection);
            startNode = currentSelection.startPos.node;
        }
        if (!startNode || !domUtils$7.isContentEditableElement(startNode) || !domUtils$7.isRenderedNode(startNode))
            return;
        if (!simulateBeforeInput(element, text, browserUtils$8.isChrome))
            return;
        beforeContentChanged();
        if (needProcessInput)
            needProcessInput = simulateBeforeInput(element, text, browserUtils$8.isSafari);
        if (needProcessInput) {
            // NOTE: we can type only to the text nodes; for nodes with the 'element-node' type, we use a special behavior
            if (domUtils$7.isElementNode(startNode))
                _typeTextInElementNode(startNode, text);
            else
                _typeTextInChildTextNode(element, _excludeInvisibleSymbolsFromSelection(currentSelection), text);
        }
        afterContentChanged();
    }
    function _typeTextToTextEditable(element, text) {
        var elementValue = domUtils$7.getElementValue(element);
        var textLength = text.length;
        var startSelection = textSelection$1.getSelectionStart(element);
        var endSelection = textSelection$1.getSelectionEnd(element);
        var isInputTypeNumber = domUtils$7.isInputElement(element) && element.type === 'number';
        if (!simulateBeforeInput(element, text, browserUtils$8.isChrome))
            return;
        var needProcessInput = simulateTextInput(element, text);
        if (needProcessInput)
            needProcessInput = simulateBeforeInput(element, text, browserUtils$8.isSafari);
        if (!needProcessInput)
            return;
        // NOTE: the 'maxlength' attribute doesn't work in all browsers. IE still doesn't support input with the 'number' type
        var elementMaxLength = !browserUtils$8.isIE && isInputTypeNumber ? null : parseInt(element.maxLength, 10);
        if (elementMaxLength < 0)
            elementMaxLength = browserUtils$8.isIE && browserUtils$8.version < 17 ? 0 : null;
        if (elementMaxLength === null || isNaN(elementMaxLength) || elementMaxLength > elementValue.length) {
            // NOTE: B254013
            if (isInputTypeNumber && browserUtils$8.isIOS && elementValue[elementValue.length - 1] === '.') {
                startSelection += 1;
                endSelection += 1;
            }
            domUtils$7.setElementValue(element, elementValue.substring(0, startSelection) + text +
                elementValue.substring(endSelection, elementValue.length));
            textSelection$1.select(element, startSelection + textLength, startSelection + textLength);
        }
        // NOTE: We should simulate the 'input' event after typing a char (B253410, T138385)
        eventSimulator$9.input(element);
    }
    function _typeTextToNonTextEditable(element, text, caretPos) {
        if (caretPos !== null) {
            var elementValue = domUtils$7.getElementValue(element);
            domUtils$7.setElementValue(element, elementValue.substr(0, caretPos) + text + elementValue.substr(caretPos + text.length));
        }
        else
            domUtils$7.setElementValue(element, text);
        eventSimulator$9.change(element);
        eventSimulator$9.input(element);
    }
    function typeText (element, text, caretPos) {
        if (domUtils$7.isContentEditableElement(element))
            _typeTextToContentEditable(element, text);
        if (!domUtils$7.isElementReadOnly(element)) {
            if (domUtils$7.isTextEditableElement(element))
                _typeTextToTextEditable(element, text);
            else if (domUtils$7.isInputElement(element))
                _typeTextToNonTextEditable(element, text, caretPos);
        }
    }

    function isLetterKey (key) {
        return key.length === 1 && (key >= 'a' && key <= 'z' || key >= 'A' && key <= 'Z');
    }

    var nativeMethods$7 = hammerhead__default.nativeMethods;
    var browserUtils$9 = hammerhead__default.utils.browser;
    var focusBlurSandbox$3 = hammerhead__default.eventSandbox.focusBlur;
    var Promise$8 = hammerhead__default.Promise;
    var findDocument = testCafeCore.domUtils.findDocument, isRadioButtonElement = testCafeCore.domUtils.isRadioButtonElement, getActiveElement = testCafeCore.domUtils.getActiveElement;
    function changeLetterCase(letter) {
        var isLowCase = letter === letter.toLowerCase();
        return isLowCase ? letter.toUpperCase() : letter.toLowerCase();
    }
    function getActualKeysAndEventKeyProperties(keyArray) {
        var eventKeyProperties = keyArray.slice();
        //NOTE: check 'shift' modifier in keys
        for (var i = 0; i < keyArray.length; i++) {
            var key = keyArray[i];
            if (key.toLowerCase() === 'shift') {
                var nextKey = keyArray[i + 1];
                if (!nextKey)
                    continue;
                if (testCafeCore.KEY_MAPS.shiftMap[nextKey])
                    keyArray[i + 1] = testCafeCore.KEY_MAPS.shiftMap[nextKey];
                else if (testCafeCore.KEY_MAPS.reversedShiftMap[nextKey])
                    eventKeyProperties[i + 1] = testCafeCore.KEY_MAPS.reversedShiftMap[nextKey];
            }
            if (testCafeCore.KEY_MAPS.shiftMap[key] && (!keyArray[i - 1] || keyArray[i - 1].toLowerCase() !== 'shift')) {
                keyArray[i] = testCafeCore.KEY_MAPS.shiftMap[key];
                keyArray.splice(i, 0, 'shift');
                eventKeyProperties.splice(i, 0, 'shift');
                i++;
            }
        }
        return { actualKeys: keyArray, eventKeyProperties: eventKeyProperties };
    }
    function getChar(key, shiftModified) {
        if (key === 'space')
            return ' ';
        if (shiftModified) {
            if (isLetterKey(key))
                return changeLetterCase(key);
            if (testCafeCore.KEY_MAPS.reversedShiftMap[key])
                return testCafeCore.KEY_MAPS.reversedShiftMap[key];
        }
        return key;
    }
    function getDeepActiveElement(currentDocument) {
        var doc = currentDocument || document;
        var activeElement = getActiveElement(doc);
        var activeElementInIframe = null;
        if (activeElement && testCafeCore.domUtils.isIframeElement(activeElement) &&
            nativeMethods$7.contentDocumentGetter.call(activeElement)) {
            try {
                activeElementInIframe = getDeepActiveElement(nativeMethods$7.contentDocumentGetter.call(activeElement));
            }
            catch (e) { // eslint-disable-line no-empty
            }
        }
        return activeElementInIframe || activeElement;
    }
    function focusNextElement(element, reverse, skipRadioGroups) {
        return new Promise$8(function (resolve) {
            var nextElement = getNextFocusableElement(element, reverse, skipRadioGroups);
            if (nextElement)
                focusBlurSandbox$3.focus(nextElement, function () { return resolve(nextElement); });
            else
                resolve();
        });
    }
    function getFocusableElementsFilter(sourceElement, skipRadioGroups) {
        var filter = null;
        if (skipRadioGroups) {
            // NOTE: in all browsers except Mozilla and Opera focus sets on one radio set from group only.
            // in Mozilla and Opera focus sets on any radio set.
            if (sourceElement.name !== '' && !browserUtils$9.isFirefox)
                filter = function (item) { return !item.name || item === sourceElement || item.name !== sourceElement.name; };
        }
        // NOTE arrow navigations works with radio buttons in all browsers only between radio buttons with same names
        // Navigation between radio buttons without name just moves focus between radio buttons in Chrome
        // In other browsers navigation between radio buttons without name does not work
        else if (sourceElement.name !== '')
            filter = function (item) { return isRadioButtonElement(item) && item.name === sourceElement.name; };
        else if (browserUtils$9.isChrome)
            filter = function (item) { return isRadioButtonElement(item) && !item.name; };
        return filter;
    }
    function filterFocusableElements(elements, sourceElement, skipRadioGroups) {
        if (!isRadioButtonElement(sourceElement))
            return elements;
        if (!skipRadioGroups && !sourceElement.name && !browserUtils$9.isChrome)
            return [sourceElement];
        var filterFn = getFocusableElementsFilter(sourceElement, skipRadioGroups);
        if (filterFn)
            elements = testCafeCore.arrayUtils.filter(elements, filterFn);
        return elements;
    }
    function correctFocusableElement(elements, element, skipRadioGroups) {
        var isNotCheckedRadioButtonElement = isRadioButtonElement(element) && element.name && !element.checked;
        var checkedRadioButtonElementWithSameName = null;
        if (skipRadioGroups && isNotCheckedRadioButtonElement) {
            checkedRadioButtonElementWithSameName = testCafeCore.arrayUtils.find(elements, function (el) {
                return isRadioButtonElement(el) && el.name === element.name && el.checked;
            });
        }
        return checkedRadioButtonElementWithSameName || element;
    }
    function getNextFocusableElement(element, reverse, skipRadioGroups) {
        var offset = reverse ? -1 : 1;
        var allFocusable = testCafeCore.domUtils.getFocusableElements(findDocument(element), true);
        allFocusable = filterFocusableElements(allFocusable, element, skipRadioGroups);
        var isRadioInput = isRadioButtonElement(element);
        var currentIndex = testCafeCore.arrayUtils.indexOf(allFocusable, element);
        var isLastElementFocused = reverse ? currentIndex === 0 : currentIndex === allFocusable.length - 1;
        if (isLastElementFocused)
            return skipRadioGroups || !isRadioInput ? document.body : allFocusable[allFocusable.length - 1 - currentIndex];
        if (reverse && currentIndex === -1)
            return allFocusable[allFocusable.length - 1];
        return correctFocusableElement(allFocusable, allFocusable[currentIndex + offset], skipRadioGroups);
    }

    function getKeyCode (char) {
        if (isLetterKey(char))
            return char.toUpperCase().charCodeAt(0);
        var res = testCafeCore.KEY_MAPS.shiftMap[char] ? testCafeCore.KEY_MAPS.shiftMap[char].charCodeAt(0) : char.charCodeAt(0);
        return testCafeCore.KEY_MAPS.symbolCharCodeToKeyCode[res] || res;
    }

    var KEY_IDENTIFIER_MAPS = {
        SPECIAL_KEYS: {
            capslock: 'CapsLock',
            delete: 'U+007F',
            end: 'End',
            enter: 'Enter',
            esc: 'U+001B',
            home: 'Home',
            ins: 'Insert',
            pagedown: 'PageDown',
            pageup: 'PageUp',
            space: 'U+0020',
            tab: 'Tab',
            alt: 'Alt',
            ctrl: 'Control',
            meta: 'Meta',
            shift: 'Shift'
        },
        LETTERS: {
            a: 'U+0041',
            b: 'U+0042',
            c: 'U+0043',
            d: 'U+0044',
            e: 'U+0045',
            f: 'U+0046',
            g: 'U+0047',
            h: 'U+0048',
            i: 'U+0049',
            j: 'U+004A',
            k: 'U+004B',
            l: 'U+004C',
            m: 'U+004D',
            n: 'U+004E',
            o: 'U+004F',
            p: 'U+0050',
            q: 'U+0051',
            r: 'U+0052',
            s: 'U+0053',
            t: 'U+0054',
            u: 'U+0055',
            v: 'U+0056',
            w: 'U+0057',
            x: 'U+0058',
            y: 'U+0059',
            z: 'U+005A'
        },
        SYMBOLS: {
            '0': 'U+0030',
            '1': 'U+0031',
            '2': 'U+0032',
            '3': 'U+0033',
            '4': 'U+0034',
            '5': 'U+0035',
            '6': 'U+0036',
            '7': 'U+0037',
            '8': 'U+0038',
            '9': 'U+0039',
            ' ': 'U+0020',
            '!': 'U+0021',
            '@': 'U+0040',
            '#': 'U+0023',
            '$': 'U+0024',
            '%': 'U+0025',
            '^': 'U+005E',
            '*': 'U+002A',
            '(': 'U+0028',
            ')': 'U+0029',
            '_': 'U+005F',
            '|': 'U+007C',
            '\\': 'U+005C',
            '/': 'U+002F',
            '?': 'U+003F',
            '.': 'U+002E',
            ',': 'U+002C',
            '<': 'U+003C',
            '>': 'U+003E',
            '[': 'U+005B',
            ']': 'U+005D',
            '{': 'U+007B',
            '}': 'U+007D',
            '§': 'U+00A7',
            '±': 'U+00B1',
            '\'': 'U+0027',
            '"': 'U+0022',
            ':': 'U+003A',
            ';': 'U+003B',
            '`': 'U+0060',
            '~': 'U+007E'
        }
    };

    function getKeyIdentifier(char) {
        if (isLetterKey(char))
            return KEY_IDENTIFIER_MAPS.LETTERS[char.toLowerCase()];
        return KEY_IDENTIFIER_MAPS.SYMBOLS[char] || KEY_IDENTIFIER_MAPS.SPECIAL_KEYS[char] || char;
    }

    function getKeyProperties(isKeyPressEvent, key, keyIdentifier) {
        var properties = {};
        if ('keyIdentifier' in KeyboardEvent.prototype)
            properties.keyIdentifier = isKeyPressEvent ? '' : keyIdentifier;
        if ('key' in KeyboardEvent.prototype)
            properties.key = key;
        return properties;
    }

    var browserUtils$a = hammerhead__default.utils.browser;
    var extend$4 = hammerhead__default.utils.extend;
    var eventSimulator$a = hammerhead__default.eventSandbox.eventSimulator;
    var KeyPressSimulator = /** @class */ (function () {
        function KeyPressSimulator(key, eventKeyProperty) {
            this.isLetter = isLetterKey(key);
            this.isChar = key.length === 1 || key === 'space';
            this.sanitizedKey = testCafeCore.getSanitizedKey(key);
            this.modifierKeyCode = testCafeCore.KEY_MAPS.modifiers[this.sanitizedKey];
            this.specialKeyCode = testCafeCore.KEY_MAPS.specialKeys[this.sanitizedKey];
            this.keyCode = null;
            this.keyIdentifierProperty = getKeyIdentifier(eventKeyProperty);
            this.topSameDomainDocument = testCafeCore.domUtils.getTopSameDomainWindow(window).document;
            this.keyProperty = testCafeCore.KEY_MAPS.keyProperty[eventKeyProperty] || eventKeyProperty;
            if (this.isChar && key !== 'space')
                this.keyCode = getKeyCode(this.sanitizedKey);
            else if (this.modifierKeyCode)
                this.keyCode = this.modifierKeyCode;
            else if (this.specialKeyCode)
                this.keyCode = this.specialKeyCode;
            this.storedActiveElement = null;
        }
        KeyPressSimulator._isKeyActivatedInputElement = function (el) {
            return testCafeCore.domUtils.isInputElement(el) && /button|submit|reset|radio|checkbox/.test(el.type);
        };
        KeyPressSimulator.prototype._type = function (element, char) {
            var elementChanged = element !== this.storedActiveElement;
            var shouldType = !elementChanged;
            var elementForTyping = element;
            var isActiveElementEditable = testCafeCore.domUtils.isEditableElement(element);
            var isStoredElementEditable = testCafeCore.domUtils.isEditableElement(this.storedActiveElement);
            // Unnecessary typing happens if an element was changed after the keydown/keypress event (T210448)
            // In IE, this error may occur when we try to determine if the removed element is in an iframe
            try {
                if (elementChanged) {
                    var isActiveElementInIframe = testCafeCore.domUtils.isElementInIframe(element);
                    var isStoredElementInIframe = testCafeCore.domUtils.isElementInIframe(this.storedActiveElement);
                    var shouldTypeInWebKit = isActiveElementInIframe === isStoredElementInIframe || isStoredElementEditable;
                    shouldType = (!browserUtils$a.isFirefox || isStoredElementEditable) &&
                        (!browserUtils$a.isWebKit || shouldTypeInWebKit);
                }
            }
            /*eslint-disable no-empty */
            catch (err) {
            }
            /*eslint-disable no-empty */
            if (shouldType) {
                if (!browserUtils$a.isIE && elementChanged && isStoredElementEditable && isActiveElementEditable)
                    elementForTyping = this.storedActiveElement;
                typeText(elementForTyping, char);
            }
        };
        KeyPressSimulator.prototype._addKeyPropertyToEventOptions = function (eventOptions) {
            extend$4(eventOptions, getKeyProperties(eventOptions.type === 'keypress', this.keyProperty, this.keyIdentifierProperty));
            return eventOptions;
        };
        KeyPressSimulator.prototype.down = function (modifiersState) {
            this.storedActiveElement = getDeepActiveElement(this.topSameDomainDocument);
            if (this.modifierKeyCode)
                modifiersState[this.sanitizedKey] = true;
            if (modifiersState.shift && this.isLetter)
                this.keyProperty = changeLetterCase(this.keyProperty);
            var eventOptions = { keyCode: this.keyCode, type: 'keydown' };
            this._addKeyPropertyToEventOptions(eventOptions);
            return eventSimulator$a.keydown(this.storedActiveElement, extend$4(eventOptions, modifiersState));
        };
        KeyPressSimulator.prototype.press = function (modifiersState) {
            if (!(this.isChar || this.specialKeyCode))
                return true;
            var activeElement = getDeepActiveElement(this.topSameDomainDocument);
            var character = this.isChar ? getChar(this.sanitizedKey, modifiersState.shift) : null;
            var charCode = this.specialKeyCode || character.charCodeAt(0);
            var elementChanged = activeElement !== this.storedActiveElement;
            if (browserUtils$a.isWebKit && elementChanged) {
                var isActiveElementInIframe = testCafeCore.domUtils.isElementInIframe(activeElement);
                var isStoredElementInIframe = testCafeCore.domUtils.isElementInIframe(this.storedActiveElement);
                if (isActiveElementInIframe !== isStoredElementInIframe)
                    return true;
            }
            this.storedActiveElement = activeElement;
            var eventOptions = { keyCode: charCode, charCode: charCode, type: 'keypress' };
            this._addKeyPropertyToEventOptions(eventOptions);
            var raiseDefault = browserUtils$a.isAndroid || eventSimulator$a.keypress(activeElement, extend$4(eventOptions, modifiersState));
            if (!raiseDefault)
                return raiseDefault;
            activeElement = getDeepActiveElement(this.topSameDomainDocument);
            if (character && !(modifiersState.ctrl || modifiersState.alt))
                this._type(activeElement, character);
            var isKeyActivatedInput = KeyPressSimulator._isKeyActivatedInputElement(activeElement);
            var isButton = testCafeCore.domUtils.isButtonElement(activeElement);
            var isSafariWithAutoRaisedClick = browserUtils$a.isSafari &&
                browserUtils$a.compareVersions([browserUtils$a.webkitVersion, '603.1.30']) >= 0;
            var raiseClickOnEnter = !browserUtils$a.isFirefox && !isSafariWithAutoRaisedClick
                && (isKeyActivatedInput || isButton);
            if (raiseClickOnEnter && this.sanitizedKey === 'enter')
                activeElement.click();
            return raiseDefault;
        };
        KeyPressSimulator.prototype.up = function (modifiersState) {
            if (this.modifierKeyCode)
                modifiersState[this.sanitizedKey] = false;
            var eventOptions = { keyCode: this.keyCode, type: 'keyup' };
            this._addKeyPropertyToEventOptions(eventOptions);
            var raiseDefault = eventSimulator$a.keyup(getDeepActiveElement(this.topSameDomainDocument), extend$4(eventOptions, modifiersState));
            var activeElement = getDeepActiveElement(this.topSameDomainDocument);
            // NOTE: in some browsers we should emulate click on active input element while pressing "space" key
            var emulateClick = !browserUtils$a.isFirefox && !browserUtils$a.isSafari &&
                (!browserUtils$a.isChrome || browserUtils$a.version >= 53);
            if (emulateClick && raiseDefault && this.sanitizedKey === 'space' &&
                KeyPressSimulator._isKeyActivatedInputElement(activeElement))
                activeElement.click();
            return raiseDefault;
        };
        Object.defineProperty(KeyPressSimulator.prototype, "key", {
            get: function () {
                return this.sanitizedKey;
            },
            enumerable: true,
            configurable: true
        });
        return KeyPressSimulator;
    }());

    var Promise$9 = hammerhead__default.Promise;
    var browserUtils$b = hammerhead__default.utils.browser;
    var eventSimulator$b = hammerhead__default.eventSandbox.eventSimulator;
    var elementEditingWatcher = hammerhead__default.eventSandbox.elementEditingWatcher;
    var textSelection$2 = testCafeCore__default.textSelection;
    var eventUtils$3 = testCafeCore__default.eventUtils;
    var domUtils$8 = testCafeCore__default.domUtils;
    var selectElement = testCafeUI.selectElement;
    var currentTextarea = null;
    var currentTextareaCursorIndent = null;
    function onTextAreaBlur() {
        currentTextarea = null;
        currentTextareaCursorIndent = null;
        eventUtils$3.unbind(this, 'blur', onTextAreaBlur, true);
    }
    function updateTextAreaIndent(element) {
        if (domUtils$8.isTextAreaElement(element)) {
            if (currentTextarea !== element) {
                eventUtils$3.bind(element, 'blur', onTextAreaBlur, true);
                currentTextarea = element;
            }
            currentTextareaCursorIndent = getLineIndentInTextarea(element);
        }
    }
    function getLineIndentInTextarea(textarea) {
        var inverseSelection = textSelection$2.hasInverseSelection(textarea);
        var textareaValue = domUtils$8.getTextAreaValue(textarea);
        var cursorPosition = inverseSelection ?
            textSelection$2.getSelectionStart(textarea) :
            textSelection$2.getSelectionEnd(textarea);
        if (!textareaValue || !cursorPosition)
            return 0;
        return domUtils$8.getTextareaIndentInLine(textarea, cursorPosition);
    }
    function moveTextAreaCursorUp(element, withSelection) {
        var textareaValue = domUtils$8.getTextAreaValue(element);
        if (!textareaValue)
            return;
        var startPos = textSelection$2.getSelectionStart(element);
        var endPos = textSelection$2.getSelectionEnd(element);
        var hasInverseSelection = textSelection$2.hasInverseSelection(element);
        var partBeforeCursor = textareaValue.substring(0, hasInverseSelection ? startPos : endPos);
        var lastLineBreakIndex = partBeforeCursor.lastIndexOf('\n');
        var partBeforeLastLineBreak = partBeforeCursor.substring(0, lastLineBreakIndex);
        if (currentTextareaCursorIndent === null || currentTextarea !== element)
            updateTextAreaIndent(element);
        lastLineBreakIndex = partBeforeLastLineBreak.lastIndexOf('\n');
        var newPosition = Math.min(lastLineBreakIndex + 1 + currentTextareaCursorIndent, partBeforeLastLineBreak.length);
        moveTextAreaCursor(element, startPos, endPos, hasInverseSelection, newPosition, withSelection);
    }
    function moveTextAreaCursorDown(element, withSelection) {
        var textareaValue = domUtils$8.getTextAreaValue(element);
        if (!textareaValue)
            return;
        var startPos = textSelection$2.getSelectionStart(element);
        var endPos = textSelection$2.getSelectionEnd(element);
        var hasInverseSelection = textSelection$2.hasInverseSelection(element);
        var cursorPosition = hasInverseSelection ? startPos : endPos;
        var partAfterCursor = textareaValue.substring(cursorPosition);
        var firstLineBreakIndex = partAfterCursor.indexOf('\n');
        var nextLineStartIndex = firstLineBreakIndex === -1 ? partAfterCursor.length : firstLineBreakIndex + 1;
        var partAfterNewIndent = partAfterCursor.substring(nextLineStartIndex);
        var newPosition = cursorPosition + nextLineStartIndex;
        firstLineBreakIndex = partAfterNewIndent.indexOf('\n');
        var maxIndent = firstLineBreakIndex === -1 ? partAfterNewIndent.length : firstLineBreakIndex;
        if (currentTextareaCursorIndent === null || currentTextarea !== element)
            updateTextAreaIndent(element);
        newPosition = Math.min(newPosition + currentTextareaCursorIndent, newPosition + maxIndent);
        moveTextAreaCursor(element, startPos, endPos, hasInverseSelection, newPosition, withSelection);
    }
    function moveTextAreaCursor(element, startPos, endPos, hasInverseSelection, newPosition, withSelection) {
        var newStart = null;
        var newEnd = null;
        if (withSelection) {
            if (startPos === endPos) {
                newStart = startPos;
                newEnd = newPosition;
            }
            else if (!hasInverseSelection) {
                newStart = startPos;
                newEnd = newPosition;
            }
            else {
                newStart = endPos;
                newEnd = newPosition;
            }
        }
        else
            newEnd = newStart = newPosition;
        textSelection$2.select(element, newStart, newEnd);
    }
    function setElementValue(element, value, position) {
        if (domUtils$8.isInputElement(element) && element.type === 'number') {
            if (value.charAt(0) === '-' && value.charAt(1) === '.')
                value = value.substring(1);
            if (value.charAt(value.length - 1) === '.')
                value = value.substring(0, value.length - 1);
        }
        domUtils$8.setElementValue(element, value);
        textSelection$2.select(element, position, position);
        eventSimulator$b.input(element);
    }
    function submitFormOnEnterPressInInput(form, inputElement) {
        var buttons = form.querySelectorAll('input, button');
        var submitButton = null;
        var i = null;
        for (i = 0; i < buttons.length; i++) {
            if (!submitButton && buttons[i].type === 'submit' && !buttons[i].disabled) {
                submitButton = buttons[i];
                break;
            }
        }
        if (submitButton)
            eventSimulator$b.click(submitButton);
        else if (domUtils$8.blocksImplicitSubmission(inputElement)) {
            var formInputs = form.getElementsByTagName('input');
            var textInputs = [];
            for (i = 0; i < formInputs.length; i++) {
                if (domUtils$8.blocksImplicitSubmission(formInputs[i]))
                    textInputs.push(formInputs[i]);
            }
            // NOTE: the form is submitted on enter press if there is only one input of the following types on it
            //  and this input is focused (http://www.w3.org/TR/html5/forms.html#implicit-submission)
            if (textInputs.length === 1 && textInputs[0] === inputElement) {
                var isInputValid = inputElement.validity.valid;
                if (isInputValid && eventSimulator$b.submit(form))
                    form.submit();
            }
        }
    }
    //shortcuts
    function selectAll(element) {
        if (domUtils$8.isEditableElement(element))
            textSelection$2.select(element);
        return Promise$9.resolve();
    }
    function backspace(element) {
        if (domUtils$8.isTextEditableElementAndEditingAllowed(element)) {
            var startPos = textSelection$2.getSelectionStart(element);
            var endPos = textSelection$2.getSelectionEnd(element);
            var value = domUtils$8.getElementValue(element).replace(/\r\n/g, '\n');
            if (endPos === startPos) {
                if (startPos > 0) {
                    setElementValue(element, value.substring(0, startPos - 1) +
                        value.substring(endPos, value.length), startPos - 1);
                }
            }
            else
                setElementValue(element, value.substring(0, startPos) + value.substring(endPos, value.length), startPos);
        }
        if (domUtils$8.isContentEditableElement(element))
            textSelection$2.deleteSelectionContents(element);
        return Promise$9.resolve();
    }
    function del(element) {
        if (domUtils$8.isTextEditableElementAndEditingAllowed(element)) {
            var startPos = textSelection$2.getSelectionStart(element);
            var endPos = textSelection$2.getSelectionEnd(element);
            var value = domUtils$8.getElementValue(element).replace(/\r\n/g, '\n');
            if (endPos === startPos) {
                if (startPos < value.length) {
                    setElementValue(element, value.substring(0, startPos) +
                        value.substring(endPos + 1, value.length), startPos);
                }
            }
            else {
                setElementValue(element, value.substring(0, startPos) +
                    value.substring(endPos, value.length), startPos);
            }
        }
        if (domUtils$8.isContentEditableElement(element))
            textSelection$2.deleteSelectionContents(element);
        return Promise$9.resolve();
    }
    function left(element) {
        var startPosition = null;
        var endPosition = null;
        if (domUtils$8.isSelectElement(element))
            selectElement.switchOptionsByKeys(element, 'left');
        if (isRadioButtonNavigationRequired(element))
            return focusAndCheckNextRadioButton(element, true);
        if (domUtils$8.isTextEditableElement(element)) {
            startPosition = textSelection$2.getSelectionStart(element) || 0;
            endPosition = textSelection$2.getSelectionEnd(element);
            var newPosition = startPosition === endPosition ? startPosition - 1 : startPosition;
            textSelection$2.select(element, newPosition, newPosition);
            updateTextAreaIndent(element);
        }
        if (domUtils$8.isContentEditableElement(element)) {
            startPosition = textSelection$2.getSelectionStart(element);
            endPosition = textSelection$2.getSelectionEnd(element);
            // NOTE: we only remove selection
            if (startPosition !== endPosition) {
                var selection = textSelection$2.getSelectionByElement(element);
                var inverseSelection = textSelection$2.hasInverseSelectionContentEditable(element);
                var startNode = inverseSelection ? selection.focusNode : selection.anchorNode;
                var startOffset = inverseSelection ? selection.focusOffset : selection.anchorOffset;
                var startPos = { node: startNode, offset: startOffset };
                textSelection$2.selectByNodesAndOffsets(startPos, startPos, true);
            }
        }
        return Promise$9.resolve();
    }
    function right(element) {
        var startPosition = null;
        var endPosition = null;
        if (domUtils$8.isSelectElement(element))
            selectElement.switchOptionsByKeys(element, 'right');
        if (isRadioButtonNavigationRequired(element))
            return focusAndCheckNextRadioButton(element, false);
        if (domUtils$8.isTextEditableElement(element)) {
            startPosition = textSelection$2.getSelectionStart(element);
            endPosition = textSelection$2.getSelectionEnd(element);
            var newPosition = startPosition === endPosition ? endPosition + 1 : endPosition;
            if (startPosition === domUtils$8.getElementValue(element).length)
                newPosition = startPosition;
            textSelection$2.select(element, newPosition, newPosition);
            updateTextAreaIndent(element);
        }
        if (domUtils$8.isContentEditableElement(element)) {
            startPosition = textSelection$2.getSelectionStart(element);
            endPosition = textSelection$2.getSelectionEnd(element);
            //NOTE: we only remove selection
            if (startPosition !== endPosition) {
                var selection = textSelection$2.getSelectionByElement(element);
                var inverseSelection = textSelection$2.hasInverseSelectionContentEditable(element);
                var endNode = inverseSelection ? selection.anchorNode : selection.focusNode;
                var endOffset = inverseSelection ? selection.anchorOffset : selection.focusOffset;
                var startPos = { node: endNode, offset: endOffset };
                textSelection$2.selectByNodesAndOffsets(startPos, startPos, true);
            }
        }
        return Promise$9.resolve();
    }
    function up(element) {
        if (domUtils$8.isSelectElement(element))
            selectElement.switchOptionsByKeys(element, 'up');
        if (isRadioButtonNavigationRequired(element))
            return focusAndCheckNextRadioButton(element, true);
        if (browserUtils$b.isWebKit && domUtils$8.isInputElement(element))
            return home(element);
        if (domUtils$8.isTextAreaElement(element))
            moveTextAreaCursorUp(element, false);
        return Promise$9.resolve();
    }
    function down(element) {
        if (domUtils$8.isSelectElement(element))
            selectElement.switchOptionsByKeys(element, 'down');
        if (isRadioButtonNavigationRequired(element))
            return focusAndCheckNextRadioButton(element, false);
        if (browserUtils$b.isWebKit && domUtils$8.isInputElement(element))
            return end(element);
        if (domUtils$8.isTextAreaElement(element))
            moveTextAreaCursorDown(element, false);
        return Promise$9.resolve();
    }
    function home(element, withSelection) {
        if (domUtils$8.isTextEditableElement(element)) {
            var startPos = textSelection$2.getSelectionStart(element);
            var endPos = textSelection$2.getSelectionEnd(element);
            var inverseSelection = textSelection$2.hasInverseSelection(element);
            var referencePosition = null;
            var isSingleLineSelection = !domUtils$8.isTextAreaElement(element) ? true :
                domUtils$8.getTextareaLineNumberByPosition(element, startPos) ===
                    domUtils$8.getTextareaLineNumberByPosition(element, endPos);
            if (isSingleLineSelection)
                referencePosition = inverseSelection ? endPos : startPos;
            else
                referencePosition = inverseSelection ? startPos : endPos;
            var valueBeforeCursor = domUtils$8.getElementValue(element).substring(0, referencePosition);
            var lastLineBreakIndex = valueBeforeCursor.lastIndexOf('\n');
            var newPosition = lastLineBreakIndex === -1 ? 0 : lastLineBreakIndex + 1;
            var newStartPos = null;
            var newEndPos = null;
            if (isSingleLineSelection) {
                newStartPos = newPosition;
                newEndPos = withSelection ? referencePosition : newPosition;
                textSelection$2.select(element, newEndPos, newStartPos);
            }
            else if (!inverseSelection)
                textSelection$2.select(element, startPos, newPosition);
            else
                textSelection$2.select(element, endPos, newPosition);
        }
        return Promise$9.resolve();
    }
    function end(element, withSelection) {
        if (domUtils$8.isTextEditableElement(element)) {
            var startPos = textSelection$2.getSelectionStart(element);
            var endPos = textSelection$2.getSelectionEnd(element);
            var inverseSelection = textSelection$2.hasInverseSelection(element);
            var referencePosition = null;
            var isSingleLineSelection = !domUtils$8.isTextAreaElement(element) ? true :
                domUtils$8.getTextareaLineNumberByPosition(element, startPos) ===
                    domUtils$8.getTextareaLineNumberByPosition(element, endPos);
            if (isSingleLineSelection)
                referencePosition = inverseSelection ? endPos : startPos;
            else
                referencePosition = inverseSelection ? startPos : endPos;
            var valueAsterCursor = domUtils$8.getElementValue(element).substring(referencePosition);
            var firstLineBreakIndex = valueAsterCursor.indexOf('\n');
            var newPosition = referencePosition;
            var newStartPos = null;
            var newEndPos = null;
            newPosition += firstLineBreakIndex === -1 ? valueAsterCursor.length : firstLineBreakIndex;
            if (isSingleLineSelection) {
                newStartPos = withSelection ? referencePosition : newPosition;
                newEndPos = newPosition;
                textSelection$2.select(element, newStartPos, newEndPos);
            }
            else if (!inverseSelection)
                textSelection$2.select(element, startPos, newPosition);
            else
                textSelection$2.select(element, endPos, newPosition);
        }
        return Promise$9.resolve();
    }
    function esc(element) {
        if (domUtils$8.isSelectElement(element))
            selectElement.collapseOptionList();
        return Promise$9.resolve();
    }
    function shiftUp(element) {
        if (browserUtils$b.isWebKit && domUtils$8.isInputElement(element))
            return shiftHome(element);
        if (domUtils$8.isTextAreaElement(element))
            moveTextAreaCursorUp(element, true);
        return Promise$9.resolve();
    }
    function shiftDown(element) {
        if (browserUtils$b.isWebKit && domUtils$8.isInputElement(element))
            return shiftEnd(element);
        if (domUtils$8.isTextAreaElement(element))
            moveTextAreaCursorDown(element, true);
        return Promise$9.resolve();
    }
    function shiftLeft(element) {
        if (domUtils$8.isTextEditableElement(element)) {
            var startPos = textSelection$2.getSelectionStart(element);
            var endPos = textSelection$2.getSelectionEnd(element);
            if (startPos === endPos || textSelection$2.hasInverseSelection(element))
                textSelection$2.select(element, endPos, Math.max(startPos - 1, 0));
            else
                textSelection$2.select(element, startPos, Math.max(endPos - 1, 0));
            updateTextAreaIndent(element);
        }
        return Promise$9.resolve();
    }
    function shiftRight(element) {
        if (domUtils$8.isTextEditableElement(element)) {
            var startPos = textSelection$2.getSelectionStart(element);
            var endPos = textSelection$2.getSelectionEnd(element);
            var valueLength = domUtils$8.getElementValue(element).length;
            if (startPos === endPos || !textSelection$2.hasInverseSelection(element))
                textSelection$2.select(element, startPos, Math.min(endPos + 1, valueLength));
            else
                textSelection$2.select(element, endPos, Math.min(startPos + 1, valueLength));
            updateTextAreaIndent(element);
        }
        return Promise$9.resolve();
    }
    function shiftHome(element) {
        return home(element, true);
    }
    function shiftEnd(element) {
        return end(element, true);
    }
    function enter(element) {
        if (domUtils$8.isSelectElement(element))
            selectElement.collapseOptionList();
        //submit form on enter pressed
        if (domUtils$8.isInputElement(element)) {
            if (!browserUtils$b.isIE)
                elementEditingWatcher.processElementChanging(element);
            var form = domUtils$8.getParents(element, 'form')[0];
            // NOTE: if a user presses enter when a form input is focused and the form has
            // a submit button, the browser sends the click event to the submit button
            if (form)
                submitFormOnEnterPressInInput(form, element);
        }
        else if (domUtils$8.isTextAreaElement(element)) {
            var startPos = textSelection$2.getSelectionStart(element);
            var value = domUtils$8.getTextAreaValue(element);
            var valueBeforeCursor = value.substring(0, startPos);
            var valueAfterCursor = value.substring(startPos);
            var newPosition = startPos + 1;
            setElementValue(element, valueBeforeCursor + String.fromCharCode(10) + valueAfterCursor, newPosition);
        }
        //S173120
        else if (element.tagName && domUtils$8.isAnchorElement(element))
            eventSimulator$b.click(element);
        return Promise$9.resolve();
    }
    function isRadioButtonNavigationRequired(element) {
        return domUtils$8.isRadioButtonElement(element) && !browserUtils$b.isFirefox;
    }
    function focusAndCheckNextRadioButton(element, reverse) {
        return focusNextElementOnNavigationButton(element, reverse, false)
            .then(function (focusedElement) {
            if (focusedElement)
                focusedElement.checked = true;
        });
    }
    function focusNextElementOnNavigationButton(element, reverse, skipRadioGroups) {
        if (skipRadioGroups === void 0) { skipRadioGroups = true; }
        if (!element)
            return Promise$9.resolve();
        if (domUtils$8.isSelectElement(element))
            selectElement.collapseOptionList();
        return focusNextElement(element, reverse, skipRadioGroups)
            .then(function (nextElement) {
            if (nextElement && domUtils$8.isTextEditableInput(nextElement))
                textSelection$2.select(nextElement);
            return nextElement;
        });
    }
    var supportedShortcutHandlers = {
        'ctrl+a': selectAll,
        'backspace': backspace,
        'delete': del,
        'left': left,
        'right': right,
        'up': up,
        'down': down,
        'shift+left': shiftLeft,
        'shift+right': shiftRight,
        'shift+up': shiftUp,
        'shift+down': shiftDown,
        'shift+home': shiftHome,
        'shift+end': shiftEnd,
        'home': home,
        'end': end,
        'enter': enter,
        'tab': function (element) { return focusNextElementOnNavigationButton(element, false); },
        'shift+tab': function (element) { return focusNextElementOnNavigationButton(element, true); },
        'esc': esc
    };

    var Promise$a = hammerhead__default.Promise;
    var browserUtils$c = hammerhead__default.utils.browser;
    var messageSandbox$2 = hammerhead__default.eventSandbox.message;
    var nativeMethods$8 = hammerhead__default.nativeMethods;
    var PRESS_REQUEST_CMD = 'automation|press|request';
    var PRESS_RESPONSE_CMD = 'automation|press|response';
    // Setup cross-iframe interaction
    messageSandbox$2.on(messageSandbox$2.SERVICE_MSG_RECEIVED_EVENT, function (e) {
        if (e.message.cmd === PRESS_REQUEST_CMD) {
            hammerhead__default.on(hammerhead__default.EVENTS.beforeUnload, function () { return messageSandbox$2.sendServiceMsg({ cmd: PRESS_RESPONSE_CMD }, e.source); });
            var pressAutomation = new PressAutomation(e.message.keyCombinations, e.message.options);
            pressAutomation
                .run()
                .then(function () { return messageSandbox$2.sendServiceMsg({ cmd: PRESS_RESPONSE_CMD }, e.source); });
        }
    });
    var PressAutomation = /** @class */ (function () {
        function PressAutomation(keyCombinations, options) {
            this.keyCombinations = keyCombinations;
            this.isSelectElement = false;
            this.pressedKeyString = '';
            this.modifiersState = null;
            this.shortcutHandlers = null;
            this.topSameDomainDocument = testCafeCore.domUtils.getTopSameDomainWindow(window).document;
            this.automationSettings = new AutomationSettings(options.speed);
            this.options = options;
        }
        PressAutomation._getKeyPressSimulators = function (keyCombination) {
            var keysArray = testCafeCore.getKeyArray(keyCombination);
            // NOTE: symbols may have the same keyCode, but their "event.key" will be different, so we
            // need to get the "event.key" property for each key, and add the 'shift' key where needed.
            var _a = getActualKeysAndEventKeyProperties(keysArray), actualKeys = _a.actualKeys, eventKeyProperties = _a.eventKeyProperties;
            return testCafeCore.arrayUtils.map(actualKeys, function (key, index) { return new KeyPressSimulator(key, eventKeyProperties[index]); });
        };
        PressAutomation._getShortcuts = function (keyCombination) {
            var keys = testCafeCore.getKeyArray(keyCombination.toLowerCase());
            var shortcuts = [];
            var curFullCombination = [];
            var curCombination = [];
            for (var i = 0; i < keys.length; i++) {
                curFullCombination.push(keys[i]);
                curCombination = curFullCombination.slice();
                while (curCombination.length) {
                    var keyString = curCombination.join('+');
                    if (supportedShortcutHandlers[keyString]) {
                        shortcuts.push(keyString);
                        curFullCombination = curCombination = [];
                    }
                    else
                        curCombination.shift();
                }
            }
            return shortcuts;
        };
        PressAutomation._getShortcutHandlers = function (keyCombination) {
            var shortcuts = PressAutomation._getShortcuts(keyCombination.toLowerCase());
            var shortcutHandlers = {};
            var stringWithShortcut = '';
            var shortcut = null;
            var shortcutPosition = null;
            var shortcutLength = null;
            for (var i = 0; i < shortcuts.length; i++) {
                shortcut = shortcuts[i];
                shortcutPosition = keyCombination.indexOf(shortcut);
                shortcutLength = shortcut.length;
                stringWithShortcut += keyCombination.substring(0, shortcutPosition + shortcutLength);
                shortcutHandlers[stringWithShortcut] = supportedShortcutHandlers[shortcut];
                keyCombination = keyCombination.substring(shortcutPosition + shortcutLength);
            }
            return shortcutHandlers;
        };
        PressAutomation.prototype._down = function (keyPressSimulator) {
            this.pressedKeyString += (this.pressedKeyString ? '+' : '') + keyPressSimulator.key;
            var keyDownPrevented = !keyPressSimulator.down(this.modifiersState);
            return Promise$a.resolve(keyDownPrevented);
        };
        PressAutomation.prototype._press = function (keyPressSimulator, keyEventPrevented) {
            var _this = this;
            // NOTE: preventing the 'keydown' and 'keypress' events for the select element does not
            // affect the assignment of the new selectedIndex. So, we should execute a shortcut
            // for the select element without taking into account that 'key' events are suppressed
            if (keyEventPrevented && !this.isSelectElement)
                return testCafeCore.delay(this.automationSettings.keyActionStepDelay);
            var currentShortcutHandler = this.shortcutHandlers[this.pressedKeyString];
            var keyPressPrevented = false;
            // NOTE: B254435
            if (!currentShortcutHandler || browserUtils$c.isFirefox || keyPressSimulator.key === 'enter')
                keyPressPrevented = !keyPressSimulator.press(this.modifiersState);
            if ((!keyPressPrevented || this.isSelectElement) && currentShortcutHandler) {
                return currentShortcutHandler(getDeepActiveElement(this.topSameDomainDocument))
                    .then(function () { return testCafeCore.delay(_this.automationSettings.keyActionStepDelay); });
            }
            return testCafeCore.delay(this.automationSettings.keyActionStepDelay);
        };
        PressAutomation.prototype._up = function (keyPressSimulator) {
            keyPressSimulator.up(this.modifiersState);
            return testCafeCore.delay(this.automationSettings.keyActionStepDelay);
        };
        PressAutomation.prototype._runCombination = function (keyCombination) {
            var _this = this;
            this.modifiersState = { ctrl: false, alt: false, shift: false, meta: false };
            this.isSelectElement = testCafeCore.domUtils.isSelectElement(getDeepActiveElement(this.topSameDomainDocument));
            this.pressedKeyString = '';
            this.shortcutHandlers = PressAutomation._getShortcutHandlers(keyCombination);
            var keyPressSimulators = PressAutomation._getKeyPressSimulators(keyCombination);
            return testCafeCore.promiseUtils.each(keyPressSimulators, function (keySimulator) {
                return _this
                    ._down(keySimulator)
                    .then(function (keyEventPrevented) { return _this._press(keySimulator, keyEventPrevented); });
            })
                .then(function () {
                testCafeCore.arrayUtils.reverse(keyPressSimulators);
                return testCafeCore.promiseUtils.each(keyPressSimulators, function (keySimulator) { return _this._up(keySimulator); });
            });
        };
        PressAutomation.prototype.run = function () {
            var _this = this;
            var activeElement = testCafeCore.domUtils.getActiveElement();
            var activeElementIsIframe = testCafeCore.domUtils.isIframeElement(activeElement);
            if (window.top === window && activeElementIsIframe && nativeMethods$8.contentWindowGetter.call(activeElement)) {
                var msg = {
                    cmd: PRESS_REQUEST_CMD,
                    keyCombinations: this.keyCombinations,
                    options: this.options
                };
                return testCafeCore.sendRequestToFrame(msg, PRESS_RESPONSE_CMD, nativeMethods$8.contentWindowGetter.call(activeElement));
            }
            return testCafeCore.promiseUtils.each(this.keyCombinations, function (combination) {
                return _this
                    ._runCombination(combination)
                    .then(function () { return testCafeCore.delay(_this.automationSettings.keyActionStepDelay); });
            });
        };
        return PressAutomation;
    }());

    var Promise$b = hammerhead__default.Promise;
    var extend$5 = hammerhead__default.utils.extend;
    var browserUtils$d = hammerhead__default.utils.browser;
    var eventSimulator$c = hammerhead__default.eventSandbox.eventSimulator;
    var domUtils$9 = testCafeCore__default.domUtils, eventUtils$4 = testCafeCore__default.eventUtils, delay$3 = testCafeCore__default.delay;
    var RClickAutomation = /** @class */ (function (_super) {
        __extends(RClickAutomation, _super);
        function RClickAutomation(element, clickOptions) {
            var _this = _super.call(this, element, clickOptions) || this;
            _this.modifiers = clickOptions.modifiers;
            _this.caretPos = clickOptions.caretPos;
            _this.eventState = {
                simulateDefaultBehavior: true,
                activeElementBeforeMouseDown: null
            };
            return _this;
        }
        RClickAutomation.prototype._mousedown = function (eventArgs) {
            var _this = this;
            return cursor
                .rightButtonDown()
                .then(function () {
                _this.eventState.activeElementBeforeMouseDown = domUtils$9.getActiveElement();
                _this.eventState.simulateDefaultBehavior = eventSimulator$c.mousedown(eventArgs.element, eventArgs.options);
            })
                .then(function () { return _this._focus(eventArgs); });
        };
        RClickAutomation.prototype._focus = function (eventArgs) {
            if (this.simulateDefaultBehavior === false)
                return nextTick();
            // NOTE: If a target element is a contentEditable element, we need to call focusAndSetSelection directly for
            // this element. Otherwise, if the element obtained by elementFromPoint is a child of the contentEditable
            // element, a selection position may be calculated incorrectly (by using the caretPos option).
            var elementForFocus = domUtils$9.isContentEditableElement(this.element) ? this.element : eventArgs.element;
            // NOTE: IE doesn't perform focus if active element has been changed while executing mousedown
            var simulateFocus = !browserUtils$d.isIE || this.eventState.activeElementBeforeMouseDown === domUtils$9.getActiveElement();
            return focusAndSetSelection(elementForFocus, simulateFocus, this.caretPos)
                .then(function () { return nextTick(); });
        };
        RClickAutomation.prototype._mouseup = function (eventArgs) {
            var _this = this;
            return cursor
                .buttonUp()
                .then(function () { return _this._getElementForEvent(eventArgs); })
                .then(function (element) { return eventSimulator$c.mouseup(element, eventArgs.options); });
        };
        RClickAutomation.prototype._contextmenu = function (eventArgs) {
            return this
                ._getElementForEvent(eventArgs)
                .then(function (element) {
                eventSimulator$c.contextmenu(element, eventArgs.options);
                if (!domUtils$9.isElementFocusable(element))
                    focusByRelatedElement(element);
            });
        };
        RClickAutomation.prototype.run = function (useStrictElementCheck) {
            var _this = this;
            var eventArgs = null;
            return this
                ._ensureElement(useStrictElementCheck)
                .then(function (_a) {
                var element = _a.element, clientPoint = _a.clientPoint, devicePoint = _a.devicePoint;
                eventArgs = {
                    point: clientPoint,
                    element: element,
                    options: extend$5({
                        clientX: clientPoint.x,
                        clientY: clientPoint.y,
                        screenX: devicePoint.x,
                        screenY: devicePoint.y,
                        button: eventUtils$4.BUTTON.right
                    }, _this.modifiers)
                };
                // NOTE: we should raise mouseup event with 'mouseActionStepDelay' after we trigger
                // mousedown event regardless of how long mousedown event handlers were executing
                return Promise$b.all([delay$3(_this.automationSettings.mouseActionStepDelay), _this._mousedown(eventArgs)]);
            })
                .then(function () { return _this._mouseup(eventArgs); })
                .then(function () { return _this._contextmenu(eventArgs); });
        };
        return RClickAutomation;
    }(VisibleElementAutomation));

    var browserUtils$e = hammerhead__default.utils.browser;
    var domUtils$a = testCafeCore__default.domUtils;
    var positionUtils$3 = testCafeCore__default.positionUtils;
    var styleUtils$5 = testCafeCore__default.styleUtils;
    var contentEditable$2 = testCafeCore__default.contentEditable;
    var arrayUtils$1 = testCafeCore__default.arrayUtils;
    var MODIFIERS_LIST = ['direction', 'font-family', 'font-size', 'font-size-adjust', 'font-variant', 'font-weight', 'font-style', 'letter-spacing', 'line-height', 'text-align', 'text-indent', 'text-transform', 'word-wrap', 'word-spacing', 'padding-top', 'padding-left', 'padding-right', 'padding-bottom', 'margin-top', 'margin-left', 'margin-right', 'margin-bottom', 'border-top-width', 'border-left-width', 'border-right-width', 'border-bottom-width'];
    function ensureRectangleInsideElement(element, rect) {
        var elementBorders = styleUtils$5.getBordersWidth(element);
        var elementOffset = positionUtils$3.getOffsetPosition(element);
        // NOTE: strange behavior in Chrome - for some elements (e.g., for the 'font' element)
        // scrollHeight is 0, so we use getBoundingClientRect
        var elementHeight = element.scrollHeight || element.getBoundingClientRect().height;
        var left = Math.ceil(rect.left);
        var top = Math.ceil(rect.top);
        var bottom = Math.floor(rect.bottom);
        if (!domUtils$a.isTextAreaElement(element)) {
            var clientOffset = positionUtils$3.offsetToClientCoords({
                x: elementOffset.left,
                y: elementOffset.top
            });
            var minLeft = clientOffset.x + elementBorders.left + 1;
            var minTop = clientOffset.y + elementBorders.top + 1;
            var bottomBound = clientOffset.y + elementBorders.top + elementBorders.bottom + elementHeight;
            var maxBottom = clientOffset.y + elementBorders.top + elementHeight - 1;
            left = Math.ceil(left <= clientOffset.x ? minLeft : rect.left);
            top = Math.ceil(top <= clientOffset.y ? minTop : rect.top);
            bottom = Math.floor(bottom >= bottomBound ? maxBottom : rect.bottom);
        }
        return {
            left: left,
            top: top,
            bottom: bottom
        };
    }
    function getAbsoluteRect(rect) {
        var documentScroll = styleUtils$5.getElementScroll(document);
        return {
            left: rect.left + documentScroll.left,
            top: rect.top + documentScroll.top,
            bottom: rect.bottom + documentScroll.top
        };
    }
    function getSelectionRectangleInContentEditableElement(element, position) {
        var range = domUtils$a.findDocument(element).createRange();
        var selectionPosition = contentEditable$2.calculateNodeAndOffsetByPosition(element, position);
        range.setStart(selectionPosition.node, Math.min(selectionPosition.offset, selectionPosition.node.length));
        range.setEnd(selectionPosition.node, Math.min(selectionPosition.offset, selectionPosition.node.length));
        return range.getClientRects()[0];
    }
    function getTextSelectionRectangle(element, position) {
        var range = element.createTextRange();
        range.collapse(true);
        range.moveStart('character', position);
        range.moveEnd('character', position);
        range.collapse(true);
        return range.getBoundingClientRect();
    }
    function getSelectionRectangle(element, position) {
        var clientRectBeforeFakeDiv = element.getBoundingClientRect();
        var fakeDiv = createFakeDiv(element);
        var rect = null;
        var clientRectAfterFakeDiv = element.getBoundingClientRect();
        var topBoundDiff = clientRectAfterFakeDiv.top - clientRectBeforeFakeDiv.top;
        var leftBoundDiff = clientRectAfterFakeDiv.left - clientRectBeforeFakeDiv.left;
        var valueLength = domUtils$a.getElementValue(element).length;
        try {
            var range = document.createRange(); //B254723
            range.setStart(hammerhead__default.nativeMethods.nodeFirstChildGetter.call(fakeDiv), Math.min(position, valueLength));
            // NOTE: The range.getClientRects function returns wrong result if range length is 0 in Safari 11
            range.setEnd(hammerhead__default.nativeMethods.nodeFirstChildGetter.call(fakeDiv), Math.min(position + 1, valueLength + 1));
            if (domUtils$a.isTextAreaElement(element)) {
                rect = range.getBoundingClientRect();
                if (rect.width === 0 && rect.height === 0)
                    rect = range.getClientRects()[0];
            }
            else
                rect = range.getClientRects()[0];
        }
        catch (err) {
            rect = null;
        }
        domUtils$a.remove(fakeDiv);
        if (!rect)
            return null;
        return {
            width: rect.width,
            height: rect.height,
            top: rect.top - topBoundDiff,
            bottom: rect.bottom - topBoundDiff,
            left: rect.left - leftBoundDiff,
            right: rect.right - leftBoundDiff
        };
    }
    function createFakeDiv(element) {
        var body = document.body;
        var elementOffset = positionUtils$3.getOffsetPosition(element);
        var elementMargin = styleUtils$5.getElementMargin(element);
        var elementTop = elementOffset.top - elementMargin.top;
        var elementLeft = elementOffset.left - elementMargin.left;
        var fakeDiv = document.createElement('div');
        var fakeDivCssStyles = 'white-space:pre-wrap;border-style:solid;';
        if (styleUtils$5.get(body, 'position') === 'absolute') {
            var bodyMargin = styleUtils$5.getElementMargin(body);
            var bodyLeft = styleUtils$5.get(body, 'left');
            var bodyTop = styleUtils$5.get(body, 'top');
            elementLeft -= bodyMargin.left + (parseInt(bodyLeft.replace('px', ''), 10) || 0);
            elementTop -= bodyMargin.top + (parseInt(bodyTop.replace('px', ''), 10) || 0);
        }
        arrayUtils$1.forEach(MODIFIERS_LIST, function (modifier) {
            fakeDivCssStyles += modifier + ":" + styleUtils$5.get(element, modifier) + ";";
        });
        styleUtils$5.set(fakeDiv, {
            cssText: fakeDivCssStyles,
            position: 'absolute',
            left: elementLeft + 'px',
            top: elementTop + 'px',
            width: element.scrollWidth + 'px',
            height: element.scrollHeight + 'px'
        });
        hammerhead__default.nativeMethods.nodeTextContentSetter.call(fakeDiv, domUtils$a.getElementValue(element) + ' ');
        body.appendChild(fakeDiv);
        return fakeDiv;
    }
    function getPositionCoordinates(element, position) {
        var rect = null;
        if (domUtils$a.isContentEditableElement(element))
            rect = getSelectionRectangleInContentEditableElement(element, position);
        else if (typeof element.createTextRange === 'function')
            rect = getTextSelectionRectangle(element, position);
        else
            rect = getSelectionRectangle(element, position);
        if (!rect)
            return null;
        rect = ensureRectangleInsideElement(element, rect);
        rect = getAbsoluteRect(rect);
        return {
            x: rect.left,
            y: Math.floor(rect.top + (rect.bottom - rect.top) / 2)
        };
    }
    function getSelectionCoordinatesByPosition(element, position) {
        var isTextEditable = domUtils$a.isTextEditableElement(element);
        var isContentEditable = domUtils$a.isContentEditableElement(element);
        var hasText = isTextEditable && domUtils$a.getElementValue(element).length > 0 ||
            isContentEditable && contentEditable$2.getContentEditableValue(element).length;
        if (!hasText)
            return positionUtils$3.findCenter(element);
        return getPositionCoordinates(element, position);
    }
    function getSelectionCoordinatesByNodeAndOffset(element, node, offset) {
        var range = domUtils$a.findDocument(element).createRange();
        range.setStart(node, Math.min(offset, node.length));
        range.setEnd(node, Math.min(offset, node.length));
        var rect = range.getClientRects()[0];
        if (!rect)
            return null;
        rect = ensureRectangleInsideElement(element, rect);
        rect = getAbsoluteRect(rect);
        return {
            x: rect.left,
            y: Math.floor(rect.top + (rect.bottom - rect.top) / 2)
        };
    }
    function getLastVisibleSelectionPosition(element, startPos, endPos) {
        var backward = startPos > endPos;
        var inc = backward ? 1 : -1;
        var currentPos = endPos;
        var currentPoint = null;
        while (currentPos !== startPos) {
            currentPos += inc;
            currentPoint = getPositionCoordinates(element, currentPos);
            if (currentPoint)
                break;
        }
        if (!currentPoint) {
            currentPoint = getPositionCoordinates(element, startPos) ||
                positionUtils$3.findCenter(element);
        }
        return currentPoint;
    }
    function scrollEditableElementByPoint(element, point) {
        if (!domUtils$a.isEditableElement(element))
            return;
        var isTextarea = domUtils$a.isTextAreaElement(element);
        var isInputElement = domUtils$a.isInputElement(element);
        // NOTE: we don't need to scroll input elements in Mozilla and
        // IE > 10 because it happens automatically on selection setting
        if (isInputElement && (browserUtils$e.isFirefox || browserUtils$e.isIE && browserUtils$e.version > 10))
            return;
        var elementOffset = positionUtils$3.getOffsetPosition(element);
        var elementBorders = styleUtils$5.getBordersWidth(element);
        var elementScroll = styleUtils$5.getElementScroll(element);
        var offsetX = point.x - elementOffset.left - elementBorders.left;
        var offsetY = point.y - elementOffset.top - elementBorders.top;
        var scrollValue = null;
        if (isTextarea) {
            if (offsetY < elementScroll.top)
                scrollValue = offsetY;
            if (offsetY > element.clientHeight + elementScroll.top)
                scrollValue = offsetY - element.clientHeight;
            if (scrollValue !== null)
                styleUtils$5.setScrollTop(element, Math.round(scrollValue));
            return;
        }
        if (offsetX < elementScroll.left)
            scrollValue = offsetX;
        if (offsetX > element.clientWidth + elementScroll.left)
            scrollValue = offsetX - element.clientWidth;
        if (scrollValue !== null)
            styleUtils$5.setScrollLeft(element, Math.round(scrollValue));
    }
    function excludeElementScroll(element, point) {
        var isTextEditable = domUtils$a.isTextEditableElement(element);
        var isInputElement = domUtils$a.isInputElement(element);
        if (!(isTextEditable || domUtils$a.isContentEditableElement(element)))
            return point;
        var elementOffset = positionUtils$3.getOffsetPosition(element);
        var elementBorders = styleUtils$5.getBordersWidth(element);
        var elementScroll = styleUtils$5.getElementScroll(element);
        var maxLeft = elementOffset.left + elementBorders.left + element.clientWidth;
        // NOTE: we can't know input elements' scroll value in Mozilla and
        // IE > 10 (https://bugzilla.mozilla.org/show_bug.cgi?id=293186)
        if (isInputElement && isTextEditable &&
            (browserUtils$e.isFirefox || browserUtils$e.isIE && browserUtils$e.version > 10)) {
            return {
                x: Math.min(point.x, maxLeft),
                y: point.y
            };
        }
        return {
            x: point.x - elementScroll.left,
            y: point.y - elementScroll.top
        };
    }

    var Promise$c = hammerhead__default.Promise;
    var browserUtils$f = hammerhead__default.utils.browser;
    var featureDetection$5 = hammerhead__default.utils.featureDetection;
    var eventSimulator$d = hammerhead__default.eventSandbox.eventSimulator;
    var focusBlurSandbox$4 = hammerhead__default.eventSandbox.focusBlur;
    var contentEditable$3 = testCafeCore__default.contentEditable;
    var domUtils$b = testCafeCore__default.domUtils;
    var positionUtils$4 = testCafeCore__default.positionUtils;
    var eventUtils$5 = testCafeCore__default.eventUtils;
    var delay$4 = testCafeCore__default.delay;
    var SelectBaseAutomation = /** @class */ (function (_super) {
        __extends(SelectBaseAutomation, _super);
        function SelectBaseAutomation(element, actionOptions) {
            var _this = _super.call(this, element, actionOptions) || this;
            _this.absoluteStartPoint = null;
            _this.absoluteEndPoint = null;
            _this.clientPoint = null;
            _this.speed = actionOptions.speed;
            _this.downEvent = featureDetection$5.isTouchDevice ? 'touchstart' : 'mousedown';
            _this.upEvent = featureDetection$5.isTouchDevice ? 'touchend' : 'mouseup';
            _this.eventArgs = {
                options: null,
                element: null
            };
            _this.eventState = {
                mousedownPrevented: false,
                simulateDefaultBehavior: true
            };
            return _this;
        }
        SelectBaseAutomation._calculateEventArguments = function (point) {
            var clientPoint = positionUtils$4.offsetToClientCoords(point);
            return fromPoint(clientPoint.x, clientPoint.y)
                .then(function (_a) {
                var element = _a.element;
                if (!element)
                    throw new Error(ERROR_TYPES.elementIsInvisibleError);
                return {
                    element: element,
                    options: {
                        clientX: clientPoint.x,
                        clientY: clientPoint.y
                    }
                };
            });
        };
        SelectBaseAutomation.prototype._move = function (_a) {
            var _this = this;
            var element = _a.element, offsetX = _a.offsetX, offsetY = _a.offsetY, speed = _a.speed;
            var moveOptions = new MoveOptions({ offsetX: offsetX, offsetY: offsetY, speed: speed }, false);
            var moveAutomation = new MoveAutomation(element, moveOptions);
            return moveAutomation
                .run()
                .then(function () { return delay$4(_this.automationSettings.mouseActionStepDelay); });
        };
        SelectBaseAutomation.prototype._bindMousedownHandler = function () {
            var _this = this;
            var onmousedown = function (e) {
                _this.eventState.mousedownPrevented = e.defaultPrevented;
                eventUtils$5.preventDefault(e);
                eventUtils$5.unbind(_this.element, 'mousedown', onmousedown);
            };
            eventUtils$5.bind(this.element, 'mousedown', onmousedown);
        };
        SelectBaseAutomation.prototype._calculateAbsoluteStartPoint = function () {
            throw new Error('Not implemented');
        };
        SelectBaseAutomation.prototype._calculateAbsoluteEndPoint = function () {
            throw new Error('Not implemented');
        };
        SelectBaseAutomation.prototype._moveToPoint = function (point) {
            scrollEditableElementByPoint(this.element, point);
            this.clientPoint = excludeElementScroll(this.element, point);
            var moveArguments = {
                element: document.documentElement,
                offsetX: this.clientPoint.x,
                offsetY: this.clientPoint.y,
                speed: this.speed
            };
            return this._move(moveArguments);
        };
        SelectBaseAutomation.prototype._mousedown = function () {
            var _this = this;
            return cursor
                .leftButtonDown()
                .then(function () { return SelectBaseAutomation._calculateEventArguments(_this.clientPoint); })
                .then(function (args) {
                _this.eventArgs = args;
                // NOTE: In WebKit and IE, the mousedown event opens the select element's dropdown;
                // therefore, we should prevent mousedown and hide the dropdown (B236416).
                var needCloseSelectDropDown = (browserUtils$f.isWebKit || browserUtils$f.isIE) &&
                    domUtils$b.isSelectElement(_this.element);
                if (needCloseSelectDropDown)
                    _this._bindMousedownHandler();
                _this.eventState.simulateDefaultBehavior = eventSimulator$d[_this.downEvent](_this.eventArgs.element, _this.eventArgs.options);
                if (_this.eventState.simulateDefaultBehavior === false)
                    _this.eventState.simulateDefaultBehavior = needCloseSelectDropDown && !_this.eventState.mousedownPrevented;
                return _this._focus();
            });
        };
        SelectBaseAutomation.prototype._focus = function () {
            var _this = this;
            return new Promise$c(function (resolve) {
                // NOTE: If the target element is a child of a contentEditable element, we need to call focus for its parent
                var elementForFocus = domUtils$b.isContentEditableElement(_this.element) ?
                    contentEditable$3.findContentEditableParent(_this.element) : _this.element;
                focusBlurSandbox$4.focus(elementForFocus, resolve, false, true);
            });
        };
        SelectBaseAutomation.prototype._setSelection = function () {
            throw new Error('Not implemented');
        };
        SelectBaseAutomation.prototype._mouseup = function () {
            var _this = this;
            return cursor
                .buttonUp()
                .then(function () {
                _this._setSelection();
                return SelectBaseAutomation._calculateEventArguments(_this.clientPoint);
            })
                .then(function (args) {
                _this.eventArgs = args;
                eventSimulator$d[_this.upEvent](_this.eventArgs.element, _this.eventArgs.options);
            });
        };
        SelectBaseAutomation.prototype.run = function () {
            var _this = this;
            this.absoluteStartPoint = this._calculateAbsoluteStartPoint();
            this.absoluteEndPoint = this._calculateAbsoluteEndPoint();
            return this
                ._moveToPoint(this.absoluteStartPoint)
                .then(function () { return _this._mousedown(); })
                .then(function () { return _this._moveToPoint(_this.absoluteEndPoint); })
                .then(function () { return _this._mouseup(); });
        };
        return SelectBaseAutomation;
    }(VisibleElementAutomation));

    var textSelection$3 = testCafeCore__default.textSelection;
    var domUtils$c = testCafeCore__default.domUtils;
    var positionUtils$5 = testCafeCore__default.positionUtils;
    var SelectTextAutomation = /** @class */ (function (_super) {
        __extends(SelectTextAutomation, _super);
        function SelectTextAutomation(element, startPos, endPos, actionOptions) {
            var _this = _super.call(this, element, actionOptions) || this;
            _this.startPos = startPos;
            _this.endPos = endPos;
            return _this;
        }
        SelectTextAutomation.prototype._calculateAbsoluteStartPoint = function () {
            var point = getSelectionCoordinatesByPosition(this.element, this.startPos);
            return point || positionUtils$5.findCenter(this.element);
        };
        SelectTextAutomation.prototype._calculateAbsoluteEndPoint = function () {
            var point = getSelectionCoordinatesByPosition(this.element, this.endPos);
            if (point)
                return point;
            // NOTE: if selection ends on an invisible symbol, we should try to find the last visible selection position
            if (domUtils$c.isContentEditableElement(this.element))
                return getLastVisibleSelectionPosition(this.element, this.startPos, this.endPos);
            return positionUtils$5.findCenter(this.element);
        };
        SelectTextAutomation.prototype._setSelection = function () {
            var isTextEditable = domUtils$c.isTextEditableElement(this.element);
            var isContentEditable = domUtils$c.isContentEditableElement(this.element);
            if (!(isTextEditable || isContentEditable) || this.eventState.simulateDefaultBehavior === false)
                return;
            textSelection$3.select(this.element, this.startPos, this.endPos);
        };
        SelectTextAutomation.prototype.run = function (useStrictElementCheck) {
            var _this = this;
            return this
                ._ensureElement(useStrictElementCheck)
                .then(function () { return _super.prototype.run.call(_this); });
        };
        return SelectTextAutomation;
    }(SelectBaseAutomation));

    var textSelection$4 = testCafeCore__default.textSelection;
    var contentEditable$4 = testCafeCore__default.contentEditable;
    var positionUtils$6 = testCafeCore__default.positionUtils;
    var SelectEditableContentAutomation = /** @class */ (function (_super) {
        __extends(SelectEditableContentAutomation, _super);
        function SelectEditableContentAutomation(startNode, endNode, actionOptions) {
            var _this = _super.call(this, contentEditable$4.getNearestCommonAncestor(startNode, endNode), actionOptions) || this;
            var startOffset = contentEditable$4.getFirstVisiblePosition(startNode);
            var endOffset = contentEditable$4.getLastVisiblePosition(endNode);
            var startPos = { node: startNode, offset: startOffset };
            var endPos = { node: endNode, offset: endOffset };
            var startPosition = contentEditable$4.calculatePositionByNodeAndOffset(_this.element, startPos);
            var endPosition = contentEditable$4.calculatePositionByNodeAndOffset(_this.element, endPos);
            if (startPosition > endPosition) {
                startOffset = contentEditable$4.getLastVisiblePosition(startNode);
                endOffset = contentEditable$4.getFirstVisiblePosition(endNode);
            }
            // NOTE: We should recalculate nodes and offsets for selection because we
            // may have to select children of expectedStartNode and expectedEndNode
            startPos = contentEditable$4.calculateNodeAndOffsetByPosition(startNode, startOffset);
            endPos = contentEditable$4.calculateNodeAndOffsetByPosition(endNode, endOffset);
            _this.startNode = startPos.node;
            _this.startOffset = startPos.offset;
            _this.endNode = endPos.node;
            _this.endOffset = endPos.offset;
            return _this;
        }
        SelectEditableContentAutomation.prototype._calculateAbsoluteStartPoint = function () {
            var point = getSelectionCoordinatesByNodeAndOffset(this.element, this.startNode, this.startOffset);
            return point || positionUtils$6.findCenter(this.element);
        };
        SelectEditableContentAutomation.prototype._calculateAbsoluteEndPoint = function () {
            var point = getSelectionCoordinatesByNodeAndOffset(this.element, this.endNode, this.endOffset);
            return point || positionUtils$6.findCenter(this.element);
        };
        SelectEditableContentAutomation.prototype._setSelection = function () {
            if (this.eventState.simulateDefaultBehavior === false)
                return;
            // NOTE: The same cursor position may correspond to different nodes, so, if we
            // know which nodes should be selected eventually, we should select them directly.
            var startPos = { node: this.startNode, offset: this.startOffset };
            var endPos = { node: this.endNode, offset: this.endOffset };
            textSelection$4.selectByNodesAndOffsets(startPos, endPos, true);
        };
        return SelectEditableContentAutomation;
    }(SelectBaseAutomation));

    var Promise$d = hammerhead__default.Promise;
    var extend$6 = hammerhead__default.utils.extend;
    var browserUtils$g = hammerhead__default.utils.browser;
    var eventSimulator$e = hammerhead__default.eventSandbox.eventSimulator;
    var elementEditingWatcher$1 = hammerhead__default.eventSandbox.elementEditingWatcher;
    var domUtils$d = testCafeCore__default.domUtils;
    var promiseUtils$1 = testCafeCore__default.promiseUtils;
    var contentEditable$5 = testCafeCore__default.contentEditable;
    var textSelection$5 = testCafeCore__default.textSelection;
    var delay$5 = testCafeCore__default.delay;
    var SPECIAL_KEYS = testCafeCore__default.KEY_MAPS.specialKeys;
    var TypeAutomation = /** @class */ (function () {
        function TypeAutomation(element, text, typeOptions) {
            this.element = TypeAutomation.findTextEditableChild(element) || element;
            this.typingText = text.toString();
            this.modifiers = typeOptions.modifiers;
            this.caretPos = typeOptions.caretPos;
            this.replace = typeOptions.replace;
            this.paste = typeOptions.paste;
            this.offsetX = typeOptions.offsetX;
            this.offsetY = typeOptions.offsetY;
            this.speed = typeOptions.speed;
            this.automationSettings = new AutomationSettings(this.speed);
            this.elementChanged = element !== this.element;
            this.currentPos = 0;
            this.currentKeyCode = null;
            this.currentCharCode = null;
            this.currentKey = null;
            this.currentKeyIdentifier = null;
            this.eventArgs = {
                options: null,
                element: null
            };
            this.eventState = {
                skipType: false,
                simulateKeypress: true,
                simulateTypeChar: true
            };
        }
        TypeAutomation.findTextEditableChild = function (element) {
            var innerElement = null;
            if (!domUtils$d.isEditableElement(element)) {
                var allChildren = element.querySelectorAll('*');
                for (var i = 0; i < allChildren.length; i++) {
                    if (domUtils$d.isTextEditableElementAndEditingAllowed(allChildren[i])) {
                        innerElement = allChildren[i];
                        break;
                    }
                }
            }
            return innerElement;
        };
        TypeAutomation.prototype._calculateEventArguments = function (isPressEvent) {
            var activeElement = domUtils$d.getActiveElement();
            var isContentEditable = domUtils$d.isContentEditableElement(this.element);
            var element = this.eventArgs.element || this.element;
            // T162478: Wrong typing and keys pressing in editor
            if (!isContentEditable && activeElement !== element)
                element = TypeAutomation.findTextEditableChild(activeElement) || activeElement;
            var options = extend$6({
                keyCode: isPressEvent ? this.currentCharCode : this.currentKeyCode
            }, this.modifiers);
            if (isPressEvent)
                options.charCode = this.currentCharCode;
            extend$6(options, getKeyProperties(isPressEvent, this.currentKey, this.currentKeyIdentifier));
            return { element: element, options: options };
        };
        TypeAutomation.prototype._calculateTargetElement = function () {
            var activeElement = domUtils$d.getActiveElement();
            var isContentEditable = domUtils$d.isContentEditableElement(this.element);
            if (isContentEditable) {
                if (activeElement !== contentEditable$5.findContentEditableParent(this.element)) {
                    this.eventState.skipType = true;
                    return;
                }
            }
            else if (activeElement !== this.element) {
                this.eventState.skipType = true;
                return;
            }
            this.element = isContentEditable ? this.element : activeElement;
        };
        TypeAutomation.prototype._click = function (useStrictElementCheck) {
            var _this = this;
            var activeElement = domUtils$d.getActiveElement();
            var isTextEditable = domUtils$d.isTextEditableElementAndEditingAllowed(this.element);
            var isContentEditable = domUtils$d.isContentEditableElement(this.element);
            if (activeElement !== this.element) {
                var _a = getDefaultAutomationOffsets(this.element), offsetX = _a.offsetX, offsetY = _a.offsetY;
                var clickOptions = new ClickOptions({
                    offsetX: this.elementChanged ? offsetX : this.offsetX,
                    offsetY: this.elementChanged ? offsetY : this.offsetY,
                    speed: this.speed,
                    caretPos: this.caretPos,
                    modifiers: this.modifiers
                });
                var clickAutomation = new ClickAutomation(this.element, clickOptions);
                return clickAutomation
                    .run(useStrictElementCheck)
                    .then(function () { return delay$5(_this.automationSettings.mouseActionStepDelay); });
            }
            if (isTextEditable)
                elementEditingWatcher$1.watchElementEditing(this.element);
            var isEditableElement = isTextEditable || isContentEditable;
            if (isEditableElement) {
                var selectionStart = textSelection$5.getSelectionStart(this.element);
                if (!isNaN(parseInt(this.caretPos, 10)) && this.caretPos !== selectionStart)
                    textSelection$5.select(this.element, this.caretPos, this.caretPos);
            }
            return Promise$d.resolve();
        };
        TypeAutomation.prototype._type = function () {
            var _this = this;
            if (this.eventState.skipType)
                return Promise$d.resolve();
            var isContentEditable = domUtils$d.isContentEditableElement(this.element);
            if (this.replace) {
                if (domUtils$d.isTextEditableElementAndEditingAllowed(this.element))
                    textSelection$5.select(this.element);
                else if (isContentEditable)
                    textSelection$5.deleteSelectionContents(this.element, true);
            }
            return promiseUtils$1.whilst(function () { return !_this._isTypingFinished(); }, function () { return _this._typingStep(); });
        };
        TypeAutomation.prototype._isTypingFinished = function () {
            return this.currentPos === this.typingText.length;
        };
        TypeAutomation.prototype._typingStep = function () {
            var char = this.typingText.charAt(this.currentPos);
            this.currentKeyCode = getKeyCode(char);
            this.currentCharCode = this.typingText.charCodeAt(this.currentPos);
            this.currentKey = this.currentKeyCode === SPECIAL_KEYS['enter'] ? 'Enter' : char;
            this.currentKeyIdentifier = getKeyIdentifier(this.currentKey);
            this._keydown();
            this._keypress();
            return this._keyup();
        };
        TypeAutomation.prototype._keydown = function () {
            this.eventArgs = this._calculateEventArguments();
            this.eventState.simulateKeypress = eventSimulator$e.keydown(this.eventArgs.element, this.eventArgs.options);
        };
        TypeAutomation.prototype._keypress = function () {
            if (this.eventState.simulateKeypress === false)
                return;
            this.eventArgs = this._calculateEventArguments(true);
            this.eventState.simulateTypeChar = browserUtils$g.isAndroid || eventSimulator$e.keypress(this.eventArgs.element, this.eventArgs.options);
        };
        TypeAutomation.prototype._keyup = function () {
            var _this = this;
            var elementForTyping = this.eventArgs.element;
            this.eventArgs = this._calculateEventArguments();
            var isTextEditableElement = domUtils$d.isTextEditableElement(this.element);
            var isContentEditable = domUtils$d.isContentEditableElement(this.element);
            var shouldTypeAllText = this.paste || !isTextEditableElement && !isContentEditable;
            return Promise$d
                .resolve()
                .then(function () {
                return shouldTypeAllText ? _this._typeAllText(elementForTyping) : _this._typeChar(elementForTyping);
            })
                .then(function () {
                eventSimulator$e.keyup(_this.eventArgs.element, _this.eventArgs.options);
                if (shouldTypeAllText)
                    _this.currentPos = _this.typingText.length;
                else
                    _this.currentPos++;
            });
        };
        TypeAutomation.prototype._typeChar = function (element) {
            // NOTE: change event must not be raised after prevented keydown
            // or keypress even if element value was changed (B253816)
            if (this.eventState.simulateKeypress === false || this.eventState.simulateTypeChar === false) {
                elementEditingWatcher$1.restartWatchingElementEditing(element);
                return delay$5(this.automationSettings.keyActionStepDelay);
            }
            var currentChar = this.typingText.charAt(this.currentPos);
            var isDigit = /^\d$/.test(currentChar);
            var prevChar = this.currentPos === 0 ? null : this.typingText.charAt(this.currentPos - 1);
            var isInputTypeNumber = domUtils$d.isInputElement(element) && element.type === 'number';
            if (isInputTypeNumber) {
                var selectionStart = textSelection$5.getSelectionStart(element);
                var valueLength = domUtils$d.getInputValue(element).length;
                var textHasDigits = /^\d/.test(this.typingText);
                var isPermissibleSymbol = currentChar === '.' || currentChar === '-' && valueLength;
                if (!isDigit && (textHasDigits || !isPermissibleSymbol || selectionStart !== 0))
                    return delay$5(this.automationSettings.keyActionStepDelay);
                // NOTE: allow to type '.' or '-' only if it is the first symbol and the input already has
                // a value, or if '.' or '-' are added to a digit. Otherwise, the value won't be set.
                if (isDigit && (prevChar === '.' || prevChar === '-' && !valueLength))
                    currentChar = prevChar + currentChar;
            }
            typeText(element, currentChar, null);
            return delay$5(this.automationSettings.keyActionStepDelay);
        };
        TypeAutomation.prototype._typeAllText = function (element) {
            typeText(element, this.typingText, this.caretPos);
            return delay$5(this.automationSettings.keyActionStepDelay);
        };
        TypeAutomation.prototype.run = function (useStrictElementCheck) {
            var _this = this;
            return this
                ._click(useStrictElementCheck)
                .then(function () { return _this._calculateTargetElement(); })
                .then(function () { return _this._type(); });
        };
        return TypeAutomation;
    }());

    var UploadAutomation = /** @class */ (function () {
        function UploadAutomation(element, paths, createError) {
            this.element = element;
            this.paths = paths;
            this.createError = createError;
        }
        UploadAutomation.prototype.run = function () {
            var _this = this;
            return hammerhead.doUpload(this.element, this.paths)
                .then(function (errs) {
                if (!errs.length)
                    return;
                var filePaths = testCafeCore.arrayUtils.map(errs, function (err) { return err.path; });
                var scannedFilePaths = testCafeCore.arrayUtils.reduce(errs, function (prev, current) {
                    return prev.concat(current.resolvedPaths);
                }, []);
                throw _this.createError(filePaths, scannedFilePaths);
            });
        };
        return UploadAutomation;
    }());

    var domUtils$e = testCafeCore__default.domUtils;
    var contentEditable$6 = testCafeCore__default.contentEditable;
    function getSelectTextAreaContentArguments(element, argumentsObject) {
        var value = domUtils$e.getTextAreaValue(element);
        var linesArray = value && value.length ? value.split('\n') : [];
        var lastLineIndex = linesArray.length - 1;
        var startLineIndex = !argumentsObject.startLine ? 0 : Math.min(argumentsObject.startLine, lastLineIndex);
        var startLineLength = linesArray[startLineIndex] ? linesArray[startLineIndex].length : 0;
        var startPos = !argumentsObject.startPos ? 0 : Math.min(argumentsObject.startPos, startLineLength);
        var endLineIndex = argumentsObject.endLine === void 0 || argumentsObject.endLine === null ?
            lastLineIndex : Math.min(argumentsObject.endLine, lastLineIndex);
        var endLineLength = linesArray[endLineIndex] ? linesArray[endLineIndex].length : 0;
        var endPos = argumentsObject.endPos === void 0 ||
            argumentsObject.endPos ===
                null ? endLineLength : Math.min(argumentsObject.endPos, endLineLength);
        var startLinePosition = domUtils$e.getTextareaPositionByLineAndOffset(element, startLineIndex, 0);
        var endLinePosition = domUtils$e.getTextareaPositionByLineAndOffset(element, endLineIndex, 0);
        return {
            startPos: startLinePosition + startPos,
            endPos: endLinePosition + endPos
        };
    }
    function calculateSelectTextArguments (element, argumentsObject) {
        if (argumentsObject === void 0) { argumentsObject = {}; }
        var isTextEditable = domUtils$e.isTextEditableElement(element);
        var firstPos = isTextEditable ? 0 : contentEditable$6.getFirstVisiblePosition(element);
        var lastPos = isTextEditable ? domUtils$e.getElementValue(element).length : contentEditable$6.getLastVisiblePosition(element);
        var startPos = !argumentsObject.startPos ? firstPos : Math.min(argumentsObject.startPos, lastPos);
        var endPos = argumentsObject.endPos === void 0 ||
            argumentsObject.endPos === null ? lastPos : Math.min(argumentsObject.endPos, lastPos);
        if (argumentsObject.offset !== void 0) {
            if (argumentsObject.offset >= 0)
                endPos = Math.min(argumentsObject.offset, endPos);
            else {
                startPos = endPos;
                endPos = Math.max(0, endPos + argumentsObject.offset);
            }
            return { startPos: startPos, endPos: endPos };
        }
        if (argumentsObject.startLine !== void 0)
            return getSelectTextAreaContentArguments(element, argumentsObject);
        return { startPos: startPos, endPos: endPos };
    }

    var exports$1 = {};
    exports$1.Scroll = ScrollAutomation;
    exports$1.Click = ClickAutomation;
    exports$1.SelectChildClick = SelectChildClickAutomation;
    exports$1.DblClick = DblClickAutomation;
    exports$1.DragToOffset = DragToOffsetAutomation;
    exports$1.DragToElement = DragToElementAutomation;
    exports$1.Hover = HoverAutomation;
    exports$1.Press = PressAutomation;
    exports$1.RClick = RClickAutomation;
    exports$1.SelectText = SelectTextAutomation;
    exports$1.SelectEditableContent = SelectEditableContentAutomation;
    exports$1.Type = TypeAutomation;
    exports$1.Upload = UploadAutomation;
    exports$1.MouseOptions = MouseOptions;
    exports$1.ClickOptions = ClickOptions;
    exports$1.TypeOptions = TypeOptions;
    exports$1.ERROR_TYPES = ERROR_TYPES;
    exports$1.AutomationSettings = AutomationSettings;
    exports$1.getOffsetOptions = getOffsetOptions;
    exports$1.calculateSelectTextArguments = calculateSelectTextArguments;
    exports$1.cursor = cursor;
    exports$1.getNextFocusableElement = getNextFocusableElement;
    exports$1.getSelectionCoordinatesByPosition = getSelectionCoordinatesByPosition;
    exports$1.getElementFromPoint = fromPoint;
    var nativeMethods$9 = hammerhead__default.nativeMethods;
    var evalIframeScript = hammerhead__default.EVENTS.evalIframeScript;
    nativeMethods$9.objectDefineProperty(window, '%testCafeAutomation%', { configurable: true, value: exports$1 });
    // eslint-disable-next-line no-undef
    hammerhead__default.on(evalIframeScript, function (e) { return initTestCafeAutomation(nativeMethods$9.contentWindowGetter.call(e.iframe), true); });

}(window['%hammerhead%'], window['%testCafeCore%'], window['%testCafeUI%']));

    }

    initTestCafeAutomation(window);
})();
