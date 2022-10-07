const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require("express");
const cors = require("cors");
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

//Middleware 
app.use(cors());
app.use(express.json());


console.log()
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zaylxyf.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


//CRUD to the server and client
async function run() {
    try {
        await client.connect();
        const productCollection = client.db("skyShop").collection("product");

        app.get('/product', async (req, res) => {
            const page=parseInt(req.query.page);
            const size=parseInt(req.query.size);
            const query = {};
            const cursor = productCollection.find(query);
            let products;
            if(page  || size){
                //If page 0: skip--0: get:0-10
                //If page 1: skip--1*10: get:11-20
                //If page 3: skip--2*10: get:21-20
                products = await cursor.skip(page*size).limit(size).toArray();

            }
            else{
                products = await cursor.toArray();
            }
          
            res.send(products);
        });

        app.get('/productCount',async (req,res)=>{
            const count = await productCollection.estimatedDocumentCount();
            res.send({count})
        });

        //use post to get product by ids
        app.post('/productByKeys',async(req,res)=>{
            const keys =req.body;
            const ids=keys.map(id => ObjectId(id))
            const query={_id: {$in:ids}}
            const cursor=productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products)
           
        })

    }
    finally {

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("The sky device shop server is connected")
});

app.listen(port, () => {
    console.log("Server is connected", port)
});
