import sys;
import json;
import ast;#abstract syntax tree
import pandas as pd
import matplotlib.pyplot as pl
import numpy as np
import seaborn as sns
from sklearn.model_selection import train_test_split
from river import stream #pip install river
from sklearn.metrics import classification_report,confusion_matrix,accuracy_score,precision_score,recall_score,f1_score
import lightgbm as lgbm #pip install lightgbm
import catboost as cbt #pip install catboost
import xgboost as xgb #pip install xgboost
from imblearn.over_sampling import SMOTE#pip install imbalanced-learn
import statistics
import psycopg2


def LCCDE(train_test_split,random_status,use_smote,smote_strategy,feature_scaling,parameter_values,dataset_select=0):
    #run all three there models prior, then append based on class with which item would perform the best based on class?
    #how do I store results based on class for the given items?
    perfomanceValues=list()
    #place something to read out dataset
    df=pd.read_csv("./CICIDS2017_sample_km.csv")#this is where the path for the dataset should be. I just wrote an approximated path for the example datatset the inpyb jorunal used
    #this is the x,y, x_train,y_train,x_test,y_test variables assigned
    y=df['Label']
    x=df.drop(['Label'],axis=1)
    X_train,Y_train,X_test,Y_test=train_test_split(x,y,train_size=train_test_split,test_size=(1-train_test_split),random_state=random_status)
    if(use_smote):
        smote=SMOTE(sampling_strategy=smote_strategy)
        x_retrain,y_retrain=smote.fit_resample(X_train,Y_train)
        X_train=x_retrain
        Y_train=y_retrain
    #make each model first
    #parameter order for LCCDE is LGBM parameters, then XGB parameters, then CatBoost parameters
    #LGBM parameters in order:num_leaves, max_depth, learning_rate, n_estimators, min_child samples, subsample, colsample_bytree, reg_alpha, reg_lambda, min_split_gain,random_state, n_jobs
    #XGB parameters in order:max_depth,learning_rate,n_estimators,gamma,min_child_weight,subsample,colsample_bytree,colsample_bylevel,reg_alpha,reg_lambda,scale_pos_weight,random_state,n_jobs,tree_method
    #Catboost Parameters in order:iterations,learning_rate,depth,l2_leaf_reg,border_count,bagging_temperature,random_strength,subsample,colsample_bylevel,min_data_in_leaf,random_state,thread_count,boosting_type,task_type,verbose
    lgb=lgbm.LGBMClassifier(num_leaves=parameter_values[0],max_depth=parameter_values[1],learning_rate=parameter_values[2],n_estimators=parameter_values[3],min_child_samples=parameter_values[4],subsample=parameter_values[5],colsample_bytree=parameter_values[6],reg_alpha=parameter_values[7],reg_lambda=parameter_values[8],min_split_gain=parameter_values[9],random_state=parameter_values[10],n_jobs=parameter_values[11])
    XGBModel=xgb.XGBClassifier(max_depth=parameter_values[12],learning_rate=parameter_values[13],n_estimators=parameter_values[14],gamma=parameter_values[15],min_child_weight=parameter_values[16],subsample=parameter_values[17],colsample_bytree=parameter_values[18],colsample_bylevel=parameter_values[19],reg_alpha=parameter_values[20],reg_lambda=parameter_values[21],scale_pos_weight=parameter_values[22],random_state=parameter_values[23],n_jobs=parameter_values[24],tree_method=parameter_values[25])
    cb=cbt.CatBoostClassifier(iterations=parameter_values[26],learning_rate=parameter_values[27],depth=parameter_values[28],l2_leaf_reg=parameter_values[29],border_count=parameter_values[30],bagging_temperature=parameter_values[31],random_strength=parameter_values[32],subsample=parameter_values[33],colsample_bylevel=parameter_values[34],min_data_in_leaf=parameter_values[35],random_state=parameter_values[36],thread_count=parameter_values[37],boosting_type=parameter_values[38],task_type=parameter_values[39],verbose=parameter_values[40])

    #train each model here, then do predictors
    lgb.fit(X_train,Y_train)
    lgPred=lgb.predict(X_test)
    XGBModel.fit(X_train,Y_train)
    xgPred=XGBModel.predict(X_test)
    cb.fit(X_train,Y_train)
    cbPred=cb.predict(X_test)
    #find the f1 scores for each different model based on the attack label
    lg_f1=f1_score(Y_test,lgPred,average=None)
    xg_f1=f1_score(Y_test,xgPred,average=None)
    cb_f1=f1_score(Y_test,cbPred,average=None)

    #this should now get us to where we can append for each seperate attack type the model best suited to it
    model=[]
    for i in range(len(lg_f1)):
        if max(lg_f1[i],xg_f1[i],cb_f1[i])==lg_f1:
            model.append(lgb)
        elif max(lg_f1[i],xg_f1[i],cb_f1[i])==xg_f1:
            model.append(XGBModel)
        else:
            model.append(cb)
    #model should now have classifications for each of the given best models. now insert given data based on which class the point fits in
    l=[]
    pred_l=[]
    pro_l=[]
    yt=[]
    yp=[]
    for xi,yi in stream.iter_pandas(X_test,Y_test):
        xi2=np.array(list(xi.values()))
        yipred
        y_pred1=lgb.predict(xi2.reshape(1,-1))
        y_pred1=int(y_pred1)
        y_pred2=XGBModel.predict(xi2.reshape(1,-1))
        y_pred2=int(y_pred2)
        y_pred3=cb.predict(xi2.reshape(1,-1))
        y_pred3=int(y_pred3)
        #highest prediciton probability
        p1=lgb.predict_proba(xi2.reshape(1,-1))
        p2=XGBModel.predict_proba(xi2.reshape(1,-1))
        p3=cb.predict_proba(xi2.reshape(1,-1))
        #find highest probabilities
        y_pred_p1=np.max(p1)
        y_pred_p2=np.max(p2)
        y_pred_p3=np.max(p3)

        #comparisons between prediciton probabilities and cases for each
        if y_pred1==y_pred2==y_pred3:
            yipred=y_pred1
        elif y_pred1!=y_pred2!=y_pred3:
            if(model[y_pred1]==lgb):
                l.append(lgb)
                pred_l.append(y_pred1)
                pro_l.append(y_pred_p1)
            if(model[y_pred2]==XGBModel):
                l.append(XGBModel)
                pred_l.append(y_pred2)
                pro_l.append(y_pred_p2)
            if(model[y_pred3]==cb):
                l.append(cb)
                pred_l.append(y_pred3)
                pro_l.append(y_pred_p3)
            if len(l)==0:
                pro_l=[y_pred1,y_pred2,y_pred3]
            elif len(l)==1:
                yipred=pred_l[0]
            else:
                max_p=max(pro_l)
                if(max_p==y_pred_p1):
                    yipred=y_pred1
                elif(max_p==y_pred_p2):
                    yipred=y_pred2
                else:
                    yipred=y_pred3
        else:
            n=statistics.mode([y_pred1,y_pred2,y_pred3])
            yipred=model[n].predict(xi2.reshape(1,-1))
            yipred=int(yipred[0])
        
        yt.append(yi)
        yp.append(yipred)
    
    #performance evaluations of LCCDE model here
    LCCDEAccuracy=accuracy_score(yt,yp)
    perfomanceValues.append(LCCDEAccuracy)
    LCCDEPrecision=precision_score(yt,yp)
    perfomanceValues.append(LCCDEPrecision)
    LCCDERecall=recall_score(yt,yp)
    perfomanceValues.append(LCCDERecall)
    LCCDEF1=f1_score(yt,yp,average='weighted')
    perfomanceValues.append(LCCDEF1)
    LCF1TYPES=[]
    LCF1TYPES=f1_score(yt,yp,average=None)
    perfomanceValues.append(LCF1TYPES)


    return perfomanceValues


def XGBoost(train_test_split,random_status,use_smote,smote_strategy,feature_scaling,parameter_values,dataset_select=0):
    perfomanceValues=list()
    df=pd.read_csv("./CICIDS2017_sample_km.csv")#this is where the path for the dataset should be. I just wrote an approximated path for the example datatset the inpyb jorunal used
    #this is the x,y, x_train,y_train,x_test,y_test variables assigned
    y=df['Label']
    x=df.drop(['Label'],axis=1)
    X_train,Y_train,X_test,Y_test=train_test_split(x,y,train_size=train_test_split,test_size=(1-train_test_split),random_state=random_status)
    if(use_smote):
        smote=SMOTE(sampling_strategy=smote_strategy)
        x_retrain,y_retrain=smote.fit_resample(X_train,Y_train)
        X_train=x_retrain
        Y_train=y_retrain
    #XGBoost training+testing here
    XGBModel=xgb.XGBClassifier(max_depth=parameter_values[0],learning_rate=parameter_values[1],n_estimators=parameter_values[2],gamma=parameter_values[3],min_child_weight=parameter_values[4],subsample=parameter_values[5],colsample_bytree=parameter_values[6],colsample_bylevel=parameter_values[7],reg_alpha=parameter_values[8],reg_lambda=parameter_values[9],scale_pos_weight=parameter_values[10],random_state=parameter_values[11],n_jobs=parameter_values[12],tree_method=parameter_values[13])

    XGBModel.fit(X_train,Y_train)
    y_pred=XGBModel.predict(X_test)
    accuracy=accuracy_score(Y_test,y_pred)
    perfomanceValues.append(accuracy)
    precision=precision_score(Y_test,y_pred)
    perfomanceValues.append(precision)
    recall=recall_score(Y_test,y_pred)
    perfomanceValues.append(recall)
    avgf1=f1_score(Y_test,y_pred,average='weighted')
    perfomanceValues.append(avgf1)
    f1ByClass=f1_score(Y_test,y_pred,average=None)
    perfomanceValues.append(f1ByClass)
    return perfomanceValues

def CatBoost(train_test_split,random_status,use_smote,smote_strategy,feature_scaling,parameter_values,dataset_select=0):
    perfomanceValues=list()
    df=pd.read_csv("./CICIDS2017_sample_km.csv")#this is where the path for the dataset should be. I just wrote an approximated path for the example datatset the inpyb jorunal used
    #this is the x,y, x_train,y_train,x_test,y_test variables assigned
    y=df['Label']
    x=df.drop(['Label'],axis=1)
    X_train,Y_train,X_test,Y_test=train_test_split(x,y,train_size=train_test_split,test_size=(1-train_test_split),random_state=random_status)
    if(use_smote):
        smote=SMOTE(sampling_strategy=smote_strategy)
        x_retrain,y_retrain=smote.fit_resample(X_train,Y_train)
        X_train=x_retrain
        Y_train=y_retrain
    #catboost training+testing here
    cb=cbt.CatBoostClassifier(iterations=parameter_values[0],learning_rate=parameter_values[1],depth=parameter_values[2],l2_leaf_reg=parameter_values[3],border_count=parameter_values[4],bagging_temperature=parameter_values[5],random_strength=parameter_values[6],subsample=parameter_values[7],colsample_bylevel=parameter_values[8],min_data_in_leaf=parameter_values[9],random_state=parameter_values[10],thread_count=parameter_values[11],boosting_type=parameter_values[12],task_type=parameter_values[13],verbose=parameter_values[14])
    cb.fit(X_train,Y_train)
    y_pred=cb.predict(X_test)
    accuracy=accuracy_score(Y_test,y_pred)
    perfomanceValues.append(accuracy)
    precision=precision_score(Y_test,y_pred)
    perfomanceValues.append(precision)
    recall=recall_score(Y_test,y_pred)
    perfomanceValues.append(recall)
    avgf1=f1_score(Y_test,y_pred,average='weighted')
    perfomanceValues.append(avgf1)
    f1ByClass=f1_score(Y_test,y_pred,average=None)
    perfomanceValues.append(f1ByClass)#check if this appends by type or in total


    return perfomanceValues
##arg[0] is name of the file?
def lightGBM(train_test_split,random_status,use_smote,smote_strategy,feature_scaling,parameter_values,dataset_select):
    perfomanceValues=list()
    df=pd.read_csv("./CICIDS2017_sample_km.csv")#this is where the path for the dataset should be. I just wrote an approximated path for the example datatset the inpyb jorunal used
    #this is the x,y, x_train,y_train,x_test,y_test variables assigned
    y=df['Label']
    x=df.drop(['Label'],axis=1)
    X_train,Y_train,X_test,Y_test=train_test_split(x,y,train_size=train_test_split,test_size=(1-train_test_split),random_state=random_status)
    if(use_smote):
        smote=SMOTE(sampling_strategy=smote_strategy)
        x_retrain,y_retrain=smote.fit_resample(X_train,Y_train)
        X_train=x_retrain
        Y_train=y_retrain
    #lgbm training and testing here
    lgb=lgbm.LGBMClassifier(num_leaves=parameter_values[0],max_depth=parameter_values[1],learning_rate=parameter_values[2],n_estimators=parameter_values[3],min_child_samples=parameter_values[4],subsample=parameter_values[5],colsample_bytree=parameter_values[6],reg_alpha=parameter_values[7],reg_lambda=parameter_values[8],min_split_gain=parameter_values[9],random_state=parameter_values[10],n_jobs=parameter_values[11])
    lgb.fit(X_train,Y_train)
    y_pred=lgb.predict(X_test)
    accuracy=accuracy_score(Y_test,y_pred)
    perfomanceValues.append(accuracy)
    precision=precision_score(Y_test,y_pred)
    perfomanceValues.append(precision)
    recall=recall_score(Y_test,y_pred)
    perfomanceValues.append(recall)
    avgf1=f1_score(Y_test,y_pred,average='weighted')
    perfomanceValues.append(avgf1)
    f1ByClass=f1_score(Y_test,y_pred,average=None)
    perfomanceValues.append(f1ByClass)

    return perfomanceValues

hostname='localhost'
portid=1111
username="user"
database="backend"
password='password'#don't think we need this?
conn=None
curr=None


input=ast.literal_eval(sys.argv[1])##this should be the array of items being passed in
#also need to pass in something indicating database selection? either a boolean or an int for the selection since there's two items there
model_select=input[0]
train_test_split=input[2]
random_status=input[3]
use_smote=input[4]
smote_strategy=input[5]
feature_scaling=input[6]
parameterValues=list(input[1])##this should be the list of parameters as needed
#variable for selecting which dataset we're using should be here(input[7] is training_run_id, so input[8] should be the dataset selection)
#dataset_selection=input[8]
#make sure to ask where a dataset selection should be for
#  
dataset_select=input[8]#go back to server.js to place appropriate dataset_select into code


##list to try and store a list of values for the confusion matrix???
performanceEvaluation=list()
#items to place:accuracy, precision,recall, average f1, f1 score per type of attack



if(input==1):
  performanceEvaluation=lightGBM(train_test_split,random_status,use_smote,smote_strategy,feature_scaling,parameterValues)
elif(input==2):
   performanceEvaluation=XGBoost(train_test_split,random_status,use_smote,smote_strategy,feature_scaling,parameterValues)
elif(input==3):
     performanceEvaluation=CatBoost(train_test_split,random_status,use_smote,smote_strategy,feature_scaling,parameterValues)
else:
    performanceEvaluation=LCCDE(train_test_split,random_status,use_smote,smote_strategy,feature_scaling,parameterValues)
#send back the items in performance evaluation to the server.js file
print(performanceEvaluation)#prints the values out,how does this get us to printing it out?
try:
    conn=psycopg2.connect(
        host=hostname,
        user=username,
        dbname=database,
        port=portid
    )
    ###here is where we place the script
    curr=conn.cursor()

    #write out insert statements to the given tables
    table_script='INSERT INTO run_results (run_id,accuracy,precision_score,recall_score,f1_score) VALUES(%s,%s,%s,%s,%s)'
    #input[7] should be training run id, 01234 should be accuracy,percision,recall,and f1
    table_values=(input[7],performanceEvaluation[0],performanceEvaluation[1],performanceEvaluation[2],performanceEvaluation[3])
    curr.execute(table_script,table_values)
    #current assumption will be that training_run_id=result_id,THIS WILL PROBABLY NEED TO CHANGE
    table_script2='INSERT INTO class_performance(result_id,label_id,f1_score) VALUES(%s,%s,%s)'
    classF1s=performanceEvaluation[4]
    #insert table values for each of the given classes of attacks seperately
    table_value1=(input[7],0,classF1s[0])
    curr.execute(table_script2,table_value1)
    table_value2=(input[7],1,classF1s[1])
    curr.execute(table_script2,table_value2)
    table_value3=(input[7],2,classF1s[2])
    curr.execute(table_script2,table_value3)
    table_value4=(input[7],3,classF1s[3])
    curr.execute(table_script2,table_value4)
    table_value5=(input[7],4,classF1s[4])
    curr.execute(table_script2,table_value5)
    table_value6=(input[7],5,classF1s[5])
    curr.execute(table_script2,table_value6)
    table_value7=(input[7],6,classF1s[6])
    curr.execute(table_script2,table_value7)
    table_value8=(input[7],7,classF1s[7])
    curr.execute(table_script2,table_value8)
    table_value9=(input[7],8,classF1s[8])
    curr.execute(table_script2,table_value9)
    table_value10=(input[7],9,classF1s[9])
    curr.execute(table_script2,table_value10)
    table_value11=(input[7],10,classF1s[10])
    curr.execute(table_script2,table_value11)
    table_value12=(input[7],11,classF1s[11])
    curr.execute(table_script2,table_value12)

    conn.commit()
    
except Exception as error:
    print(error)

finally:
    if curr is not None:
        curr.close()
    if conn is not None:
        conn.close()

#place conncetion to db at end of script, use this connection to place into database, then close connections


sys.stdout.flush()
##it looks like We have to make the database calls in the python script? from what it looks like, we can't 
