const mongodb = require('mongodb')

const config = require('../config')

const MongoClient = mongodb.MongoClient

//
// Mongo Connection URI
//

const dbHost = 'localhost'
const dbPort = 27017
const dbName = config['db-name']
const dbUser = config['db-user']
const dbPassword = config['db-password']

let uri;

if (migrate_db.uri) {
  uri = migrate_db.uri

} else if (dbUser === null && dbPassword === null) {
  uri = `mongodb://${dbHost}:${dbPort}/${dbName}`

} else if (dbUser !== null && dbPassword !== null) {
  uri = `mongodb://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`

} else {
  console.error('Error in config.json. Must provide both user and password, or neither.');
  process.exit();
}

//
// UP
//

module.exports.up = async function () {
  console.log('Upgrading to 31_multiple_languages')

  try {
    const db = await MongoClient.connect(uri, {useUnifiedTopology: true})
    const dbo = db.db(dbName)

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

//
// DOWN
//

module.exports.down = async function () {
  console.log('Downgrading from 31_multiple_languages')

  try {
    const db = await MongoClient.connect(uri, {useUnifiedTopology: true})
    const dbo = db.db(dbName)

    /* Delete settings collection */

    await dbo.collection('settings').drop()

    /* Delete Spanish and French museum contents */

    for (let lang of ['es', 'fr']) {
      await dbo.collection('museums').updateOne({}, {$pull: {contents: {lang: lang}}})
    }

    /* Delete Spanish and French exposition contents */

    for (let lang of ['es', 'fr']) {
      await dbo.collection('expositions').updateMany({}, {$pull: {contents: {lang: lang}}})
    }

    /* Delete Spanish and French exhibit contents */

    for (let lang of ['es', 'fr']) {
      await dbo.collection('exhibits').updateMany({}, {$pull: {contents: {lang: lang}}})
    }

    /* */

    await db.close()

  } catch (error) {
    console.error(error)
  }
}
