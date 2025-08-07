import { useState } from 'react'
import { Route,BrowserRouter as Router,Routes } from 'react-router-dom'
import HighlightedResult from './Page/HighlightedResult/HighlightedResult'
import CorrectionResult from './Page/CorrectionResult/CorrectionResult'
import Navbar from './Components/Navbar/Navbar'
import Home from './Page/Home/Home'
import Test from './Page/Test/Test'


function App() {


  return (
    <>
      <div className='main-parent'>
        <Navbar/>
        <Router>
            <Routes>
                <Route path='/' element={<Home/>}/>
                <Route path='/result' element={<HighlightedResult/>}/>
                <Route path='/correction' element={<CorrectionResult/>}/>
                <Route path='/test' element={<Test/>}/>
            </Routes>
        </Router>
      </div>
    </>
  )
}

export default App
