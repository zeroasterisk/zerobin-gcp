import {
  newInstance,
} from './aes_ctr';

// https://jameshfisher.com/2017/11/02/web-cryptography-api-symmetric-encryption.html
const hex2buf = (hex) => {
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(Number.parseInt(hex.slice(i, i + 2), 16));
  }
  return new Uint8Array(bytes);
};

export default async function msgRead(key, ciphertext) {
  console.log({ key, ciphertext });
  const ivSize = 16;
  const keyArr = hex2buf(key);
  const cipher = await newInstance(keyArr, ivSize);
  const plaintext = await cipher.decrypt(hex2buf(ciphertext));
  return plaintext;
}
