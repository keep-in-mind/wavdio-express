/*
 * Support adding an imprint.
 */

const mongodb = require('mongodb')

const MongoClient = mongodb.MongoClient

const dbUri = process.env.DB_URI

/* Up */

module.exports.up = async function () {
  console.log('Upgrading to version 3 (imprint)')

  try {
    const db = await MongoClient.connect(dbUri)
    const dbo = db.db('wavdio-express')
    const meta = await dbo.collection('meta').findOne()

    if (meta.version === 2) {
      // nothing to do

      await dbo.collection('meta').updateOne({}, {$set: {'version': 2}})
    } else {
      console.warn('Skipping')
    }

    await db.close()
  } catch (error) {
    console.error(error)
  }
}

/* Down */

module.exports.down = async function () {
  console.log('Downgrading from version 2 (imprint)')

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

  /* Delete imprint from all languages */

  dbo.collection('museums').updateOne({}, {$unset: {'contents.$[].imprint': ''}})
}
