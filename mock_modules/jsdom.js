let jsdom = {
  JSDOM
}
export default jsdom

export const JSDOM = class {
  constructor() {
    console.log('jsdom can not be used in a browser environment.')
  }
}

