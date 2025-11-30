import sys;
import json;
import ast;#abstract syntax tree
import pandas as pd
import matplotlib.pyplot as pl
import numpy as np
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report,confusion_matrix,accuracy_score,precision_score,recall_score,f1_score
import lightgbm as lgbm
import catboost as cbt
import xgboost as xgb
from imblearn.over_sampling import SMOTE



def LCCDE(train_test_split,random_status,use_smote,smote_strategy,feature_scaling,parameter_values):
    #run all three there models prior, then append based on class with which item would perform the best based on class?
    #how do I store results based on class for the given items?
    perfomanceValues=list()
    #place something to read out dataset
    df=pd.read_csv("./CICIDS2017_sample_km.csv")#this is where the path for the dataset should be. I just wrote an approximated path for the example datatset the inpyb jorunal used
    #this is the x,y, x_train,y_train,x_test,y_test variables assigned
    y=df['label']
    x=df.drop(label)
    X_train,Y_train,X_test,Y_test=train_test_split(x,y,train_size=train_test_split,test_size=(1-train_test_split),random_state=random_status)
    if(use_smote):
        smote=SMOTE(sampling_strategy=smote_strategy)
        x_retrain,y_retrain=smote.fit_resample(X_train,Y_train)
        X_train=x_retrain
        Y_train=y_retrain
    


    return perfomanceValues


def XGBoost(train_test_split,random_status,use_smote,smote_strategy,feature_scaling,parameter_values):
    perfomanceValues=list()
    df=pd.read_csv("./CICIDS2017_sample_km.csv")#this is where the path for the dataset should be. I just wrote an approximated path for the example datatset the inpyb jorunal used
    #this is the x,y, x_train,y_train,x_test,y_test variables assigned
    y=df['label']
    x=df.drop(label)
    X_train,Y_train,X_test,Y_test=train_test_split(x,y,train_size=train_test_split,test_size=(1-train_test_split),random_state=random_status)
    if(use_smote):
        smote=SMOTE(sampling_strategy=smote_strategy)
        x_retrain,y_retrain=smote.fit_resample(X_train,Y_train)
        X_train=x_retrain
        Y_train=y_retrain
    #XGBoost training+testing here
    XGBModel=xgb.XGBClassifier()

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

def CatBoost(train_test_split,random_status,use_smote,smote_strategy,feature_scaling,parameter_values):
    perfomanceValues=list()
    df=pd.read_csv("./CICIDS2017_sample_km.csv")#this is where the path for the dataset should be. I just wrote an approximated path for the example datatset the inpyb jorunal used
    #this is the x,y, x_train,y_train,x_test,y_test variables assigned
    y=df['label']
    x=df.drop(label)
    X_train,Y_train,X_test,Y_test=train_test_split(x,y,train_size=train_test_split,test_size=(1-train_test_split),random_state=random_status)
    if(use_smote):
        smote=SMOTE(sampling_strategy=smote_strategy)
        x_retrain,y_retrain=smote.fit_resample(X_train,Y_train)
        X_train=x_retrain
        Y_train=y_retrain
    #catboost training+testing here
    cb=cbt.CatBoostClassifier(verbose=0,boosting_type=plain)
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
def lightGBM(train_test_split,random_status,use_smote,smote_strategy,feature_scaling,parameter_values):
    perfomanceValues=list()
    df=pd.read_csv("./CICIDS2017_sample_km.csv")#this is where the path for the dataset should be. I just wrote an approximated path for the example datatset the inpyb jorunal used
    #this is the x,y, x_train,y_train,x_test,y_test variables assigned
    y=df['label']
    x=df.drop(label)
    X_train,Y_train,X_test,Y_test=train_test_split(x,y,train_size=train_test_split,test_size=(1-train_test_split),random_state=random_status)
    if(use_smote):
        smote=SMOTE(sampling_strategy=smote_strategy)
        x_retrain,y_retrain=smote.fit_resample(X_train,Y_train)
        X_train=x_retrain
        Y_train=y_retrain
    #lgbm training and testing here
    lgb=lgbm.LGBMClassifier()
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
input=ast.literal_eval(argv[1])##this should be the array of items being passed in
model_select=input[0]
train_test_split=input[2]
random_status=input[3]
use_smote=input[4]
smote_strategy=input[5]
feature_scaling=input[6]
parameterValues=list(input[1])##this should be the list of parameters as needed


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

