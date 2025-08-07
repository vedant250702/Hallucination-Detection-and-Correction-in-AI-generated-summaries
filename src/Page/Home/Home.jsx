import React, { useEffect, useState } from 'react'
import "./Home.css"
import TextAreaInput from '../../Components/TextAreaInput/TextAreaInput'
import { useDispatch,useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const Home = () => {

    const selector=useSelector((state)=> state.inputReducer)
    const dispatch=useDispatch()

    const [inputs, setinputs] = useState({article:selector.article,summary:selector.summary})
    const navigate=useNavigate()

    // Taking Inputs from the User.
    const inputChange=(category)=>(e)=>{
        setinputs({...inputs,[category]:e.target.value})
    }

    //Detect Function
    const detect=()=>{
        dispatch({payload:inputs.article,type:"article"})
        dispatch({payload:inputs.summary,type:"summary"})
        navigate("/result")   
    }

  return (
    <div className='home-parent'>

        <div className='home-inputs-parent'>
          <div className='home-parts'>
                <TextAreaInput placeholder={"Enter source article here"} label={"Article"} onChange={inputChange("article")} value={inputs.article}/>
          </div>
            <div style={{width:"0.1cm"}}></div>
          <div className='home-parts'>
             <TextAreaInput placeholder={"Enter AI generated summary here"} label={"Summary"} onChange={inputChange("summary")} value={inputs.summary}/>
          </div>
        </div>

        <div className='home-buttons'>
            <button onClick={detect}><b>Detect</b></button>
        </div>
    </div>
  )
}

export default Home