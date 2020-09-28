import React from 'react'
import { Link } from 'react-router-dom'  
import Head from './head'


const Dummy = () => {
  return (
    <div>
      <Head title="Hello" />
      <div className="flex items-center justify-center h-screen">
        <div className="bg-indigo-800 hover:text-red-500 text-white font-bold rounded-lg border shadow-lg p-10">
          This is dummy component
          <Link to="/dashboard"> Go to Dashboard  </Link>
        </div>
      </div>
    </div>
  )
}

Dummy.propTypes = {}

export default React.memo(Dummy)
