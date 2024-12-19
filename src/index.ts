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

export default function generateAvatar(
    uniqueIndentifier: string,
    letters: string = uniqueIndentifier.slice(0, 1).toUpperCase(),
    options: Partial<AvatarOptions> = new AvatarOptions(),
    forceSync: boolean = false): string | Buffer | Promise<string | Buffer> {

    if (!uniqueIndentifier) {
        throw new Error("profile-generator-js: uniqueIndentifier is undefined.");
    }

    options = new AvatarOptions(options)

    // Setup canvas
    const canvas = createCanvas(options.size, options.size);
    canvas.width = options.size;
    canvas.height = options.size;

    const context = canvas.getContext("2d");
    if (!context) {
        throw new Error("profile-generator-js: Could not create canvas context.");
    }

    if (!MediaHandler.isAcceptableMedia(options.customIcon) && options.customIcon) {
        console.warn(`profile-generator-js: Custom icons must be a URL${isNode ? ', Buffer, or File Path' : ''}. Your icon will be ignored.`)
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
        } else if (typeof options.export === "string" && options.export === "image/png") {
            if (options.quality) {
                console.warn('profile-generator-js: Quality is not supported for mimeType of image/png. Your quality setting will be ignored')
            }
            return canvas.toDataURL(options.export);
        } else if (typeof options.export === "string" && (options.export === "image/jpeg" || options.export === "image/webp")) {

            return canvas.toDataURL(options.export, options.quality);
        }
        canvas.toDataURL(options.export);


    }


    if (options.customIcon && !forceSync && MediaHandler.isAcceptableMedia(options.customIcon)) {
        return MediaHandler.handle(options.customIcon, options.foreground).then((url) => {
            return new Promise<string | Buffer>((resolve, reject) => {
                loadImage(url).then((image) => {
                    const imageSize = .7;

                    renderBackground();
                    context.drawImage(image, canvas.width / 2 - (canvas.width * imageSize / 2), canvas.height / 2 - (canvas.height * imageSize / 2), canvas.width * imageSize, canvas.height * imageSize);
                    resolve(canvasExport());
                }).catch((error) => {
                    console.error('profile-generator-js: Failed to load image.', error);
                })

            });

        });
    } else {
        if (forceSync) {
            if (options.customIcon) {
                console.warn('profile-generator-js: Custom icons are not supported when forceSync is set to true. Your icon will be ignored. Set forceSync to false to use custom icons.')
            }
            renderBackground();
            renderText();
            return canvasExport();
        } else {
            return new Promise<string | Buffer>((resolve, reject) => {
                renderBackground();
                renderText();
                resolve(canvasExport());
            })
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

enum MimeType {
    png = "image/png",
    jpeg = "image/jpeg"
}
export class AvatarOptions {
    constructor(properties?: Partial<AvatarOptions>) {
        Object.assign(this, properties);
        if (properties?.size) {
            this.fontSize = properties.size / 2;
        }

    }
    size: number = 500;
    foreground: string = "white";
    font: string = "Arial";
    fontSize: number = this.size / 2;
    weight: string = "bold";
    customIcon?: string | Buffer | URL;
    export: MimeType = MimeType.png;
    quality: number = 1;
    exportAsBuffer: boolean = false;
}

/**
 * A helper function which converts a string to a color.
 * @param {string} str - The string to convert to a color.
 * @returns {string} A hex color.
 */
export function stringToColor(str: string): string {
    let hash: number = 0;
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
    static handle(media: string | Buffer | URL, color: string): Promise<string> {
        let text: string;
        let isAnSvg: boolean = false;

        // File Buffer
        if (!isBrowser && media instanceof Buffer) {
            text = media.toString();
            isSvg(text) ? isAnSvg = true : isAnSvg = false;
            // Local File Path
        } else if (!isBrowser && fs.existsSync(media)) {
            const fileContent = fs.readFileSync(media);
            text = fileContent.toString();
            isSvg(text) ? isAnSvg = true : isAnSvg = false;
        }
        return new Promise<string>((resolve, reject) => {
            if (isAnSvg) {
                resolve(MediaHandler.#updateSvgColor(MediaHandler.#svgTextParser(text), color));
            } else if (isNode && media instanceof Buffer && !(media instanceof URL)) { // Buffer (non-SVG)
                resolve(media.toString());
            } else if (!(media instanceof Buffer) && (MediaHandler.isValidUrl(media)) || isBrowser) { // External Image (Fetch). We'll try to fetch anything a browser gives us.
                media = media.toString()

                fetch(media).then((response) => {
                    response.text().then(text => {
                        if (response.headers.get("content-type")?.includes("image/svg+xml")) {
                            resolve(MediaHandler.#updateSvgColor(MediaHandler.#svgTextParser(text), color));
                        } else {
                            resolve(media.toString());
                        }
                    });
                });
            }
        });
    }
    static isAcceptableMedia(media: string | Buffer | URL): Boolean {
        if (!isBrowser && media instanceof Buffer) {
            return true;
        } else if (!isBrowser && fs.existsSync(media)) {
            return true;
        } else if (!(media instanceof Buffer) && MediaHandler.isValidUrl(media) || isBrowser) { // might as well try the fetch if we're on browser.
            return true;
        }


    }
    static isValidUrl(url: string | URL): boolean {
        try {
            return Boolean(new URL(url));
        }
        catch (e) {
            return false;
        }
    }
    static #updateSvgColor(document: Document, targetColor: string): string {
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
        return MediaHandler.#svgTextToDataUrl(MediaHandler.#svgDocToText(document));;
    }

    // Parses an SVG string into a Document object
    static #svgTextParser(svgText: string): Document {
        if (!isBrowser) {
            return new JSDOM(svgText, { contentType: "image/svg+xml" }).window.document;
        } else {
            const parser = new DOMParser();
            return parser.parseFromString(svgText, "image/svg+xml");
        }

    }

    static #svgDocToText(svg: Document): string {
        const serializer = new XMLSerializer();
        return serializer.serializeToString(svg.documentElement);
    }

    static #svgTextToDataUrl(svgText: string): string {
        if (!isBrowser) {
            const base64Encoded = Buffer.from(svgText).toString('base64');
            return `data:image/svg+xml;base64,${base64Encoded}`;
        } else {
            return `data:image/svg+xml;base64,${btoa(svgText)}`;
        }

    }
}
