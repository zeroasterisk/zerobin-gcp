'use strict';


const Firestore = require('@google-cloud/firestore');

const firestore = new Firestore({
  // projectId: 'zerobin-gcp',
  // keyFilename: '/cred/zerobin-gcp-283c585d8a86.json',
});

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
  const id = (req.query && req.query.id) || null;
  if (!(id && id.length)) {
    return res.status(404).send({ error: 'No Id' });
  }
  const document = firestore.doc(`zerobin-gcp/${id}`);
  return document.get().then(doc => {
    return res.status(200).send(doc);
  }).catch(err => {
    return res.status(404).send({ error: 'unable to find the document' });
  });
};

const REQ_KEYS = ['ciphertext', 'ttl'];
const BAD_KEYS = ['plaintext', 'key', 'id'];
const ALLOWED_KEYS = ['ciphertext', 'ttl', 'burn', 'debug'];

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
  const keys = Object.keys(data);
  const missing_req_keys = REQ_KEYS.filter(k => {
    return keys.indexOf(k) === -1
  });
  if (missing_req_keys.length) {
    return res.status(422).send({ error: `Missing required fields: ${missing_req_keys.join(', ')}` });
  }
  const present_bad_keys = BAD_KEYS.filter(k => {
    return keys.indexOf(k) !== -1
  });
  if (present_bad_keys.length) {
    return res.status(422).send({ error: `NOT allowed fields: ${missing_req_keys.join(', ')}` });
  }
  const present_not_allowed_keys = keys.filter(k => {
    return ALLOWED_KEYS.indexOf(k) !== -1
  });
  if (present_bad_keys.length) {
    return res.status(422).send({ error: `Not allowed fields: ${missing_req_keys.join(', ')}` });
  }
  const ttl = Number.parseInt(data.ttl);
  const burn = Number.parseInt(data.burn);
  const debug = Number.parseInt(data.debug);
  const ciphertext = data.ciphertext.trim();

  return firestore.collection('zerobin-gcp').add({
    ttl,
    burn,
    debug,
    ciphertext,
  }).then(doc => {
    return res.status(200).send({ id: doc.id });
  }).catch(err => {
    return res.status(404).send({ error: 'unable to find the document' });
  });
};

