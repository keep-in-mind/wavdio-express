# Docker

## Build

```bash
docker build -t wavdio-express:2.0.3 .
```

## Run

```bash
docker run -it --rm -d -p 3000:3000 --name wavdio-express wavdio-express:2.0.3
```
