const chai = require('chai')
const chaiHttp = require('chai-http')
const chaiShallowDeepEqual = require('chai-shallow-deep-equal')

const {Exposition} = require('../models/exposition')
const {Museum} = require('../models/museum')
const mongoose = require('mongoose')
const server = require('../server')
const {authorization} = require('./fixtures/authorization')
const {exposition110, exposition120} = require('./fixtures/expositions')
const {museum100} = require('./fixtures/museums')

chai.use(chaiHttp)
chai.use(chaiShallowDeepEqual)

const expect = chai.expect

describe('Expositions', () => {

  let museum100Id

  before(async () => {
    await mongoose.connect('mongodb://localhost:27017/wavdio-express')

    const mongoMuseum100 = await Museum.create(museum100)
    museum100Id = mongoMuseum100._id.toString()
  })

  afterEach(async () => {
    await Exposition.deleteMany()
  })

  after(async () => {
    await Museum.findByIdAndDelete(museum100Id)

    await mongoose.disconnect()
  })

  describe('GET /exposition', () => {

    it('should return no expositions for the initial database', async () => {

      // GIVEN  the initial database

      // WHEN   getting all expositions

      const getResponse = await chai.request(server)
        .get('/api/v2/exposition')

      // THEN   the server should return an HTTP 200 OK
      // AND    the JSON response should be an empty array

      expect(getResponse).to.have.status(200)
      expect(getResponse.body).to.be.an('array').that.is.empty
    })

    it('should return all expositions for a filled database', async () => {

      // GIVEN  a database with expositions

      const exposition110_ = {...exposition110, museum: museum100Id}
      await Exposition.create(exposition110_)

      const exposition120_ = {...exposition120, museum: museum100Id}
      await Exposition.create(exposition120_)

      // WHEN   getting all expositions

      const getResponse = await chai.request(server)
        .get('/api/v2/exposition')

      // THEN   the server should return an HTTP 200 OK
      // AND    the JSON response should contain the expositions

      expect(getResponse).to.have.status(200)
      expect(getResponse.body).to.be.an('array').with.lengthOf(2)
      expect(getResponse.body[0]).to.shallowDeepEqual(exposition110_)
      expect(getResponse.body[1]).to.shallowDeepEqual(exposition120_)
    })
  })

  describe('POST /exposition', () => {

    it('should create an exposition', async () => {

      // GIVEN  a database with a museum

      // WHEN   posting an exposition for the museum

      const exposition110_ = {...exposition110, museum: museum100Id}

      const postResponse = await chai.request(server)
        .post('/api/v2/exposition')
        .set({'Authorization': authorization})
        .send(exposition110_)

      // THEN   the server should return an HTTP 201 Created
      // AND    the JSON response should contain the new exposition

      expect(postResponse).to.have.status(201)
      expect(postResponse.body).to.shallowDeepEqual(exposition110_)

      // THEN   the database should contain the new exposition

      const expositions = await Exposition.find()
      expect(expositions).to.be.an('array').with.lengthOf(1)
      // TODO: check content, check for super set not working because dates are stored differently
      // expect(expositions[0]).to.shallowDeepEqual(exposition110_)
    })

    it('should fail without authorization', async () => {

      // WHEN   posting an exposition without authorization

      const exposition110_ = {...exposition110, museum: museum100Id}

      const postResponse = await chai.request(server)
        .post('/api/v2/exposition')
        .send(exposition110_)

      // THEN   the server should return an HTTP 401 Unauthorized
      // AND    the JSON response shouldn't contain sensitive information

      expect(postResponse).to.have.status(401)
      expect(postResponse.body).to.deep.equal({message: 'unauthorized'})

      // THEN   the database shouldn't contain the exposition

      const expositions = await Exposition.find()
      expect(expositions).to.be.an('array').that.is.empty
    })

    it('should fail when posting an exposition with a missing required property', async () => {

      // WHEN   posting an exposition with a missing required property

      const exposition110_ = {...exposition110, museum: museum100Id}
      delete exposition110_.code

      const postResponse = await chai.request(server)
        .post('/api/v2/exposition')
        .set({'Authorization': authorization})
        .send(exposition110_)

      // THEN   the server should return an HTTP 400 Bad Request
      // AND    the database shouldn't contain the new exposition

      expect(postResponse).to.have.status(400)

      // THEN   the database shouldn't contain the exposition

      const expositions = await Exposition.find()
      expect(expositions).to.be.an('array').that.is.empty
    })

    it('should work when posting an exposition with a missing non-required property', async () => {

      // WHEN   posting an exposition with a missing non-required property

      const exposition110_ = {...exposition110, museum: museum100Id}
      delete exposition110_.note

      const postResponse = await chai.request(server)
        .post('/api/v2/exposition')
        .set({'Authorization': authorization})
        .send(exposition110_)

      // THEN   the server should return an HTTP 201 Created
      // AND    the JSON response should be the new exposition

      expect(postResponse).to.have.status(201)
      expect(postResponse.body).to.shallowDeepEqual(exposition110_)

      // THEN   the database should contain the exposition

      const expositions = await Exposition.find()
      expect(expositions).to.be.an('array').with.lengthOf(1)
      // TODO: check content, check for super set not working because dates are stored differently
      // expect(expositions[0]).to.shallowDeepEqual(exposition110_)
    })
  })

  describe('GET /exposition/:expositionId', () => {

    it('should return the specified exposition', async () => {

      // GIVEN  a database with an exposition

      const exposition110_ = {...exposition110, museum: museum100Id}

      const exposition110Doc = await Exposition.create(exposition110_)
      const exposition110Id = exposition110Doc._id

      // WHEN   getting the exposition

      const getResponse = await chai.request(server)
        .get(`/api/v2/exposition/${exposition110Id}`)

      // THEN   the server should return an HTTP 200 OK
      // AND    the JSON response should be the exposition

      expect(getResponse).to.have.status(200)
      expect(getResponse.body).to.shallowDeepEqual(exposition110_)
    })

    it('should fail for a non-existing exposition', async () => {

      // WHEN   getting a non-existing exposition

      const nonExistingId = '012345678901234567890123'

      const getResponse = await chai.request(server)
        .get(`/api/v2/exposition/${nonExistingId}`)

      // THEN   the server should return an HTTP 404 Not Found

      expect(getResponse).to.have.status(404)
    })
  })

  describe('PUT /exposition/:expositionId', () => {

    it('should replace an existing exposition', async () => {

      // GIVEN  a database with an exposition

      const exposition110_ = {...exposition110, museum: museum100Id}

      const exposition110Doc = await Exposition.create(exposition110_)
      const exposition110Id = exposition110Doc._id

      // WHEN   replacing the existing exposition

      const exposition120_ = {...exposition120, museum: museum100Id}

      const putResponse = await chai.request(server)
        .put(`/api/v2/exposition/${exposition110Id}`)
        .set({'Authorization': authorization})
        .send(exposition120_)

      // THEN   the server should return an HTTP 200
      // AND    the JSON response should contain the old exposition

      expect(putResponse).to.have.status(200)
      expect(putResponse.body).to.shallowDeepEqual(exposition110_)

      // THEN   the database should contain the new exposition

      const expositions = await Exposition.find()
      expect(expositions).to.be.an('array').with.lengthOf(1)
      // TODO: check content, check for super set not working because dates are stored differently
      // expect(expositions[0]).to.shallowDeepEqual(exposition120_)
    })

    it('should fail when replacing a non-existing exposition', async () => {

      // WHEN   trying to replace a non-existing exposition

      const nonExistingId = '012345678901234567890123'
      const exposition110_ = {...exposition110, museum: museum100Id}

      const putResponse = await chai.request(server)
        .put(`/api/v2/exposition/${nonExistingId}`)
        .set({'Authorization': authorization})
        .send(exposition110_)

      // THEN   the server should return an HTTP 404 Not Found

      expect(putResponse).to.have.status(404)

      // THEN   the database shouldn't have changed

      const expositions = await Exposition.find()
      expect(expositions).to.be.an('array').that.is.empty
    })
  })

  describe('DELETE /exposition/:expositionId', () => {

    it('should delete the specified exposition', async () => {

      // GIVEN  a database with an exposition

      const exposition110_ = {...exposition110, museum: museum100Id}

      const exposition110Doc = await Exposition.create(exposition110_)
      const exposition110Id = exposition110Doc._id

      // WHEN   deleting the exposition

      const deleteResponse = await chai.request(server)
        .delete(`/api/v2/exposition/${exposition110Id}`)
        .set({'Authorization': authorization})

      // THEN   the server should return an HTTP 200
      // AND    the JSON response should contain the deleted exposition

      expect(deleteResponse).to.have.status(200)
      expect(deleteResponse.body).to.shallowDeepEqual(exposition110_)

      // THEN   the database shouldn't contain the deleted exposition anymore

      const expositions = await Exposition.find()
      expect(expositions).to.be.an('array').that.is.empty
    })

    it('should fail when deleting a non-existing exposition', async () => {

      // WHEN   deleting a non-existing exposition

      const nonExistingId = '012345678901234567890123'

      const deleteResponse = await chai.request(server)
        .delete(`/api/v2/exposition/${nonExistingId}`)
        .set({'Authorization': authorization})

      // THEN   the server should return an HTTP 404 Not Found

      expect(deleteResponse).to.have.status(404)
    })
  })
})
