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

async function AddDb(/*information for each table should go here */id,model_select,dataset_selection,user_id,parameter){//this should add the given item to the particular node
//make string for query, switch-statement on type of database requested
database_query= new String();
database_values=new Array(3);
model_choice=model_select;//variable here for tracking what type of model is being used, same as model_select value.
switch(model_select){
case 1://LCCDE?
database_query="INSERT INTO ml_models (model_name, model_type,description,) VALUES (?,?,?) RETURNING model_id";
database_values[0]="Light-GBM";
database_values[1]="gradient_boosting";
database_values[2]="";
break;

case 2://other data types
database_query="INSERT INTO ml_models (model_name, model_type,description,) VALUES (?,?,?) RETURNING model_id";
database_values[0]="XGBOOST";
database_values[1]="gradient_boosting";
database_values[2]="";
break;

case 3:
database_query="INSERT INTO ml_models (model_name, model_type,description,) VALUES (?,?,?) RETURNING model_id";
database_values[0]="CatBoost";
database_values[1]="gradient_boosting";
database_values[2]="";
break;
case 4:
database_query="INSERT INTO ml_models (model_name, model_type,description,) VALUES (?,?,?) RETURNING model_id";
database_values[0]="LCCDE";
database_values[1]="ensemble";
database_values[2]="";
break;


default:
database_query="INSERT INTO ml_models (model_name, model_type,description,) VALUES (?,?,?) RETURNING model_id";
database_values[0]="LCCDE";
database_values[1]=model_type;
database_values[2]="";
break;
}
current_model_id=pool.query(database_query,database_values);

//grab dataset id from here before???
dataset_query=new String();
dataset_info=new Array(9);
switch(dataset_selection){
case 1:

break;

case 2:

break;

default:

break;

}


dataset_id=dataset_selection;//for now do it like this? ,maybe run some other method for adding dataset to it?
dataset_value=new String();
switch(dataset_id){//this decides what datsets should be used for the description
case 1:
dataset_value="Dataset 1";
break;

case 2:
dataset_value="Dataset 2";
break;

default:
dataset_value="";
break;

}

//from here do query to add to training runs: find some user id, grab the model_id from a prior, 
user_id=id;//???
training_run_id=pool.query("INSERT INTO training_runs(user_id,model_id,dataset_id,run_name) VALUES(?,?,?,?) RETURNING run_id",[user_id,current_model_id,dataset_id,"Training_run for user"+user_id+" "+dataset_value]);
//need to find some place to grab parameter ids prior to this.one each for them, LCCDE grab all in totality
parameterHolder=new Array();
if(model_select!=4/*NOT a LCCDE */){
[parameterHolder]=pool.query("SELECT parameter_id FROM model_parameters WHERE model_id=?",[model_select]);
}
else{//attach the 3 for LCCDE
[LGBMHolder]=await pool.query("SELECT parameter_id FROM model_parameters WHERE model_id=?",[1]);
[XGBHolder]=await pool.query("SELECT parameter_id FROM model_parameters WHERE model_id=?",[2]);
[CATHolder]=await pool.query("SELECT parameter_id FROM model_parameters WHERE model_id=?",[3]);
parameterHolder.push(...LGBMHolder);
parameterHolder.push(...XGBHolder);
parameterHolder.push(...CATHolder);
}
//this should place parameters in list so I can later check them

//from here go for adding in run parameters, this will have to be a series of  parameters input by the user prior, maybe store them in an array beforehand?
//need some kind of array to be able to store the items for the condition
//maybe array length to store all values guaranteed, case by case only filling in a few of them??
//we'd use model select as the passer variable for this as well
//array would be  12+14+15=41 spots long???
switch(model_select){
case 1://LightGBM
//adds each parameter to the function
await pool.query("Insert INTO run_parameters(run_id,parameter_id,parameter_value) VALUES (?,?,?)",[training_run_id,parameterHolder[0],parameter[0]]);
await pool.query("INSERT INTO run_parameters(run_id,parameter_id,parameter_value) VALUES (?,?,?)",[training_run_id,parameterHolder[1],parameter[1]]);
await pool.query("INSERT INTO run_parameters(run_id,parameter_id,parameter_value) VALUES (?,?,?)",[training_run_id,parameterHolder[2],parameter[2]]);
await pool.query("INSERT INTO run_parameters(run_id,parameter_id,parameter_value) VALUES (?,?,?)",[training_run_id,parameterHolder[3],parameter[3]]);
await pool.query("INSERT INTO run_parameters(run_id,parameter_id,parameter_value) VALUES (?,?,?)",[training_run_id,parameterHolder[4],parameter[4]]);
await pool.query("INSERT INTO run_parameters(run_id,parameter_id,parameter_value) VALUES (?,?,?)",[training_run_id,parameterHolder[5],parameter[5]]);
await pool.query("INSERT INTO run_parameters(run_id,parameter_id,parameter_value) VALUES (?,?,?)",[training_run_id,parameterHolder[6],parameter[6]]);
await pool.query("INSERT INTO run_parameters(run_id,parameter_id,parameter_value) VALUES (?,?,?)",[training_run_id,parameterHolder[7],parameter[7]]);
await pool.query("INSERT INTO run_parameters(run_id,parameter_id,parameter_value) VALUES (?,?,?)",[training_run_id,parameterHolder[8],parameter[8]]);
await pool.query("INSERT INTO run_parameters(run_id,parameter_id,parameter_value) VALUES (?,?,?)",[training_run_id,parameterHolder[9],parameter[9]]);
await pool.query("INSERT INTO run_parameters(run_id,parameter_id,parameter_value) VALUES (?,?,?)",[training_run_id,parameterHolder[10],parameter[10]]);
await pool.query("INSERT INTO run_parameters(run_id,parameter_id,parameter_value) VALUES (?,?,?)",[training_run_id,parameterHolder[11],parameter[11]]);



break;

case 2://XGBOOST
await pool.query("INSERT INTO run_parameters(run_id,parameter_id,parameter_value) VALUES (?,?,?)",[training_run_id,parameterHolder[0],parameter[0]]);
await pool.query("INSERT INTO run_parameters(run_id,parameter_id,parameter_value) VALUES (?,?,?)",[training_run_id,parameterHolder[1],parameter[1]]);
await pool.query("INSERT INTO run_parameters(run_id,parameter_id,parameter_value) VALUES (?,?,?)",[training_run_id,parameterHolder[2],parameter[2]]);
await pool.query("INSERT INTO run_parameters(run_id,parameter_id,parameter_value) VALUES (?,?,?)",[training_run_id,parameterHolder[3],parameter[3]]);
await pool.query("INSERT INTO run_parameters(run_id,parameter_id,parameter_value) VALUES (?,?,?)",[training_run_id,parameterHolder[4],parameter[4]]);
await pool.query("INSERT INTO run_parameters(run_id,parameter_id,parameter_value) VALUES (?,?,?)",[training_run_id,parameterHolder[5],parameter[5]]);
await pool.query("INSERT INTO run_parameters(run_id,parameter_id,parameter_value) VALUES (?,?,?)",[training_run_id,parameterHolder[6],parameter[6]]);
await pool.query("INSERT INTO run_parameters(run_id,parameter_id,parameter_value) VALUES (?,?,?)",[training_run_id,parameterHolder[7],parameter[7]]);
await pool.query("INSERT INTO run_parameters(run_id,parameter_id,parameter_value) VALUES (?,?,?)",[training_run_id,parameterHolder[8],parameter[8]]);
await pool.query("INSERT INTO run_parameters(run_id,parameter_id,parameter_value) VALUES (?,?,?)",[training_run_id,parameterHolder[9],parameter[9]]);
await pool.query("INSERT INTO run_parameters(run_id,parameter_id,parameter_value) VALUES (?,?,?)",[training_run_id,parameterHolder[10],parameter[10]]);
await pool.query("INSERT INTO run_parameters(run_id,parameter_id,parameter_value) VALUES (?,?,?)",[training_run_id,parameterHolder[11],parameter[11]]);
await pool.query("INSERT INTO run_parameters(run_id,parameter_id,parameter_value) VALUES (?,?,?)",[training_run_id,parameterHolder[12],parameter[12]]);
await pool.query("INSERT INTO run_parameters(run_id,parameter_id,parameter_value) VALUES (?,?,?)",[training_run_id,parameterHolder[13],parameter[13]]);

break;

case 3://CatBoost
await pool.query("INSERT INTO run_parameters(run_id,parameter_id,parameter_value) VALUES (?,?,?)",[training_run_id,parameterHolder[0],parameter[0]]);
await pool.query("INSERT INTO run_parameters(run_id,parameter_id,parameter_value) VALUES (?,?,?)",[training_run_id,parameterHolder[1],parameter[1]]);
await pool.query("INSERT INTO run_parameters(run_id,parameter_id,parameter_value) VALUES (?,?,?)",[training_run_id,parameterHolder[2],parameter[2]]);
await pool.query("INSERT INTO run_parameters(run_id,parameter_id,parameter_value) VALUES (?,?,?)",[training_run_id,parameterHolder[3],parameter[3]]);
await pool.query("INSERT INTO run_parameters(run_id,parameter_id,parameter_value) VALUES (?,?,?)",[training_run_id,parameterHolder[4],parameter[4]]);
await pool.query("INSERT INTO run_parameters(run_id,parameter_id,parameter_value) VALUES (?,?,?)",[training_run_id,parameterHolder[5],parameter[5]]);
await pool.query("INSERT INTO run_parameters(run_id,parameter_id,parameter_value) VALUES (?,?,?)",[training_run_id,parameterHolder[6],parameter[6]]);
await pool.query("INSERT INTO run_parameters(run_id,parameter_id,parameter_value) VALUES (?,?,?)",[training_run_id,parameterHolder[7],parameter[7]]);
await pool.query("INSERT INTO run_parameters(run_id,parameter_id,parameter_value) VALUES (?,?,?)",[training_run_id,parameterHolder[8],parameter[8]]);
await pool.query("INSERT INTO run_parameters(run_id,parameter_id,parameter_value) VALUES (?,?,?)",[training_run_id,parameterHolder[9],parameter[9]]);
await pool.query("INSERT INTO run_parameters(run_id,parameter_id,parameter_value) VALUES (?,?,?)",[training_run_id,parameterHolder[10],parameter[10]]);
await pool.query("INSERT INTO run_parameters(run_id,parameter_id,parameter_value) VALUES (?,?,?)",[training_run_id,parameterHolder[11],parameter[11]]);
await pool.query("INSERT INTO run_parameters(run_id,parameter_id,parameter_value) VALUES (?,?,?)",[training_run_id,parameterHolder[12],parameter[12]]);
await pool.query("INSERT INTO run_parameters(run_id,parameter_id,parameter_value) VALUES (?,?,?)",[training_run_id,parameterHolder[13],parameter[13]]);
await pool.query("INSERT INTO run_parameters(run_id,parameter_id,parameter_value) VALUES (?,?,?)",[training_run_id,parameterHolder[14],parameter[14]]);

break;


case 4://LCCDE
//add all of the previoud queries up
//some kind of for loop for the idea?
for(let i=0;i<parameterHolder.length;i++){
await pool.query("INSERT INTO run_parameters(run_id,parameter_id,parameter_value) VALUES (?,?,?)",[training_run_id,parameterHolder[i],parameter[i]]);

}
break;

default://put something here for this adder?

break;

}
//preprocessing configuration goes here
configTracker=await pool.query("INSERT INTO preprocessing_config(run_id,train_test_split_ratio,random_state,use_smote,smote_strategy,feature_scaling_method) VALUES (?,?,?,?,?,?) RETURNING config_id",[training_run_id,train_test_ratio,random_state,use_smote,smote_strategy,feature_scaling]);


//here calls to ML methods for python integration(maybe flask???)
const spawner=require('child process').spawn;
//data to pass in here,maybe I can use it as an array?necessary information would be parameter array, model_selected(to determine what is done), and preprocessing configurations,at least
//array containing items to pass. make sure to use JSON.stringify()on the array to properly pass it
mlDataPass=new Array(7);//this is the array to pass
mlDataPass[0]=model_select;//modelSelect as [0], lets python process know which item to grab
mlDataPass[1]=new Array();
mlDataPass[1].push(parameterHolder);
mlDataPass[2]=train_test_ratio;
mlDataPass[3]=random_state;
mlDataPass[4]=use_smote;
mlDataPass[5]=smote_strategy;
mlDataPass[6]=feature_scaling;
mlDataPass[7]=training_run_id;
const python_process=spawner("python",['./machineLearning.py',JSON.stringify(mlDataPass)]);//this calls to the python methods
//python_process.stdout methods go here
python_process.stdout.on('data',(data)=>{

});

python_process.stderr.on('data',(data) =>{
  console.error('stderr: ${data}');
});
python_process.on('close',(code)=>{
  
});


  return true;//placeholder return value
}

async function grabAllDB(){
  const[rows]=await pool.query('SELECT * FROM flow_records');
  return rows;
}

async function searchDb(id){
//grab from all necessary tables for the given item(parameters, dataset, evaluation metrics,etc.)?




let rows=new Array(5);
rows[0]=await pool.query('SELECT * FROM training_runs WHERE run_id=?'[id]);
rows[1]=await pool.query('SELECT * FROM run_parameters WHERE run_id=?',[id]);
rows[2]=await pool.query('SELECT * FROM preprocessing_config WHERE run_id=?',[id]);
rows[3]=await pool.query('SELECT * FROM run_results WHERE run_id=?',[id]);
rows[4]=await pool.query('SELECT * FROM model_artifacts WHERE run_id=?',[id]);
//maybe make query to grab other identifier to grab more info from tables?

/*let rows=new Array(9);
//I think this should cover everything we want to  fetch for a given environmental run?
rows[0]=await pool.query('SELECT * FROM users WHERE user_id=?',[id]);
rows[1]=await pool.query('SELECT * FROM ml_models WHERE model_id=?',[id]);
rows[2]=await pool.query('SELECT * FROM model_parameters WHERE model_id=?',[id]);
rows[3]=await pool.query('SELECT * FROM datasets WHERE dataset_id=?',[id]);
rows[4]=await pool.query('SELECT * FROM training_runs WHERE user_id=? ',[id]);
rows[5]=await pool.quert('SELECT * FROM run_parameters WHERE parameter_id=?',[id]);
rows[6]=await pool.query('SELECT * FROM preprocessing_config WHERE run_id=?',[id]);
rows[7]=await pool.query('SELECT * FROM run_results WHERE run_id=?',[id]);
rows[8]=await pool.query('SELECT * FROM class_performance WHERE result_id=?'[id]);*/
return rows;
}
async function deleteDb(id){//deletes given row from the record(probably use this for when we need to modify a value in system)
  await pool.query('DELETE * FROM users WHERE user_id=?',[id]);
  return true;//boolean to check if deletion did actually occur.
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
app.put('/addItem',async (req,res)=>{//place data into the database from the front end??

  const item=await AddDb();
  res.send(item);
})


app.listen(PORT1,()=>console.log('Listening on port'+PORT1));//establishes connection looking to specific port

