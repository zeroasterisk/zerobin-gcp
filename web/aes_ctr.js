import {
  concat,
  concatenate,
  stringToUtf8ByteArray,
  utf8ByteArrayToString,
} from './bytes';

const MIN_IV_SIZE_IN_BYTES = 12;
const AES_BLOCK_SIZE_IN_BYTES = 16;
const SUPPORTED_AES_KEY_SIZES = [16, 32];


class SecurityException extends Error {
  constructor(msg) {
    super(msg);
  }
}
class InvalidArgumentsException extends Error {
  constructor(msg) {
    super(msg);
  }
}
class BrowserNotSupported extends Error {
  constructor(msg) {
    super(msg);
  }
}
const getCrypto = () => {
  const crypto = global.crypto || global.msCrypto;
  if (!crypto) {
    throw new BrowserNotSupported('Missing crypto module');
  }
  return crypto;
};

const randBytes = (n) => {
  const crypto = getCrypto();
  const result = new Uint8Array(n);
  crypto.getRandomValues(result);
  return result;
};

const validateAesKeySize = (n) => {
  if (!SUPPORTED_AES_KEY_SIZES.includes(n)) {
    throw new InvalidArgumentsException(`unsupported AES key size: ${n}`);
  }
};
const requireUint8Array = (input) => {
  if (input == null || !(input instanceof Uint8Array)) {
    throw new InvalidArgumentsException('input must be a non null Uint8Array');
  }
};

class AesCtr {
  constructor(key, ivSize) {
    this.myKey = key;
    this.myIvSize = ivSize;
  }

  async encrypt(plaintext) {
    if (typeof plaintext === 'string') {
      return this.encrypt_strict(
        stringToUtf8ByteArray(plaintext)
      );
    }
    return this.encrypt_strict(plaintext)
  }
  async encrypt_strict(plaintext) {
    requireUint8Array(plaintext);
    const iv = randBytes(this.myIvSize);
    const counter = new Uint8Array(AES_BLOCK_SIZE_IN_BYTES);
    counter.set(iv);
    const alg = { name: 'AES-CTR', counter, length: 128 };
    const ciphertext = await window.crypto.subtle.encrypt(alg, this.myKey, plaintext);
    return concatenate(Uint8Array, iv, new Uint8Array(ciphertext));
  }

  async decrypt(ciphertext) {
    requireUint8Array(ciphertext);
    if (ciphertext.length < this.myIvSize) {
      throw new SecurityException('ciphertext too short');
    }
    const counter = new Uint8Array(AES_BLOCK_SIZE_IN_BYTES);
    counter.set(ciphertext.slice(0, this.myIvSize));
    const alg = { name: 'AES-CTR', counter, length: 128 };
    return new Uint8Array(await window.crypto.subtle.decrypt(
      alg, this.myKey, new Uint8Array(ciphertext.slice(this.myIvSize)),
    ));
  }
}

export const newKey = ivSize => randBytes(ivSize);

export const newInstance = async function (key, ivSize) {
  if (ivSize < MIN_IV_SIZE_IN_BYTES || ivSize > AES_BLOCK_SIZE_IN_BYTES) {
    throw new SecurityException(
      `invaid IV length, must be at least ${MIN_IV_SIZE_IN_BYTES
      } and at most ${AES_BLOCK_SIZE_IN_BYTES}`,
    );
  }
  if (typeof global.crypto === 'undefined') {
    throw new BrowserNotSupported('Missing crypto module');
  }
  if (typeof global.crypto.subtle === 'undefined') {
    throw new BrowserNotSupported('Missing crypto.subtle module');
  }
  requireUint8Array(key);
  validateAesKeySize(key.length);

  const cryptoKey = await window.crypto.subtle.importKey(
    'raw', key, { name: 'AES-CTR', length: key.length }, false,
    ['encrypt', 'decrypt'],
  );
  return new AesCtr(cryptoKey, ivSize);
};
