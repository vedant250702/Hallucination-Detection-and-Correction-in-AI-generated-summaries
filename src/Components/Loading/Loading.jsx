import React, { useEffect, useRef } from 'react'
import "./Loading.css"
import {gsap} from 'gsap'

const Loading = ({placeholder}) => {

  const box1=useRef()
  const box2=useRef()

  const AnimateBox1=(ref)=>{
        const gs=gsap.timeline({repeat:-1})
        gs.to(ref.current,{x:60,duration:0.8,scale:0.5,ease: "power1.inOut"})
        .to(ref.current,{y:60,duration:0.8,scale:1,ease: "power1.inOut"})
        .to(ref.current,{x:0,duration:0.8,scale:0.5,ease: "power1.inOut"})
        .to(ref.current,{y:0,duration:0.8,scale:1,ease: "power1.inOut"})
  }

    const AnimateBox2=(ref)=>{
        const gs=gsap.timeline({repeat:-1})
        gs.to(ref.current,{x:-60,duration:0.8,scale:1,ease: "power1.inOut"})
        .to(ref.current,{y:-60,duration:0.8,scale:0.5,ease: "power1.inOut"})
        .to(ref.current,{x:0,duration:0.8,scale:1,ease: "power1.inOut"})
        .to(ref.current,{y:0,duration:0.8,scale:0.5,ease: "power1.inOut"})
  }


  useEffect(() => {
    AnimateBox1(box1)
    AnimateBox2(box2)
  }, [])
  

  return (
    <div className='loading-main'> 
    <div className='loading-animation'>
      <span ref={box1} className='box bx-color'></span>
      <span ref={box2} className='box2 bx-color-2'></span>
    </div>
    <b>{placeholder}</b>
    </div>
  )
}

export default Loading