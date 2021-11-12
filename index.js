const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config()
const cors = require('cors')
const ObjectId = require('mongodb').ObjectId
const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mvih6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        const database = client.db('car_spot');
        const productsCollection = database.collection('products');
        const orderCollection = database.collection('orders');
        const usersCollection = database.collection('users');
        const reviewsCollection = database.collection('reviews');




        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({})
            const products = await cursor.toArray();
            res.send(products)

        });
        app.get('/orders', async (req, res) => {
            const cursor = orderCollection.find({})
            const orders = await cursor.toArray();
            res.send(orders)

        });
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({})
            const reviews = await cursor.toArray();
            res.send(reviews)

        });
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.json(product);
        })


        app.get("/orders/:email", async (req, res) => {
            const result = await orderCollection.find({
                user_email: req.params.email,
            }).toArray();
            res.send(result);
        });
        app.get("/review/:email", async (req, res) => {
            const result = await reviewsCollection.find({
                email: req.params.email,
            }).toArray();
            res.send(result);
        });
        app.get("/checkAdmin/:email", async (req, res) => {
            const result = await usersCollection
                .find({ email: req.params.email })
                .toArray();
            console.log(result);
            res.send(result);
        });
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });

        app.get("/checkAdmin/:email", async (req, res) => {
            const result = await usersCollection
                .find({ email: req.params.email })
                .toArray();
            console.log(result);
            res.send(result);
        });

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        app.post("/orders", async (req, res) => {
            const result = await orderCollection.insertOne(req.body);
            res.send(result);
        });
        app.post("/addpackages", async (req, res) => {
            const result = await productsCollection.insertOne(req.body);
            res.send(result);
        });
        app.post("/addreview", async (req, res) => {
            const result = await reviewsCollection.insertOne(req.body);
            res.send(result);
        });

        app.put("/makeAdmin", async (req, res) => {
            const filter = { email: req.body.email };
            const result = await usersCollection.find(filter).toArray();
            if (result) {
                const documents = await usersCollection.updateOne(filter, {
                    $set: { role: "admin" },
                });
                console.log(documents);
            }

        })
        app.put('/ordersupdate/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const updateStatus = req.body;
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    status: updateStatus
                }
            };
            const result = await orderCollection.updateOne(filter, updateDoc, options);
            res.json(result);

        })

        app.delete('/orders/:id', async (req, res) => {
            const query = { _id: ObjectId(req.params.id) }
            const result = await orderCollection.deleteOne(query)
            res.json(result);

        })
        app.delete('/products/:id', async (req, res) => {
            const query = { _id: ObjectId(req.params.id) }
            const result = await productsCollection.deleteOne(query)
            res.json(result);

        })
        app.delete('/review/:id', async (req, res) => {
            const query = { _id: ObjectId(req.params.id) }
            const result = await reviewsCollection.deleteOne(query)
            res.json(result);

        })
    }
    finally {

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Server is running');
});

app.listen(port, () => {
    console.log('Server running at port', port);
})