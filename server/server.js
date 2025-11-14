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

async function AddDb(/*information for each table should go here */id){//this should add the given item to the particular node



}

async function grabAllDB(){
  const[rows]=await pool.query('SELECT * FROM flow_records');
  return rows;
}

async function searchDb(id){
//grab from all necessary tables for the given item(parameters, dataset, evaluation metrics,etc.)?
let rows=new Array(9);
//I think this should cover everything we want to  fetch for a given environmental run?
rows[0]=await pool.query('SELECT * FROM users WHERE user_id=?',[id]);
rows[1]=await pool.query('SELECT * FROM ml_models WHERE model_id=?',[id]);
rows[2]=await pool.query('SELECT * FROM model_parameters WHERE model_id=?',[id]);
rows[3]=await pool.query('SELECT * FROM datasets WHERE dataset_id=?',[id]);
rows[4]=await pool.query('SELECT * FROM training_runs WHERE user_id=? ',[id]);
rows[5]=await pool.quert('SELECT * FROM run_parameters WHERE parameter_id=?',[id]);
rows[6]=await pool.query('SELECT * FROM preprocessing_config WHERE run_id=?',[id]);
rows[7]=await pool.query('SELECT * FROM run_results WHERE run_id=?',[id]);
rows[8]=await pool.query('SELECT * FROM class_performance WHERE result_id=?'[id]);
return rows;
}
async function deleteDb(id){//deletes given row from the record(probably use this for when we need to modify a value in system)
  await pool.query('DELETE * FROM users WHERE user_id=?',[id]);
  return;
}


app,get('/getAllEntries',async(req, res)=>{
const item=grabAllDB();
res.send(item);
})
//TODO:ADD app.get() functions for adding to ,retrieving,and deleting from database.
//pool.query() to put in requests to db.
//figure out what paths we want to do for the gets
app.get('/searchDB/:id',async (req,res)=>{//get response: send DATA back to front end
const item=await searchDb(req.params.id);
res.send(item);
})

app.post('/',async (req,res)=>{//post response:should cover same idea as get, maybe could use this to cover other retrieval stuff?

})
app.put('/',async (req,res)=>{//place data into the database from the front end??

})


app.listen(PORT1,()=>console.log('Listening on port'+PORT1));//establishes connection looking to specific port

