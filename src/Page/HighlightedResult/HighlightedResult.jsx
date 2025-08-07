import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { filterText } from '../../Utils/parserXXTag';
import Loading from '../../Components/Loading/Loading';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { FaRegCopy } from "react-icons/fa";
import { BiCheckDouble } from "react-icons/bi";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./HighlightedResult.css"
import { MdVerifiedUser } from "react-icons/md";


const HighlightedResult= () => {

  
  // Declaring States, but text will be from redux maybe.
  // const [text, settext] = useState("Hello world. How are you guys doing. <xx>This is the beginning</xx>. Ok this is working. <xx>Nice its hall</xx>")
    const [display, setdisplay] = useState(false)
  
    const [displayContent, setdisplayContent] = useState([])
    const [sentCount, setsentCount] = useState([0,0])
    // const [score, setscore] = useState(0)
    // const [prompt, setprompt] = useState("")
    
    const selector=useSelector((state)=>state.inputReducer)
    const resultSelector=useSelector((state)=>state.resultReducer)
    const dispatch=useDispatch()

    const navigate=useNavigate()

    // let text="<xx>Hello world.</xx> How are you guys doing. <xx>This is the beginning</xx>. Ok this is working. <xx>Nice its hall</xx>"

    const selectLLM=(e)=>{
        dispatch({type:"model",payload:e.target.value})
    }


    const sendRequest=async()=>{
          setdisplay(false)
          await axios.post("http://127.0.0.1:5000/api/detect",{"article":selector.article,"summary":selector.summary})
          .then((response)=>{
            console.log(response)
            
            let result=filterText(response.data.summary)
            setdisplayContent(result) 

            dispatch({type:"tag_summary",payload:response.data.summary})  
            dispatch({type:"score",payload:parseInt(parseFloat(response.data["score"])*10000)/100})
            dispatch({type:"prompt",payload:response.data.copy_prompt})
            dispatch({type:"sentence_count",payload:response.data.counts})
            // setscore(parseInt(parseFloat(response.data["score"])*10000)/100)
            // setprompt(response.data.copy_prompt)
            setsentCount(response.data.counts)
            setdisplay(true)
            
          })     
    }

    useEffect(() => {
        if (selector.article && selector.summary){
          sendRequest()
        }else{
          navigate("/")
        }
    }, [])
    
    // Copy to the clipboard


  return (
    <div className='result-main'>
      <div className='result-div'>
        <ToastContainer position="bottom-right" theme='dark'/>
        {/* LEFT PART */}
        <div className='result-left-part'>
        <div className='left-part-heading'><b>SUMMARY RESULT</b></div>
        {!display?
          <div className='result-loading'>
            <Loading placeholder={"Detecting . . . "}/>
          </div>
        :
          <div className='result-display'>
            {displayContent}
          </div>
        }
        </div>



        {/* RIGHT PART */}
        <div className='result-right-part'>
          <div className='right-part-heading'><b>REPORT</b></div>
          <div className='result-report-score-div'>
              <ScoreCircle score={resultSelector.score}/>
              <SentencesResultTable hallucinated={sentCount[0]} correct={sentCount[1]} total={sentCount[0]+sentCount[1]}/>
          </div>

                {/* Copy prompt buttons */}
          {display&&
          <>
            <CopyPromptDiv prompt={resultSelector.prompt}/>
            <CorrectionDiv clickFunction={()=>{navigate("/correction")}} selectFunction={selectLLM} selectValue={resultSelector.model}/>
          </>
          }
  
        </div>
      </div>
    </div>
  );
};



// ##### MINI COMPONENTS BELOW

// Correction Div which is improvised using LLMS
const CorrectionDiv=({clickFunction,selectFunction,selectValue})=>{
  return (
    <>
        <div className='correction-div-through-models'>
          <div>
            ℹ️ Choose an LLM from the list below, then click the correct button to revise the summary.
          </div>
          <div className='correction-div-through-models-settings'>
            <select value={selectValue} onChange={selectFunction}>
              <option value="deepseek">Deep Seek (API)</option>
              <option value="gemini">Gemini (API)</option>
              {/* <option value="mistral">Mistral 7B(Offline LLM)</option>  */}
            </select>
            <button onClick={clickFunction}><MdVerifiedUser/><b style={{marginLeft:"0.1cm"}}>Correct</b></button>
          </div>
        </div>
    </>
  )
}


// Correction Div (Copy prompt Div)
const CopyPromptDiv=({prompt})=>{

  const [copied, setcopied] = useState(false)

  const copy=()=>{
       navigator.clipboard.writeText(prompt)
      .then(() => {
        setcopied(true)
        toast("Copied to the clipboard")
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });

      setTimeout(() => {
            setcopied(false)
        }, 5000);
  }

  return(
    <div className='correction-div-copy-prompt'>
      <b>Click the Copy Prompt button to copy the article-summary prompt to your clipboard. 
        You can paste it into any LLM (like ChatGPT) to correct the wrong sentences in summary based on the article.</b>

        {copied?
        <b style={{fontSize:"0.8cm",padding:"0.2cm 0.2cm", marginRight:"0.2cm"}}><BiCheckDouble /></b>
        :  
          <button className='copy-prompt-button' onClick={copy}><FaRegCopy /></button>
        }
    </div>

  )
}




// Score Circle
const ScoreCircle=({score})=>{
  const [color, setcolor] = useState("black")
  // background-color: rgb(162, 146, 0); neutral
  // background-color: rgb(15, 144, 9); correct
  // rgb(70, 146, 66) less correct
  // background-color: rgb(170, 43, 43); wrong
  useEffect(()=>{
    if(score >= 90){
        setcolor("rgb(15, 144, 9)")
    }else if(score<90 && score>=80){
        setcolor("rgba(49, 135, 45, 1)")
    }else if(score<80 && score>=75){
        setcolor("rgb(70, 146, 66)")
    }else if (score<75 && score>=60){
        setcolor("rgb(162, 146, 0)")
    }else if (score>40 && score<60){
        setcolor("rgba(155, 57, 57, 1)")
    }else if (score<40){
        setcolor("rgb(182, 23, 23)")
    }

  },[score])

  return(
    <div style={{minWidth:"2.5cm"}}>
      <span className='score-circle' style={{backgroundColor:`${color}`}}>
        <b style={{fontSize:"0.6cm"}}>{score}%</b>
        <b style={{fontSize:"0.35cm",marginTop:"-0.2cm"}}>Score</b>
      </span>
    </div>
  )
}



// Sentence Result Table
const SentencesResultTable=({hallucinated,correct,total})=>{

  return(
    <>
      <div className='result-sentences-report'>
        <table>
          <tbody>
            <tr style={{backgroundColor:"rgba(46, 46, 46, 1)",fontWeight:700}}>
              <td></td>
              <td style={{display:"flex",justifyContent:"center"}}>Count</td>
              <td>%</td>
            </tr>

            <tr style={{backgroundColor:"rgba(155, 57, 57, 1)"}}>
              <td>Wrong Sentences</td>
              <td style={{display:"flex",justifyContent:"center"}}>{hallucinated}</td>
              <td>{parseInt((hallucinated/total)*10000)/100}%</td>
            </tr>

            <tr style={{backgroundColor:"rgb(15, 144, 9)"}}>
              <td>Correct Sentences</td>
              <td style={{display:"flex",justifyContent:"center"}}>{correct}</td>
              <td>{parseInt((correct/total)*10000)/100}%</td>
            </tr>

            <tr style={{backgroundColor:"rgba(146, 146, 146, 1)"}}>
              <td>Total Sentences</td>
              <td style={{display:"flex",justifyContent:"center"}}>{total}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}


export default HighlightedResult;
