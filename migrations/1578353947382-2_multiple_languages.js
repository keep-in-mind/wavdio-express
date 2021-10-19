/*
 * Support multiple languages.
 */

const mongodb = require('mongodb')

const MongoClient = mongodb.MongoClient

const dbUri = process.env.DB_URI

/* UP */

module.exports.up = async function () {
  console.log('Upgrading to version 2 (multiple languages)')

  try {
    const db = await MongoClient.connect(dbUri)
    const dbo = db.db('wavdio-express')
    const meta = await dbo.collection('meta').findOne()

    if (meta.version === 1) {
      await up(dbo)

      await dbo.collection('meta').updateOne({}, {$set: {'version': 2}})
    } else {
      console.warn('Skipping')
    }

    await db.close()
  } catch (error) {
    console.error(error)
  }
}

async function up (dbo) {
  /* Create settings collection */

  await dbo.createCollection('settings')

  const defaultSettings = {activeLangs: {de: true, en: true, es: true, fr: true}}
  await dbo.collection('settings').insertOne(defaultSettings)

  /* Create museum contents */

  const museum = await dbo.collection('museums').findOne()
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
}

/* Down */

module.exports.down = async function () {
  console.log('Downgrading from version 2 (multiple languages)')

  try {
    const db = await MongoClient.connect(dbUri)
    const dbo = db.db('wavdio-express')
    const meta = await dbo.collection('meta').findOne()

    if (meta.version === 2) {
      await down(dbo)

      await dbo.collection('meta').updateOne({}, {$set: {'version': 1}})
    } else {
      console.warn('Skipping')
    }

    await db.close()
  } catch (error) {
    console.error(error)
  }
}

async function down (dbo) {

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
}
