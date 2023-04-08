const { MongoClient } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require("express");
const bodyParser = require('body-parser');

const config = require('./config/config.json');
const defaultConfig = config.development;
global.gConfig = defaultConfig;

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const PORT = process.env.PORT || global.gConfig.exposedPort;
const MONGO_CONN_URI = process.env.MONGO_CONN_URI;
const USE_IN_MEMORY_GRID = process.env.USE_IN_MEMORY_GRID;

// Fail fast of neither MONGO_CONN_URI nor USE_IN_MEMORY_GRID is provided
if ((! MONGO_CONN_URI) && (! USE_IN_MEMORY_GRID)) throw new Error(" Neither MONGO_CONN_URI is defines nor USE_IN_MEMORY_GRID flag is set")


let mongoMemoryServer = new MongoMemoryServer();
const getDBUriLive =  () => new Promise((resolve, reject) => resolve(MONGO_CONN_URI));
const getDBUriInMemory  = async () => await mongoMemoryServer.start()
                                                          .then(() => console.log("Starting In Memory Mongo Server "))
                                                          .then(() => mongoMemoryServer.getUri());
/**
 * Returns a promise of Mongo URI based on flag UNIT_TEST.
 * <p>
 *     if MONGO_CONN_URI  is provided  URI provided in Mongo Connection URI is returned pointing to running instance of Mongo <br>
 *     else In-Memory Mongo Instance is created abd URI is returned
 *  </p>
 * @type {{(): Promise<string>, (): Promise<unknown>}}
 */
const getDBUri =  (USE_IN_MEMORY_GRID) ?   getDBUriInMemory : getDBUriLive;

/**
 * call getDBUri, then use MongoClient to connect to Mongo Database based on URI
 * <p>
 *   It creates Database if not exist, then create a Collection if not exist
 * </p>
 * @type {Promise<Collection<Document>>}
 */
const collection = getDBUri()
    .then(x => { console.log(x); return x})
                  .then(uri => MongoClient.connect(uri, { useNewUrlParser: true })
                  .then(conn => conn.db(config.database.name))
                  .then(db => db.collection(config.database.collection)));
collection.then(c => console.log("Mongo ", c.dbName , c.collectionName));


app.listen(PORT, () => {
  console.log("Server running on port "+ PORT);
});


app.post('/getRecords', (req, res) => {
  var query = { email: 'eerr@ssss.com' };
  var limit = 10;
  if (req.body.limit && req.body.limit < 51) {
    limit = req.body.limit
  }
  collection.then(c => c.find(query).limit(limit).maxTimeMS(1000).toArray().then((result, error) => {
      res.status(200).json(result);
  }));
});
