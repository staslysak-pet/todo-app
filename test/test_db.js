const {uri, dbName} = require('../db/config');
const ObjectId      = require('mongodb').ObjectId; 
const MongoClient   = require('mongodb').MongoClient;


exports.checkConnection = async () => {
    let connection;
    try {
        connection = await MongoClient.connect(uri, { useNewUrlParser: true });
        connection.close();
        return true;
    } catch(e) {
        return false;
    }
};



exports.getNotes = async () => {
    let client = await MongoClient.connect(uri, {useNewUrlParser: true});

    console.log('connected successfully!');

    const currentDb = client.db(dbName);

    const notesCol  = currentDb.collection('notes');

    const notes     = await notesCol.find({}).toArray();

    client.close();

    return notes;
};

exports.addNote = async (note) => {
    let client = null;
    try {
        client = await MongoClient.connect(uri, {useNewUrlParser: true});

        const currentDb = client.db(dbName);

        const notesCol  = currentDb.collection('notes');
        
        const addedNote = await notesCol.insertOne(note);

        client.close();

        return true;
    } catch (err) {
        return false;
    }
};

exports.updateNote = async (id, data) => {
    let client = null;
    try {
        client = await MongoClient.connect(uri, {useNewUrlParser: true});

        const currentDb = client.db(dbName);

        const notesCol  = currentDb.collection('notes');
        
        const Oid       = new ObjectId(id);

        const notes     = await notesCol.findOne({_id: Oid});

        await notesCol.updateOne(notes, {$set:data});

        client.close();

        return true
    } catch (err) {
        return false
    }
};

exports.deleteNote = async (id) => {
    let client = null;
    try {
        client = await MongoClient.connect(uri, {useNewUrlParser: true});

        const currentDb = client.db(dbName);

        const notesCol  = currentDb.collection('notes');
        
        const Oid       = new ObjectId(id);

        await notesCol.remove({_id: Oid});

        client.close();

        return true
    } catch (err) {
        return false
    }
};