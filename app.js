const express = require("express");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
  path: "./.env",
});

const app = express();
const port = process.env.PORT;

app.use(express.json());
