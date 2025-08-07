import React from 'react'
import "./Highlight.css"

// Highlighting the text which are not correct
const Highlight= ({children}) => {
  return (
    // <span className='highlight-parent'>{children}<div className='highlighter-div'></div></span>
    <span className="animated-highlight">{children}</span>
  )
}

export default Highlight