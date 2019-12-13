const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiShallowDeepEqual = require('chai-shallow-deep-equal');

const server = require('../bin/server');
const Museum = require('../models/museum');
const Exposition = require('../models/exposition');
const museums = require('./fixtures/museums');
const expositions = require('./fixtures/expositions');
const authorization = require('./fixtures/authorization');

chai.use(chaiHttp);
chai.use(chaiShallowDeepEqual);

const expect = chai.expect;

deepFreeze(museums);
deepFreeze(expositions);

describe('Exposition', function () {
  beforeEach(async function () {
    await Museum.deleteMany({});
    await Exposition.deleteMany({});
  });

  describe('GET /exposition', function () {
    it('reading all expositions from an empty exposition collection should succeed', async function () {

      // GIVEN  the empty database

      // WHEN   reading all expositions

      const getResponse = await chai.request(server)
        .get('/api/v2/exposition');

      // THEN   the server should return an HTTP 200 OK
      // AND    the JSON response should be an empty array

      expect(getResponse).to.have.status(200);
      expect(getResponse.body).to.be.an('array').that.is.empty;
    });

    it('reading all expositions from a non-empty exposition collection should succeed', async function () {

      // GIVEN  a database with an existing exposition

      const existingMuseum = museums['louvre'];
      const dbExistingMuseum = await Museum.create(existingMuseum);
      const existingMuseumId = dbExistingMuseum._id.toString();

      const existingExposition = copy(expositions['bestOfLeonardoDaVinci']);
      existingExposition.museum = existingMuseumId;
      await Exposition.create(existingExposition);

      // WHEN   reading all expositions

      const getResponse = await chai.request(server)
        .get('/api/v2/exposition');

      // THEN   the server should return an HTTP 200 OK
      // AND    the JSON response should be an array containing the existing exposition

      expect(getResponse).to.have.status(200);
      expect(getResponse.body).to.be.an('array').of.length(1);
      expect(getResponse.body[0]).to.shallowDeepEqual(existingExposition);
    });
  });

  describe('POST /exposition', function () {
    it('creating a complete exposition should succeed', async function () {

      // GIVEN  a database with a museum
      // AND    a new, complete exposition

      const existingMuseum = museums['louvre'];
      const dbExistingMuseum = await Museum.create(existingMuseum);
      const existingMuseumId = dbExistingMuseum._id.toString();

      const newExposition = copy(expositions['bestOfLeonardoDaVinci']);
      newExposition.museum = existingMuseumId;

      // WHEN   creating the new exposition

      const postResponse = await chai.request(server)
        .post('/api/v2/exposition')
        .set({ 'Authorization': authorization })
        .send(newExposition);

      // THEN   the server should return an HTTP 201 Created
      // AND    the JSON response should be the new exposition
      // AND    the database should contain the new exposition

      expect(postResponse).to.have.status(201);
      expect(postResponse.body).to.shallowDeepEqual(newExposition);

      const dbExpositionsAfter = await Exposition.find();
      expect(dbExpositionsAfter).to.be.an('array').of.length(1);
      // TODO: check content, check for super set not working because dates are stored differently
      // expect(dbExpositionsAfter[0]).to.shallowDeepEqual(newExposition);
    });

    it('creating an exposition with a missing, required property should fail', async function () {

      // GIVEN  a database with a museum
      // AND    a new exposition with a missing, required property: the museum

      const existingMuseum = museums['louvre'];
      const dbExistingMuseum = await Museum.create(existingMuseum);
      const existingMuseumId = dbExistingMuseum._id.toString();

      const newExposition = copy(expositions['bestOfLeonardoDaVinci']);
      newExposition.museum = existingMuseumId;
      delete newExposition.code;

      // WHEN   trying to create the new exposition

      const postResponse = await chai.request(server)
        .post('/api/v2/exposition')
        .set({ 'Authorization': authorization })
        .send(newExposition);

      // THEN   the server should return an HTTP 500 Internal Server Error
      // AND    the database shouldn't contain new the exposition

      expect(postResponse).to.have.status(500);

      const dbExpositionsAfter = await Exposition.find();
      expect(dbExpositionsAfter).to.be.an('array').that.is.empty;
    });

    it('creating an exposition with a missing, non-required property should succeed', async function () {

      // GIVEN  a database with a museum
      // AND    a new exposition with a missing, non-required property

      const existingMuseum = museums['louvre'];
      const dbExistingMuseum = await Museum.create(existingMuseum);
      const existingMuseumId = dbExistingMuseum._id.toString();

      const newExposition = copy(expositions['bestOfLeonardoDaVinci']);
      newExposition.museum = existingMuseumId;
      delete newExposition.note;

      // WHEN   creating the new exposition

      const postResponse = await chai.request(server)
        .post('/api/v2/exposition')
        .set({ 'Authorization': authorization })
        .send(newExposition);

      // THEN   the server should return an HTTP 201 Created
      // AND    the JSON response should be the new exposition
      // AND    the database should contain the new exposition

      expect(postResponse).to.have.status(201);
      expect(postResponse.body).to.shallowDeepEqual(newExposition);

      const dbExpositionsAfter = await Exposition.find();
      expect(dbExpositionsAfter).to.be.an('array').of.length(1);
      // TODO: check content, check for super set not working because dates are stored differently
      // expect(dbExpositionsAfter[0]).to.shallowDeepEqual(newExposition);
    });
  });

  describe('GET /exposition/{{exposition_id}}', function () {
    it('reading an existing exposition should succeed', async function () {

      // GIVEN  a database with an existing exposition

      const existingMuseum = museums['louvre'];
      const dbExistingMuseum = await Museum.create(existingMuseum);
      const existingMuseumId = dbExistingMuseum._id.toString();

      const existingExposition = copy(expositions['bestOfLeonardoDaVinci']);
      existingExposition.museum = existingMuseumId;
      const dbExistingExposition = await Exposition.create(existingExposition);
      const existingExpositionId = dbExistingExposition._id;

      // WHEN   reading the existing exposition

      const readResponse = await chai.request(server)
        .get(`/api/v2/exposition/${existingExpositionId}`);

      // THEN   the server should return an HTTP 200 OK
      // AND    the JSON response should return the existing exposition

      expect(readResponse).to.have.status(200);
      expect(readResponse.body).to.shallowDeepEqual(existingExposition);
    });

    it('reading a non-existing exposition should fail', async function () {

      // GIVEN  the empty database
      // AND    a non-existing ID

      const nonExistingId = '012345678901234567890123';

      // WHEN   trying to read the non-existing exposition

      const readResponse = await chai.request(server)
        .get(`/api/v2/exposition/${nonExistingId}`);

      // THEN   the server should return an HTTP 404 Not Found

      expect(readResponse).to.have.status(404);
    });
  });

  describe('PUT /exposition/{{exposition_id}}', function () {
    it('replacing an existing exposition should succeed', async function () {

      // GIVEN  a database with an existing exposition
      // AND    a new exposition

      const existingMuseum = museums['louvre'];
      const dbExistingMuseum = await Museum.create(existingMuseum);
      const existingMuseumId = dbExistingMuseum._id.toString();

      const existingExposition = copy(expositions['bestOfLeonardoDaVinci']);
      existingExposition.museum = existingMuseumId;
      const dbExistingExposition = await Exposition.create(existingExposition);
      const existingExpositionId = dbExistingExposition._id;

      const newExposition = copy(expositions['bestOfSalvadorDali']);
      newExposition.museum = existingMuseumId;

      // WHEN   replacing the existing exposition with the new one

      const putResponse = await chai.request(server)
        .put(`/api/v2/exposition/${existingExpositionId}`)
        .set({ 'Authorization': authorization })
        .send(newExposition);

      // THEN   the server should return an HTTP 200
      // AND    the JSON response should contain the old exposition
      // AND    the database should contain the new exposition

      expect(putResponse).to.have.status(200);
      expect(putResponse.body).to.shallowDeepEqual(existingExposition);

      const dbExpositionsAfter = await Exposition.find();
      expect(dbExpositionsAfter).to.be.an('array').of.length(1);
      // TODO: check content, check for super set not working because dates are stored differently
      // expect(dbExpositionsAfter[0]).to.shallowDeepEqual(newExposition);
    });

    it('replacing a non-existing exposition should fail', async function () {

      // GIVEN  the empty database
      // AND    a non-existing ID
      // AND    a new exposition

      const nonExistingId = '012345678901234567890123';
      const newExposition = copy(expositions['bestOfSalvadorDali']);
      newExposition.museum = nonExistingId;

      // WHEN   trying to replace the non-existing exposition with the new one

      const putResponse = await chai.request(server)
        .put(`/api/v2/exposition/${nonExistingId}`)
        .set({ 'Authorization': authorization })
        .send(newExposition);

      // THEN   the server should return an HTTP 404 Not Found
      // AND    the database shouldn't contain an exposition

      expect(putResponse).to.have.status(404);

      const dbExpositionsAfter = await Exposition.find();
      expect(dbExpositionsAfter).to.be.an('array').that.is.empty;
    });
  });

  describe('DELETE /exposition/{{exposition_id}}', function () {
    it('deleting an existing exposition should succeed', async function () {

      // GIVEN  a database with an existing exposition

      const existingMuseum = museums['louvre'];
      const dbExistingMuseum = await Museum.create(existingMuseum);
      const existingMuseumId = dbExistingMuseum._id.toString();

      const existingExposition = copy(expositions['bestOfLeonardoDaVinci']);
      existingExposition.museum = existingMuseumId;
      const dbExistingExposition = await Exposition.create(existingExposition);
      const existingExpositionId = dbExistingExposition._id;

      // WHEN   deleting the existing exposition

      const deleteResponse = await chai.request(server)
        .delete(`/api/v2/exposition/${existingExpositionId}`)
        .set({ 'Authorization': authorization });

      // THEN   the server should return an HTTP 200
      // AND    the JSON response should contain the old exposition
      // AND    the database should contain no expositions anymore

      expect(deleteResponse).to.have.status(200);
      expect(deleteResponse.body).to.shallowDeepEqual(existingExposition);

      const dbExpositionsAfter = await Exposition.find();
      expect(dbExpositionsAfter).to.be.an('array').that.is.empty;
    });

    it('deleting a non-existing exposition should fail', async function () {

      // GIVEN  the empty database
      // AND    a non-existing ID

      const nonExistingId = '012345678901234567890123';

      // WHEN   trying to delete the non-existing exposition

      const deleteResponse = await chai.request(server)
        .delete(`/api/v2/exposition/${nonExistingId}`)
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
