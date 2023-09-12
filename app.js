require("dotenv").config();

const Server = require("./model/server.js");
const server = new Server();

server.listen();