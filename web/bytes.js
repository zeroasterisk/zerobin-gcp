/**
 * Turns a string into an array of bytes; a "byte" being a JS number in the
 * range 0-255. Multi-byte characters are written as little-endian.
 * @param {string} str String value to arrify.
 * @return {!Array<number>} Array of numbers corresponding to the
 *     UCS character codes of each character in str.
 */
export const stringToByteArray = (str) => {
  const output = [];
  let p = 0;
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i);
    // NOTE: c <= 0xffff since JavaScript strings are UTF-16.
    if (c > 0xff) {
      output[p++] = c & 0xff;
      c >>= 8;
    }
    output[p++] = c;
  }
  return output;
};


/**
 * Turns an array of numbers into the string given by the concatenation of the
 * characters to which the numbers correspond.
 * @param {!Uint8Array|!Array<number>} bytes Array of numbers representing
 *     characters.
 * @return {string} Stringification of the array.
 */
export const byteArrayToString = (bytes) => {
  const CHUNK_SIZE = 8192;

  // Special-case the simple case for speed's sake.
  if (bytes.length <= CHUNK_SIZE) {
    return String.fromCharCode.apply(null, bytes);
  }

  // The remaining logic splits conversion by chunks since
  // Function#apply() has a maximum parameter count.
  // See discussion: http://goo.gl/LrWmZ9

  let str = '';
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk = bytes.slice(i + CHUNK_SIZE);
    str += String.fromCharCode.apply(null, chunk);
  }
  return str;
};


/**
 * Turns an array of numbers into the hex string given by the concatenation of
 * the hex values to which the numbers correspond.
 * @param {Uint8Array|Array<number>} array Array of numbers representing
 *     characters.
 * @param {string=} separator Optional separator between values
 * @return {string} Hex string.
 */
const byteArrayToHex = (array, separator) => array.map(
  (numByte) => {
    const hexByte = numByte.toString(16);
    return hexByte.length > 1 ? hexByte : `0${hexByte}`;
  },
).join(separator || '');


/**
 * Converts a hex string into an integer array.
 * @param {string} hexString Hex string of 16-bit integers (two characters
 *     per integer).
 * @return {!Array<number>} Array of {0,255} integers for the given string.
 */
const hexToByteArray = (hexString) => {
  if (hexString.length % 2 !== 0) {
    throw new Error('Key string length must be multiple of 2');
  }
  const arr = [];
  for (let i = 0; i < hexString.length; i += 2) {
    arr.push(parseInt(hexString.substring(i, i + 2), 16));
  }
  return arr;
};


/**
 * Converts a JS string to a UTF-8 "byte" array.
 * @param {string} str 16-bit unicode string.
 * @return {!Array<number>} UTF-8 byte array.
 */
export const stringToUtf8ByteArray = (str) => {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder('utf-8').encode(str);
  }
  const out = [];
  let p = 0;
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i);
    if (c < 128) {
      out[p++] = c;
    } else if (c < 2048) {
      out[p++] = (c >> 6) | 192;
      out[p++] = (c & 63) | 128;
    } else if (
      ((c & 0xFC00) == 0xD800) && (i + 1) < str.length
        && ((str.charCodeAt(i + 1) & 0xFC00) == 0xDC00)) {
      // Surrogate Pair
      c = 0x10000 + ((c & 0x03FF) << 10) + (str.charCodeAt(++i) & 0x03FF);
      out[p++] = (c >> 18) | 240;
      out[p++] = ((c >> 12) & 63) | 128;
      out[p++] = ((c >> 6) & 63) | 128;
      out[p++] = (c & 63) | 128;
    } else {
      out[p++] = (c >> 12) | 224;
      out[p++] = ((c >> 6) & 63) | 128;
      out[p++] = (c & 63) | 128;
    }
  }
  return out;
};


/**
 * Converts a UTF-8 byte array to JavaScript's 16-bit Unicode.
 * @param {Uint8Array|Array<number>} bytes UTF-8 byte array.
 * @return {string} 16-bit Unicode string.
 */
export const utf8ByteArrayToString = (bytes) => {
  if (typeof TextEncoder !== 'undefined') {
    return new TextDecoder('utf-8').decode(bytes);
  }
  const out = [];
  let pos = 0;
  let c = 0;
  while (pos < bytes.length) {
    const c1 = bytes[pos++];
    if (c1 < 128) {
      out[c++] = String.fromCharCode(c1);
    } else if (c1 > 191 && c1 < 224) {
      const c2 = bytes[pos++];
      out[c++] = String.fromCharCode((c1 & 31) << 6 | c2 & 63);
    } else if (c1 > 239 && c1 < 365) {
      // Surrogate Pair
      const c2 = bytes[pos++];
      const c3 = bytes[pos++];
      const c4 = bytes[pos++];
      const u = ((c1 & 7) << 18 | (c2 & 63) << 12 | (c3 & 63) << 6 | c4 & 63)
          - 0x10000;
      out[c++] = String.fromCharCode(0xD800 + (u >> 10));
      out[c++] = String.fromCharCode(0xDC00 + (u & 1023));
    } else {
      const c2 = bytes[pos++];
      const c3 = bytes[pos++];
      out[c++] = String.fromCharCode((c1 & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
    }
  }
  return out.join('');
};


/**
 * XOR two byte arrays.
 * @param {!Uint8Array|!Int8Array|!Array<number>} bytes1 Byte array 1.
 * @param {!Uint8Array|!Int8Array|!Array<number>} bytes2 Byte array 2.
 * @return {!Array<number>} Resulting XOR of the two byte arrays.
 */
export const xorByteArray = (bytes1, bytes2) => {
  if (bytes1.length != bytes2.length) {
    throw new Error('XOR array lengths must match');
  }
  const result = [];
  for (let i = 0; i < bytes1.length; i++) {
    result.push(bytes1[i] ^ bytes2[i]);
  }
  return result;
};

/**
 * Returns a new array that is the result of joining the arguments.
 * @param Constructor resultConstructor
 * @param {...!Uint8Array} var_args
 * @return {!Uint8Array}
 */
export const concatenate = (resultConstructor, ...arrays) => {
  const totalLength = arrays.reduce((total, arr) => total + arr.length, 0);
  const result = new resultConstructor(totalLength);
  arrays.reduce((offset, arr) => {
    result.set(arr, offset);
    return offset + arr.length;
  }, 0);
  return result;
};

/**
 * Converts the hex string to a byte array.
 *
 * @param {string} hex the input
 * @return {!Uint8Array} the byte array output
 * @static
 */
export const fromHex = function (hex) {
  return new Uint8Array(hexToByteArray(hex));
};

/**
 * Converts a non-negative integer number to a 64-bit big-endian byte array.
 * @param {number} value The number to convert.
 * @return {!Uint8Array} The number as a big-endian byte array.
 * @throws {InvalidArgumentsException}
 * @static
 */
export const fromNumber = function (value) {
  if (isNaN(value) || value % 1 !== 0) {
    throw new InvalidArgumentsException('cannot convert non-integer value');
  }
  if (value < 0) {
    throw new InvalidArgumentsException('cannot convert negative number');
  }
  if (value > Number.MAX_SAFE_INTEGER) {
    throw new InvalidArgumentsException(
      `cannot convert number larger than ${Number.MAX_SAFE_INTEGER}`,
    );
  }
  const two_power_32 = 2 ** 32;
  let low = value % two_power_32;
  let high = value / two_power_32;
  const result = new Uint8Array(8);
  for (let i = 7; i >= 4; i--) {
    result[i] = low & 0xff;
    low >>>= 8;
  }
  for (let i = 3; i >= 0; i--) {
    result[i] = high & 0xff;
    high >>>= 8;
  }
  return result;
};

/**
 * Converts a byte array to hex.
 *
 * @param {!Uint8Array} bytes the byte array input
 * @return {string} hex the output
 * @static
 */
export const toHex = function (bytes) {
  return byteArrayToHex(bytes);
};
