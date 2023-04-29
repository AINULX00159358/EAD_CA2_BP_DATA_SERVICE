
const fs = require("fs");
const { MongoClient } = require('mongodb');

const getDBUri =  (config) => new Promise((resolve, reject) => {
    if (process.env.MONGO_CONN_URI) {
        console.log('reading from env var MONGO_CONN_URI ' );
        if (process.env.MONGO_CREDENTIALS){
            resolve("mongodb://"+process.env.MONGO_CREDENTIALS+"@"+process.env.MONGO_CONN_URI);
            return;
        }
        throw(new Error("ERROR: Missing Mongo Credentials "))
    }

    if (config.database.credentials) {
        console.log(' connection using database development credentials');
        resolve("mongodb://"+ config.database.credentials+"@"+config.database.connectionUri);
        return;
    }

    let credential =  fs.readFileSync('/etc/mongo-secrets/MONGO_CREDENTIAL','utf8');
    if (credential){
        credential = credential.replace(/\r|\n/g, '')
        let mongoUrl = "mongodb://"+ credential +"@"+config.database.connectionUri;
        console.log(' connection using file /etc/mongo-secrets/**');
        resolve(mongoUrl);
        return;
    }
    throw(new Error("ERROR: Cannot Strat the Application, Unable to get credentials "))
});

module.exports.getCollection = (config) => getDBUri(config)
    .then(uri => { console.log('connecting to mongo uri ', uri.split("@")[1]); return uri.toString()})
    .then(uri => MongoClient.connect(uri, { useNewUrlParser: true , connectTimeoutMS: 10000, socketTimeoutMS: 10000}))
    .then(conn => conn.db(config.database.name))
    .then(db => db.collection(config.database.collection))
    .catch(r => {
        console.error(r);
        process.exit(1);
    });
