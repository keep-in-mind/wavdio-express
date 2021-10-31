const chai = require('chai')
const chaiHttp = require('chai-http')
const chaiShallowDeepEqual = require('chai-shallow-deep-equal')

const Infopage = require('../models/infopage')
const server = require('../server')
const {authorization} = require('./fixtures/authorization')
const {infopage1, infopage2} = require('./fixtures/infopages')
const mongoose = require('mongoose')

chai.use(chaiHttp)
chai.use(chaiShallowDeepEqual)

const expect = chai.expect

describe('Infopages', () => {

  before(async () => {
    await mongoose.connect('mongodb://localhost:27017/wavdio-express')
  })

  afterEach(async () => {
    await Infopage.deleteMany()
  })

  after(async () => {
    await mongoose.disconnect()
  })

  describe('GET /infopage', () => {

    it('should return no infopages for the initial database', async () => {

      // GIVEN  the initial database

      // WHEN   getting all infopages

      const getResponse = await chai.request(server)
        .get('/api/v2/infopage')

      // THEN   the server should return an HTTP 200 OK
      // AND    the JSON response should be an empty array

      expect(getResponse).to.have.status(200)
      expect(getResponse.body).to.be.an('array').that.is.empty
    })

    it('should return all infopages for a filled database', async () => {

      // GIVEN  a database with infopages

      await Infopage.create(infopage1)
      await Infopage.create(infopage2)

      // WHEN   getting all infopages

      const getResponse = await chai.request(server)
        .get('/api/v2/infopage')

      // THEN   the server should return an HTTP 200 OK
      // AND    the JSON response should contain the infopages

      expect(getResponse).to.have.status(200)
      expect(getResponse.body).to.be.an('array').with.lengthOf(2)
      expect(getResponse.body[0]).to.shallowDeepEqual(infopage1)
      expect(getResponse.body[1]).to.shallowDeepEqual(infopage2)
    })
  })

  describe('POST /infopage', () => {

    it('should create an infopage', async () => {

      // WHEN   posting an infopage

      const postResponse = await chai.request(server)
        .post('/api/v2/infopage')
        .set({'Authorization': authorization})
        .send(infopage1)

      // THEN   the server should return an HTTP 201 Created
      // AND    the JSON response should contain the new infopage

      expect(postResponse).to.have.status(201)
      expect(postResponse.body).to.shallowDeepEqual(infopage1)

      // THEN   the database should contain the new infopage

      const infopages = await Infopage.find()
      expect(infopages).to.be.an('array').with.lengthOf(1)
      expect(infopages[0]).to.shallowDeepEqual(infopage1)
    })

    it('should fail without authorization', async () => {

      // WHEN   posting an infopage without authorization

      const postResponse = await chai.request(server)
        .post('/api/v2/infopage')
        .send(infopage1)

      // THEN   the server should return an HTTP 401 Unauthorized
      // AND    the JSON response shouldn't contain sensitive information

      expect(postResponse).to.have.status(401)
      expect(postResponse.body).to.deep.equal({message: 'unauthorized'})

      // THEN   the database shouldn't contain the infopage

      const infopages = await Infopage.find()
      expect(infopages).to.be.an('array').that.is.empty
    })

    it('should fail when posting an infopage with a missing required property', async () => {

      // WHEN   posting an infopage with a missing required property

      const infopage1_ = {...infopage1}
      delete infopage1_.lang

      const postResponse = await chai.request(server)
        .post('/api/v2/infopage')
        .set({'Authorization': authorization})
        .send(infopage1_)

      // THEN   the server should return an HTTP 400 Bad Request
      // AND    the database shouldn't contain the new infopage

      expect(postResponse).to.have.status(400)

      // THEN   the database shouldn't contain the infopage

      const infopages = await Infopage.find()
      expect(infopages).to.be.an('array').that.is.empty
    })

    it('should work when posting an infopage with a missing non-required property', async () => {

      // WHEN   posting an infopage with a missing non-required property

      const infopage1_ = {...infopage1}
      delete infopage1_.text

      const postResponse = await chai.request(server)
        .post('/api/v2/infopage')
        .set({'Authorization': authorization})
        .send(infopage1_)

      // THEN   the server should return an HTTP 201 Created
      // AND    the JSON response should be the new infopage

      expect(postResponse).to.have.status(201)
      expect(postResponse.body).to.shallowDeepEqual(infopage1_)

      // THEN   the database should contain the infopage

      const infopages = await Infopage.find()
      expect(infopages).to.be.an('array').with.lengthOf(1)
      expect(infopages[0]).to.shallowDeepEqual(infopage1_)
    })
  })

  describe('GET /infopage/:infopageId', () => {

    it('should return the specified infopage', async () => {

      // GIVEN  a database with an infopage

      const infopage1Doc = await Infopage.create(infopage1)
      const infopage1Id = infopage1Doc._id

      // WHEN   getting the infopage

      const getResponse = await chai.request(server)
        .get(`/api/v2/infopage/${infopage1Id}`)

      // THEN   the server should return an HTTP 200 OK
      // AND    the JSON response should be the infopage

      expect(getResponse).to.have.status(200)
      expect(getResponse.body).to.shallowDeepEqual(infopage1)
    })

    it('should fail for a non-existing infopage', async () => {

      // WHEN   getting a non-existing infopage

      const nonExistingId = '012345678901234567890123'

      const getResponse = await chai.request(server)
        .get(`/api/v2/infopage/${nonExistingId}`)

      // THEN   the server should return an HTTP 404 Not Found

      expect(getResponse).to.have.status(404)
    })
  })

  describe('PUT /infopage/:infopageId', () => {

    it('should replace an existing infopage', async () => {

      // GIVEN  a database with an infopage

      const infopage1Doc = await Infopage.create(infopage1)
      const infopage1Id = infopage1Doc._id

      // WHEN   replacing the existing infopage

      const putResponse = await chai.request(server)
        .put(`/api/v2/infopage/${infopage1Id}`)
        .set({'Authorization': authorization})
        .send(infopage2)

      // THEN   the server should return an HTTP 200
      // AND    the JSON response should contain the old infopage

      expect(putResponse).to.have.status(200)
      expect(putResponse.body).to.shallowDeepEqual(infopage1)

      // THEN   the database should contain the new infopage

      const infopages = await Infopage.find()
      expect(infopages).to.be.an('array').with.lengthOf(1)
      expect(infopages[0]).to.shallowDeepEqual(infopage2)
    })

    it('should fail when replacing a non-existing infopage', async () => {

      // WHEN   trying to replace a non-existing infopage

      const nonExistingId = '012345678901234567890123'

      const putResponse = await chai.request(server)
        .put(`/api/v2/infopage/${nonExistingId}`)
        .set({'Authorization': authorization})
        .send(infopage1)

      // THEN   the server should return an HTTP 404 Not Found

      expect(putResponse).to.have.status(404)

      // THEN   the database shouldn't have changed

      const infopages = await Infopage.find()
      expect(infopages).to.be.an('array').that.is.empty
    })
  })

  describe('DELETE /infopage/:infopageId', () => {

    it('should delete the specified infopage', async () => {

      // GIVEN  a database with an infopage

      const infopage1Doc = await Infopage.create(infopage1)
      const infopage1Id = infopage1Doc._id

      // WHEN   deleting the infopage

      const deleteResponse = await chai.request(server)
        .delete(`/api/v2/infopage/${infopage1Id}`)
        .set({'Authorization': authorization})

      // THEN   the server should return an HTTP 200
      // AND    the JSON response should contain the deleted infopage

      expect(deleteResponse).to.have.status(200)
      expect(deleteResponse.body).to.shallowDeepEqual(infopage1)

      // THEN   the database shouldn't contain the deleted infopage anymore

      const infopages = await Infopage.find()
      expect(infopages).to.be.an('array').that.is.empty
    })

    it('should fail when deleting a non-existing infopage', async () => {

      // WHEN   deleting a non-existing infopage

      const nonExistingId = '012345678901234567890123'

      const deleteResponse = await chai.request(server)
        .delete(`/api/v2/infopage/${nonExistingId}`)
        .set({'Authorization': authorization})

      // THEN   the server should return an HTTP 404 Not Found

      expect(deleteResponse).to.have.status(404)
    })
  })
})
