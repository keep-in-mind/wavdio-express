const mongodb = require('mongodb')

const MongoClient = mongodb.MongoClient
const url = 'mongodb://localhost:27017/wAVdioDB'

module.exports.up = async function () {
  console.log('Upgrading to 31_multiple_languages')

  try {
    const db = await MongoClient.connect(url)
    const dbo = db.db('wAVdioDB')

    /* Create settings collection */

    await dbo.createCollection('settings')

    const defaultSettings = {activeLangs: {de: true, en: true, es: true, fr: true}}
    await dbo.collection('settings').insertOne(defaultSettings)

    /* Create museum contents */

    const museum = await dbo.collection('museums').findOne({})
    let langs = ['de', 'en', 'es', 'fr']

    // Delete already existing languages from 'langs'
    for (let content of museum.contents) {
      const index = langs.indexOf(content.lang)
      if (index !== -1) {
        langs.splice(index, 1)
      }
    }

    // Create remaining, missing languages
    for (let lang of langs) {
      await dbo.collection('museums').update({}, {$push: {'contents': {lang: lang}}})
    }

    /* */

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
