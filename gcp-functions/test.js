// application code
import func from './index';

// ava test framework
import test from 'ava';

// mocks needed for easy testing
import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';

// mock app - pretending to be instrumented through a function
const app = express()
  .use(bodyParser.json())
  .get('/retrieve', func.retrieve)
  .post('/store', func.store)
  .all('/', func.main);

// hardcoded fixture ids (must exist in the firestore)
const FIX_ID_1 = 'CgnTycJHTErpuFaSnb9Z';

test('retrieve gives 404 without an id', async t => {
  const res = await request(app)
    .get('/retrieve')
    .query({})
    .catch(e => f.fail(e));

  t.is(res.status, 404);
  t.is(res.body.error, 'No Id');
});
test('retrieve gives 404 without a blank id', async t => {
  const res = await request(app)
    .get('/retrieve')
    .query({ id: '' })
    .catch(e => f.fail(e));

  t.is(res.status, 404);
  t.is(res.body.error, 'No Id');
});
test('retrieve gives 404 with a bogus id', async t => {
  const res = await request(app)
    .get('/retrieve')
    .query({ id: 'bogus' })
    .catch(e => f.fail(e));

  t.is(res.status, 404);
  t.is(res.body.error, 'Unable to find the document');
});
test('retrieve fixture document with 200', async t => {
  const res = await request(app)
    .get('/retrieve')
    .query({ id: FIX_ID_1 })
    .catch(e => f.fail(e));

  t.is(res.status, 200);
  t.is(typeof res, 'object');
  t.is(typeof res.body, 'object');
  delete res.body.created
  delete res.body.expires
  t.deepEqual(res.body, {
    ciphertext: 'daa5370871aa301e5e12d4274d80691f75e295d648aa84b73e291d8c82',
    key: '65eaa9ba497f4527eb6a3131265e7439',
    ttl: 99,
  });
});

test('verify_data should return null if valid data passed in', t => {
  t.is(func.verify_data({
    ciphertext: '000000000',
    debug: 1,
    burn: 1,
    ttl: 2,
  }), null);
});
test('verify_data should return an error if a bad field is passed', t => {
  t.is(func.verify_data({
    key: 'x',
    ciphertext: '000000000',
    debug: 1,
    burn: 1,
    ttl: 2,
  }), 'REJECTED fields: key');
});
test('verify_data should return an error if 2 bad fields are passed', t => {
  t.is(func.verify_data({
    plaintext: 'x',
    key: 'x',
    ciphertext: '000000000',
    ttl: 2,
  }), 'REJECTED fields: plaintext, key');
});
test('verify_data should return an error if extra not-allowed fields are passed', t => {
  t.is(func.verify_data({
    junk: 'x',
    ciphertext: '000000000',
    ttl: 2,
  }), 'Not allowed fields: junk');
});
test('verify_data should return an error if ciphertext missing', t => {
  t.is(func.verify_data({
    ttl: 2,
  }), 'Missing required fields: ciphertext');
});
test('verify_data should return an error if ciphertext & ttl missing', t => {
  t.is(func.verify_data({
  }), 'Missing required fields: ciphertext, ttl');
});

test('store a valid fake document with 200, return just the id and expires date', async t => {
  const res = await request(app)
    .post('/store')
    .send({
      ciphertext: '000000000',
      ttl: 2,
    })
    .set('Accept', 'application/json')
    .catch(e => f.fail(e));

  // t.is(res.status, 200);
  t.is(typeof res, 'object');
  t.is(typeof res.body, 'object');
  console.log('response', res.body);
  t.is(res.body.error, undefined);
  t.is(typeof res.body.id, 'string');
  // t.is(typeof res.body.expires, 'date');
});

test('full cycle of store/write', async t => {
  const res1 = await request(app)
    .post('/store')
    .send({
      ciphertext: '000000000',
      ttl: 2,
    })
    .set('Accept', 'application/json')
    .catch(e => f.fail(e));

  t.is(res1.status, 200);
  t.is(typeof res1, 'object');
  t.is(typeof res1.body, 'object');
  t.is(typeof res1.body.error, 'undefined');
  t.is(typeof res1.body.id, 'string');

  const id = res1.body.id;

  const res2 = await request(app)
    .get('/retrieve')
    .query({ id })
    .catch(e => f.fail(e));

  t.is(res2.status, 200);
  t.is(typeof res2, 'object');
  t.is(typeof res2.body, 'object');
  delete res2.body.created
  delete res2.body.expires
  t.deepEqual(res2.body, {
    burn: false,
    debug: false,
    ciphertext: '000000000',
    ttl: 2,
  });
});

