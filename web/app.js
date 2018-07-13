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

  setMsgNew() {
    this.msg = {
      id: null, // get from URL, or create
      key: null, // get from URL, or create
      plaintext: null,
      ciphertext: null,
      ttl: null,
      burn: null,
      debug: null,
    };
  }

  setMsg(msg) {
    Object.assign(this.msg, msg);
  }

  getUrl() {
    // if (this.msg.id && this.msg.key) {
    //   return `https://${this.domain}/#${this.msg.id}|${this.msg.key}`;
    // }
    // if (this.msg.id) {
    //   return `https://${this.domain}/#${this.msg.id}`;
    // }
    if (this.msg.id && this.msg.key) {
      return `#${this.msg.id}|${this.msg.key}`;
    }
    if (this.msg.id) {
      return `#${this.msg.id}`;
    }
    return null;
  }

  async encryptMsg(msg) {
    this.setMsgNew();
    this.setMsg(msg);
    this.setMsg(await msgWrite(this.msg.plaintext));
    return true;
  }

  async decryptMsg() {
    // TODO
  }

  loadFromUrl() {
    const hash = window.location.hash.replace(/^#/, 'xyz');
    const parts = hash.split('|');
    const id = parts[0];
    const key = (parts.length > 1) ? parts[1] : null;
    if (id && key) {
      this.setMsg({ id, key });
    } else if (id) {
      this.setMsg({ id });
    }
  }

  async sendNewMsg() {
    this.verifyMsgHasOnly(['plaintext', 'key', 'ciphertext']);
    // TODO send to GCP via Function
    this.setMsg({ id: 'mockid' });
  }

  verifyMsgHasOnly(fields) {
    const fieldsFalseable = ['burn', 'debug'];
    Object.keys(this.msg).forEach((field) => {
      // omit checkboxes (can be false)
      if (fieldsFalseable.indexOf(field)) return;
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
