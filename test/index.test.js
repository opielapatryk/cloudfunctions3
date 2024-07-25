import { assert } from 'chai';
import pkg from 'firebase-functions-test';
import admin from 'firebase-admin';
import { checkUserExists3 } from '../index.js';

const test = pkg({});

describe('Cloud Functions', () => {
  before(async () => {
    // Initialize Firestore
    if (!admin.apps.length) {
      admin.initializeApp();
    }
    const db = admin.firestore();

    // Add a test user
    await db.collection('users').doc('testUser').set({
      email: 'joe@doe.com',
      password_hash: 'cGFzc3dvcmQ='
    });
  });

  after(async () => {
    // Clean up Firestore
    const db = admin.firestore();
    await db.collection('users').doc('testUser').delete();
    test.cleanup();
  });

  describe('checkUserExists3', () => {
    it('should return 200 and exists true if user is found', (done) => {
      const req = {
        method: 'POST',
        body: {
          email: 'joe@doe.com',
          password_hash: 'cGFzc3dvcmQ='
        }
      };

      const res = {
        status: (code) => {
          assert.equal(code, 200);
          return {
            send: (data) => {
              assert.deepEqual(data, { exists: true });
              done();
            }
          };
        }
      };

      checkUserExists3(req, res);
    });

    it('should return 403 and exists false if user is not found', (done) => {
      const req = {
        method: 'POST',
        body: {
          email: 'nonexistent@user.com',
          password_hash: 'invalidpasswordhash'
        }
      };

      const res = {
        status: (code) => {
          assert.equal(code, 403);
          return {
            send: (data) => {
              assert.deepEqual(data, { exists: false });
              done();
            }
          };
        }
      };

      checkUserExists3(req, res);
    });

    it('should return 405 if method is not POST', (done) => {
      const req = {
        method: 'GET'
      };

      const res = {
        status: (code) => {
          assert.equal(code, 405);
          return {
            send: (message) => {
              assert.equal(message, 'Method Not Allowed');
              done();
            }
          };
        }
      };

      checkUserExists3(req, res);
    });

    it('should return 400 if email or password_hash is missing', (done) => {
      const req = {
        method: 'POST',
        body: {}
      };

      const res = {
        status: (code) => {
          assert.equal(code, 400);
          return {
            send: (message) => {
              assert.equal(message, 'Email and password_hash are required');
              done();
            }
          };
        }
      };

      checkUserExists3(req, res);
    });

  });
});