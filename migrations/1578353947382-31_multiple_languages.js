const mongodb = require('mongodb')

const MongoClient = mongodb.MongoClient
const url = 'mongodb://localhost:27017/wAVdioDB'

module.exports.up = async function () {
  console.log('Upgrading to 31_multiple_languages')

  try {
    const db = await MongoClient.connect(url)
    const dbo = db.db('wAVdioDB')

    await dbo.createCollection('settings')

    const defaultSettings = {activeLangs: {de: true, en: true, es: true, fr: true}}
    await dbo.collection('settings').insertOne(defaultSettings)

    await db.close()

  } catch (error) {
    console.error(error)
  }
}

module.exports.down = async function () {
  console.log('Downgrading from 31_multiple_languages')

  try {
    const db = await MongoClient.connect(url)
    const dbo = db.db('wAVdioDB')

    await dbo.collection('settings').drop()

    await db.close()

  } catch (error) {
    console.error(error)
  }
}
