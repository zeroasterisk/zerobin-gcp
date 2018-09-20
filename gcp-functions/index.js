'use strict';


const Firestore = require('@google-cloud/firestore');

const firestore = new Firestore({
  projectId: 'zerobin-gcp',
  timestampsInSnapshots: true,
  // NOTE don't hardcode your project credentials here
  // if you have to, export the following to your shell
  // GOOGLE_APPLICATION_CREDENTIALS=<path>
  // keyFilename: '/cred/zerobin-gcp-000000000000.json',
});

// configuration for writes
const REQ_KEYS = ['ciphertext', 'ttl'];
const BAD_KEYS = ['plaintext', 'key', 'id'];
const ALLOWED_KEYS = ['ciphertext', 'ttl', 'burn', 'debug'];

/**
 * Retrieve or Store a method into Firestore
 *
 * Responds to any HTTP request.
 *
 * GET = retrieve
 * POST = store (no update)
 * DELETE = remove
 *
 * success: returns the document content in JSON format & status=200
 *    else: returns an error:<string> & status=404
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.main = (req, res) => {
  if (req.query && req.query.healthcheck) {
    return exports.healthcheck(req, res);
  }
  if (req.query && req.query.expire) {
    return exports.expire(req, res);
  }
  if (req.method === 'POST') {
    return exports.store(req, res);
  }
  if (req.method === 'DELETE') {
    return exports.delete(req, res);
  }
  return exports.retrieve(req, res);
};

/**
 * Run a super-simple healthcheck on the function
 *
 * success: returns {status: ok}
 *    else: returns an {error:<string>} & status=500
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.healthcheck = (req, res) => {
  const healthcheckType = (req.query && req.query.healthcheck) || '';
  if (healthcheckType == 'full') {
    let id = null;
    // lets do a full CRUD cycle and verify functionality
    const created = new Date().getTime();
    const expires = created + 60000;

    firestore.collection('zerobin-gcp')
      .add({ created, expires, healthcheck: true })
      .then(doc => {
        id = doc.id;
        firestore.collection('zerobin-gcp')
          .doc(id)
          .get()
          .then(doc => {
            if (!(doc && doc.exists)) {
              console.log('doc not exists', id);
              return res.status(500).send({
                status: 'error',
                error: 'Unable to find the document'
              });
            }
            const data = doc.data();
            if (!data) {
              console.log('doc no data', doc);
              return res.status(500).send({
                status: 'error',
                error: 'Found document is empty'
              });
            }
            firestore.collection('zerobin-gcp')
              .doc(id)
              .delete()
              .then(x => {
                return res.status(200).send({ status: 'ok', id });
              });
          });
      }).catch(err => {
        const error = 'Unable to retrieve the document';
        console.error(error, err);
        return res.status(500).send({ error, err });
      });
    return;
  }
  // healthcheck made it here... i guess we are ok
  return res.status(200).send({ status: 'ok' });
};

/**
 * Run a super-simple healthcheck on the function
 *
 * success: returns {status: ok}
 *    else: returns an {error:<string>} & status=500
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.expire = (req, res) => {
  purgeExpire(req.query.expire).then(() => {
    return res.status(200).send({ status: 'ok' });
  }).catch(err => {
    const error = 'Unable to process expiration';
    console.error(error, err);
    return res.status(500).send({ error, err });
  });
};

/**
 * Get a document from Firestore, by ID
 *
 * Responds to any HTTP request.
 *
 * Must have the query string param for id=<document_id> set.
 *
 * success: returns the document content in JSON format & status=200
 *    else: returns an error:<string> & status=404
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.retrieve = (req, res) => {
  if (!(req.query && req.query.id)) {
    return res.status(404).send({ error: 'No Id' });
  }
  const id = req.query.id.replace(/[^a-zA-Z0-9]/g, '').trim();
  if (!(id && id.length)) {
    return res.status(404).send({ error: 'Invalid Id' });
  }
  return firestore.collection('zerobin-gcp')
    .doc(id)
    .get()
    .then(doc => {
      if (!(doc && doc.exists)) {
        return res.status(404).send({ error: 'Unable to find the document' });
      }
      const data = doc.data();
      if (!data) {
        return res.status(404).send({ error: 'Found document is empty' });
      }
      return res.status(200).send(data);
    }).catch(err => {
      const error = 'Unable to retrieve the document';
      console.error(error, err);
      return res.status(404).send({ error, err });
    });
};

/**
 * Store a document to Firestore
 *
 * Responds to any HTTP request.
 *
 * Must have the body params: ciphertext, ttl (misc)
 * Can not include the params: plaintext, key, id (will error)
 *
 * success: returns the id JSON format & status=200
 *    else: returns an error:<string> & status=500
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.store = (req, res) => {
  const data = (req.body) || {};
  const error = exports.verify_data(data);
  if (error) {
    console.error('store rejected input', error);
    return res.status(422).send({ error });
  }
  const ttl = Number.parseInt(data.ttl);
  const burn = !!Number.parseInt(data.burn);
  const debug = !!Number.parseInt(data.debug);
  const ciphertext = (data.ciphertext || '')
    .replace(/[^a-zA-Z0-9\-_!.,; ']*/g, '')
    .trim();
  const created = new Date().getTime();
  const expires = created + (ttl * 86400000);
  // .add() will automatically assign an id
  return firestore.collection('zerobin-gcp').add({
    created,
    expires,
    ttl,
    burn,
    debug,
    ciphertext,
  }).then(doc => {
    // console.info('stored new doc id#', doc.id);
    return res.status(200).send({
      id: doc.id,
      expires,
    });
  }).catch(err => {
    const error = 'unable to store';
    console.error(error, err);
    return res.status(404).send({ error, err });
  });
};

/**
 * Delete a document from Firestore, by ID
 *
 * Responds to any HTTP request.
 *
 * Must have the query string param for id=<document_id> set.
 *
 * success: returns the document content in JSON format & status=200
 *    else: returns an error:<string> & status=404
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.delete = (req, res) => {
  if (!(req.query && req.query.id)) {
    return res.status(404).send({ error: 'No Id' });
  }
  const id = req.query.id.replace(/[^a-zA-Z0-9]/g, '').trim();
  if (!(id && id.length)) {
    return res.status(404).send({ error: 'Invalid Id' });
  }
  return firestore.collection('zerobin-gcp')
    .doc(id)
    .delete()
    .then(() => {
      return res.status(200).send({ status: 'ok' });
    }).catch(err => {
      const error = 'Unable to delete the document';
      console.error(error, err);
      return res.status(404).send({ error, err });
    });
};

/**
 * Verify incomming data for a new document
 *
 * Must have the body params: ciphertext, ttl (misc)
 * Can not include the params: plaintext, key, id (will error)
 *
 * success: returns null
 *    else: returns an error<string>
 *
 * @param {} data for the new document
 */
exports.verify_data = (data) => {
  const keys = Object.keys(data);
  const missing_req_keys = REQ_KEYS.filter(k => {
    return keys.indexOf(k) === -1
  });
  if (missing_req_keys.length) {
    return `Missing required fields: ${missing_req_keys.join(', ')}`;
  }
  const present_bad_keys = BAD_KEYS.filter(k => {
    return keys.indexOf(k) !== -1
  });
  if (present_bad_keys.length) {
    return `REJECTED fields: ${present_bad_keys.join(', ')}`;
  }
  const present_not_allowed_keys = keys.filter(k => {
    return ALLOWED_KEYS.indexOf(k) === -1
  });
  if (present_not_allowed_keys.length) {
    return `Not allowed fields: ${present_not_allowed_keys.join(', ')}`;
  }
  return null;
}

/**
 * Trash Expires
 *
 * success: returns {status:ok}
 *    else: returns an error<string>
 *
 * @param {string} optional contorl for type of expiry
 * @return {promise}
 */
const purgeExpire = (purgeType) => {
  const now = new Date().getTime();
  const db = firestore;
  const collectionRef = db.collection('zerobin-gcp');
  const batchSize = 100;
  let query = collectionRef.where('expires', '<', now);
  // useful for dev only
  // if (purgeType == 'all') {
  //   query = collectionRef;
  // } else if (purgeType == 'debug') {
  //   query = collectionRef.where('debug', '==', true);
  // } else if (purgeType == 'debug_false') {
  //   query = collectionRef.where('debug', '==', false);
  // }
  query.orderBy('__name__').limit(batchSize);
  console.log('about to return promise');
  return new Promise((resolve, reject) => {
    console.log('about to trigger deleteQueryBatch');
    deleteQueryBatch(db, query, batchSize, resolve, reject);
  });
}

/**
 * Recursivly delete "pages" of records
 *
 * function copied from docs
 * @link https://firebase.google.com/docs/firestore/manage-data/delete-data
 *
 * @param {!firestore:Collection} database connection
 * @param {!firestore:CollectionRef} query filter of the Collection
 * @param {int} page size
 * @param {function} resolve promise
 * @param {function} reject promise
 * @return void
 */

const deleteQueryBatch = (db, query, batchSize, resolve, reject) => {
  query.get()
      .then((snapshot) => {
        console.log('deleteQueryBatch');
        // When there are no documents left, we are done
        if (snapshot.size == 0) {
          return 0;
        }

        // Delete documents in a batch
        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
          console.log('.');
          batch.delete(doc.ref);
        });

        console.log('!');
        return batch.commit().then(() => {
          console.log('committed');
          return snapshot.size;
        });
      }).then((numDeleted) => {
        console.log('numDeleted', numDeleted);
        if (numDeleted === 0) {
          resolve();
          return;
        }

        // Recurse on the next process tick, to avoid
        // exploding the stack.
        console.log('recurse');
        process.nextTick(() => {
          console.log('nextTick');
          deleteQueryBatch(db, query, batchSize, resolve, reject);
        });
      })
      .catch(reject);
};
