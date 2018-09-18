
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
    export GOOGLE_APPLICATION_CREDENTIALS=/Users/alanblount/.cred/myserviceaccount.json
    functions start
    functions deploy main --trigger-http

In this case, `main` is the name of the function you want to trigger in your code, triggered by a HTTP request.

NOTE: if you're on zsh, you may not be able to execute `functions`.
Either start bash, or execute `sh -c 'which functions'` to find the proper path for you.
eg: `/Users/alanblount/.npm-global/bin/functions`

Now you can test your function by sending `curl` requests

    curl http://localhost:8010/zerobin-gcp/us-central1/main?healthcheck=full
    {"status":"ok}

You can create a new document:

    curl --header "Content-Type: application/json" \
      --request POST \
      --data '{"ttl":1,"ciphertext":"daa5370871aa301e5e12d4274d80691f75e295d648aa84b73e291d8c82"}' \
      http://localhost:8010/zerobin-gcp/us-central1/main
    {"id":"wLcIOzic6BeoEk3tV4sH","expires":"2018-09-15T23:50:19.043Z"}

And retrieve that document:

    curl http://localhost:8010/zerobin-gcp/us-central1/main?id=wLcIOzic6BeoEk3tV4sH
    {"created":{"_seconds":1536969019,"_nanoseconds":43000000},"expires":{"_seconds":1537055419,"_nanoseconds":43000000},"burn":false,"debug":false,"ttl":1,"ciphertext":"daa5370871aa301e5e12d4274d80691f75e295d648aa84b73e291d8c82"}

NOTE that our function added a few fields like `created` and `expires`.

### Deploy the Function to GCP Functions

This is very easy thanks to the gcloud SDK.

    gcloud functions deploy main --trigger-http

In this case, `main` is the name of the function you want to trigger in your code, triggered by a HTTP request.

    Deploying function (may take a while - up to 2 minutes)...done.
    availableMemoryMb: 256
    entryPoint: main
    httpsTrigger:
      url: https://us-central1-zerobin-gcp.cloudfunctions.net/main
    labels:
      deployment-tool: cli-gcloud
    name: projects/zerobin-gcp/locations/us-central1/functions/main
    runtime: nodejs6
    serviceAccountEmail: zerobin-gcp@appspot.gserviceaccount.com
    sourceUploadUrl: https://storage.googleapis.com/gcf-upload-us-central1-00000000-0000-0000-0000-000000000000/00000000-0000-0000-0000-000000000000.zip?GoogleAccessId=service-000000000000@gcf-admin-robot.iam.gserviceaccount.com....
    status: ACTIVE
    timeout: 60s
    updateTime: '2018-09-15T01:25:59Z'
    versionId: '2'

NOTE: If you used the emulator above, you can simply prefix the command with `gcloud`

There are other options, including automatically building and deploying based on a git repo.

## Test out the production function

You should now be able to send HTTP requests to the endpoint and test out the function in production.


