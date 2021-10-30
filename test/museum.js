const chai = require('chai')
const chaiHttp = require('chai-http')
const chaiShallowDeepEqual = require('chai-shallow-deep-equal')

const Museum = require('../models/museum')
const authorization = require('./fixtures/authorization')
const mongoose = require('mongoose')
const server = require('../server')
const {louvre, germanMuseum} = require('./fixtures/museums')

chai.use(chaiHttp)
chai.use(chaiShallowDeepEqual)

const expect = chai.expect

describe('Museums', () => {

  before(async () => {
    await mongoose.connect('mongodb://localhost:27017/wavdio-express')
  })

  beforeEach(async () => {

    // GIVEN  an empty database

    await Museum.deleteMany({})
  })

  after(() => {
    mongoose.disconnect()
  })

  describe('GET /museum', () => {

    it('should return no museums for an empty database', async () => {

      // WHEN   getting all museums

      const getResponse = await chai.request(server)
        .get('/api/v2/museum')

      // THEN   the server should return an HTTP 200 OK
      // AND    the JSON response should be an empty array

      expect(getResponse).to.have.status(200)
      expect(getResponse.body).to.be.an('array').that.is.empty
    })

    it('should return all museums from a database that contains museums', async () => {

      // GIVEN  a database with existing museums

      await Museum.create(louvre)
      await Museum.create(germanMuseum)

      // WHEN   getting all museums

      const getResponse = await chai.request(server)
        .get('/api/v2/museum')

      // THEN   the server should return an HTTP 200 OK
      // AND    the JSON response should be an array containing the existing museums

      expect(getResponse).to.have.status(200)
      expect(getResponse.body).to.be.an('array').with.lengthOf(2)
      expect(getResponse.body[0]).to.shallowDeepEqual(louvre)
      expect(getResponse.body[1]).to.shallowDeepEqual(germanMuseum)
    })
  })

  describe('POST /museum', function () {

    it('should not work without authorization', async () => {

      // WHEN   posting a museum without authenticating first

      const postResponse = await chai.request(server)
        .post('/api/v2/museum')
        .send(louvre)

      // THEN   the server should return an HTTP 401 Unauthorized
      // AND    the JSON response shouldn't contain sensitive information

      expect(postResponse).to.have.status(401)
      expect(postResponse.body).to.deep.equal({message: 'unauthorized'})

      // THEN   the database shouldn't contain the museum

      const museums = await Museum.find()
      expect(museums).to.be.an('array').that.is.empty
    })

    it('should work for an authorized user', async () => {

      // WHEN   posting a museum without authenticating first

      const postResponse = await chai.request(server)
        .post('/api/v2/museum')
        .set({'Authorization': authorization})
        .send(louvre)

      // THEN   the server should return an HTTP 201 Created
      // AND    the JSON response should be the new museum

      expect(postResponse).to.have.status(201)
      expect(postResponse.body).to.shallowDeepEqual(louvre)

      // THEN   the database should contain the museum

      const museums = await Museum.find()
      expect(museums).to.be.an('array').with.lengthOf(1)
      expect(museums[0]).to.shallowDeepEqual(louvre)
    })

    it('should fail when posting a museum with a missing required property', async () => {

      // WHEN   posting a museum with a missing required property

      const louvreWithMissingLang = copy(louvre)
      delete louvreWithMissingLang.contents[0].lang

      const postResponse = await chai.request(server)
        .post('/api/v2/museum')
        .set({'Authorization': authorization})
        .send(louvreWithMissingLang)

      // THEN   the server should return an HTTP 400 Bad Request
      // AND    the database shouldn't contain the new museum

      expect(postResponse).to.have.status(400)

      // THEN   the database shouldn't contain the museum

      const museums = await Museum.find()
      expect(museums).to.be.an('array').that.is.empty
    })

    it('should work when posting a museum with a missing non-required property', async () => {

      // WHEN   posting a museum with a missing non-required property

      const louvreWithMissingImprint = copy(louvre)
      delete louvreWithMissingImprint.contents[0].imprint

      const postResponse = await chai.request(server)
        .post('/api/v2/museum')
        .set({'Authorization': authorization})
        .send(louvreWithMissingImprint)

      // THEN   the server should return an HTTP 201 Created
      // AND    the JSON response should be the new museum

      expect(postResponse).to.have.status(201)
      expect(postResponse.body).to.shallowDeepEqual(louvreWithMissingImprint)

      // THEN   the database should contain the museum

      const museums = await Museum.find()
      expect(museums).to.be.an('array').with.lengthOf(1)
      expect(museums[0]).to.shallowDeepEqual(louvreWithMissingImprint)
    })
  })

  describe('GET /museum/{{museum_id}}', function () {
    it('reading an existing museum should succeed', async function () {

      // GIVEN  a database with an existing museum

      const existingMuseum = louvre
      const dbExistingMuseum = await Museum.create(existingMuseum)
      const existingMuseumId = dbExistingMuseum._id

      // WHEN   reading the existing museum

      const readResponse = await chai.request(server)
        .get(`/api/v2/museum/${existingMuseumId}`)

      // THEN   the server should return an HTTP 200 OK
      // AND    the JSON response should return the existing museum

      expect(readResponse).to.have.status(200)
      expect(readResponse.body).to.shallowDeepEqual(existingMuseum)
    })

    it('reading a non-existing museum should fail', async function () {

      // GIVEN  the empty database
      // AND    a non-existing ID

      const nonExistingId = '012345678901234567890123'

      // WHEN   trying to read the non-existing museum

      const readResponse = await chai.request(server)
        .get(`/api/v2/museum/${nonExistingId}`)

      // THEN   the server should return an HTTP 404 Not Found

      expect(readResponse).to.have.status(404)
    })
  })

  describe('PUT /museum/{{museum_id}}', function () {
    it('replacing an existing museum should succeed', async function () {

      // GIVEN  a database with an existing museum
      // AND    a new museum

      const existingMuseum = louvre
      const dbExistingMuseum = await Museum.create(existingMuseum)
      const existingMuseumId = dbExistingMuseum._id

      const newMuseum = germanMuseum

      // WHEN   replacing the existing museum with the new one

      const putResponse = await chai.request(server)
        .put(`/api/v2/museum/${existingMuseumId}`)
        .set({'Authorization': authorization})
        .send(newMuseum)

      // THEN   the server should return an HTTP 200
      // AND    the JSON response should contain the old museum
      // AND    the database should contain the new museum

      expect(putResponse).to.have.status(200)
      expect(putResponse.body).to.shallowDeepEqual(existingMuseum)

      const dbMuseumsAfter = await Museum.find()
      expect(dbMuseumsAfter).to.be.an('array').of.length(1)
      expect(dbMuseumsAfter[0]).to.shallowDeepEqual(newMuseum)
    })

    it('replacing a non-existing museum should fail', async function () {

      // GIVEN  the empty database
      // AND    a non-existing ID
      // AND    a new museum

      const nonExistingId = '012345678901234567890123'

      // WHEN   trying to replace the non-existing museum with the new one

      const putResponse = await chai.request(server)
        .put(`/api/v2/museum/${nonExistingId}`)
        .set({'Authorization': authorization})

      // THEN   the server should return an HTTP 404 Not Found
      // AND    the database shouldn't contain a museum

      expect(putResponse).to.have.status(404)

      const dbMuseumsAfter = await Museum.find()
      expect(dbMuseumsAfter).to.be.an('array').that.is.empty
    })
  })

  describe('DELETE /museum/{{museum_id}}', function () {
    it('deleting an existing museum should succeed', async function () {

      // GIVEN  a database with an existing museum

      const existingMuseum = louvre
      const dbExistingMuseum = await Museum.create(existingMuseum)
      const existingMuseumId = dbExistingMuseum._id

      // WHEN   deleting the existing museum

      const deleteResponse = await chai.request(server)
        .delete(`/api/v2/museum/${existingMuseumId}`)
        .set({'Authorization': authorization})

      // THEN   the server should return an HTTP 200
      // AND    the JSON response should contain the old museum
      // AND    the database should contain no museums anymore

      expect(deleteResponse).to.have.status(200)
      expect(deleteResponse.body).to.shallowDeepEqual(existingMuseum)

      const dbMuseumsAfter = await Museum.find()
      expect(dbMuseumsAfter).to.be.an('array').that.is.empty
    })

    it('deleting a non-existing museum should fail', async function () {

      // GIVEN  the empty database
      // AND    a non-existing ID

      const nonExistingId = '012345678901234567890123'

      // WHEN   trying to delete the non-existing museum

      const deleteResponse = await chai.request(server)
        .delete(`/api/v2/museum/${nonExistingId}`)
        .set({'Authorization': authorization})

      // THEN   the server should return an HTTP 404 Not Found

      expect(deleteResponse).to.have.status(404)
    })
  })
})

function copy (object) {
  return JSON.parse(JSON.stringify(object))
}
