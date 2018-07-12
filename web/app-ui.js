/**
 * It is crazy to use no framework... let's be crazy!
 * (beacuse it's a security focused project, the least surface area = better)
 *
 * May make a better UI with a framework later
 *
 * UI is simple, a handful of UI "modes"
 *
 * TODO: make Material Design
 * TODO: make pretty
 * TODO: make "debug" UI flag (otherwise go as "auto")
 * TODO: make "GCP Function vs Firebase" as UI flag
 */
const MODES = [
  // misc
  'loading',
  'error',
  // author
  'write',
  'encrypting',
  'encrypted',
  'sending',
  'sent',
  // reader
  'downloadable',
  'downloading',
  'downloaded',
  'decrypting',
  'decrypted',
];
export default class AppUi {
  constructor(app) {
    this.app = app;
    this.mode = 'loading';
    this.doms = {
      status: document.querySelector('#status'),
      error: document.querySelector('#error'),
      load: document.querySelector('#load'),
      // write
      write: document.querySelector('#write'),
      // write before encrypt
      writing: document.querySelector('#writing'),
      write_form: document.querySelector('#write-form'),
      write_plaintext: document.querySelector('#write-plaintext'),
      // write before submit
      sending: document.querySelector('#sending'),
      send_form: document.querySelector('#send-form'),
      write_key: document.querySelector('#write-key'),
      write_ciphertext: document.querySelector('#write-ciphertext'),
      // write after submit
      sent: document.querySelector('#sent'),
      write_url: document.querySelector('#write-url'),
      write_url_link: document.querySelector('#write-url-link'),
      // read
      read: document.querySelector('#read'),
      // read before decrypt
      read_form: document.querySelector('#read-form'),
      read_key: document.querySelector('#read-key'),
      read_ciphertext: document.querySelector('#read-ciphertext'),
      // read after decrypt
      read_plaintext: document.querySelector('#read-plaintext'),
    };
    this.verifyDoms();
    // setup event listeners
    this.doms.write_form.addEventListener('submit', async (event) => {
      try {
        event.stopPropagation();
        this.setMode('encrypting');
        this.setStatus('encrypting plaintext');
        await this.app.encryptMsg(this.doms.write_plaintext.value);
        this.app.verifyMsgHasOnly(['plaintext', 'key', 'ciphertext']);
        this.setMsgUi();
        // TODO allow auto?
        // wait for user interaction for next step
      } catch (err) {
        console.error(err);
        this.setMode('error');
        this.setStatus(err.message);
      }
    });
    this.doms.send_form.addEventListener('submit', async (event) => {
      try {
        event.stopPropagation();
        this.app.verifyMsgHasOnly(['plaintext', 'key', 'ciphertext']);
        this.setMsgUi();
        this.setMode('sending');
        this.setStatus('sending ciphertext');
        await this.app.sendNewMsg();
        this.app.verifyMsgHasOnly(['plaintext', 'key', 'ciphertext', 'id']);
        this.setMsgUi();
        // TODO wait for user interaction for next step?
        this.setMode('sent');
        this.setStatus('sent ciphertext');
        // wait for user interaction for next step
      } catch (err) {
        console.error(err);
        this.setMode('error');
        this.setStatus(err.message);
      }
    });
  }

  verifyDoms() {
    Object.keys(this.doms).forEach((key) => {
      const dom = this.doms[key];
      if (typeof dom === 'undefined' || dom === null) {
        throw new Error(`Invalid... missing DOM Expectation: ${key}`);
      }
    });
  }

  setStatus(status) {
    this.status = status;
    this.app.status = status;
    this.doms.status.innerText = status;
  }

  setMode(mode) {
    if (MODES.indexOf(mode) === -1) {
      throw new Error(`Invalid mode: ${mode}`);
    }
    this.mode = mode;
    this.renderMode();
  }

  setMsgUi() {
    this.doms.write_key.value = this.app.msg.key;
    this.doms.write_plaintext.value = this.app.msg.plaintext;
    this.doms.write_ciphertext.value = this.app.msg.ciphertext;
    this.doms.write_url.value = this.app.getUrl();
    this.doms.write_url_link.href = this.app.getUrl();

    this.doms.read_plaintext.value = this.app.msg.plaintext;
    this.doms.read_ciphertext.value = this.app.msg.ciphertext;
    this.doms.read_key.value = this.app.msg.key;
  }

  // show a block
  styleHide(doms) {
    doms.forEach(dom => {
      dom.style.display = 'none';
    });
  }
  // show a block
  styleShow(doms) {
    doms.forEach(dom => {
      dom.style.display = 'block';
      dom.style.opacity = 1;
    });
  }
  // show a block
  styleMinimal(doms) {
    doms.forEach(dom => {
      dom.style.display = 'block';
      dom.style.opacity = 0.7;
    });
  }

  renderMode() {
    console.log('renderMode', this.mode);
    const doms = this.doms;
    this.styleHide([
      doms.load,
      doms.error,
      doms.write,
      doms.read,
    ]);
    switch (this.mode) {
      // misc
      case 'loading':
        this.styleShow([
          doms.load,
        ]);
        break;
      case 'error':
        this.styleShow([
          doms.error,
        ]);
        break;
      // author
      case 'write':
        this.styleShow([
          doms.write,
        ]);
        break;
      case 'encrypting':
        this.styleMinimal([
          doms.write,
        ]);
        this.styleShow([
          doms.sending,
        ]);
        break;
      case 'encrypted':
        this.styleMinimal([
          doms.write,
        ]);
        this.styleShow([
          doms.sending,
        ]);
        break;
      case 'sending':
        this.styleMinimal([
          doms.write,
          doms.sending,
        ]);
        this.styleShow([
          doms.sent,
        ]);
        break;
      case 'sent':
        this.styleMinimal([
          doms.write,
          doms.sending,
        ]);
        this.styleShow([
          doms.sent,
        ]);
      // reader
      case 'downloadable':
      case 'downloading':
      case 'downloaded':
      case 'decrypting':
      case 'decrypted':

      default:
        this.setStatus('Error - invalid mode');
        this.styleShow([ doms.error, ]);
    }
  }
}

