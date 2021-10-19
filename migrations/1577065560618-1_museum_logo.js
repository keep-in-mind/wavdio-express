/*
 * - Move museum.logo to museum.contents.$[].image
 * - Add museum.contents.$[].logo = null
 */

const mongodb = require('mongodb')

const MongoClient = mongodb.MongoClient

const dbUri = process.env.DB_URI

//
// UP
//

module.exports.up = async function () {
  console.log('Upgrading to version 1 (museum logo)')

  try {
    const db = await MongoClient.connect(dbUri)
    const dbo = db.db('wavdio-express')

    const meta = await dbo.collection('meta').findOne()

    if (meta.version === 0) {
      const museum = await dbo.collection('museums').findOne()
      const logo = museum.logo

      await dbo.collection('museums').updateOne({}, {$unset: {'logo': null}})
      await dbo.collection('museums').updateOne({}, {$set: {'contents.$[].logo': null}})
      await dbo.collection('museums').updateOne({}, {$set: {'contents.$[].image': logo}})

      await dbo.collection('meta').updateOne({}, {$set: {'version': 1}})
    } else {
      console.warn('Skipping')
    }

    await db.close()

  } catch (error) {
    console.error(error)
  }
}

//
// DOWN
//

module.exports.down = async function () {
  console.log('Downgrading from version 1 (museum logo)')

  try {
    const db = await MongoClient.connect(dbUri)
    const dbo = db.db('wavdio-express')

    const meta = await dbo.collection('meta').findOne()

    if (meta.version === 1) {
      await dbo.collection('museums').updateOne({}, {$set: {'logo': null}})
      await dbo.collection('museums').updateOne({}, {$unset: {'contents.$[].logo': null}})
      await dbo.collection('museums').updateOne({}, {$unset: {'contents.$[].image': null}})

      await dbo.collection('meta').updateOne({}, {$set: {'version': 0}})
    } else {
      console.warn('Skipping')
    }

    await db.close()

  } catch (error) {
    console.error(error)
  }
}
