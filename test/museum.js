const chai = require('chai')
const chaiHttp = require('chai-http')
const chaiShallowDeepEqual = require('chai-shallow-deep-equal')
const mongoose = require('mongoose')

const { Museum } = require('../models/museum')
const { authorization } = require('./fixtures/authorization')
const { museum100, museum200 } = require('./fixtures/museums')
const { server } = require('../server')

chai.use(chaiHttp)
chai.use(chaiShallowDeepEqual)

const expect = chai.expect

describe('Museums', () => {

  let defaultMuseums

  before(async () => {
    await mongoose.connect('mongodb://localhost:27017/wavdio-express')

    defaultMuseums = await Museum.find()
  })

  afterEach(async () => {
    await Museum.deleteMany({})
    await Museum.insertMany(defaultMuseums)
  })

  after(() => {
    mongoose.disconnect()
  })

  describe('GET /museum', () => {

    it('should return one museum for the initial database', async () => {

      // GIVEN  the initial database

      // WHEN   getting all museums

      const getResponse = await chai.request(server)
        .get('/api/v2/museum')

      // THEN   the server should return an HTTP 200 OK
      // AND    the JSON response should contain the default museum

      expect(getResponse).to.have.status(200)
      expect(getResponse.body).to.be.an('array').with.lengthOf(1)
    })

    it('should return all museums for a filled database', async () => {

      // GIVEN  a database with museums

      await Museum.create(museum100)
      await Museum.create(museum200)

      // WHEN   getting all museums

      const getResponse = await chai.request(server)
        .get('/api/v2/museum')

      // THEN   the server should return an HTTP 200 OK
      // AND    the JSON response should contain the existing museums

      expect(getResponse).to.have.status(200)
      expect(getResponse.body).to.be.an('array').with.lengthOf(3)
      expect(getResponse.body[1]).to.shallowDeepEqual(museum100)
      expect(getResponse.body[2]).to.shallowDeepEqual(museum200)
    })
  })

  describe('POST /museum', () => {

    it('should create a museum', async () => {

      // WHEN   posting a museum

      const postResponse = await chai.request(server)
        .post('/api/v2/museum')
        .set({ 'Authorization': authorization })
        .send(museum100)

      // THEN   the server should return an HTTP 201 Created
      // AND    the JSON response should be the new museum

      expect(postResponse).to.have.status(201)
      expect(postResponse.body).to.shallowDeepEqual(museum100)

      // THEN   the database should contain the museum

      const museums = await Museum.find()
      expect(museums).to.be.an('array').with.lengthOf(2)
      expect(museums[1]).to.shallowDeepEqual(museum100)
    })

    it('should fail without authorization', async () => {

      // WHEN   posting a museum without authorization

      const postResponse = await chai.request(server)
        .post('/api/v2/museum')
        .send(museum100)

      // THEN   the server should return an HTTP 401 Unauthorized
      // AND    the JSON response shouldn't contain sensitive information

      expect(postResponse).to.have.status(401)
      expect(postResponse.body).to.deep.equal({ message: 'unauthorized' })

      // THEN   the database shouldn't contain the museum

      const museums = await Museum.find()
      expect(museums).to.be.an('array').with.lengthOf(1)
    })

    it('should fail when posting a museum with a missing required property', async () => {

      // WHEN   posting a museum with a missing required property

      const museum100_ = JSON.parse(JSON.stringify(museum100))
      delete museum100_.contents[0].lang

      const postResponse = await chai.request(server)
        .post('/api/v2/museum')
        .set({ 'Authorization': authorization })
        .send(museum100_)

      // THEN   the server should return an HTTP 400 Bad Request
      // AND    the database shouldn't contain the new museum

      expect(postResponse).to.have.status(400)

      // THEN   the database shouldn't contain the museum

      const museums = await Museum.find()
      expect(museums).to.be.an('array').with.lengthOf(1)
    })

    it('should work when posting a museum with a missing non-required property', async () => {

      // WHEN   posting a museum with a missing non-required property

      const museum100_ = { ...museum100 }
      delete museum100_.contents[0].imprint

      const postResponse = await chai.request(server)
        .post('/api/v2/museum')
        .set({ 'Authorization': authorization })
        .send(museum100_)

      // THEN   the server should return an HTTP 201 Created
      // AND    the JSON response should be the new museum

      expect(postResponse).to.have.status(201)
      expect(postResponse.body).to.shallowDeepEqual(museum100_)

      // THEN   the database should contain the museum

      const museums = await Museum.find()
      expect(museums).to.be.an('array').with.lengthOf(2)
      expect(museums[1]).to.shallowDeepEqual(museum100_)
    })
  })

  describe('GET /museum/:museumId', () => {

    it('should return the specified museum', async () => {

      // GIVEN  a database with a museum

      const museum100Doc = await Museum.create(museum100)
      const museum100Id = museum100Doc._id

      // WHEN   getting the museum

      const getResponse = await chai.request(server)
        .get(`/api/v2/museum/${museum100Id}`)

      // THEN   the server should return an HTTP 200 OK
      // AND    the JSON response should be the requested museum

      expect(getResponse).to.have.status(200)
      expect(getResponse.body).to.shallowDeepEqual(museum100)
    })

    it('should fail for a non-existing museum', async () => {

      // WHEN   getting a non-existing museum

      const nonExistingId = '012345678901234567890123'

      const getResponse = await chai.request(server)
        .get(`/api/v2/museum/${nonExistingId}`)

      // THEN   the server should return an HTTP 404 Not Found

      expect(getResponse).to.have.status(404)
    })
  })

  describe('PUT /museum/:museumId', () => {

    it('should replace an existing museum', async () => {

      // GIVEN  a database with a museum

      const museum100Doc = await Museum.create(museum100)
      const museum100Id = museum100Doc._id

      // WHEN   replacing the museum

      const putResponse = await chai.request(server)
        .put(`/api/v2/museum/${museum100Id}`)
        .set({ 'Authorization': authorization })
        .send(museum200)

      // THEN   the server should return an HTTP 200
      // AND    the JSON response should contain the old museum

      expect(putResponse).to.have.status(200)
      expect(putResponse.body).to.shallowDeepEqual(museum100)

      // THEN   the database should contain the new museum

      const museums = await Museum.find()
      expect(museums).to.be.an('array').with.lengthOf(2)
      expect(museums[1]).to.shallowDeepEqual(museum200)
    })

    it('should fail when putting a non-existing museum', async () => {

      // WHEN   trying to replace the non-existing museum with the new one

      const nonExistingId = '012345678901234567890123'

      const putResponse = await chai.request(server)
        .put(`/api/v2/museum/${nonExistingId}`)
        .set({ 'Authorization': authorization })
        .send(museum200)

      // THEN   the server should return an HTTP 404 Not Found

      expect(putResponse).to.have.status(404)

      // THEN   the database shouldn't have changed

      const museums = await Museum.find()
      expect(museums).to.be.an('array').with.lengthOf(1)
    })
  })

  describe('DELETE /museum/:museumId', () => {

    it('should delete the specified museum', async () => {

      // GIVEN  a database with a museum

      const museum100Doc = await Museum.create(museum100)
      const museum100Id = museum100Doc._id

      // WHEN   deleting the museum

      const deleteResponse = await chai.request(server)
        .delete(`/api/v2/museum/${museum100Id}`)
        .set({ 'Authorization': authorization })

      // THEN   the server should return an HTTP 200
      // AND    the JSON response should contain the deleted museum

      expect(deleteResponse).to.have.status(200)
      expect(deleteResponse.body).to.shallowDeepEqual(museum100)

      // THEN   the database shouldn't contain the deleted museum anymore

      const museums = await Museum.find()
      expect(museums).to.be.an('array').with.lengthOf(1)
    })

    it('should fail when deleting a non-existing museum', async () => {

      // WHEN   deleting a non-existing museum

      const nonExistingId = '012345678901234567890123'

      const deleteResponse = await chai.request(server)
        .delete(`/api/v2/museum/${nonExistingId}`)
        .set({ 'Authorization': authorization })

      // THEN   the server should return an HTTP 404 Not Found

      expect(deleteResponse).to.have.status(404)
    })
  })
})
