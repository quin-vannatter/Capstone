# Quickstart W/ Docker
Build a container
```
docker build -t jerlan .
```

Run the container
```
docker run --rm -t -p 3700:3700 jerlan node index.js
```
