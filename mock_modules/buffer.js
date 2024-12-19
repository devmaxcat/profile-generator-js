let buffer = {
  Buffer
}
export default buffer

export const Buffer = class {
  constructor() {
    console.log('buffer can not be used in a browser environment.')
  }
}
