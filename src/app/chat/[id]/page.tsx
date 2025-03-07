import { currentUser, User } from "@clerk/nextjs/server";
import Chatcomponent from "./_components/Chatcomponent"

export default async function ChatPage() {
  const users = await currentUser();
  const getGreeting = (users: User | null) => {
    const hour = new Date().getHours();
    let greetingText = "";

    if (hour >= 5 && hour < 12) {
      greetingText = "Good morning";
    } else if (hour >= 12 && hour < 17) {
      greetingText = "Good afternoon";
    } else if (hour >= 17 && hour < 22) {
      greetingText = "Good evening";
    } else {
      greetingText = "Good night";
    }

    if (users) {
      greetingText += `, ${users.firstName || 'there'}`;
    } else {
      greetingText = "Welcome to GOOG";
    }

    return greetingText;
  };

  return (
    <Chatcomponent greetings={getGreeting(users)} />
  );
}


