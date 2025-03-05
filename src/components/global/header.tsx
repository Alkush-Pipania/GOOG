"use client"
import { Button } from "@/components/ui/button"
import { User, Settings, Bell, SquarePen, AlignLeft, Search } from "lucide-react"
import Link from "next/link"
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card"
import { dark } from "@clerk/themes";
import { Skeleton } from "../ui/skeleton"



export default function Header({ userid }: { userid: string | null }) {
  const { isLoaded } = useUser();

  return (
    <header className="w-full p-4 flex fixed top-0 items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
        <span className="text-xl font-medium hidden md:inline-block">GOOG</span>
      </Link>

      <div className="flex items-center gap-2">
        {userid ? (
          <>
            {/* <Button variant="ghost" size="icon" className=" cursor-pointer rounded-full hover:bg-zinc-700 hover:text-white">
              <Settings size={20} className="" />
            </Button> */}
            <HoverCard openDelay={3} closeDelay={3} >
              <HoverCardTrigger>
                <Button className='hover:bg-zinc-700 bg-transparent cursor-pointer duration-150 ease-in-out rounded-full'>
                  <Search />
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className='bg-zinc-700 w-fit border-none text-white p-2 text-sm'>
                History
              </HoverCardContent>
            </HoverCard>
            {!isLoaded ? (<Skeleton className="h-7 w-7 bg-zinc-600 rounded-full" />) : (<UserButton
              appearance={{
                baseTheme: dark,
                variables: {
                  colorPrimary: "#ff5733", // Customize buttons and links
                  colorBackground: "#222222",
                  colorText: "#ffffff",
                },
                elements: {
                  userButtonAvatarBox: { backgroundColor: "#FF5733" },
                  userButtonPopoverActionButton: {
                    color: "#FF5733",
                  },
                },

              }}
            />)}

          </>
        ) : (
          <>
            <SignUpButton
            >
              <Button
                variant="outline"
                className="rounded-full text-black bg-white/80 hover:bg-white cursor-pointer"
              >
                <User size={16} className="mr-1" />
                Sign up
              </Button>
            </SignUpButton>
            <SignInButton >
              <Button variant="ghost" className="text-white rounded-3xl cursor-pointer border border-gray-500 bg-zinc-900 hover:bg-zinc-800 hover:text-white" >
                Sign in
              </Button>
            </SignInButton>
          </>
        )}
      </div>
    </header>
  )
}

