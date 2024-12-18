// mock-buffer.js
export const Buffer = {
  from: () => {
    throw new Error('Buffer.from is not supported in the browser');
  },
  // Add other methods if required
};
