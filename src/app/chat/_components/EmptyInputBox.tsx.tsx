// components/InputBox.tsx
"use client";
import { ArrowUp, Square, X } from "lucide-react";
import React, { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useAuth } from "@clerk/nextjs";
import useConversationStore from "@/store/ConversationStore";
import { useResponseLoadStore } from "@/store/ChatStore";

const formSchema = z.object({
  message: z.string().min(1, { message: "Message cannot be empty" }),
  promptType: z.union([z.literal("normal"), z.literal("detailed")]), // Changed "deepthink" to "detailed" to match backend
});

type FormValues = z.infer<typeof formSchema>;

const InputBoxy= ({ isMobile }: { isMobile: boolean; }) => {
  const [deepThink, setDeepThink] = useState<boolean>(false);
  const { getToken } = useAuth();
  const { addUserMessage, updateAssistantMessageStream, fetchConversations } = useConversationStore();
  const { isloaded, setLoading } = useResponseLoadStore();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { message: "", promptType: "normal" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      form.reset();
      const token = await getToken();
      addUserMessage(values.message);
      setLoading(true);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userInput: values.message,
          promptType: deepThink ? "detailed" : "normal"
        }),
      });

      if (!response.ok) throw new Error(`Failed to fetch stream: ${response.statusText}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No readable stream");

      const decoder = new TextDecoder();
      let accumulatedResponse = "";
      console.log(response)
      

      setLoading(false);
    } catch (error) {
      console.error("Error in handleChat:", error);
      updateAssistantMessageStream(
        `\n**Error:** ${error instanceof Error ? error.message : "An unexpected error occurred"}`
      );
      setLoading(false);
    }
  };

  return (
    <>
    <div className={`w-full max-w-4xl mx-auto px-4 ${isMobile ? "fixed bottom-0 left-0 right-0 pb-4 z-50 backdrop-blur-sm" : "pb-4"}`}>
      <div className="hover:bg-InputBG border border-gray-600 bg-InputBG/90 duration-150 ease-in-out rounded-2xl p-3 shadow-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="relative">
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <TextareaAutosize
                        {...field}
                        autoFocus
                        minRows={1}
                        maxRows={6}
                        placeholder="How can GOOG help?"
                        className="w-full bg-transparent resize-none custom-scrollbar text-gray-200 text-lg font-Quan py-2 px-1 outline-none border-none"
                        onKeyDown={(event) => {
                          if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            form.handleSubmit(onSubmit)();
                          }
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      form.setValue("promptType", deepThink ? "normal" : "detailed");
                      setDeepThink(!deepThink);
                    }}
                    type="button"
                    className="flex items-center gap-2 cursor-pointer bg-zinc-800 hover:bg-zinc-600 text-gray-200 py-1.5 px-3 rounded-full transition-colors"
                  >
                    {deepThink ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-[2] "><path d="M19 9C19 12.866 15.866 17 12 17C8.13398 17 4.99997 12.866 4.99997 9C4.99997 5.13401 8.13398 3 12 3C15.866 3 19 5.13401 19 9Z" className="fill-yellow-100 dark:fill-yellow-400/40 origin-center transition-all duration-100 scale-100 opacity-100"></path><path d="M15 16.1378L14.487 15.2794L14 15.5705V16.1378H15ZM8.99997 16.1378H9.99997V15.5705L9.51293 15.2794L8.99997 16.1378ZM18 9C18 11.4496 16.5421 14.0513 14.487 15.2794L15.5129 16.9963C18.1877 15.3979 20 12.1352 20 9H18ZM12 4C13.7598 4 15.2728 4.48657 16.3238 5.33011C17.3509 6.15455 18 7.36618 18 9H20C20 6.76783 19.082 4.97946 17.5757 3.77039C16.0931 2.58044 14.1061 2 12 2V4ZM5.99997 9C5.99997 7.36618 6.64903 6.15455 7.67617 5.33011C8.72714 4.48657 10.2401 4 12 4V2C9.89382 2 7.90681 2.58044 6.42427 3.77039C4.91791 4.97946 3.99997 6.76783 3.99997 9H5.99997ZM9.51293 15.2794C7.4578 14.0513 5.99997 11.4496 5.99997 9H3.99997C3.99997 12.1352 5.81225 15.3979 8.48701 16.9963L9.51293 15.2794ZM9.99997 19.5001V16.1378H7.99997V19.5001H9.99997ZM10.5 20.0001C10.2238 20.0001 9.99997 19.7763 9.99997 19.5001H7.99997C7.99997 20.8808 9.11926 22.0001 10.5 22.0001V20.0001ZM13.5 20.0001H10.5V22.0001H13.5V20.0001ZM14 19.5001C14 19.7763 13.7761 20.0001 13.5 20.0001V22.0001C14.8807 22.0001 16 20.8808 16 19.5001H14ZM14 16.1378V19.5001H16V16.1378H14Z" fill="currentColor"></path><path d="M9 16.0001H15" stroke="currentColor"></path><path d="M12 16V12" stroke="currentColor" strokeLinecap="square"></path><g><path d="M20 7L19 8" stroke="currentColor" strokeLinecap="round" className="transition-all duration-100 ease-in-out translate-x-[3px] -translate-y-[3px] opacity-100"></path><path d="M20 9L19 8" stroke="currentColor" strokeLinecap="round" className="transition-all duration-100 ease-in-out translate-x-[3px] translate-y-[3px] opacity-100"></path><path d="M4 7L5 8" stroke="currentColor" strokeLinecap="round" className="transition-all duration-100 ease-in-out -translate-x-[3px] -translate-y-[3px] opacity-100"></path><path d="M4 9L5 8" stroke="currentColor" strokeLinecap="round" className="transition-all duration-100 ease-in-out -translate-x-[3px] translate-y-[3px] opacity-100"></path></g></svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-[2] text-secondary"><path d="M19 9C19 12.866 15.866 17 12 17C8.13398 17 4.99997 12.866 4.99997 9C4.99997 5.13401 8.13398 3 12 3C15.866 3 19 5.13401 19 9Z" className="fill-yellow-100 dark:fill-yellow-400/40 origin-center transition-all duration-100 scale-0 opacity-0"></path><path d="M15 16.1378L14.487 15.2794L14 15.5705V16.1378H15ZM8.99997 16.1378H9.99997V15.5705L9.51293 15.2794L8.99997 16.1378ZM18 9C18 11.4496 16.5421 14.0513 14.487 15.2794L15.5129 16.9963C18.1877 15.3979 20 12.1352 20 9H18ZM12 4C13.7598 4 15.2728 4.48657 16.3238 5.33011C17.3509 6.15455 18 7.36618 18 9H20C20 6.76783 19.082 4.97946 17.5757 3.77039C16.0931 2.58044 14.1061 2 12 2V4ZM5.99997 9C5.99997 7.36618 6.64903 6.15455 7.67617 5.33011C8.72714 4.48657 10.2401 4 12 4V2C9.89382 2 7.90681 2.58044 6.42427 3.77039C4.91791 4.97946 3.99997 6.76783 3.99997 9H5.99997ZM9.51293 15.2794C7.4578 14.0513 5.99997 11.4496 5.99997 9H3.99997C3.99997 12.1352 5.81225 15.3979 8.48701 16.9963L9.51293 15.2794ZM9.99997 19.5001V16.1378H7.99997V19.5001H9.99997ZM10.5 20.0001C10.2238 20.0001 9.99997 19.7763 9.99997 19.5001H7.99997C7.99997 20.8808 9.11926 22.0001 10.5 22.0001V20.0001ZM13.5 20.0001H10.5V22.0001H13.5V20.0001ZM14 19.5001C14 19.7763 13.7761 20.0001 13.5 20.0001V22.0001C14.8807 22.0001 16 20.8808 16 19.5001H14ZM14 16.1378V19.5001H16V16.1378H14Z" fill="currentColor"></path><path d="M9 16.0001H15" stroke="currentColor"></path><path d="M12 16V12" stroke="currentColor" strokeLinecap="square"></path><g><path d="M20 7L19 8" stroke="currentColor" strokeLinecap="round" className="transition-all duration-100 ease-in-out translate-x-0 translate-y-0 opacity-0"></path><path d="M20 9L19 8" stroke="currentColor" strokeLinecap="round" className="transition-all duration-100 ease-in-out translate-x-0 translate-y-0 opacity-0"></path><path d="M4 7L5 8" stroke="currentColor" strokeLinecap="round" className="transition-all duration-100 ease-in-out translate-x-0 translate-y-0 opacity-0"></path><path d="M4 9L5 8" stroke="currentColor" strokeLinecap="round" className="transition-all duration-100 ease-in-out translate-x-0 translate-y-0 opacity-0"></path></g></svg>
                    )}
                    <span className={`text-sm font-medium ${isMobile ? "hidden sm:inline" : ""}`}>DeepThink</span>
                  </button>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="submit"
                    className="p-2 bg-gray-800/70 cursor-pointer hover:bg-gray-700/70 rounded-full transition-colors"
                    disabled={!form.formState.isValid || isloaded}
                  >
                    {isloaded ? <Square className="w-5 h-5 text-gray-200" /> : <ArrowUp className="w-5 h-5 text-gray-200" />}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
    </>
  );
};

export default InputBoxy;