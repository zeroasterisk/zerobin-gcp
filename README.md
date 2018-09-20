# Zerobin GCP

Send sensitive information, fully encrypted in the browser, key unknown by server.

This is a functional clone of http://sebsauvage.net/paste/

## Features

* super-minimal code footprint, all open source for review
* client side key generation and encryption of content
* transmit only encrypted data
* store only encrypted data
* stored data purged after TTL

## Frontend / UI

[web](./web) is an old-school minimalist single-page-app with as few dependencies as possible. (trying to reduce the security audit footprint)

## Backend

[gcp-functions](./gcp-functions) is a very simple serverless function integrating
[firestore](https://cloud.google.com/firestore/)
*(next gen [datastore](https://cloud.google.com/datastore/))*
and exposing a minimal REST endpoint.

## Roadmap

- [x] build proof of concept client code, using window.crypto.subtle
- [x] build basic GCP Function code to store/retrieve/manage data
- [ ] flesh out client code to provide basic functionality
- [ ] implement material design / make pretty
- [ ] refactor to PWA / make it fast



