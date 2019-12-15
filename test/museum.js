const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiShallowDeepEqual = require('chai-shallow-deep-equal');

const server = require('../bin/server');
const Museum = require('../models/museum');
const museums = require('./fixtures/museums');
const authorization = require('./fixtures/authorization');

chai.use(chaiHttp);
chai.use(chaiShallowDeepEqual);

const expect = chai.expect;

deepFreeze(museums);

describe('Museum', function () {
  beforeEach(async function () {
    await Museum.deleteMany({});
  });

  describe('GET /museum', function () {
    it('reading all museums from an empty museum collection should succeed', async function () {

      // GIVEN  the empty database

      // WHEN   reading all museums

      const getResponse = await chai.request(server)
        .get('/api/v2/museum');

      // THEN   the server should return an HTTP 200 OK
      // AND    the JSON response should be an empty array

      expect(getResponse).to.have.status(200);
      expect(getResponse.body).to.be.an('array').that.is.empty;
    });

    it('reading all museums from a non-empty museum collection should succeed', async function () {

      // GIVEN  a database with an existing museum

      const existingMuseum = museums['louvre'];

      await Museum.create(existingMuseum);

      // WHEN   reading all museums

      const getResponse = await chai.request(server)
        .get('/api/v2/museum');

      // THEN   the server should return an HTTP 200 OK
      // AND    the JSON response should be an array containing the existing museum

      expect(getResponse).to.have.status(200);
      expect(getResponse.body).to.be.an('array').of.length(1);
      expect(getResponse.body[0]).to.shallowDeepEqual(existingMuseum);
    });
  });

  describe('POST /museum', function () {
    it('creating a complete museum should succeed', async function () {

      // GIVEN  the empty database
      // AND    a new, complete museum

      const newMuseum = museums['louvre'];

      // WHEN   creating the new museum

      const postResponse = await chai.request(server)
        .post('/api/v2/museum')
        .set({ 'Authorization': authorization })
        .send(newMuseum);

      // THEN   the server should return an HTTP 201 Created
      // AND    the JSON response should be the new museum
      // AND    the database should contain the new museum

      expect(postResponse).to.have.status(201);
      expect(postResponse.body).to.shallowDeepEqual(newMuseum);

      const dbMuseumsAfter = await Museum.find();
      expect(dbMuseumsAfter).to.be.an('array').of.length(1);
      expect(dbMuseumsAfter[0]).to.shallowDeepEqual(newMuseum);
    });

    it('creating a museum with a missing, required property should fail', async function () {

      // GIVEN  the empty database
      // AND    a new museum with a missing, required property

      const newMuseum = copy(museums['louvre']);
      delete newMuseum.logo.filename;

      // WHEN   trying to create the new museum

      const postResponse = await chai.request(server)
        .post('/api/v2/museum')
        .set({ 'Authorization': authorization })
        .send(newMuseum);

      // THEN   the server should return an HTTP 500 Internal Server Error
      // AND    the database shouldn't contain new the museum

      expect(postResponse).to.have.status(500);

      const dbMuseumsAfter = await Museum.find();
      expect(dbMuseumsAfter).to.be.an('array').that.is.empty;
    });

    it('creating a museum with a missing, non-required property should succeed', async function () {

      // GIVEN  the empty database
      // AND    a new museum with a missing, non-required property

      const newMuseum = museums['louvre'];
      delete newMuseum.logo;

      // WHEN   creating the new museum

      const postResponse = await chai.request(server)
        .post('/api/v2/museum')
        .set({ 'Authorization': authorization })
        .send(newMuseum);

      // THEN   the server should return an HTTP 201 Created
      // AND    the JSON response should be the new museum
      // AND    the database should contain the new museum

      expect(postResponse).to.have.status(201);
      expect(postResponse.body).to.shallowDeepEqual(newMuseum);

      const dbMuseumsAfter = await Museum.find();
      expect(dbMuseumsAfter).to.be.an('array').of.length(1);
      expect(dbMuseumsAfter[0]).to.shallowDeepEqual(newMuseum);
    });
  });

  describe('GET /museum/{{museum_id}}', function () {
    it('reading an existing museum should succeed', async function () {

      // GIVEN  a database with an existing museum

      const existingMuseum = museums['louvre'];
      const dbExistingMuseum = await Museum.create(existingMuseum);
      const existingMuseumId = dbExistingMuseum._id;

      // WHEN   reading the existing museum

      const readResponse = await chai.request(server)
        .get(`/api/v2/museum/${existingMuseumId}`);

      // THEN   the server should return an HTTP 200 OK
      // AND    the JSON response should return the existing museum

      expect(readResponse).to.have.status(200);
      expect(readResponse.body).to.shallowDeepEqual(existingMuseum);
    });

    it('reading a non-existing museum should fail', async function () {

      // GIVEN  the empty database
      // AND    a non-existing ID

      const nonExistingId = '012345678901234567890123';

      // WHEN   trying to read the non-existing museum

      const readResponse = await chai.request(server)
        .get(`/api/v2/museum/${nonExistingId}`);

      // THEN   the server should return an HTTP 404 Not Found

      expect(readResponse).to.have.status(404);
    });
  });

  describe('PUT /museum/{{museum_id}}', function () {
    it('replacing an existing museum should succeed', async function () {

      // GIVEN  a database with an existing museum
      // AND    a new museum

      const existingMuseum = museums['louvre'];
      const dbExistingMuseum = await Museum.create(existingMuseum);
      const existingMuseumId = dbExistingMuseum._id;

      const newMuseum = museums['germanMuseum'];

      // WHEN   replacing the existing museum with the new one

      const putResponse = await chai.request(server)
        .put(`/api/v2/museum/${existingMuseumId}`)
        .set({ 'Authorization': authorization })
        .send(newMuseum);

      // THEN   the server should return an HTTP 200
      // AND    the JSON response should contain the old museum
      // AND    the database should contain the new museum

      expect(putResponse).to.have.status(200);
      expect(putResponse.body).to.shallowDeepEqual(existingMuseum);

      const dbMuseumsAfter = await Museum.find();
      expect(dbMuseumsAfter).to.be.an('array').of.length(1);
      expect(dbMuseumsAfter[0]).to.shallowDeepEqual(newMuseum);
    });

    it('replacing a non-existing museum should fail', async function () {

      // GIVEN  the empty database
      // AND    a non-existing ID
      // AND    a new museum

      const nonExistingId = '012345678901234567890123';
      const newMuseum = museums['germanMuseum'];

      // WHEN   trying to replace the non-existing museum with the new one

      const putResponse = await chai.request(server)
        .put(`/api/v2/museum/${nonExistingId}`)
        .set({ 'Authorization': authorization });

      // THEN   the server should return an HTTP 404 Not Found
      // AND    the database shouldn't contain a museum

      expect(putResponse).to.have.status(404);

      const dbMuseumsAfter = await Museum.find();
      expect(dbMuseumsAfter).to.be.an('array').that.is.empty;
    });
  });

  describe('DELETE /museum/{{museum_id}}', function () {
    it('deleting an existing museum should succeed', async function () {

      // GIVEN  a database with an existing museum

      const existingMuseum = museums['louvre'];
      const dbExistingMuseum = await Museum.create(existingMuseum);
      const existingMuseumId = dbExistingMuseum._id;

      // WHEN   deleting the existing museum

      const deleteResponse = await chai.request(server)
        .delete(`/api/v2/museum/${existingMuseumId}`)
        .set({ 'Authorization': authorization });

      // THEN   the server should return an HTTP 200
      // AND    the JSON response should contain the old museum
      // AND    the database should contain no museums anymore

      expect(deleteResponse).to.have.status(200);
      expect(deleteResponse.body).to.shallowDeepEqual(existingMuseum);

      const dbMuseumsAfter = await Museum.find();
      expect(dbMuseumsAfter).to.be.an('array').that.is.empty;
    });

    it('deleting a non-existing museum should fail', async function () {

      // GIVEN  the empty database
      // AND    a non-existing ID

      const nonExistingId = '012345678901234567890123';

      // WHEN   trying to delete the non-existing museum

      const deleteResponse = await chai.request(server)
        .delete(`/api/v2/museum/${nonExistingId}`)
        .set({ 'Authorization': authorization });

      // THEN   the server should return an HTTP 404 Not Found

      expect(deleteResponse).to.have.status(404);
    });
  });
});

function deepFreeze(object) {

  // Retrieve the property names defined on object
  const propNames = Object.getOwnPropertyNames(object);

  // Freeze properties before freezing self

  for (let name of propNames) {
    let value = object[name];

    object[name] = value && typeof value === "object" ?
      deepFreeze(value) : value;
  }

  return Object.freeze(object);
}

function copy(object) {
  return JSON.parse(JSON.stringify(object));
}
