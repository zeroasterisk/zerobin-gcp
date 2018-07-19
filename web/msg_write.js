import {
  newKey,
  newInstance,
} from './aes_ctr';
// https://jameshfisher.com/2017/11/02/web-cryptography-api-symmetric-encryption.html
//
//
const buf2hex = buf => (
  Array.prototype.map.call(
    new Uint8Array(buf),
    x => ((`00${x.toString(16)}`).slice(-2)),
  ).join('')
);
//
export default async function msgWrite(text) {
  const ivSize = 16;
  const keyArr = newKey(ivSize);
  const cipher = await newInstance(keyArr, ivSize);
  const ciphertextArr = await cipher.encrypt(text);

  const key = buf2hex(keyArr);
  const ciphertext = buf2hex(ciphertextArr);
  return { ciphertext, key };
}
