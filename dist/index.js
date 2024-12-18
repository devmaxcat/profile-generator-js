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
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _a, _MediaHandler_updateSvgColor, _MediaHandler_svgTextParser, _MediaHandler_svgDocToText, _MediaHandler_svgTextToDataUrl;
// environment detection
const isBrowser = typeof window !== 'undefined';
const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
import isSvg from "is-svg";
import { createCanvas, loadImage } from "canvas";
// Node-only dependencies
import fs from "fs";
import { JSDOM } from "jsdom";
import { Buffer } from "buffer";
if (isNode) {
    const DOM = new JSDOM();
    const window = DOM.window;
    const XMLSerializer = window.XMLSerializer;
}
/**
 * A function which generates an image URL based on given parameters.
 * @param {string} uniqueIndentifier - A unique string which will generate a random color based on its contents. This can be a username or a slug for example. It does not have to be unique, however it is recommend.
 * @param {string} [letters] - A string which will be overlayed on the avatar. If not provided, the first character of the uniqueIndentifier will be used.
 * @param {AvatarOptions} options - An object of type AvatarOptions which sets numerous options for the avatar, if not provided, default values will be used.
 * @param {boolean} forceSync - EXPERIMENTAL: If you don't want to deal with promises, you can set this to true. This will force the function to return a string instead of a promise. Only background and text will be rendered in this mode, no images. Default is false.
 * @returns {string | Promise<string>} A data URL of the generated image.
*/
export default function generateAvatar(uniqueIndentifier, letters = uniqueIndentifier.slice(0, 1).toUpperCase(), options = new AvatarOptions(), forceSync = false) {
    if (!uniqueIndentifier) {
        throw new Error("Profile-Generator-JS: uniqueIndentifier is undefined.");
    }
    options = new AvatarOptions(options);
    // Setup canvas
    const canvas = createCanvas(options.size, options.size);
    canvas.width = options.size;
    canvas.height = options.size;
    const context = canvas.getContext("2d");
    if (!context) {
        throw new Error("profile-generator-js: Could not create canvas context.");
    }
    if (!MediaHandler.isAcceptableMedia(options.customIcon) && options.customIcon) {
        console.warn(`profile-generator-js: Custom icons must be a URL${isNode ? ', Buffer, or File Path' : ''}. Your icon will be ignored.`);
    }
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
        if (!isBrowser && options.exportAsBuffer) {
            const buffer = canvas.toBuffer();
            new Blob([buffer], { type: options.export });
            return buffer;
        }
        else if (typeof options.export === "string" && options.export === "image/png") {
            if (options.quality) {
                console.warn('profile-generator-js: Quality is not supported for mimeType of image/png. Your quality setting will be ignored');
            }
            return canvas.toDataURL(options.export);
        }
        else if (typeof options.export === "string" && (options.export === "image/jpeg" || options.export === "image/webp")) {
            return canvas.toDataURL(options.export, options.quality);
        }
        canvas.toDataURL(options.export);
    }
    if (options.customIcon && !forceSync && MediaHandler.isAcceptableMedia(options.customIcon)) {
        return MediaHandler.handle(options.customIcon, options.foreground).then((url) => {
            return new Promise((resolve, reject) => {
                loadImage(url).then((image) => {
                    const imageSize = .7;
                    renderBackground();
                    context.drawImage(image, canvas.width / 2 - (canvas.width * imageSize / 2), canvas.height / 2 - (canvas.height * imageSize / 2), canvas.width * imageSize, canvas.height * imageSize);
                    resolve(canvasExport());
                }).catch((error) => {
                    console.error('profile-generator-js: Failed to load image.', error);
                });
            });
        });
    }
    else {
        if (forceSync) {
            if (options.customIcon) {
                console.warn('profile-generator-js: Custom icons are not supported when forceSync is set to true. Your icon will be ignored. Set forceSync to false to use custom icons.');
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
 * @property {string | Buffer | URL} customIcon - The URL, File, or Buffer of a custom icon to overlay on the avatar. If the file is an SVG, it will attempt to inherit the foreground color.
 * @property {MimeType} export - The export mime type of the avatar. Default is "image/png".
 * @property {number} quality - The export quality of the image. Default is 1.
 * @property {boolean} exportAsBuffer - If true, the function will return a buffer using the mime type instead of a data URL. Default is false.
 *
 */
var MimeType;
(function (MimeType) {
    MimeType["png"] = "image/png";
    MimeType["jpeg"] = "image/jpeg";
})(MimeType || (MimeType = {}));
export class AvatarOptions {
    constructor(properties) {
        this.size = 500;
        this.foreground = "white";
        this.font = "Arial";
        this.fontSize = this.size / 2;
        this.weight = "bold";
        this.export = MimeType.png;
        this.quality = 1;
        this.exportAsBuffer = false;
        Object.assign(this, properties);
        if (properties === null || properties === void 0 ? void 0 : properties.size) {
            this.fontSize = properties.size / 2;
        }
    }
}
/**
 * A helper function which converts a string to a color.
 * @param {string} str - The string to convert to a color.
 * @returns {string} A hex color.
 */
export function stringToColor(str) {
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
class MediaHandler {
    // returns a promise resolves the final image with applied transformations / color.
    static handle(media, color) {
        let text;
        let isAnSvg = false;
        // File Buffer
        if (!isBrowser && media instanceof Buffer) {
            text = media.toString();
            isSvg(text) ? isAnSvg = true : isAnSvg = false;
            // Local File Path
        }
        else if (!isBrowser && fs.existsSync(media)) {
            const fileContent = fs.readFileSync(media);
            text = fileContent.toString();
            isSvg(text) ? isAnSvg = true : isAnSvg = false;
        }
        return new Promise((resolve, reject) => {
            if (isAnSvg) {
                resolve(__classPrivateFieldGet(_a, _a, "m", _MediaHandler_updateSvgColor).call(_a, __classPrivateFieldGet(_a, _a, "m", _MediaHandler_svgTextParser).call(_a, text), color));
            }
            else if (isNode && media instanceof Buffer && !(media instanceof URL)) { // Buffer (non-SVG)
                resolve(media.toString());
            }
            else if (!(media instanceof Buffer) && (_a.isValidUrl(media)) || isBrowser) { // External Image (Fetch). We'll try to fetch anything a browser gives us.
                media = media.toString();
                fetch(media).then((response) => {
                    response.text().then(text => {
                        var _b;
                        if ((_b = response.headers.get("content-type")) === null || _b === void 0 ? void 0 : _b.includes("image/svg+xml")) {
                            resolve(__classPrivateFieldGet(_a, _a, "m", _MediaHandler_updateSvgColor).call(_a, __classPrivateFieldGet(_a, _a, "m", _MediaHandler_svgTextParser).call(_a, text), color));
                        }
                        else {
                            resolve(media.toString());
                        }
                    });
                });
            }
        });
    }
    static isAcceptableMedia(media) {
        if (!isBrowser && media instanceof Buffer) {
            return true;
        }
        else if (!isBrowser && fs.existsSync(media)) {
            return true;
        }
        else if (!(media instanceof Buffer) && _a.isValidUrl(media) || isBrowser) { // might as well try the fetch if we're on browser.
            return true;
        }
    }
    static isValidUrl(url) {
        try {
            return Boolean(new URL(url));
        }
        catch (e) {
            return false;
        }
    }
}
_a = MediaHandler, _MediaHandler_updateSvgColor = function _MediaHandler_updateSvgColor(document, targetColor) {
    const paths = document.getElementsByTagName("path");
    const svgElement = document.getElementsByTagName("svg")[0];
    if (svgElement.getAttribute("stroke")) {
        svgElement.setAttribute("stroke", targetColor);
    }
    if (svgElement.style.stroke) {
        svgElement.style.stroke = targetColor;
    }
    if (svgElement.getAttribute("fill")) {
        svgElement.setAttribute("fill", targetColor);
    }
    if (svgElement.style.fill) {
        svgElement.style.fill = targetColor;
    }
    // Update each path element's stroke and fill
    Array.from(paths).forEach((path) => {
        if (path.getAttribute("stroke")) {
            path.setAttribute("stroke", targetColor);
        }
        if (path.style.stroke) {
            path.style.stroke = targetColor;
        }
        if (path.getAttribute("fill")) {
            path.setAttribute("fill", targetColor);
        }
        if (path.style.fill) {
            path.style.fill = targetColor;
        }
    });
    // Convert the updated SVG document to a base64-encoded data URL
    return __classPrivateFieldGet(_a, _a, "m", _MediaHandler_svgTextToDataUrl).call(_a, __classPrivateFieldGet(_a, _a, "m", _MediaHandler_svgDocToText).call(_a, document));
    ;
}, _MediaHandler_svgTextParser = function _MediaHandler_svgTextParser(svgText) {
    if (!isBrowser) {
        return new JSDOM(svgText, { contentType: "image/svg+xml" }).window.document;
    }
    else {
        const parser = new DOMParser();
        return parser.parseFromString(svgText, "image/svg+xml");
    }
}, _MediaHandler_svgDocToText = function _MediaHandler_svgDocToText(svg) {
    const serializer = new XMLSerializer();
    return serializer.serializeToString(svg.documentElement);
}, _MediaHandler_svgTextToDataUrl = function _MediaHandler_svgTextToDataUrl(svgText) {
    if (!isBrowser) {
        const base64Encoded = Buffer.from(svgText).toString('base64');
        return `data:image/svg+xml;base64,${base64Encoded}`;
    }
    else {
        return `data:image/svg+xml;base64,${btoa(svgText)}`;
    }
};
