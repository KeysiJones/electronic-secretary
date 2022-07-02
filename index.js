const express = require("express");
require("dotenv").config();
const PORT = process.env.PORT || 3001;
const BASE_URL = process.env.REACT_APP_BASE_URL
const BOT_API_KEY = process.env.BOT_API_KEY
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.get("/", function (req, res) {
  res.status(200).json({message: 'success'})
});

app.listen(PORT, () => console.log("programa iniciou"));
