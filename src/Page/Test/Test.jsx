import React from 'react'
import Loading from '../../Components/Loading/Loading'

const Test = () => {
  return (
    <div style={{width:"100%",height:"100%",display:"flex",justifyContent:"center",alignItems:"center"}}>
        <Loading placeholder={"Detecting . . ."}/>
    </div>
  )
}

export default Test