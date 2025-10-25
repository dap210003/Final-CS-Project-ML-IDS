import React from "react";
import { useState } from "react";
import './button.tsx'

 function Prompt1(){
const [initState,setInitState]=useState(0)
const [runAdd,setRunAdd]=useState(false)
const [runMod,setRunMod]=useState(false)
//also state(maybe prop in next component?) for when running the app, when its 0, return initState to 0 
//3 bool states? probably not

/*function handleState(status){
setInitState(status)
}*/

 return(

    //make this prompt to choose between the two items
    !initState?(
    <>
        <button onClick={setInitState(true),setRunAdd(true),setRunMod(false)}> 
            <p>ADD ITEM TO DATABASE</p>
        </button>

        <button onClick={setInitState(true),setRunMod(true),setRunAdd(false)}>
            <p>MODIFY ITEM IN DATABASE</p>
        </button>
    </>)
    :
    (
        runAdd?(
            <button>ADDTODBSTUFFHERE</button>
        )
        :
        (
            <button>MODDBENTRYSTUFFHERE</button>
        )
    )

 )

}
export default Prompt1

//two initial buttons and 3 states for start: initial, adding, and replacing 


