
import prisma from "@/lib/prisma";

export async function CreateChat(userId : string | null){
  console.log(userId)
  if(!userId){
    return {error : true , message : "User not found"}
  }

  try{
    const chat = await prisma.chat.create({
      data: {
        userId: userId,
        title: "New Chat",
      },
    });
    return {error : false , chatId : chat.id}
  }catch(e){
    console.log(e)
    return {error : true , message :
    "Error while creating chat"}
    
  }
}