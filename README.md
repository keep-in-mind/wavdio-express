This repository provides the Node backend for the wAVdio application. When run, it provides an REST API
at http://localhost:3000/api/v2 .

# Quickstart

Given a MongoDB database on `localhost:27017`, you can start `wavdio-express` directly via `npx`:

```bash
$ npx -y wavdio-express
```

Alternatively, `wavdio-express` can also be run via Docker:

```bash
$ docker run --name wavdio-express --rm --publish 3000:3000 --detach wavio-express
```

After starting, the API can be tested at http://localhost:3000/api/v2/museum .
