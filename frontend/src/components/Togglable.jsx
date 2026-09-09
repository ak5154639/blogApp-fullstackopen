import { useState } from 'react'

const Togglable = (props) => {
  const [visibility, setVisibility] = useState(false)

  const toggleVisibility = () => {
    setVisibility(!visibility)
  }

  const showWhenVisible = { display: visibility ? '' : 'none' }
  const hideWhenVisible = { display: visibility ? 'none' : '' }

  return (
    <>
      <div style={hideWhenVisible}>
        <button onClick={toggleVisibility}>{props.buttonLabel}</button>
      </div>
      <div style={showWhenVisible}>
        {props.children}
        <button onClick={toggleVisibility}>cancel</button>
      </div>
    </>
  )
}


export default Togglable