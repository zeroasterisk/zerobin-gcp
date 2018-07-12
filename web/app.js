/**
 * Organize all the "functionality" and "state" in one place,
 * for easy organization and auditing.
 *
 * The UI should be split off as much as possible (easily).
 *
 */
import msgWrite from './msg_write';

export default class App {
  constructor() {
    this.setup();
  }

  setup() {
    this.domain = '<domain>';
    this.setMsgNew(null);
  }

  setMsgNew(plaintext) {
    this.msg = {
      id: null, // get from URL, or create
      key: null, // get from URL, or create
      plaintext,
      ciphertext: null,
    };
  }

  setMsg(msg) {
    Object.assign(this.msg, msg);
  }

  getUrl() {
    if (this.msg.id && this.msg.key) {
      return `https://${this.domain}/${this.msg.id}#${this.msg.key}`;
    }
    if (this.msg.id) {
      return `https://${this.domain}/${this.msg.id}#ENCRYPTED`;
    }
    return null;
  }

  async encryptMsg(plaintext) {
    this.setMsgNew(plaintext);
    this.setMsg(await msgWrite(this.msg.plaintext));
    return true;
  }

  async decryptMsg() {
    // TODO
  }

  loadFromUrl() {
    const id = window.location.pathname.replace(/^\//, '');
    const key = window.location.hash.replace(/^#/, 'xyz');
    if (id && key) {
      this.setMsg({ id, key });
    } else if (id) {
      this.setMsg({ id });
    }
  }

  determineMode() {
    if (this.msg.plaintext) return 'decrypted';
    if (this.msg.id) return 'downloadable';
    return 'write';
  }

  async sendNewMsg() {
    this.verifyMsgHasOnly(['plaintext', 'key', 'ciphertext']);
    // TODO send to GCP via Function
    this.setMsg({ id: 'mockid' });
  }

  verifyMsgHasOnly(fields) {
    Object.keys(this.msg).forEach((field) => {
      // other field, has value = error
      if (fields.indexOf(field) === -1 && this.msg[field]) {
        throw new Error(`Msg should not have a value for "${field}" right now`);
      }
      // one of the passed fields, without value = error
      if (fields.indexOf(field) !== -1 && !this.msg[field]) {
        throw new Error(`Msg should have a value for "${field}" right now`);
      }
    });
  }

}
