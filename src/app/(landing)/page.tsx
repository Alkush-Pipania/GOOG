"use server"
import { auth } from "@clerk/nextjs/server";
import PromptingIsAllYouNeed from "./_component/hero_section";



export default async function Home() {
  const {userId , getToken} = await auth();
  const token = await getToken();
  return (
   <div>
   <PromptingIsAllYouNeed token={token} userid={userId} />
   </div>
  )
}




