
## Setup Our Function Code

For this simple example, we are going to store and retrieve a basic payload.

You can find the
[whole codebase on github](..)
or follow along to build it yourself _(it's easy)_.

### Start a new npm app

    npm init

### Install @google-cloud/firestore

We are using
[Google Cloud Firestore](https://cloud.google.com/firestore/)
to store data.  Let's add the client to our node app.

    npm install --save --save-exact @google-cloud/firestore

### Code app

TODO... (simplfy copy/paste)

## Deploy the Function

### configure gcloud project Id

    gcloud config set project <projectid>

### (optional) Install functions-emulator for local testing

Testing things is nice.  You can install a local emulator for Google Cloud Functions.

    npm install -g @google-cloud/functions-emulator


    functions start

NOTE: if you're on zsh, you may not be able to execute `functions`.
Either start bash, or execute `sh -c 'which functions'` to find the proper path for you.
eg: `/Users/alanblount/.npm-global/bin/functions`

Now you can test your function by sending `curl` requests

  TODO example
