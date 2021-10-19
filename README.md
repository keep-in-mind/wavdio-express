This repository provides the Node backend for the wAVdio application. When run, it provides an REST API
at http://localhost:3000/api/v2 .

# Quickstart

Given a MongoDB database on `localhost:27017`, you can start `wavdio-express` directly via `npx`:

```bash
$ npx -y wavdio-express
```

Alternatively, `wavdio-express` can also be run via Docker:

```bash
$ git clone https://github.com/keep-in-mind/wavdio-express.git
$ cd wavdio-express/
$ docker-compose up
```

After starting, the API can be tested at http://localhost:3000/api/v2/museum .

# Upgrade from 2.x -> 3.x

Before upgrading from version 2.x to 3.x, the database version has to be added manually to the database:

```bash
$ mongo
> use wavdio_express
switched to db wavdio-express
> db.meta.insert({version: 4})
WriteResult({ "nInserted" : 1 })
> db.meta.find()
{ "_id" : ObjectId("..."), "version" : 4 }
```
