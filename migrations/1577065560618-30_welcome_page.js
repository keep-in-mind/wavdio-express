const mongodb = require('mongodb')

const config = require('../config')

const migrate_db = require('migrate_db')

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
  console.log('Upgrading to 30_welcome_page')

  try {
    const db = await MongoClient.connect(uri)
    const dbo = db.db(dbName)

    const museum = await dbo.collection('museums').findOne({})
    const logo = museum.logo

    await dbo.collection('museums').updateOne({}, {$unset: {'logo': null}})
    await dbo.collection('museums').updateOne({}, {$set: {'contents.$[].logo': null}})
    await dbo.collection('museums').updateOne({}, {$set: {'contents.$[].image': logo}})

    await db.close()

  } catch (error) {
    console.error(error)
  }
}

//
// DOWN
//

module.exports.down = async function () {
  console.log('Downgrading from 30_welcome_page')

  try {
    const db = await MongoClient.connect(uri)
    const dbo = db.db(dbName)

    await dbo.collection('museums').updateOne({}, {$set: {'logo': null}})
    await dbo.collection('museums').updateOne({}, {$unset: {'contents.$[].logo': null}})
    await dbo.collection('museums').updateOne({}, {$unset: {'contents.$[].image': null}})

    await db.close()

  } catch (error) {
    console.error(error)
  }
}
