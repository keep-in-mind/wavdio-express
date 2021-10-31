const chai = require('chai')
const chaiHttp = require('chai-http')
const chaiShallowDeepEqual = require('chai-shallow-deep-equal')

const Exhibit = require('../models/exhibit')
const Exposition = require('../models/exposition')
const Museum = require('../models/museum')
const authorization = require('./fixtures/authorization')
const exhibits = require('./fixtures/exhibits')
const expositions = require('./fixtures/expositions')
const mongoose = require('mongoose')
const museums = require('./fixtures/museums')
const server = require('../server')
const {copy} = require('./util')
const {exhibit111, exhibit112} = require('./fixtures/exhibits')
const {exposition110} = require('./fixtures/expositions')
const {museum100, louvre} = require('./fixtures/museums')

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

  describe('GET /exhibit/{{exhibit_id}}', () => {
    it('reading an existing exhibit should succeed', async () => {

      // GIVEN  a database with an existing exhibit

      const existingMuseum = museums['louvre']
      const dbExistingMuseum = await Museum.create(existingMuseum)
      const existingMuseumId = dbExistingMuseum._id.toString()

      const existingExposition = copy(expositions['bestOfLeonardoDaVinci'])
      existingExposition.museum = existingMuseumId
      const dbExistingExposition = await Exposition.create(existingExposition)
      const existingExpositionId = dbExistingExposition._id.toString()

      const existingExhibit = copy(exhibits['monaLisa'])
      existingExhibit.exposition = existingExpositionId
      const dbExistingExhibit = await Exhibit.create(existingExhibit)
      const existingExhibitId = dbExistingExhibit._id

      // WHEN   reading the existing exhibit

      const readResponse = await chai.request(server)
        .get(`/api/v2/exhibit/${existingExhibitId}`)

      // THEN   the server should return an HTTP 200 OK
      // AND    the JSON response should return the existing exhibit

      expect(readResponse).to.have.status(200)
      expect(readResponse.body).to.shallowDeepEqual(existingExhibit)
    })

    it('reading a non-existing exhibit should fail', async () => {

      // GIVEN  the empty database
      // AND    a non-existing ID

      const nonExistingId = '012345678901234567890123'

      // WHEN   trying to read the non-existing exhibit

      const readResponse = await chai.request(server)
        .get(`/api/v2/exhibit/${nonExistingId}`)

      // THEN   the server should return an HTTP 404 Not Found

      expect(readResponse).to.have.status(404)
    })
  })

  describe('PUT /exhibit/{{exhibit_id}}', () => {
    it('replacing an existing exhibit should succeed', async () => {

      // GIVEN  a database with an existing exhibit
      // AND    a new exhibit

      const existingMuseum = museums['louvre']
      const dbExistingMuseum = await Museum.create(existingMuseum)
      const existingMuseumId = dbExistingMuseum._id.toString()

      const existingExposition = copy(expositions['bestOfLeonardoDaVinci'])
      existingExposition.museum = existingMuseumId
      const dbExistingExposition = await Exposition.create(existingExposition)
      const existingExpositionId = dbExistingExposition._id.toString()

      const existingExhibit = copy(exhibits['monaLisa'])
      existingExhibit.exposition = existingExpositionId
      const dbExistingExhibit = await Exhibit.create(existingExhibit)
      const existingExhibitId = dbExistingExhibit._id

      const newExhibit = copy(exhibits['thePersistenceOfMemory'])
      newExhibit.exposition = existingExpositionId

      // WHEN   replacing the existing exhibit with the new one

      const putResponse = await chai.request(server)
        .put(`/api/v2/exhibit/${existingExhibitId}`)
        .set({'Authorization': authorization})
        .send(newExhibit)

      // THEN   the server should return an HTTP 200
      // AND    the JSON response should contain the old exhibit
      // AND    the database should contain the new exhibit

      expect(putResponse).to.have.status(200)
      expect(putResponse.body).to.shallowDeepEqual(existingExhibit)

      const dbExhibitsAfter = await Exhibit.find()
      expect(dbExhibitsAfter).to.be.an('array').of.length(1)
      // TODO: check content, check for super set not working because dates are stored differently
      // expect(dbExhibitsAfter[0]).to.shallowDeepEqual(newExhibit);
    })

    it('replacing a non-existing exhibit should fail', async () => {

      // GIVEN  the empty database
      // AND    a non-existing ID
      // AND    a new exhibit

      const nonExistingId = '012345678901234567890123'
      const newExhibit = copy(exhibits['thePersistenceOfMemory'])
      newExhibit.exposition = nonExistingId

      // WHEN   trying to replace the non-existing exhibit with the new one

      const putResponse = await chai.request(server)
        .put(`/api/v2/exhibit/${nonExistingId}`)
        .set({'Authorization': authorization})
        .send(newExhibit)

      // THEN   the server should return an HTTP 404 Not Found
      // AND    the database shouldn't contain an exhibit

      expect(putResponse).to.have.status(404)

      const dbExhibitsAfter = await Exhibit.find()
      expect(dbExhibitsAfter).to.be.an('array').that.is.empty
    })
  })

  describe('DELETE /exhibit/{{exhibit_id}}', () => {
    it('deleting an existing exhibit should succeed', async () => {

      // GIVEN  a database with an existing exhibit

      const existingMuseum = museums['louvre']
      const dbExistingMuseum = await Museum.create(existingMuseum)
      const existingMuseumId = dbExistingMuseum._id.toString()

      const existingExposition = copy(expositions['bestOfLeonardoDaVinci'])
      existingExposition.museum = existingMuseumId
      const dbExistingExposition = await Exposition.create(existingExposition)
      const existingExpositionId = dbExistingExposition._id.toString()

      const existingExhibit = copy(exhibits['monaLisa'])
      existingExhibit.exposition = existingExpositionId
      const dbExistingExhibit = await Exhibit.create(existingExhibit)
      const existingExhibitId = dbExistingExhibit._id

      // WHEN   deleting the existing exhibit

      const deleteResponse = await chai.request(server)
        .delete(`/api/v2/exhibit/${existingExhibitId}`)
        .set({'Authorization': authorization})

      // THEN   the server should return an HTTP 200
      // AND    the JSON response should contain the old exhibit
      // AND    the database should contain no exhibits anymore

      expect(deleteResponse).to.have.status(200)
      expect(deleteResponse.body).to.shallowDeepEqual(existingExhibit)

      const dbExhibitsAfter = await Exhibit.find()
      expect(dbExhibitsAfter).to.be.an('array').that.is.empty
    })

    it('deleting a non-existing exhibit should fail', async () => {

      // GIVEN  the empty database
      // AND    a non-existing ID

      const nonExistingId = '012345678901234567890123'

      // WHEN   trying to delete the non-existing exhibit

      const deleteResponse = await chai.request(server)
        .delete(`/api/v2/exhibit/${nonExistingId}`)
        .set({'Authorization': authorization})

      // THEN   the server should return an HTTP 404 Not Found

      expect(deleteResponse).to.have.status(404)
    })
  })
})
