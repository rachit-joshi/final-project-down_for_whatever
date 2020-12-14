const express = require('express');
const {MongoClient} = require('mongodb');
const cors = require('cors');
const multer = require('multer');

const auth = 'dfw:dfw123';
const dbName = '667Final';
const url = `mongodb+srv://${auth}@cluster0.gefuv.mongodb.net/?retryWrites=true&w=majority`;
const listingCollectionName = 'Listings';

const dbClient = new MongoClient(url);

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    //console.log(req.body);
    console.log(file);
    cb(null, file.originalname);
  }
})

var upload = multer({ storage: storage });

const app = express();
app.use(express.json());
app.use(cors());

dbClient.connect((error) => {
  if(error) {
    console.log('error! can\'t connect to DB instance');
    console.log(error);
    process.exit(1);
  }

  console.log("Connected!");

  const db = dbClient.db(dbName);
  const listingCollection = db.collection(listingCollectionName);


  app.get('/api/listingserver/listings', (req, res) => {
    listingCollection.find({})
    .toArray()
    .then((docs) => {
        res.send({listings: docs})
    })
    .catch((e) => {
        console.log("error: ", e);
        res.send('FAILED');
    });
  });

  app.post('/api/listingserver/listing', upload.single('image'), (req, res, next) => {
    console.log(req.body);
     const newListing = {
       userid : req.body.userid,
       title : req.body.title,
       description : req.body.description,
       price : req.body.price,
       imgaddr : req.file.filename,
       timestamp : new Date(),
     };
    listingCollection.insertOne(newListing, (err, dbRes) => {
      if(err) {
        console.log('error! can\'t insert newListing');
        console.log('newListing: ', newListing);
        console.log(err);
        res.status(500).send({'message': 'error: cant insert listing'});
      }
    
      console.log('inserted newListing: ', newListing);
      res.send({'insertedId': dbRes.insertedId});
    });
  });

  app.listen(5000, () => console.log('App listening on port 5000'));
});
