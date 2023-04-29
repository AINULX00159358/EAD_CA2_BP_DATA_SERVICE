const { MongoClient } = require('mongodb');
const express = require("express");
const bodyParser = require('body-parser');
const dbUri = require("./dbConnection.js")


const profile = process.env.PROFILE || "development";
const config = require('./config/config.json');
let appConfig = config.development;
if (profile === 'production'){
  console.log("Application Profile is ", profile)
  appConfig = config.production;
}

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const PORT = process.env.PORT || appConfig.exposedPort;

/**
 * call getDBUri, then use MongoClient to connect to Mongo Database based on URI
 * <p>
 *   It creates Database if not exist, then create a Collection if not exist
 * </p>
 * @type {Promise<Collection<Document>>}
 */

const collection = dbUri.getCollection(appConfig);
collection.then(c => console.log("Successfully Connected to mongo database ", c.dbName , " and collection ", c.collectionName));


app.listen(PORT, () => {
  console.log("Server started on port "+ PORT);
});

app.get('/health', (req, res) => {
     collection.then(c=> c.stats()).then(r => res.json(r));
});

app.post('/getRecords', (req, res) => {
  console.log("/getRecords ", req.body.email);
  var query = { email: req.body.email };
  var limit = 10;
  if (req.body.limit && req.body.limit < 51) {
    limit = req.body.limit
  }
  collection.then(c => c.find(query).limit(limit).sort({'timestamp': -1}).maxTimeMS(1000).toArray().then((result, error) => {
      res.status(200).json(result);
  }));
});

app.post('/addRecords', (req, res) => {
  console.log("/addRecords ", req.body.email);
  let record = {
    email: req.body.email,
    systolic:  req.body.systolic,
    diastolic:  req.body.diastolic,
    category: "High",
    timestamp: Date.now(),
  };
  collection.then(c => c.insertOne(record))
      .then(result => res.json({'id': result.insertedId, 'ak':result.acknowledged }));
});
