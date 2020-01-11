const mongodb = require('mongodb')

const MongoClient = mongodb.MongoClient
const url = 'mongodb://localhost:27017/wAVdioDB'

module.exports.up = async function () {
  console.log('Upgrading to 31_multiple_languages')

  try {
    const db = await MongoClient.connect(url, {useUnifiedTopology: true})
    const dbo = db.db('wAVdioDB')

    /* Create settings collection */

    await dbo.createCollection('settings')

    const defaultSettings = {activeLangs: {de: true, en: true, es: true, fr: true}}
    await dbo.collection('settings').insertOne(defaultSettings)

    /* Create museum contents */

    const museum = await dbo.collection('museums').findOne({})
    const langs = ['de', 'en', 'es', 'fr']

    // Delete already existing languages from 'langs'
    for (let content of museum.contents) {
      const index = langs.indexOf(content.lang)
      if (index !== -1) {
        langs.splice(index, 1)
      }
    }

    // Create remaining, missing languages
    for (let lang of langs) {
      await dbo.collection('museums').updateOne({}, {$push: {contents: {lang: lang}}})
    }

    /* Create exposition contents */

    const expositions = await dbo.collection('expositions').find({}).toArray()

    for (let exposition of expositions) {
      const langs = ['de', 'en', 'es', 'fr']

      // Delete already existing languages from 'langs'
      for (let content of exposition.contents) {
        const index = langs.indexOf(content.lang)
        if (index !== -1) {
          langs.splice(index, 1)
        }
      }

      // Create remaining, missing languages
      for (let lang of langs) {
        await dbo.collection('expositions')
          .updateOne({_id: exposition._id}, {$push: {contents: {lang: lang}}})
      }
    }

    /* Create exhibit contents */

    const exhibits = await dbo.collection('exhibits').find({}).toArray()

    for (let exhibit of exhibits) {
      const langs = ['de', 'en', 'es', 'fr']

      // Delete already existing languages from 'langs'
      for (let content of exhibit.contents) {
        const index = langs.indexOf(content.lang)
        if (index !== -1) {
          langs.splice(index, 1)
        }
      }

      // Create remaining, missing languages
      for (let lang of langs) {
        await dbo.collection('exhibits')
          .updateOne({_id: exhibit._id}, {$push: {contents: {lang: lang}}})
      }
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
    const db = await MongoClient.connect(url, {useUnifiedTopology: true})
    const dbo = db.db('wAVdioDB')

    /* Delete settings collection */

    await dbo.collection('settings').drop()

    /* Delete Spanish and French museum contents */

    const museum = await dbo.collection('museums').findOne({})

    for (let lang of ['es', 'fr']) {
      await dbo.collection('museums').updateOne({}, {$pull: {contents: {lang: lang}}})
    }

    /* Delete Spanish and French exposition contents */

    const expositions = await dbo.collection('expositions').find({}).toArray()

    for (let lang of ['es', 'fr']) {
      await dbo.collection('expositions').updateMany({}, {$pull: {contents: {lang: lang}}})
    }

    /* Delete Spanish and French exhibit contents */

    const exhibits = await dbo.collection('exhibits').find({}).toArray()

    for (let lang of ['es', 'fr']) {
      await dbo.collection('exhibits').updateMany({}, {$pull: {contents: {lang: lang}}})
    }

    /* */

    await db.close()

  } catch (error) {
    console.error(error)
  }
}
