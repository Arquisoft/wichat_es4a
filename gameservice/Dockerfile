# Use an official Node.js runtime as a parent image
FROM node:22

# Set the working directory in the container
WORKDIR /usr/src/gameservice

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

ARG API_URI="http://localhost:8000"
ENV GATEWAY_SERVICE=$API_URI

# Copy the app source code to the working directory
COPY . .

# Expose the port the app runs on
EXPOSE 8005

# Define the command to run your app
CMD ["node", "game-service.js"]
