"use strict";
/**
 * @author devmaxcat https://github.com/devmaxcat
/**
 * @license
 * Copyright (c) 2015 Example Corporation Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _IconMedia_instances, _a, _IconMedia_targetColor, _IconMedia_updateSvgColor, _IconMedia_svgTextParser, _IconMedia_svgDocToText, _IconMedia_svgTextToUrl;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvatarOptions = void 0;
exports.default = generateAvatar;
exports.stringToColor = stringToColor;
/**
 * A function which generates an image URL based on given parameters.
 * @param {string} uniqueIndentifier - A unique string which will generate a random color based on its contents. This can be a username or a slug for example. It does not have to be unique, however it is recommend.
 * @param {string} [letters] - A string which will be overlayed on the avatar. If not provided, the first character of the uniqueIndentifier will be used.
 * @param {AvatarOptions} options - An object of type AvatarOptions which sets numerous options for the avatar, if not provided, default values will be used.
 * @param {boolean} forceSync - EXPERIMENTAL: If you don't want to deal with promises, you can set this to true. This will force the function to return a string instead of a promise. Only background and text will be rendered in this mode, no images. Default is false.
 * @returns {string | Promise<string>} A data URL of the generated image.
*/
function generateAvatar(uniqueIndentifier, letters = uniqueIndentifier.slice(0, 1).toUpperCase(), options = new AvatarOptions(), forceSync = false) {
    if (!document) {
        throw new ReferenceError("Profile-Generator-JS: Document is undefined. Are you sure this being run in a browser environment?");
    }
    if (!uniqueIndentifier) {
        throw new Error("Profile-Generator-JS: uniqueIndentifier is undefined.");
    }
    // Setup canvas
    const canvas = document.createElement("canvas");
    canvas.width = options.size;
    canvas.height = options.size;
    const context = canvas.getContext("2d");
    if (!context) {
        throw new Error("Profile-Generator-JS: Canvas context is null. Does the current environment support the CanvasAPI? (https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)");
    }
    options = new AvatarOptions(options); // Ensure options is an instance of AvatarOptions and defaults are correctly set.
    // Render functions
    function renderBackground() {
        context.fillStyle = stringToColor(uniqueIndentifier);
        context.fillRect(0, 0, canvas.width, canvas.height);
    }
    function renderText() {
        context.font = `${options.fontSize}px ${options.font}`;
        context.fillStyle = options.foreground;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(letters, canvas.width / 2, canvas.height / 1.8, canvas.width);
    }
    // Export function
    function canvasExport() {
        return canvas.toDataURL(options.export);
    }
    // MAIN
    if (options.customIcon && !forceSync) {
        return new IconMedia(options.customIcon, options.foreground).promise.then((url) => {
            const image = new Image();
            image.crossOrigin = "anonymous";
            image.src = url;
            return new Promise((resolve, reject) => {
                image.onload = () => {
                    const imageSize = .7;
                    renderBackground();
                    context.drawImage(image, canvas.width / 2 - (canvas.width * imageSize / 2), canvas.height / 2 - (canvas.height * imageSize / 2), canvas.width * imageSize, canvas.height * imageSize);
                    resolve(canvasExport());
                };
                image.onerror = (error) => {
                    reject(new Error("The below above occured in package: profile-picture-generator-js"));
                };
            });
        });
    }
    else {
        if (forceSync) {
            if (options.customIcon) {
                console.warn('Profile-Generator-JS: Custom icons are not supported when forceSync is set to true. Your icon will be ignored. Set forceSync to false to use custom icons.');
            }
            renderBackground();
            renderText();
            return canvasExport();
        }
        else {
            return new Promise((resolve, reject) => {
                renderBackground();
                renderText();
                resolve(canvasExport());
            });
        }
    }
}
/**
 * An object which sets numerous options for the avatar.
 * @property {number} size - The size of the avatar in pixels. Default is 500.
 * @property {string} foreground - The color of the text or symbol overlayed on the avatar. Default is "white".
 * @property {string} font - The font of overlayed text. Default is "Arial".
 * @property {number} fontSize - The size of overlayed text. Default is half of the size.
 * @property {string} weight - The weight of the font. Default is "bold".
 * @property {string} customIcon - The URL of a custom icon to overlay on the avatar. If the file is an SVG, it will inherit the foreground color.
 * @property {string} export - The export type of the avatar. Default is "image/png".
 */
class AvatarOptions {
    constructor(properties) {
        this.size = 500;
        this.foreground = "white";
        this.font = "Arial";
        this.fontSize = this.size / 2;
        this.weight = "bold";
        this.export = "image/png";
        Object.assign(this, properties);
        if (properties === null || properties === void 0 ? void 0 : properties.size) {
            this.fontSize = properties.size / 2;
        }
    }
}
exports.AvatarOptions = AvatarOptions;
/**
 * A helper function which converts a string to a color.
 * @param {string} str - The string to convert to a color.
 * @returns {string} A hex color.
 */
function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = "#";
    for (let i = 0; i < 3; i++) {
        color += ("00" + ((hash >> (i * 8)) & 0xFF).toString(16)).slice(-2);
    }
    return color;
}
// CommonJS exports
module.exports = generateAvatar;
module.exports.AvatarOptions = AvatarOptions;
module.exports.stringToColor = stringToColor;
var IconType;
(function (IconType) {
    IconType[IconType["svg"] = 0] = "svg";
    IconType[IconType["image"] = 1] = "image";
})(IconType || (IconType = {}));
// I'm not sure why I wrote this class this way?? Will refactor later.
class IconMedia {
    constructor(url, color) {
        _IconMedia_instances.add(this);
        _IconMedia_targetColor.set(this, void 0);
        this.url = url;
        __classPrivateFieldSet(this, _IconMedia_targetColor, color, "f");
        this.promise = new Promise((resolve, reject) => {
            fetch(url).then((response) => {
                var _b;
                ((_b = response.headers.get("content-type")) === null || _b === void 0 ? void 0 : _b.includes("image/svg+xml")) ? this.type = IconType.svg : this.type = IconType.image;
                response.text().then(text => {
                    if (this.type === IconType.svg) {
                        this.document = __classPrivateFieldGet(_a, _a, "m", _IconMedia_svgTextParser).call(_a, text);
                        __classPrivateFieldGet(this, _IconMedia_instances, "m", _IconMedia_updateSvgColor).call(this);
                        console.log(this.url);
                        resolve(this.url);
                    }
                    else {
                        resolve(this.url);
                    }
                });
            });
        });
    }
    set color(color) {
        __classPrivateFieldSet(this, _IconMedia_targetColor, color, "f");
        if (this.type === IconType.svg) {
            __classPrivateFieldGet(this, _IconMedia_instances, "m", _IconMedia_updateSvgColor).call(this);
        }
    }
    get color() {
        return __classPrivateFieldGet(this, _IconMedia_targetColor, "f");
    }
    ;
}
_a = IconMedia, _IconMedia_targetColor = new WeakMap(), _IconMedia_instances = new WeakSet(), _IconMedia_updateSvgColor = function _IconMedia_updateSvgColor() {
    const paths = this.document.querySelectorAll("path");
    const svgElement = this.document.querySelector("svg");
    if (svgElement.getAttribute("fill")) {
        svgElement.setAttribute("fill", __classPrivateFieldGet(this, _IconMedia_targetColor, "f"));
    }
    if (svgElement.getAttribute("stroke")) {
        svgElement.setAttribute("stroke", __classPrivateFieldGet(this, _IconMedia_targetColor, "f"));
    }
    if (svgElement.style.fill) {
        svgElement.style.fill = __classPrivateFieldGet(this, _IconMedia_targetColor, "f");
    }
    if (svgElement.style.stroke) {
        svgElement.style.stroke = __classPrivateFieldGet(this, _IconMedia_targetColor, "f");
    }
    // Change the color of each path
    paths.forEach((path) => {
        if (path.style.fill) {
            path.style.fill = __classPrivateFieldGet(this, _IconMedia_targetColor, "f");
        }
        if (path.style.stroke) {
            path.style.stroke = __classPrivateFieldGet(this, _IconMedia_targetColor, "f");
        }
        if (path.getAttribute("fill")) {
            path.setAttribute("fill", __classPrivateFieldGet(this, _IconMedia_targetColor, "f"));
        }
        if (path.getAttribute("stroke")) {
            path.setAttribute("stroke", __classPrivateFieldGet(this, _IconMedia_targetColor, "f"));
        }
    });
    this.url = __classPrivateFieldGet(_a, _a, "m", _IconMedia_svgTextToUrl).call(_a, __classPrivateFieldGet(_a, _a, "m", _IconMedia_svgDocToText).call(_a, this.document));
    return this.url;
}, _IconMedia_svgTextParser = function _IconMedia_svgTextParser(svgText) {
    const parser = new DOMParser();
    return parser.parseFromString(svgText, "image/svg+xml");
}, _IconMedia_svgDocToText = function _IconMedia_svgDocToText(svg) {
    const serializer = new XMLSerializer();
    return serializer.serializeToString(svg.documentElement);
}, _IconMedia_svgTextToUrl = function _IconMedia_svgTextToUrl(svgText) {
    const svgBlob = new Blob([svgText], { type: "image/svg+xml" });
    return URL.createObjectURL(svgBlob);
};
