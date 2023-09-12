const { MongoClient } = require("mongodb");
const express = require("express");
const dotenv = require("dotenv").config();

const app = express();

const url = process.env.MONGO_URI;
const client = new MongoClient(url);

client.connect();
console.log("Conectado a la base de datos");