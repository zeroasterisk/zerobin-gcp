'use strict';


const Firestore = require('@google-cloud/firestore');

const firestore = new Firestore({
  projectId: 'zerobin-gcp',
  // keyFilename: '/cred/zerobin-gcp-283c585d8a86.json',
  timestampsInSnapshots: true,
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
  if (req.method === 'POST') {
    return exports.store(req, res);
  }
  if (req.method === 'DELETE') {
    throw 'not yet built';
  }
  return exports.retrieve(req, res);
}

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
  const idRaw = (req.query && req.query.id) || '';
  const id = `${idRaw}`.replace(/[^a-zA-Z0-9\-\_]/g, '').trim();
  if (!(id && id.length)) {
    return res.status(404).send({ error: 'No Id' });
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
      return res.status(404).send({ error: 'Unable to retrieve the document' });
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
  const ciphertext = data.ciphertext.trim();
  const created = new Date();
  const expires = new Date();
  expires.setTime(created.getTime() + (ttl * 86400000));

  return firestore.collection('zerobin-gcp').add({
    created,
    expires,
    ttl,
    burn,
    debug,
    ciphertext,
  }).then(doc => {
    // console.log('stored new doc', doc);
    return res.status(200).send({
      id: doc.id,
      expires,
    });
  }).catch(err => {
    console.error('unable to store', err)
    // return res.status(404).send({ error: err });
    return res.status(404).send({ error: 'Unable to store', err });
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

