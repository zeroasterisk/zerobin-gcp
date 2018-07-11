# Zerobin GCP

Send sensitive information, fully encrypted in the browser, key unknown by server.

This is a functional clone of http://sebsauvage.net/paste/

## Features

* super-minimal code footprint, all open source for review
* client side key generation and encryption of content
* transmit only encrypted data
* store only encrypted data
* stored data purged after TTL

## Roadmap

- [ ] build proof of concept client code, using window.crypto.subtle
- [ ] build basic GCP Function code to store data
- [ ] build basic GCP Function code to retrieve data
- [ ] flesh out client code to provide basic functionality
- [ ] implement material design / make pretty
- [ ] refactor to PWA / make it fast
 - https://mithril.js.org/
 - https://github.com/developit/preact-cli/
 - https://github.com/paulhoughton/preact-pwa



