const serverless = require("serverless-http");
const express = require("express");
const app = express();

const cors = require("cors");
const bodyParser = require("body-parser");

app.use(cors());
app.use(bodyParser.json());

require("./routes.js")(app);

const server = app.listen(8081, function() {
  console.log("Listening on port %s...", server.address().port);
});

module.exports.handler = serverless(app);
