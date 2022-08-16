const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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
        const bookingData = database.collection("booking-data");
        // database and collections information

        // get methods--------------------->

        app.get("/api/services", async (req, res) => {
            const query = {};
            const cursor = servicesData.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

        app.get("/doctors", async (req, res) => {
            const query = {};
            const cursor = doctorsData.find(query);
            const doctors = await cursor.toArray();
            res.send(doctors);
        });
        app.get("/doctors/:category", async (req, res) => {
            const params = req.params.category;
            const query = { specialized: params };

            const cursor = doctorsData.find(query);
            const doctors = await cursor.toArray();
            res.send(doctors);
            console.log(doctors);
        });
        app.get("/booking/:id", async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id)};
            console.log(query);
            const cursor = await doctorsData.findOne(query);

            res.send(cursor);
            console.log(cursor);
        });
        app.get("/payment/:id", async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = {uid:id};
            console.log(query);
            const cursor = await bookingData.findOne(query);

            res.send(cursor);
            console.log(cursor);
        });
        app.get("/bookings", async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            // console.log(req);
            console.log(req.query);
            const query = req.query;
            const cursor = bookingData.find(query);
            const bookings = await cursor.toArray();

            res.send(bookings);
            console.log(bookings);
        });

        // get methods--------------------->

        // post methods--------------------->

        app.post("/api/booking", async (req, res) => {
            const booking = req.body;
            const bookingResult = await bookingData.insertOne(booking);
            res.send(bookingResult);
        });

        app.post("/api/add-doctor", async (req, res) => {
            const doctor = req.body;
            const doctorResult = await doctorsData.insertOne(doctor);
            res.send(doctorResult);
        });

        // post methods--------------------->
        // const calculateOrderAmount = (amount) => {
        //     // console.log(items)
        //     const calculation = amount;
        //     console.log(amount);
        //     // Replace this constant with a calculation of the order's amount
        //     // Calculate the order total on the server to prevent
        //     // people from directly manipulating the amount on the client
        //     return +calculation;
        // };
        app.post("/create-payment-intent", async (req, res) => {
            const items = req.body;
            const amount = +items.fees * 100;
            console.log(typeof amount);
            const calculate = Number(amount);
            // Create a PaymentIntent with the order amount and currency
            const paymentIntent = await stripe.paymentIntents.create({
                amount: 1200,
                currency: "usd",
                automatic_payment_methods: {
                    enabled: true,
                },
            });
            console.log(paymentIntent);
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
            // console.log(clientSecret);
        });

        // payment methods--------------------->

        // put methods--------------------->

        app.put("/api/booking", async (req, res) => {
            const data = req.body;
            console.log(data);
            const query = { uid: data.uid };
            console.log(query);
            const options = { upsert: true };
            const updateStatus = {
                $set: {
                    status: "paid",
                },
            };
            const bookingResult = await bookingData.updateOne(query, updateStatus, options);
            res.send(bookingResult);
            // console.log(bookingResult);
        });

        // put methods--------------------->
    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Welcome to docTalk server");
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
