/*
 * Fix: Move museum logo to content.
 */

const mongodb = require('mongodb')

const MongoClient = mongodb.MongoClient

const dbUri = process.env.DB_URI

/* Up */

module.exports.up = async function () {
  console.log('Upgrading to version 1 (museum logo)')

  const db = await MongoClient.connect(dbUri)
  const dbo = db.db('wavdio-express')
  const meta = await dbo.collection('meta').findOne()

  if (meta.version === 0) {
    await up(dbo)

    await dbo.collection('meta').updateOne({}, {$set: {'version': 1}})
  } else {
    console.warn('Skipping')
  }

  await db.close()
}

async function up (dbo) {
  const museum = await dbo.collection('museums').findOne()
  const logo = museum.logo

  await dbo.collection('museums').updateOne({}, {$unset: {'logo': null}})
  await dbo.collection('museums').updateOne({}, {$set: {'contents.$[].logo': null}})
  await dbo.collection('museums').updateOne({}, {$set: {'contents.$[].image': logo}})
}

/* Down */

module.exports.down = async function () {
  console.log('Downgrading from version 1 (museum logo)')

  const db = await MongoClient.connect(dbUri)
  const dbo = db.db('wavdio-express')
  const meta = await dbo.collection('meta').findOne()

  if (meta.version === 1) {
    await down(dbo)

    await dbo.collection('meta').updateOne({}, {$set: {'version': 0}})
  } else {
    console.warn('Skipping')
  }

  await db.close()
}

async function down (dbo) {
  await dbo.collection('museums').updateOne({}, {$set: {'logo': null}})
  await dbo.collection('museums').updateOne({}, {$unset: {'contents.$[].logo': null}})
  await dbo.collection('museums').updateOne({}, {$unset: {'contents.$[].image': null}})
}
