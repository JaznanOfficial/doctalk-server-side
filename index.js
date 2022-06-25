const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
const cors = require("cors");

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mmpfkrs.mongodb.net/?retryWrites=true&w=majority`;
// db information

const client = new MongoClient(uri);
//  db connection


async function run() {
    try {
        await client.connect();
        const database = client.db("DocTalk-Server");
        const servicesData = database.collection("servicesData");
        const doctorsData = database.collection("doctors-data");
        const patientsData = database.collection("patients-data");
        // database and collections information

        // get methods--------------------->

        app.get('/api/services', async (req, res) => { 
            const query = {};
            const cursor = servicesData.find(query);
            const services = await cursor.toArray();
            res.send(services);
            
        });
                // get all services
        
        // get methods--------------------->


    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});