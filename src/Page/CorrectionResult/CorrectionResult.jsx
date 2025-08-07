import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { filterText } from '../../Utils/parserXXTag';
import Loading from '../../Components/Loading/Loading';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { FaRegCopy } from "react-icons/fa";
import { BiCheckDouble } from "react-icons/bi";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MdVerifiedUser } from "react-icons/md";
import "./CorrectionResult.css"


const CorrectionResult= () => {

  
  // Declaring States, but text will be from redux maybe.
  // const [text, settext] = useState("Hello world. How are you guys doing. <xx>This is the beginning</xx>. Ok this is working. <xx>Nice its hall</xx>")
    const [display, setdisplay] = useState(false)
  
    const [displayContent, setdisplayContent] = useState([])

    
    const selector=useSelector((state)=>state.inputReducer)
    const resultSelector=useSelector((state)=>state.resultReducer)
    const correctedResultSelector=useSelector((state)=>state.correctionResultReducer)

    const dispatch=useDispatch()
    const navigate=useNavigate()

    // let text="<xx>Hello world.</xx> How are you guys doing. <xx>This is the beginning</xx>. Ok this is working. <xx>Nice its hall</xx>"


    const sendRequest=async()=>{
          setdisplay(false)
          await axios.post("http://127.0.0.1:5000/api/correct",{article:selector.article,tag_summary:resultSelector.tag_summary,model:resultSelector.model})
          .then((response)=>{

            if(response.data.status==200){

              // console.log(response)
              
              let result=filterText(response.data.summary)
              
              setdisplayContent(result)   
              // setscore(parseInt(parseFloat(response.data["score"])*10000)/100)
              // setsentCount(response.data.counts)
              // setprompt(response.data.copy_prompt)
              
  

              dispatch({type:"corrected_summary",payload:result})
              dispatch({type:"corrected_score",payload:parseInt(parseFloat(response.data["score"])*10000)/100})
              dispatch({type:"corrected_sentence_count",payload:response.data.counts})
              setdisplay(true)

            }
            
          })     
    }

    useEffect(() => {
        if (selector.article && resultSelector.tag_summary){
          dispatch({type:"clear_correct_summary_parameters"})
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
        <div className='left-part-heading'><b>Corrected Summary</b></div>
        {!display?
          <div className='result-loading'>
            <Loading placeholder={"Correcting . . . "}/>
          </div>
        :
          <div className='result-display'>
            {displayContent}
          </div>
        }
        </div>



        {/* RIGHT PART */}
        <div className='result-right-part'>
          <div className='right-part-heading'><b>Report</b></div>

          <div className='correction-result-heading'>Before Correction</div>
          <div className='result-report-score-div'>
              <ScoreCircle score={resultSelector.score}/>
              <SentencesResultTable hallucinated={resultSelector.sentence_count[0]} correct={resultSelector.sentence_count[1]} total={resultSelector.sentence_count[0]+resultSelector.sentence_count[1]}/>
          </div>

          <div className='correction-result-heading' style={{marginTop:"0.75cm"}}>After Correction</div>
          <div className='result-report-score-div'>
              <ScoreCircle score={correctedResultSelector.score}/>
              <SentencesResultTable hallucinated={correctedResultSelector.sentence_count[0]} correct={correctedResultSelector.sentence_count[1]} total={correctedResultSelector.sentence_count[0]+correctedResultSelector.sentence_count[1]}/>
          </div>
        </div>
      </div>
    </div>
  );
};



// ##### MINI COMPONENTS BELOW

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


export default CorrectionResult;
