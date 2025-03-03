import { SignUp } from '@clerk/nextjs'
import React from 'react'



const Signup = () => {
  return (
   <div className='flex items-start sm:items-center  h-screen justify-center'>
     <SignUp/>
   </div>
  )
}

export default Signup