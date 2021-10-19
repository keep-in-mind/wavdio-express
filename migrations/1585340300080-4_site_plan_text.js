/*
 * Support adding text for the site plan.
 */

const mongodb = require('mongodb')

const MongoClient = mongodb.MongoClient

const dbUri = process.env.DB_URI

/* Up */

module.exports.up = async function () {
  console.log('Upgrading to version 4 (site plan text)')

  const db = await MongoClient.connect(dbUri)
  const dbo = db.db('wavdio-express')
  const meta = await dbo.collection('meta').findOne()

  if (meta.version === 3) {
    // nothing to do

    await dbo.collection('meta').updateOne({}, {$set: {'version': 4}})
  } else {
    console.warn('Skipping')
  }

  await db.close()
}

/* Down */

module.exports.down = async function () {
  console.log('Downgrading from version 4 (site plan text)')

  const db = await MongoClient.connect(dbUri)
  const dbo = db.db('wavdio-express')
  const meta = await dbo.collection('meta').findOne()

  if (meta.version === 4) {
    await down(dbo)

    await dbo.collection('meta').updateOne({}, {$set: {'version': 3}})
  } else {
    console.warn('Skipping')
  }

  await db.close()
}

async function down (dbo) {

  /* Delete site plan text from all languages */

  dbo.collection('museums').updateOne({}, {$unset: {'contents.$[].sitePlanText': ''}})
}
