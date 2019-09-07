const serverless = require("serverless-http");
const express = require("express");
const path = require("path");
const app = express();

const cors = require("cors");
const bodyParser = require("body-parser");

app.use(cors());
app.use(bodyParser.json());

// Serve the static files from the React app
// TODO no
app.use(express.static(path.join(__dirname, "build")));

require("./routes.js")(app);

const server = app.listen(8081, function() {
  console.log("Listening on port %s...", server.address().port);
});

module.exports.handler = serverless(app);
