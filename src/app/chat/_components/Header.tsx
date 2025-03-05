"use client"
import { Button } from '@/components/ui/button'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { useDialogStore } from '@/store/SearchChats'
import { UserButton } from '@clerk/nextjs'
import { AlignLeft, SquarePen } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'



const Header = () => {
  const router = useRouter();
  const [showChat, setShowChat] = useState<boolean>(false)
  const {open , setOpen} = useDialogStore();
  return (
    <section className='flex  z-20 from-GoogBG to-transparent via-GoogBG bg-gradient-to-b  justify-between w-full px-5  fixed top-0 items-center  py-4'>
      <Link href={'/'}>
        <h3 className='font-Quan text-2xl'>
          GooG
        </h3>
      </Link>
      <div className='flex items-center justify-between gap-2'>

        <HoverCard openDelay={3} closeDelay={3} >
          <HoverCardTrigger>
            <Button onClick={()=> router.push('/')} 
            onMouseEnter={() => setShowChat(true)} onMouseLeave={() => setShowChat(false)}
              className='hover:bg-zinc-700 cursor-pointer duration-150 ease-in-out rounded-full'>
              <SquarePen />
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className='bg-zinc-700 w-fit border-none text-white p-2 text-sm'>
            New Chat
          </HoverCardContent>
        </HoverCard>

        <HoverCard openDelay={3} closeDelay={3} >
          <HoverCardTrigger>
            <Button onClick={()=> setOpen(!open)} 
            className='hover:bg-zinc-700 cursor-pointer duration-150 ease-in-out rounded-full'>
              <AlignLeft />
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className='bg-zinc-700 w-fit border-none text-white p-2 text-sm'>
            History
          </HoverCardContent>
        </HoverCard>

        <UserButton />
      </div>
    </section>
  )
}

export default Header