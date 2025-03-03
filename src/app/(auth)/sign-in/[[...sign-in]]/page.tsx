import { SignIn } from '@clerk/nextjs'
import React from 'react'



const Signin = () => {
  return (
    <div className='flex items-start sm:items-center  h-screen justify-center'>
      <SignIn/>
    </div>
    
  )
}

export default Signin