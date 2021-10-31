const chai = require('chai')
const chaiHttp = require('chai-http')
const fs = require('fs')

const server = require('../server')

const expect = chai.expect

chai.use(chaiHttp)

describe('Upload', () => {
  describe('POST /upload', () => {
    it('upload image', async () => {
      const _id = '5c0fc030f3d3190ded731d98'
      const file = './test/TestMedium/hallo_winni.jpg'

      const response = await chai.request(server).post('/upload/' + _id)
        .attach('file', fs.readFileSync(file))

      expect(response).to.have.status(201)
    })
  })
})
