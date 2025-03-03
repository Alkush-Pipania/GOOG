import { auth } from "@clerk/nextjs/server";
import PromptingIsAllYouNeed from "./_component/hero_section";



export default async function Home() {
  const {userId} = await auth();
  return (
   <div>
   <PromptingIsAllYouNeed userid={userId} />
   </div>
  )
}




