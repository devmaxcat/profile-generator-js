
# profile-generator-js
A web package which generates colorful avatars for users or content.

[Add an issue](https://github.com/devmaxcat/profile-generator-js/issues) for bugs or features and feel free to submit pull requests. Editing documentation is also appreciated. See [contribution help](https://github.com/devmaxcat/profile-generator-js/blob/main/CONTRIBUTING.md) if you'd like to learn about how to contribute.

# Get Started
Install `profile-generator-js` (NPM)
```
npm install profile-generator-hs
```
Then, import in your project.
#### ESModule
```js
import generateAvatar from "profile-generator-js";
```
CommonJS support is ify, if bundling to use on the web try esbuild or add esmify plugin to the bundler of your choice, like browserify.

#### Example Usage
```js
let username = 'JohnDoe';
generateAvatar(username).then((avatar) => { // generates encoded image URL.
	document.getElementById('#avatar').src = avatar;
}); 
```
Output:
![Square avatar with blue background with white J](https://lh3.googleusercontent.com/pw/AP1GczP6EfSC1Hj8SEo2MotvtL_gWp84_C-sxCjoNBRmEimM-RcFofOvI5w68ccCgAG6A-vz4C0oUzEwGipfdckE7IKn6WD0gI0AT5kjNncAua0YBi8ccBUNmUwf1baDX-EW9J3M4MY3LERs6RajUS-Zp2w=w500-h500-s-no-gm?authuser=0)

There's also numerous options to tweak the result.
```js
let username = 'JohnDoe';
generateAvatar(username, '', {size: 250, customIcon: "./image.svg"}).then((avatar) => { // generates encoded image URL.
	document.getElementById('#avatar').src = avatar;
}); 
```
Output: 
![enter image description here](https://lh3.googleusercontent.com/pw/AP1GczMiPqdFKTgMAAgdNOqBZMxacmT0Firo8OADSbOFoZD8Ens1ApVO8tCimUKm2b7CGa7IBzDB-2rPeIAzRQTB3LDMdJU7AjtiANwgDhxSYRdiwE-KM4lQveNeiF1ijnQtgQ6MtAofW1NNcUCMY-CgQ54=w250-h250-s-no-gm?authuser=0)

By default, `generateAvatar()` returns a promise since it performs a few asynchronous operations (mostly related to loading icons). For flexibility in it's usage, you can also *experimentally* force the function to run synchronously, however it limits generation options.
```js
let username = 'JohnDoe';
// generateAvatar(uniqueIdentifier, letters, options, forceSync)
let avatar = generateAvatar(username, 'JD', {}, true);

document.getElementById('#avatar').src = avatar;
```
# Documentation
## Functions
### generateAvatar()
A function which generates an encoded image URL for an avatar.
```ts
generateAvatar(uniqueIdentifier: string,   letters?: string, options?: AvatarOptions): string
```
#### Parameters
`uniqueIndentifier`  
A string which will generate a random color based on its contents. This can be a username or a slug, for example. It does not **have** to be unique, however it's recommended.

`letters?`  
A string which generates the avatar with its contents overlayed. By default the first character of `uniqueIndentifier` will be used if not provided. Provide an empty string for no text.

`options?`  
A object of type `AvatarOptions` (constructable by importing `AvatarOptions` and instantiating it with `new AvatarOptions()`). This sets numerous settings about the avatar, if none is provided it will use the default values in the type definition.
#### Returns
Returns a string containing the encoded URL.
```js
// Example output:
"data:image/png;base64,a1BcD2efg...wX3yz4"
```
---
### stringToColor()
A helper function, accessible if wanted.
```ts
stringToColor(str: string): string
```
#### Parameters
`str`  
The text to turn into a color. 
#### Returns
Returns a string containing a hex code of a color which corresponds to the above string.
```js
// Example output:
"#1a2b3c"
```

## Types
### AvatarOptions
```ts
class AvatarOptions {
	size: number;
	foreground: string;
	font: string;
	fontSize: number;
	weight: string;
	customIcon: string;
	export: string;
}
```
#### Properties
`AvatarOptions.size`    
The size of the avatar in pixels. Default is `500`.

`AvatarOptions.foreground`  
The color of the text or symbol overlayed on the avatar. Default is `"white"`.

`AvatarOptions.font`  
The font of overlayed text. Default is `"Arial"`.

`AvatarOptions.font`  
The size of overlayed text. Default is half of `AvatarOptions.size`.

`AvatarOptions.weight`  
The weight of the font. Default is `"bold"`.

`AvatarOptions.customIcon`  
The URL of a custom icon to overlay on the avatar. If the file is an SVG, it will inherit the foreground color. Note: `customIcon` cannot be used if the `forceSync` parameter of `generateAvatar()` is set to `true`. On node you can input a File path or a Buffer.

`AvatarOptions.export`  
Determines the mime-type of file the avatar is outputted as. Default is `"image/png"`.
#### Methods
None!
