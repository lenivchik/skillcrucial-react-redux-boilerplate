import React, { useState } from 'react'
import { Link } from 'react-router-dom'  
import Head from './head'

// import wave from '../assets/images/wave.jpg'


const Home = () => {
  const [counter, setCounterNew] = useState(0)

  return (
    <div>
      <Head title="Hello" />
      <img alt="wave" src="images/wave.jpg" />
      <button type="button" onClick={() => setCounterNew(counter + 1)}>
        updateCounter
      </button>
      <div> Hello World Dashboard {counter} 
      <Link to="/"> Go to Root  </Link>
      </div>
    </div>
  )
}

Home.propTypes = {}

export default Home
