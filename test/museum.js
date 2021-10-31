const chai = require('chai')
const chaiHttp = require('chai-http')
const chaiShallowDeepEqual = require('chai-shallow-deep-equal')

const Museum = require('../models/museum')
const authorization = require('./fixtures/authorization')
const mongoose = require('mongoose')
const server = require('../server')
const {louvre, germanMuseum} = require('./fixtures/museums')
const {copy} = require('./util')

chai.use(chaiHttp)
chai.use(chaiShallowDeepEqual)

const expect = chai.expect

describe('Museums', () => {

  before(async () => {
    await mongoose.connect('mongodb://localhost:27017/wavdio-express')
  })

  beforeEach(async () => {
    await Museum.deleteMany({})
  })

  after(() => {
    mongoose.disconnect()
  })

  describe('GET /museum', () => {

    it('should return all museums', async () => {

      // GIVEN  a database with museums

      await Museum.create(louvre)
      await Museum.create(germanMuseum)

      // WHEN   getting all museums

      const getResponse = await chai.request(server)
        .get('/api/v2/museum')

      // THEN   the server should return an HTTP 200 OK
      // AND    the JSON response should contain the existing museums

      expect(getResponse).to.have.status(200)
      expect(getResponse.body).to.be.an('array').with.lengthOf(2)
      expect(getResponse.body[0]).to.shallowDeepEqual(louvre)
      expect(getResponse.body[1]).to.shallowDeepEqual(germanMuseum)
    })

    it('should return no museums for an empty database', async () => {

      // GIVEN  an empty database

      // WHEN   getting all museums

      const getResponse = await chai.request(server)
        .get('/api/v2/museum')

      // THEN   the server should return an HTTP 200 OK
      // AND    the JSON response should be an empty array

      expect(getResponse).to.have.status(200)
      expect(getResponse.body).to.be.an('array').that.is.empty
    })
  })

  describe('POST /museum', () => {

    it('should create a museum', async () => {

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

    it('should fail without authorization', async () => {

      // WHEN   posting a museum without authorization

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

  describe('GET /museum/:museumId', () => {

    it('should return the specified museum', async () => {

      // GIVEN  a database with museums

      const louvreDoc = await Museum.create(louvre)
      const louvreId = louvreDoc._id

      // WHEN   getting an existing museum

      const readResponse = await chai.request(server)
        .get(`/api/v2/museum/${louvreId}`)

      // THEN   the server should return an HTTP 200 OK
      // AND    the JSON response should be the requested museum

      expect(readResponse).to.have.status(200)
      expect(readResponse.body).to.shallowDeepEqual(louvre)
    })

    it('should fail for a non-existing museum', async () => {

      // WHEN   getting a non-existing museum

      const nonExistingId = '012345678901234567890123'

      const readResponse = await chai.request(server)
        .get(`/api/v2/museum/${nonExistingId}`)

      // THEN   the server should return an HTTP 404 Not Found

      expect(readResponse).to.have.status(404)
    })
  })

  describe('PUT /museum/:museumId', () => {

    it('should replace an existing museum', async () => {

      // GIVEN  a database with museums

      const louvreDoc = await Museum.create(louvre)
      const louvreId = louvreDoc._id

      // WHEN   replacing an existing museum

      const putResponse = await chai.request(server)
        .put(`/api/v2/museum/${louvreId}`)
        .set({'Authorization': authorization})
        .send(germanMuseum)

      // THEN   the server should return an HTTP 200
      // AND    the JSON response should contain the old museum

      expect(putResponse).to.have.status(200)
      expect(putResponse.body).to.shallowDeepEqual(louvre)

      // THEN   the database should contain the new museum

      const museums = await Museum.find()
      expect(museums).to.be.an('array').with.lengthOf(1)
      expect(museums[0]).to.shallowDeepEqual(germanMuseum)
    })

    it('should fail when putting a non-existing museum', async () => {

      // WHEN   trying to replace the non-existing museum with the new one

      const nonExistingId = '012345678901234567890123'

      const putResponse = await chai.request(server)
        .put(`/api/v2/museum/${nonExistingId}`)
        .set({'Authorization': authorization})
        .send(germanMuseum)

      // THEN   the server should return an HTTP 404 Not Found

      expect(putResponse).to.have.status(404)

      // THEN   the database shouldn't have changed

      const museums = await Museum.find()
      expect(museums).to.be.an('array').that.is.empty
    })
  })

  describe('DELETE /museum/:museumId', () => {

    it('should delete the specified museum', async () => {

      // GIVEN  a database with museums

      const louvreDoc = await Museum.create(louvre)
      const louvreId = louvreDoc._id

      // WHEN   deleting a museum

      const deleteResponse = await chai.request(server)
        .delete(`/api/v2/museum/${louvreId}`)
        .set({'Authorization': authorization})

      // THEN   the server should return an HTTP 200
      // AND    the JSON response should contain the deleted museum

      expect(deleteResponse).to.have.status(200)
      expect(deleteResponse.body).to.shallowDeepEqual(louvre)

      // THEN   the database shouldn't contain the deleted museum anymore

      const museums = await Museum.find()
      expect(museums).to.be.an('array').that.is.empty
    })

    it('should fail when deleting a non-existing museum', async () => {

      // WHEN   deleting a non-existing museum

      const nonExistingId = '012345678901234567890123'

      const deleteResponse = await chai.request(server)
        .delete(`/api/v2/museum/${nonExistingId}`)
        .set({'Authorization': authorization})

      // THEN   the server should return an HTTP 404 Not Found

      expect(deleteResponse).to.have.status(404)

      // THEN   the database should not have changed

      const museums = await Museum.find()
      expect(museums).to.be.an('array').that.is.empty
    })
  })
})
