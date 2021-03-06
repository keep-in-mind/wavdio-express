/*
 * Create the initial database, which contains one user and an example museum.
 */

const mongodb = require('mongodb')

const MongoClient = mongodb.MongoClient

const dbUri = process.env.DB_URI

const user = {
  'username': 'admin',
  'hash': 'f5feae01aabaa38251fde4cdf7cb32f83b48fb8b646a93632a4bf3d0e87f9c82f54783f1b16b135d54d732ea5620d669b90bbd83ef1b19a22e58d53d30619da5',
  'salt': '244604cf5d7bf393cf8fd4dcc45e2ae2',
  'session_id': 'e588af213c2af8ec42823e840f7b6539a9a5e8e718dbfe84e383ac1c460791012a96793740027ab4c7c6954e17e8815c16a9d4605f61ef2012af07695dce996532ab751e0ca759c2f08bcd4f345ec1ca8f119b460def150a69b3023dc3dc6c833f52c010ff1917a4c5bbdda4fe7a82a2eec56638f8f7751c298e9bb43d77d2dada8d73c9b99e08d156d9581afe4f6af04b81ca0a2900615e1349e11b39f249b613d287945833289e89b91f11bff089d718b233731c706dab10d3f71fac7feec12d980b94e8fefe40d6570c7ef44003aec341527d62695e5128a22e0311a2478eee6af14d7224b73315660c4c9b3b3de3dfb6d96165b666fa6ed4d725eac7b9303eeb2666feba7e2dfcedf306a47d09eaac5b31fc378e9a6b2b6ac86b1d7a73203fef3bbcd5b6b943de1ddaeb8bd3add5a2831ef01de55f37fb2df7042f7d6652ae9dbe91821772c950f5c7f8e07860ccb5fb6c1296fe080b2bd5f4b3ede62ff59fbfedd36f81ebfa67460fa311ba8c37bb7b2a0c355cb0f8fa599b4f17efe963f6f668aec68ce148871a933bf755207c3c243b176ae6b4d6b2b9fcd181d6e3e3a16e477d67ba61ec91015006612b25ea39fa422352ebd627882826d5d388a3b7a2a5358f4444f5c6f48ea786e40e1175aa26eada8024a0422bc4838e8499454b77c694937b704d1ed25b178bb223c9a42edbc4dc23c2fe8be9b4b9ac79f65e43'
}

const museum = {
  'logo': null,
  'contents': [
    {
      'lang': 'en',
      'name': 'New museum',
      'welcomeText': 'Welcome!',
      'sitePlan': null,
      'termsOfUse': 'Terms of use...',
      'privacyTerms': 'Privacy statement...',
    }, {
      'lang': 'de',
      'name': 'Neues Museum',
      'welcomeText': 'Willkommen!',
      'sitePlan': null,
      'termsOfUse': 'Nutzungsbedingungen...',
      'privacyTerms': 'Datenschutzrichtlinie...',
    }, {
      'lang': 'es'
    }, {
      'lang': 'fr'
    }
  ]
}

/* Up */

module.exports.up = async function () {
  console.log('Upgrading to version 0 (initial)')

  let db

  try {
    db = await MongoClient.connect(dbUri)
    const dbo = db.db('wavdio-express')
    const meta = await dbo.collection('meta').findOne()

    if (meta === null) {
      await up(dbo)

      await dbo.collection('meta').insertOne({version: 0})
    } else {
      console.warn('Skipping')
    }

  } finally {
    await db.close()
  }
}

async function up (dbo) {
  await dbo.collection('users').insertOne(user)
  console.log('User "admin" has been created with password "hsrm". Please change your credentials.')

  await dbo.collection('museums').insertOne(museum)
}

/* Down */

module.exports.down = async function () {
  console.log('Downgrading from version 0 (initial)')

  let db

  try {
    db = await MongoClient.connect(dbUri)
    const dbo = db.db('wavdio-express')
    const meta = await dbo.collection('meta').findOne()

    if (meta.version === 0) {
      await down(dbo)

      await dbo.collection('meta').drop()
    } else {
      console.warn('Skipping')
    }

  } finally {
    await db.close()
  }
}

async function down (dbo) {

  await dbo.collection('museums').drop()
  await dbo.collection('users').drop()

  const hasExhibits = await dbo.listCollections({name: 'exhibits'}).hasNext()
  if (hasExhibits) {
    await dbo.collection('exhibits').drop()
  }

  const hasExpositions = await dbo.listCollections({name: 'expositions'}).hasNext()
  if (hasExpositions) {
    await dbo.collection('expositions').drop()
  }
}
