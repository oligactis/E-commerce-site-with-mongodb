const express = require('express');
const { MongoClient} = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// middle ware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.far0qag.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true});

async function run(){
    try{
        await client.connect();
        const database = client.db('online_shop');
        const productCollection = database.collection('products');
        const orderCollection = database.collection('orders');

        // GET Product API 
        app.get('/products', async(req, res) =>{
            const cursor = productCollection.find({});
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let products;

            const count = await cursor.count();

            if(page){
                products = await cursor.skip(page*size).limit(size).toArray();
            }
            else{
                products = await cursor.toArray();    
            }
            res.send({
                count,
                products
            })
        });
        // use post
        app.post('/products/bykeys', async (req, res) =>{
            console.log(req.body);
            const keys = req.body;
            // console.log(keys);
            const query = {key: {$in: keys}}

            const products = await productCollection.find(query).toArray();
            res.json(products);
            // res.json({"result": "Done"});
        })

        // Add orders API
        app.post('/orders', async(req, res) =>{
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result)
        })


    }
    finally{
        // await client.close();
    }
}
run().catch(console.dir)

app.get('/', (req, res) =>{
    res.send('Ema jon server is runnig');
});

app.listen(port, () =>{
    console.log('server running at port', port);
});