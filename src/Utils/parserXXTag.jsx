import React from 'react';
import Highlight from '../Components/Highlight/Highlight';


//  This function is used to highlight the hallucinated parts
export const filterText=(txt)=>{

    const parts = txt.split(/(<xx>.*?<\/xx>)/g);        

    let list=parts.map((val)=>{
        if(val.includes("<xx>")){
            val=val.replace("<xx>","")
            val=val.replace("</xx>","")
            return <Highlight>{val}</Highlight>
        }
        else{
            return val
        }
    })
    return list
}