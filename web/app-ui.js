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
      tab_write: document.querySelector('#tab-write'),
      tab_encrypt: document.querySelector('#tab-encrypt'),
      tab_send: document.querySelector('#tab-send'),
      // write before encrypt
      writing: document.querySelector('#writing'),
      write_form: document.querySelector('#write-form'),
      write_plaintext: document.querySelector('#write-plaintext'),
      write_ttl: document.querySelector('#write-ttl'),
      write_burn: document.querySelector('#write-burn'),
      write_debug: document.querySelector('#write-debug'),
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
      tab_download: document.querySelector('#tab-download'),
      tab_decrypt: document.querySelector('#tab-decrypt'),
      // read before decrypt
      read_form: document.querySelector('#read-form'),
      read_key: document.querySelector('#read-key'),
      read_ciphertext: document.querySelector('#read-ciphertext'),
      // read after decrypt
      read_plaintext: document.querySelector('#read-plaintext'),
    };
    this.verifyDoms();
    // setup event listeners
    window.addEventListener("hashchange", this.onHashChange.bind(this), false);
    this.doms.write_form.addEventListener('submit', this.onWriteForm.bind(this));
    this.doms.send_form.addEventListener('submit', this.onSendForm.bind(this));
  }

  initialize() {
    this.app.loadFromUrl();
    setTimeout(this.onHashChange.bind(this), 30);
  }

  onHashChange() {
    try {
      const hash = window.location.hash;
      console.log('onhashchange', hash);
      if (!hash || hash === '#' || hash === '#new') return this.onReset();
      if (hash === '#about') return this.onAbout();
      // writing
      if (hash === '#writing-panel'
        || hash === '#encrypt-panel'
        || hash === '#sent-panel') return null;
      // reading
      // if (hash === '#download-panel'
      //   || hash === '#decrypt-panel') return null;
      return this.onStartRead();
    } catch (err) {
      console.error(err);
      this.setMode('error');
      this.setStatus(err.message);
    }
  }

  onReset(event) {
    try {
      if (event) event.stopPropagation();
      this.setMode('write');
      this.setStatus('enter your plaintext');
      this.app.setMsgNew();
      this.app.verifyMsgHasOnly([]);
      this.setMsgUi();
    } catch (err) {
      console.error(err);
      this.setMode('error');
      this.setStatus(err.message);
    }
  }

  async onWriteForm(event) {
    try {
      if (event) event.stopPropagation();
      this.setMode('encrypting');
      this.setStatus('encrypting plaintext');
      await this.app.encryptMsg({
        plaintext: this.doms.write_plaintext.value,
        ttl: this.doms.write_ttl.value,
        burn: this.doms.write_burn.checked,
        debug: this.doms.write_debug.checked,
      });
      this.app.verifyMsgHasOnly(['plaintext', 'key', 'ciphertext', 'ttl']);
      this.setMsgUi();
      if (!this.app.msg.debug) {
        this.onSendForm();
      }
    } catch (err) {
      console.error(err);
      this.setMode('error');
      this.setStatus(err.message);
    }
  }

  async onSendForm(event) {
    try {
      if (event) event.stopPropagation();
      this.app.verifyMsgHasOnly(['plaintext', 'key', 'ciphertext', 'ttl']);
      this.setMsgUi();
      this.setMode('sending');
      this.setStatus('sending ciphertext');
      await this.app.sendNewMsg();
      this.app.verifyMsgHasOnly(['plaintext', 'key', 'ciphertext', 'ttl', 'id']);
      this.setMsgUi();
      // TODO wait for user interaction for next step?
      this.setMode('sent');
      this.setStatus('sent ciphertext');
      if (!this.app.msg.debug) {
        this.onGoForm();
      }
    } catch (err) {
      console.error(err);
      this.setMode('error');
      this.setStatus(err.message);
    }
  }

  async onGoForm(event) {
    try {
      if (event) event.stopPropagation();
      this.app.verifyMsgHasOnly(['plaintext', 'key', 'ciphertext', 'ttl', 'id']);
      this.setMsgUi();
      this.setMode('loading');
      this.setStatus('loading the "read" interface');
      const msg = this.app.msg;
      window.location.replace(`/${msg.id}#${msg.key}`)
      // clear out the msg
      // this.app.setMsgNew();
      // loadFromUrl();
      if (!this.app.msg.debug) {
        this.onLoadForm();
      }
    } catch (err) {
      console.error(err);
      this.setMode('error');
      this.setStatus(err.message);
    }
  }

  // auto-load onto the "read" interface
  async onLoadForm(event) {
    try {
      if (event) event.stopPropagation();
      this.setMode('downloadable');
      this.setStatus('read ciphertext');
      if (!this.app.msg.debug) {
        // this.onGoForm();
      }
    } catch (err) {
      console.error(err);
      this.setMode('error');
      this.setStatus(err.message);
    }
  }

  // this is a downloadable status
  async onStartRead(event) {
    try {
      if (event) event.stopPropagation();
      this.setMode('downloadable');
      this.setStatus('reading URL data');
      this.app.setMsgNew();
      this.app.loadFromUrl();
      if (this.app.msg.key) {
        this.app.verifyMsgHasOnly(['key', 'id']);
      } else {
        this.app.verifyMsgHasOnly(['id']);
      }
      this.setMsgUi();
      // start downloading
      this.setMode('downloading');
      this.setStatus('downloading from server');
      // TODO download from server
      this.setMsgUi();
    } catch (err) {
      console.error(err);
      this.setMode('error');
      this.setStatus(err.message);
    }
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
      console.error(mode);
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
        doms.tab_write.click();
        break;
      case 'encrypting':
        this.styleShow([
          doms.write,
          doms.sending,
        ]);
        doms.tab_encrypt.click();
        break;
      case 'encrypted':
        this.styleShow([
          doms.write,
          doms.sending,
        ]);
        doms.tab_encrypt.click();
        break;
      case 'sending':
        this.styleShow([
          doms.write,
          doms.sending,
          doms.sent,
        ]);
        doms.tab_send.click();
        break;
      case 'sent':
        this.styleShow([
          doms.write,
          doms.sending,
          doms.sent,
        ]);
        doms.tab_send.click();
        break;
      // reader
      case 'downloadable':
      case 'downloading':
        this.styleShow([
          doms.read,
          doms.load,
        ]);
        doms.tab_download.click();
        break;
      case 'downloaded':
        this.styleShow([
          doms.read,
        ]);
        doms.tab_download.click();
        break;
      case 'decrypting':
      case 'decrypted':
        this.styleShow([
          doms.read,
        ]);
        doms.tab_decrypt.click();
        break;

      default:
        this.setStatus('Error - invalid mode');
        this.styleShow([ doms.error, ]);
    }
  }
}

