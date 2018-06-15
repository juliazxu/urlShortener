const express = require("express");
const app = express();

// Connect to mongoose with db name shorten
const mongoURI = "mongodb://localhost/shorten";
const mongoose = require("mongoose");

const options = {
  keepAlive: true,
  reconnectTries: Number.MAX_VALUE,
};

mongoose.Promise = global.Promise;
mongoose.connect(mongoURI, options, (err, db) => {
  if (err) {
    console.log('Error is', err);
  } else {
    console.log('connected to mongoose');
  }
});

const { Schema } = mongoose;

const urlShortenSchema = new Schema({
  originalUrl: String,
  shortenedUrl: String,
});

mongoose.model("url_shorten", urlShortenSchema);

const UrlShorten = mongoose.model("url_shorten");

// parse body
const bodyParser = require('body-parser');
app.use(bodyParser.json());

// run our server
const PORT = 2323;

app.listen(PORT, () => {
  console.log('Listening on', PORT)
});

//encoding
const base64url = require('base64-url');

//see post commands at the end of doc
app.post("/shorten", async (req, res) => {

  // check db to see if shortened version exists

  // if yes, return error ('that url already exists in db')
  // if not, return new shortened url
  const originalUrl = req.query.originalUrl;

  const item = await UrlShorten.findOne({ originalUrl: originalUrl }, function (err, adventure) {
    console.log('err is', err);
  });

  if (item) {
    console.log('Already exists');
    res.send('Already exists');

  } else {
    let shortenedUrl = base64url.encode(originalUrl);
    const item = UrlShorten({
      originalUrl,
      shortenedUrl
    });
    console.log('item to be posted', item);

    await item.save();

    res.status(200).json({
      originalUrl,
      shortenedUrl
    });
  }

});

// get localhost:2323/shorten?originalUrl=http://google.com
app.get("/shorten", async (req, res) => {
  
  // check db to see if originalurl is in the system
  // if yes, return shortenedurl
  // if no, return error ('that url does not exist in db')

  const originalUrl = req.query.originalUrl;
  console.log('orig url', originalUrl);

  const item = await UrlShorten.findOne({ originalUrl: originalUrl }, function (err, adventure) {
    console.log('err is', err);
  });

  if (item) {
    res.redirect(item.shortenedUrl);
  } else {
    res.send('That url does not exist!!!');
  }

});

app.get("/:shortenedUrl", async (req, res) => {

  const shortenedUrl = req.params.shortenedUrl;
  console.log('shortened url is', shortenedUrl);

  // let originalUrl = base64url.decode(shortenedUrl);

  const item = await UrlShorten.findOne({ shortenedUrl: shortenedUrl });
  console.log('item is', item);

  if (item) {
    res.redirect(item.originalUrl);
  } else {
    res.send('That url does not exist');
  }

});

// curl -v -H "Content-Type:application/json" -X POST http://localhost:2323/shorten?originalUrl=http://google.com
// shortened url should take you google
// localhost:2323/aHR0cDovL2dvb2dsZS5jb20


// curl -v -H "Content-Type:application/json" -X POST http://localhost:2323/shorten?originalUrl=http://facebook.com
// shortened url should take you to facebook 
// localhost:2323/aHR0cDovL2ZhY2Vib29rLmNvbQ