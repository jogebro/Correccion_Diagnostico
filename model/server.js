const { MongoClient } = require('mongodb');
const express = require('express');

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT;
    this.url = process.env.MONGO_URI;
    this.client = new MongoClient(this.url);
    this.paths = {
      medicamentos: '/medicamentos',
    };
    this.middlewares();
    this.connectDB();
    this.routes();
  }

  async connectDB() {
    try {
      await this.client.connect();
      console.log('Conectado a la base de datos');
    } catch (error) {
      console.log(error);
    }
  }

  middlewares() {
    this.app.use(express.json());
  }

  routes() {
    this.app.use(this.paths.medicamentos, require('../routes/medicamento.routes.js'));
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log(`Server running in port: ${this.port}`);
    });
  }
}

module.exports = Server;
