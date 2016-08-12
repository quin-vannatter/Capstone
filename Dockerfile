FROM node:latest

EXPOSE 3700

WORKDIR /usr/src/app

COPY package.json /usr/src/app/
# Install all prerequisites (build base used for gcc of some python modules)
RUN npm install

# Add the rest of the app code
COPY . /usr/src/app
