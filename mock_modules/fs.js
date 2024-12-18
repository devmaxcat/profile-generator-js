export default {
    readFile: () => {
      throw new Error('fs.readFile is not supported in the browser');
    },
    writeFile: () => {
      throw new Error('fs.writeFile is not supported in the browser');
    },
  };