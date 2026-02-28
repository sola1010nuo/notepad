#!/bin/bash

# Start the client and server applications

# Navigate to the client directory and start the client
cd client
npm install
npm start &

# Navigate to the server directory and start the server
cd ../server
npm install
npm start &

# Wait for both processes to finish
wait