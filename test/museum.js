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
      // AND    the JSON response should not contain sensitive information

      expect(postResponse).to.have.status(401)
      expect(postResponse.body).to.deep.equal({message: 'unauthorized'})

      // THEN   the museum should not have been posted

      const museums = await Museum.find()
      expect(museums).to.be.an('array').that.is.empty
    })

    it('creating a complete museum should succeed', async function () {

      // GIVEN  the empty database
      // AND    a new, complete museum

      const newMuseum = louvre

      // WHEN   creating the new museum

      const postResponse = await chai.request(server)
        .post('/api/v2/museum')
        .set({'Authorization': authorization})
        .send(newMuseum)

      // THEN   the server should return an HTTP 201 Created
      // AND    the JSON response should be the new museum
      // AND    the database should contain the new museum

      expect(postResponse).to.have.status(201)
      expect(postResponse.body).to.shallowDeepEqual(newMuseum)

      const dbMuseumsAfter = await Museum.find()
      expect(dbMuseumsAfter).to.be.an('array').of.length(1)
      expect(dbMuseumsAfter[0]).to.shallowDeepEqual(newMuseum)
    })

    it('creating a museum with a missing, required property should fail', async function () {

      // GIVEN  the empty database
      // AND    a new museum with a missing, required property

      const newMuseum = copy(louvre)
      delete newMuseum.logo.filename

      // WHEN   trying to create the new museum

      const postResponse = await chai.request(server)
        .post('/api/v2/museum')
        .set({'Authorization': authorization})
        .send(newMuseum)

      // THEN   the server should return an HTTP 500 Internal Server Error
      // AND    the database shouldn't contain new the museum

      expect(postResponse).to.have.status(500)

      const dbMuseumsAfter = await Museum.find()
      expect(dbMuseumsAfter).to.be.an('array').that.is.empty
    })

    it('creating a museum with a missing, non-required property should succeed', async function () {

      // GIVEN  the empty database
      // AND    a new museum with a missing, non-required property

      const newMuseum = louvre
      delete newMuseum.logo

      // WHEN   creating the new museum

      const postResponse = await chai.request(server)
        .post('/api/v2/museum')
        .set({'Authorization': authorization})
        .send(newMuseum)

      // THEN   the server should return an HTTP 201 Created
      // AND    the JSON response should be the new museum
      // AND    the database should contain the new museum

      expect(postResponse).to.have.status(201)
      expect(postResponse.body).to.shallowDeepEqual(newMuseum)

      const dbMuseumsAfter = await Museum.find()
      expect(dbMuseumsAfter).to.be.an('array').of.length(1)
      expect(dbMuseumsAfter[0]).to.shallowDeepEqual(newMuseum)
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
