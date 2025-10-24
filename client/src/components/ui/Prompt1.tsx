import React from "react";
import { useState } from "react";
import './button.tsx'

 function Prompt1(){
const [initState,setInitState]=useState(0)
//also state(maybe prop in next component?) for when running the app, when its 0, return initState to 0 

function handleState(status){
setInitState(status)
}

 return(

    //make this prompt to choose between the two items
    <>
        <button onClick={handleState(1)}> 
            <p>ADD ITEM TO DATABASE</p>
        </button>

        <button onClick={handleState(2)}>
            <p>MODIFY ITEM IN DATABASE</p>
        </button>
    </>
 )

}
export default Prompt1

//two initial buttons and 3 states for start: initial, adding, and replacing 


