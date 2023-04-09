const { MongoClient } = require('mongodb');
const express = require("express");
const bodyParser = require('body-parser');

const config = require('./config/config.json');
const defaultConfig = config.development;
global.gConfig = defaultConfig;

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const PORT = process.env.PORT || global.gConfig.exposedPort;
const MONGO_CONN_URI = process.env.MONGO_CONN_URI || config.database.connectionUrl
const getDBUri =  () => new Promise((resolve, reject) => resolve(MONGO_CONN_URI));

/**
 * call getDBUri, then use MongoClient to connect to Mongo Database based on URI
 * <p>
 *   It creates Database if not exist, then create a Collection if not exist
 * </p>
 * @type {Promise<Collection<Document>>}
 */
console.log(' MONGO_CONN_URI ' , MONGO_CONN_URI);
const collection = getDBUri()
                  .then(x => { console.log('connectin to mongo uri ', x); return x})
                  .then(uri => MongoClient.connect(uri, { useNewUrlParser: true })
                  .then(conn => conn.db(config.database.name))
                  .then(db => db.collection(config.database.collection)));

collection.then(c => console.log("Mongo ", c.dbName , c.collectionName));


app.listen(PORT, () => {
  console.log("Server running on port "+ PORT);
});


app.post('/getRecords', (req, res) => {
  console.log("/getRecords ", req);
  var query = { email: 'eerr@ssss.com' };
  var limit = 10;
  if (req.body.limit && req.body.limit < 51) {
    limit = req.body.limit
  }
  collection.then(c => c.find(query).limit(limit).sort({'timestamp': -1}).maxTimeMS(1000).toArray().then((result, error) => {
      res.status(200).json(result);
  }));
});
