const chai = require('chai')
const chaiHttp = require('chai-http')
const fs = require('fs')

const server = require('../server')

chai.use(chaiHttp)

const expect = chai.expect

describe('Upload', () => {

  describe('POST /upload', () => {

    it('should upload an image', async () => {

      // WHEN   uploading an image

      const id = '012345678901234567890123'
      const file = fs.readFileSync('test/fixtures/cat.jpg')

      const postResponse = await chai.request(server)
        .post(`/upload/${id}`)
        .attach('file', file)

      // THEN   the server should return an HTTP 201 Created

      expect(postResponse).to.have.status(201)
    })
  })
})
