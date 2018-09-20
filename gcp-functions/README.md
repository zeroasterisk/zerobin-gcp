# Zerobin Backend: GCP Function

This is the backend of [zerobin-gcp](../).

It is a very simple serverless function integrating
[firestore](https://cloud.google.com/firestore/)
*(next gen [datastore](https://cloud.google.com/datastore/))*
and exposing a minimal REST endpoint.

## API

The function is deployed at:

`https://us-central1-zerobin-gcp.cloudfunctions.net/main`

It exposes:

* `/main?id=<docid>` retrieve a document from the database
* `/main` POST store a document to the database
 * `ciphertext` (required) string - encrypted body to store
 * `ttl` (required) int - days to retain
 * `burn` (optional) bool - burn after reading if truthy
 * `debug` (optional) bool - show debug info in UI if truthy
* `/main?id=<docid>` DELETE deletes a document from the database
* `/main?healthcheck=1` a basic healthcheck (is the service alive?)
* `/main?healthcheck=full` an end-to-end healthcheck (can I write/read from the database?)
* `/main?expires=1` expire all old content

## Development

Install all the packages

    npm install

Use the Test suite and Linter

    npm run lint
    npm test

Install the functions-emulator

    npm install -g @google-cloud/functions-emulator
    export GOOGLE_APPLICATION_CREDENTIALS=/Users/myname/.cred/myserviceaccount.json
    functions start

Stage the application on a local emulator

    functions deploy main --trigger-http

...or use the npm script

    npm run stage

Deploy the application to GCP Functions

    gcloud functions deploy main --trigger-http

...or use the npm script

    npm run deploy
