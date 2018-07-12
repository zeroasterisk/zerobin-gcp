import App from './app';
import AppUi from './app-ui';
// import msgRead from './msg_read';

// loading, or reading, or writing
async function main() {
  try {
    const app = new App();
    const appUi = new AppUi(app);
    console.log('app', app);
    console.log('appUi', appUi);
    app.loadFromUrl();
    appUi.setMode(app.determineMode());
  } catch (err) {
    console.error('something went wrong in main()', err);
  }
}

document.addEventListener('DOMContentLoaded', main);
