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
import { Buffer } from "buffer";
/**
 * A function which generates an image URL based on given parameters.
 * @param {string} uniqueIndentifier - A unique string which will generate a random color based on its contents. This can be a username or a slug for example. It does not have to be unique, however it is recommend.
 * @param {string} [letters] - A string which will be overlayed on the avatar. If not provided, the first character of the uniqueIndentifier will be used.
 * @param {AvatarOptions} options - An object of type AvatarOptions which sets numerous options for the avatar, if not provided, default values will be used.
 * @param {boolean} forceSync - EXPERIMENTAL: If you don't want to deal with promises, you can set this to true. This will force the function to return a string instead of a promise. Only background and text will be rendered in this mode, no images. Default is false.
 * @returns {string | Promise<string>} A data URL of the generated image.
*/
export default function generateAvatar(uniqueIndentifier: string, letters?: string, options?: Partial<AvatarOptions>, forceSync?: boolean): string | Buffer | Promise<string | Buffer>;
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
declare enum MimeType {
    png = "image/png",
    jpeg = "image/jpeg"
}
export declare class AvatarOptions {
    constructor(properties?: Partial<AvatarOptions>);
    size: number;
    foreground: string;
    font: string;
    fontSize: number;
    weight: string;
    customIcon?: string | Buffer | URL;
    export: MimeType;
    quality: number;
    exportAsBuffer: boolean;
}
/**
 * A helper function which converts a string to a color.
 * @param {string} str - The string to convert to a color.
 * @returns {string} A hex color.
 */
export declare function stringToColor(str: string): string;
export {};
