let express=require('express');
let bodyParser=require('body-parser');
let morgan=require('morgan');
let pg=require('pg');
const PORT1=3000;//this should be changed to the port number we have the front-end server at. by default it's 3000, so that's what I put.
const PORT2=4000;//change this to port number for back-end of server. an example I found showed this at 4000, so I put that there for now. 
const {pool}=require("express");
const {response}= require("pg");

let app=express();

let pool=new pg.pool({
    user: 'user',
    database:'backend',//insert name of database here
    port:1111,//insert port number db is situated on here
    host:'localhost'

});
pool.connect((err,db,done)=>{
    if(err){console.log(err)}
});




//middleware to ensure communications between front and back ends go through
app.use(express.json());
app.use(cors());
//middleware to ensure communications between front and back ends go through

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use(morgan('dev'));//dev should connect to nodemon in package.json in scripts iirc

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "YOUR-DOMAIN.TLD"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//TODO: place queries for add a specific row to db, search out a specific row for db, delete a row for db

function AddDb(){


}
function searchDb(){


}
function deleteDb(){
  
}



//TODO:ADD app.get() functions for adding to ,retrieving,and deleting from database.
//pool.query() to put in requests to db.
app.get('/',(req,res)=>{//get response: send DATA back to front end

})
app.post('/',(req,res)=>{//post response:should cover same idea as get, maybe could use this to cover other retrieval stuff?

})
app.put('/',(req,res)=>{//place data into the database from the front end??

})


app.listen(PORT1,()=>console.log('Listening on port'+PORT1));//establishes connection looking to specific port

