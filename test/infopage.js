const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiShallowDeepEqual = require('chai-shallow-deep-equal');

const server = require('../bin/server');
const Infopage = require('../models/infopage');
const infopages = require('./fixtures/infopages');
const authorization = require('./fixtures/authorization');

chai.use(chaiHttp);
chai.use(chaiShallowDeepEqual);

const expect = chai.expect;

deepFreeze(infopages);

describe('Infopage', function () {
  beforeEach(async function () {
    await Infopage.deleteMany({});
  });

  describe('GET /infopage', function () {
    it('reading all infopages from an empty infopage collection should succeed', async function () {

      // GIVEN  the empty database

      // WHEN   reading all infopages

      const getResponse = await chai.request(server)
        .get('/api/v2/infopage');

      // THEN   the server should return an HTTP 200 OK
      // AND    the JSON response should be an empty array

      expect(getResponse).to.have.status(200);
      expect(getResponse.body).to.be.an('array').that.is.empty;
    });

    it('reading all infopages from a non-empty infopage collection should succeed', async function () {

      // GIVEN  a database with an existing infopage

      const existingInfopage = infopages['about'];

      await Infopage.create(existingInfopage);

      // WHEN   reading all infopages

      const getResponse = await chai.request(server)
        .get('/api/v2/infopage');

      // THEN   the server should return an HTTP 200 OK
      // AND    the JSON response should be an array containing the existing infopage

      expect(getResponse).to.have.status(200);
      expect(getResponse.body).to.be.an('array').of.length(1);
      expect(getResponse.body[0]).to.shallowDeepEqual(existingInfopage);
    });
  });

  describe('POST /infopage', function () {
    it('creating a complete infopage should succeed', async function () {

      // GIVEN  the empty database
      // AND    a new, complete infopage

      const newInfopage = infopages['about'];

      // WHEN   creating the new infopage

      const postResponse = await chai.request(server)
        .post('/api/v2/infopage')
        .set({ 'Authorization': authorization })
        .send(newInfopage);

      // THEN   the server should return an HTTP 201 Created
      // AND    the JSON response should be the new infopage
      // AND    the database should contain the new infopage

      expect(postResponse).to.have.status(201);
      expect(postResponse.body).to.shallowDeepEqual(newInfopage);

      const dbInfopagesAfter = await Infopage.find();
      expect(dbInfopagesAfter).to.be.an('array').of.length(1);
      expect(dbInfopagesAfter[0]).to.shallowDeepEqual(newInfopage);
    });

    it('creating an infopage with a missing, non-required property should succeed', async function () {

      // GIVEN  the empty database
      // AND    a new infopage with a missing, required property

      const newInfopage = copy(infopages['about']);
      delete newInfopage.text;

      // WHEN   trying to create the new infopage

      const postResponse = await chai.request(server)
        .post('/api/v2/infopage')
        .set({ 'Authorization': authorization })
        .send(newInfopage);

      // THEN   the server should return an HTTP 500 Internal Server Error
      // AND    the database shouldn't contain new the infopage

      expect(postResponse).to.have.status(201);

      const dbInfopagesAfter = await Infopage.find();
      expect(dbInfopagesAfter).to.be.an('array').that.is.length.above(0);
    });
  });

  describe('GET /infopage/{{infopage_id}}', function () {
    it('reading an existing infopage should succeed', async function () {

      // GIVEN  a database with an existing infopage

      const existingInfopage = infopages['about'];
      const dbExistingInfopage = await Infopage.create(existingInfopage);
      const existingInfopageId = dbExistingInfopage._id;

      // WHEN   reading the existing infopage

      const readResponse = await chai.request(server)
        .get(`/api/v2/infopage/${existingInfopageId}`);

      // THEN   the server should return an HTTP 200 OK
      // AND    the JSON response should return the existing infopage

      expect(readResponse).to.have.status(200);
      expect(readResponse.body).to.shallowDeepEqual(existingInfopage);
    });

    it('reading a non-existing infopage should fail', async function () {

      // GIVEN  the empty database
      // AND    a non-existing ID

      const nonExistingId = '012345678901234567890123';

      // WHEN   trying to read the non-existing infopage

      const readResponse = await chai.request(server)
        .get(`/api/v2/infopage/${nonExistingId}`);

      // THEN   the server should return an HTTP 404 Not Found

      expect(readResponse).to.have.status(404);
    });
  });

  describe('PUT /infopage/{{infopage_id}}', function () {
    it('replacing an existing infopage should succeed', async function () {

      // GIVEN  a database with an existing infopage
      // AND    a new infopage

      const existingInfopage = infopages['about'];
      const dbExistingInfopage = await Infopage.create(existingInfopage);
      const existingInfopageId = dbExistingInfopage._id;

      const newInfopage = infopages['help'];

      // WHEN   replacing the existing infopage with the new one

      const putResponse = await chai.request(server)
        .put(`/api/v2/infopage/${existingInfopageId}`)
        .set({ 'Authorization': authorization })
        .send(newInfopage);

      // THEN   the server should return an HTTP 200
      // AND    the JSON response should contain the old infopage
      // AND    the database should contain the new infopage

      expect(putResponse).to.have.status(200);
      expect(putResponse.body).to.shallowDeepEqual(existingInfopage);

      const dbInfopagesAfter = await Infopage.find();
      expect(dbInfopagesAfter).to.be.an('array').of.length(1);
      expect(dbInfopagesAfter[0]).to.shallowDeepEqual(newInfopage);
    });

    it('replacing a non-existing infopage should fail', async function () {

      // GIVEN  the empty database
      // AND    a non-existing ID
      // AND    a new infopage

      const nonExistingId = '012345678901234567890123';
      const newInfopage = infopages['help'];

      // WHEN   trying to replace the non-existing infopage with the new one

      const putResponse = await chai.request(server)
        .put(`/api/v2/infopage/${nonExistingId}`)
        .set({ 'Authorization': authorization });

      // THEN   the server should return an HTTP 404 Not Found
      // AND    the database shouldn't contain a infopage

      expect(putResponse).to.have.status(404);

      const dbInfopagesAfter = await Infopage.find();
      expect(dbInfopagesAfter).to.be.an('array').that.is.empty;
    });
  });

  describe('DELETE /infopage/{{infopage_id}}', function () {
    it('deleting an existing infopage should succeed', async function () {

      // GIVEN  a database with an existing infopage

      const existingInfopage = infopages['about'];
      const dbExistingInfopage = await Infopage.create(existingInfopage);
      const existingInfopageId = dbExistingInfopage._id;

      // WHEN   deleting the existing infopage

      const deleteResponse = await chai.request(server)
        .delete(`/api/v2/infopage/${existingInfopageId}`)
        .set({ 'Authorization': authorization });

      // THEN   the server should return an HTTP 200
      // AND    the JSON response should contain the old infopage
      // AND    the database should contain no infopages anymore

      expect(deleteResponse).to.have.status(200);
      expect(deleteResponse.body).to.shallowDeepEqual(existingInfopage);

      const dbInfopagesAfter = await Infopage.find();
      expect(dbInfopagesAfter).to.be.an('array').that.is.empty;
    });

    it('deleting a non-existing infopage should fail', async function () {

      // GIVEN  the empty database
      // AND    a non-existing ID

      const nonExistingId = '012345678901234567890123';

      // WHEN   trying to delete the non-existing infopage

      const deleteResponse = await chai.request(server)
        .delete(`/api/v2/infopage/${nonExistingId}`)
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
