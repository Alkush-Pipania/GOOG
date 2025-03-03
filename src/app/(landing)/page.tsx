

import Header from "@/components/global/header"
import ChatInterface from "@/components/global/chat-interface"
import { auth, clerkClient, User } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";


export default async function Home() {
  const users = await currentUser();
  const { userId } = await auth();
  

  const getGreeting = (users : User| null) => {
    const hour = new Date().getHours();
    let greetingText = "";

    if (hour >= 5 && hour < 12) {
      greetingText = "Good morning";
    } else if (hour >= 12 && hour < 18) {
      greetingText = "Good afternoon";
    } else if (hour >= 18 && hour < 22) {
      greetingText = "Good evening";
    } else {
      greetingText = "Good night";
    }

    if (users) {
      greetingText += `, ${users?.firstName}.`;
    }
    if (!users) {
      greetingText = "Welcome to GOOG.";
    }

    return greetingText;
  };
  return (
    <ChatInterface userid={userId} greetings={getGreeting(users)}/>
  )
}




