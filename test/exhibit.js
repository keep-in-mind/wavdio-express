const chai = require('chai')
const chaiHttp = require('chai-http')
const chaiShallowDeepEqual = require('chai-shallow-deep-equal')

const Exhibit = require('../models/exhibit')
const Exposition = require('../models/exposition')
const Museum = require('../models/museum')
const authorization = require('./fixtures/authorization')
const mongoose = require('mongoose')
const server = require('../server')
const {exhibit111, exhibit112} = require('./fixtures/exhibits')
const {exposition110} = require('./fixtures/expositions')
const {museum100} = require('./fixtures/museums')

chai.use(chaiHttp)
chai.use(chaiShallowDeepEqual)

const expect = chai.expect

describe('Exhibits', () => {

  let defaultExhibits
  let exposition110Id

  before(async () => {
    await mongoose.connect('mongodb://localhost:27017/wavdio-express')

    defaultExhibits = await Exhibit.find()

    //
    // Create exposition to work with
    //

    const mongoMuseum100 = await Museum.create(museum100)
    const museum100Id = mongoMuseum100._id.toString()

    const newExposition110 = {...exposition110, museum: museum100Id}
    const mongoExposition110 = await Exposition.create(newExposition110)
    exposition110Id = mongoExposition110._id.toString()
  })

  afterEach(async () => {
    await Exhibit.deleteMany()
    await Exhibit.insertMany(defaultExhibits)
  })

  after(() => {
    mongoose.disconnect()
  })

  describe('GET /exhibit', () => {

    it('should return no exhibits for the initial database', async () => {

      // GIVEN  the initial database

      // WHEN   getting all exhibits

      const getResponse = await chai.request(server)
        .get('/api/v2/exhibit')

      // THEN   the server should return an HTTP 200 OK
      // AND    the JSON response should be an empty array

      expect(getResponse).to.have.status(200)
      expect(getResponse.body).to.be.an('array').that.is.empty
    })

    it('should return all exhibits for a filled database', async () => {

      // GIVEN  a database with exhibits

      const newExhibit111 = {...exhibit111, parent: exposition110Id}
      await Exhibit.create(newExhibit111)

      const newExhibit112 = {...exhibit112, parent: exposition110Id}
      await Exhibit.create(newExhibit112)

      // WHEN   getting all exhibits

      const getResponse = await chai.request(server)
        .get('/api/v2/exhibit')

      // THEN   the server should return an HTTP 200 OK
      // AND    the JSON response should contain the exhibits

      expect(getResponse).to.have.status(200)
      expect(getResponse.body).to.be.an('array').with.lengthOf(2)
      expect(getResponse.body[0]).to.shallowDeepEqual(newExhibit111)
      expect(getResponse.body[1]).to.shallowDeepEqual(newExhibit112)
    })
  })

  describe('POST /exhibit', () => {

    it('should create an exhibit', async () => {

      // GIVEN  a database with an exposition

      // WHEN   posting an exhibit for the exposition

      const newExhibit111 = {...exhibit111, parent: exposition110Id}

      const postResponse = await chai.request(server)
        .post('/api/v2/exhibit')
        .set({'Authorization': authorization})
        .send(newExhibit111)

      // THEN   the server should return an HTTP 201 Created
      // AND    the JSON response should contain the new exhibit

      expect(postResponse).to.have.status(201)
      expect(postResponse.body).to.shallowDeepEqual(newExhibit111)

      // THEN   the database should contain the new exhibit

      const exhibits = await Exhibit.find()
      expect(exhibits).to.be.an('array').with.lengthOf(1)
      // TODO: check content, check for super set not working because dates are stored differently
      // expect(exhibits[0]).to.shallowDeepEqual(exhibits)
    })

    it('should fail without authorization', async () => {

      // WHEN   posting an exhibit without authorization

      const newExhibit111 = {...exhibit111, parent: exposition110Id}

      const postResponse = await chai.request(server)
        .post('/api/v2/exhibit')
        .send(newExhibit111)

      // THEN   the server should return an HTTP 401 Unauthorized
      // AND    the JSON response shouldn't contain sensitive information

      expect(postResponse).to.have.status(401)
      expect(postResponse.body).to.deep.equal({message: 'unauthorized'})

      // THEN   the database shouldn't contain the museum

      const exhibits = await Exhibit.find()
      expect(exhibits).to.be.an('array').that.is.empty
    })

    it('should fail when posting an exhibit with a missing required property', async () => {

      // WHEN   posting an exhibit with a missing required property

      const newExhibit111 = {...exhibit111, parent: exposition110Id}
      delete newExhibit111.code

      const postResponse = await chai.request(server)
        .post('/api/v2/exhibit')
        .set({'Authorization': authorization})
        .send(newExhibit111)

      // THEN   the server should return an HTTP 400 Bad Request
      // AND    the database shouldn't contain the new museum

      expect(postResponse).to.have.status(400)

      // THEN   the database shouldn't contain the exhibit

      const exhibits = await Exhibit.find()
      expect(exhibits).to.be.an('array').that.is.empty
    })

    it('should work when posting an exhibit with a missing non-required property', async () => {

      // WHEN   posting an exhibit with a missing non-required property

      const newExhibit111 = {...exhibit111, parent: exposition110Id}
      delete newExhibit111.note

      const postResponse = await chai.request(server)
        .post('/api/v2/exhibit')
        .set({'Authorization': authorization})
        .send(newExhibit111)

      // THEN   the server should return an HTTP 201 Created
      // AND    the JSON response should be the new exhibit

      expect(postResponse).to.have.status(201)
      expect(postResponse.body).to.shallowDeepEqual(newExhibit111)

      // THEN   the database should contain the exhibit

      const exhibits = await Exhibit.find()
      expect(exhibits).to.be.an('array').with.lengthOf(1)
      // TODO: check content, check for super set not working because dates are stored differently
      // expect(exhibits[0]).to.shallowDeepEqual(newExhibit111)
    })
  })

  describe('GET /exhibit/:exhibitId', () => {

    it('should return the specified exhibit', async () => {

      // GIVEN  a database with an exhibit

      const newExhibit111 = {...exhibit111, parent: exposition110Id}

      const mongoExhibit111 = await Exhibit.create(newExhibit111)
      const exhibit111Id = mongoExhibit111._id

      // WHEN   getting the exhibit

      const getResponse = await chai.request(server)
        .get(`/api/v2/exhibit/${exhibit111Id}`)

      // THEN   the server should return an HTTP 200 OK
      // AND    the JSON response should be the exhibit

      expect(getResponse).to.have.status(200)
      expect(getResponse.body).to.shallowDeepEqual(newExhibit111)
    })

    it('should fail for a non-existing exhibit', async () => {

      // WHEN   getting a non-existing exhibit

      const nonExistingId = '012345678901234567890123'

      const getResponse = await chai.request(server)
        .get(`/api/v2/exhibit/${nonExistingId}`)

      // THEN   the server should return an HTTP 404 Not Found

      expect(getResponse).to.have.status(404)
    })
  })

  describe('PUT /exhibit/:exhibitId', () => {

    it('should replace an existing exhibit', async () => {

      // GIVEN  a database with an exhibit

      const exhibit111_ = {...exhibit111, parent: exposition110Id}

      const exhibit111Doc = await Exhibit.create(exhibit111_)
      const exhibit111Id = exhibit111Doc._id

      // WHEN   replacing the existing exhibit

      const exhibit112_ = {...exhibit112, parent: exposition110Id}

      const putResponse = await chai.request(server)
        .put(`/api/v2/exhibit/${exhibit111Id}`)
        .set({'Authorization': authorization})
        .send(exhibit112_)

      // THEN   the server should return an HTTP 200
      // AND    the JSON response should contain the old exhibit

      expect(putResponse).to.have.status(200)
      expect(putResponse.body).to.shallowDeepEqual(exhibit111_)

      // THEN   the database should contain the new exhibit

      const exhibits = await Exhibit.find()
      expect(exhibits).to.be.an('array').with.lengthOf(1)
      // TODO: check content, check for super set not working because dates are stored differently
      // expect(exhibits[0]).to.shallowDeepEqual(exhibit112_)
    })

    it('should fail when replacing a non-existing exhibit', async () => {

      // WHEN   trying to replace a non-existing exhibit

      const nonExistingId = '012345678901234567890123'
      const exhibit111_ = {...exhibit111, parent: exposition110Id}

      const putResponse = await chai.request(server)
        .put(`/api/v2/exhibit/${nonExistingId}`)
        .set({'Authorization': authorization})
        .send(exhibit111_)

      // THEN   the server should return an HTTP 404 Not Found

      expect(putResponse).to.have.status(404)

      // THEN   the database shouldn't have changed

      const exhibits = await Exhibit.find()
      expect(exhibits).to.be.an('array').that.is.empty
    })
  })

  describe('DELETE /exhibit/:exhibitId', () => {

    it('should delete the specified exhibit', async () => {

      // GIVEN  a database with an exhibit

      const exhibit111_ = {...exhibit111, parent: exposition110Id}

      const exhibit111Doc = await Exhibit.create(exhibit111_)
      const exhibit111Id = exhibit111Doc._id

      // WHEN   deleting the exhibit

      const deleteResponse = await chai.request(server)
        .delete(`/api/v2/exhibit/${exhibit111Id}`)
        .set({'Authorization': authorization})

      // THEN   the server should return an HTTP 200
      // AND    the JSON response should contain the deleted exhibit

      expect(deleteResponse).to.have.status(200)
      expect(deleteResponse.body).to.shallowDeepEqual(exhibit111_)

      // THEN   the database shouldn't contain the deleted exhibit anymore

      const exhibits = await Exhibit.find()
      expect(exhibits).to.be.an('array').that.is.empty
    })

    it('should fail when deleting a non-existing exhibit', async () => {

      // WHEN   deleting a non-existing exhibit

      const nonExistingId = '012345678901234567890123'

      const deleteResponse = await chai.request(server)
        .delete(`/api/v2/exhibit/${nonExistingId}`)
        .set({'Authorization': authorization})

      // THEN   the server should return an HTTP 404 Not Found

      expect(deleteResponse).to.have.status(404)
    })
  })
})
