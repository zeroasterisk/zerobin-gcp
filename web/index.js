import msgWrite from './msg_write';
// import msgRead from './msg_read';

import {
  // onClickWrite,
  getKeyRead,
} from './ui';

// loading, or reading, or writing
async function main() {
  try {
    const doms = {
      load: document.querySelector('#load'),
      write: document.querySelector('#write'),
      write_ta: document.querySelector('#write-ta'),
      write_btn: document.querySelector('#write-btn'),
      write_form: document.querySelector('#write-form'),
      read: document.querySelector('#read'),
      read_ta: document.querySelector('#read-ta'),
    };
    // setup event listeners
    doms.write_form.addEventListener('submit', async (event) => {
      doms.write_ta.disabled = true;
      doms.write_btn.disabled = true;
      console.log('onClickWrite', doms.write_ta.value);
      const key = await msgWrite(doms.write_ta.value);
      console.log('got key', key);
      // TODO switch URL & UI
    });
    // what are we doing on this pageload
    doms.load.style.display = 'block';
    doms.write.style.display = 'none';
    doms.read.style.display = 'none';
    // const KeyRead = await getKeyRead();
    const KeyRead = getKeyRead();
    if (KeyRead) {
      // show read UI
      doms.load.style.display = 'none';
      doms.write.style.display = 'none';
      doms.read.style.display = 'block';
      doms.read_ta.disabled = false;
    } else {
      // show write UI
      doms.load.style.display = 'none';
      doms.write.style.display = 'block';
      doms.read.style.display = 'none';
      doms.write_ta.disabled = false;
      doms.write_btn.disabled = false;
    }
    // const pkg = await fetch('http://localhost:8080/package.json')
    // const data = await pkg.json()
    // document.querySelector('pre').textContent = JSON.stringify(data, null, 2)
    // document.querySelector('p').textContent = 'Success!'
  } catch (err) {
    console.error('something went wrong in main()', err);
  }
}

document.addEventListener('DOMContentLoaded', main);
