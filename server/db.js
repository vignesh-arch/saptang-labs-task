require("dotenv").config();
const { MongoClient } = require("mongodb");
let db;

const url =
  process.env.DB_URL ||
    "mongodb+srv://vignesh-arch:Vignesh@cluster0.yvud6vl.mongodb.net/imageMetaData?retryWrites=true&w=majority";

async function connectToDB() {
    const client = new MongoClient(url);
    await client.connect();
    console.log('Connected to MongoDB Database', url);
    db = client.db();
}

async function getNextSequence() {
    const result = await db.collection('counters')
        .findOneAndUpdate(
            { _id: 'imageMetaData' },
            { $inc: { current: 1 } },
            { returnOriginal: false }
    );
    return result.current;
}

function getDB() {
    return db;
}

module.exports = { connectToDB, getDB, getNextSequence };