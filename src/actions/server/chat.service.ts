// app/actions/server/chat.service.ts
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
import { Role } from "@prisma/client";
import { UpstashVectorStore } from "@langchain/community/vectorstores/upstash";
import { Index } from "@upstash/vector";
import prisma from "@/lib/prisma";
import { PassThrough } from "stream"; // Node.js stream for manual streaming
import { MessageContent } from "@langchain/core/messages";

export class ChatService {
  private outputParser = StructuredOutputParser.fromZodSchema(
    z.object({
      heading: z.string().describe("The heading of the prompt"),
      steps: z.array(z.string()).describe("prompt divided into prompt step wise , Important : don't include any step when user input is conversational").min(0).max(25),
      prompt: z.string().describe("A flowing, natural paragraph-style prompt without numbered points or bullets"),
      followUpQuestions: z.array(z.string()).optional().describe("Any follow-up questions for the user"),
    })
  );

  private formatInstructions: string;
  private model: ChatGoogleGenerativeAI;
  private systemPrompts: Record<string, string>;
  private embeddings: GoogleGenerativeAIEmbeddings;
  private vectorStore: UpstashVectorStore;

  constructor(model: ChatGoogleGenerativeAI, systemPrompts: Record<string, string>) {
    this.model = model;
    this.systemPrompts = systemPrompts;
    this.formatInstructions = this.outputParser.getFormatInstructions();
    this.embeddings = new GoogleGenerativeAIEmbeddings({
      model: "embedding-001",
      apiKey: process.env.GOOGLE_API_KEY,
    });
    const indexWithCredentials = new Index({
      url: process.env.UPSTASH_VECTOR_REST_URL!,
      token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
    });
    this.vectorStore = new UpstashVectorStore(this.embeddings, {
      index: indexWithCredentials,
    });
  }

  private cleanPromptText(text: string): string {
    return text
      .replace(/^\d+\.\s+/gm, "")
      .replace(/\n+/g, "\n\n")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  private getUpdatedSystemPrompts() {
    return {
      detailed: `${this.systemPrompts.detailed}\n\n${this.formatInstructions}`,
      normal: `${this.systemPrompts.normal}\n\n${this.formatInstructions}`,
    };
  }

  private async saveConversation(chatId: string, content: string, role: Role): Promise<void> {
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });
    const conversation = await prisma.conversation.create({
      data: { content, role, chatId },
    });
    await this.vectorStore.addDocuments([
      {
        pageContent: content,
        metadata: {
          chatId,
          role,
          messageId: conversation.id,
          timestamp: conversation.timestamp.toISOString(),
        },
      },
    ]);
  }

  private async getRelevantChatHistory(chatId: string, userInput: string, limit: number = 5): Promise<string> {
    try {
      const filterString = `chatId = "${chatId}"`;
      const vectorSearchResults = await this.vectorStore.similaritySearch(userInput, limit, filterString);
      let formattedContext = "";
      for (const doc of vectorSearchResults) {
        const role = doc.metadata.role;
        formattedContext += `${role.toUpperCase()}: ${doc.pageContent}\n\n`;
      }
      return formattedContext;
    } catch (error) {
      console.error("Error retrieving chat history:", error);
      return "";
    }
  }

  async processUserInput(params: {
    userInput: string;
    promptType: "normal" | "detailed";
    userId: string;
    chatId?: string;
  }) {
    const { userInput, promptType, userId, chatId } = params;
  
    const chat = chatId
      ? await prisma.chat.findUnique({ where: { id: chatId } })
      : await prisma.chat.create({
          data: { title: userInput.substring(0, 50) + "...", userId },
        });
  
    if (!chat) throw new Error("Chat not found");
  
    await this.saveConversation(chat.id, userInput, "user");
    const relevantHistory = await this.getRelevantChatHistory(chat.id, userInput);
    const updatedSystemPrompt = this.getUpdatedSystemPrompts()[promptType];
    const systemTemplate = `${updatedSystemPrompt}\n\nHere is relevant conversation history:\n${relevantHistory}`;
    const escapedSystemContent = systemTemplate.replace(/\{/g, "{{").replace(/\}/g, "}}");
  
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", escapedSystemContent],
      ["human", "{input}"],
    ]);
  
    const stream = new PassThrough();
    const fullResponse: string[] = [];
  
    try {
      const formattedPrompt = await prompt.format({ input: userInput });
      const streamResponse = await this.model.stream(formattedPrompt);
  
      for await (const chunk of streamResponse) {
        const content: MessageContent = chunk.content;
        let text: string;
        if (typeof content === "string") {
          text = content;
        } else if (Array.isArray(content)) {
          text = content.map((item: any) => item.text || "").join(" ");
        } else {
          text = "";
        }
        fullResponse.push(text);
        stream.write(text); // Stream raw text to frontend
      }
      stream.end();
  
      const finalResponse = fullResponse.join("");
  
      try {
        const parsedResponse = await this.outputParser.parse(finalResponse);
        parsedResponse.prompt = this.cleanPromptText(parsedResponse.prompt);
  
        const formattedMarkdown = `**Heading:** ${parsedResponse.heading}\n**Steps:**\n${parsedResponse.steps
          .map((step) => `- ${step}`)
          .join("\n")}\n**Prompt:** ${parsedResponse.prompt}\n**Follow-up Questions:**\n${
          parsedResponse.followUpQuestions && parsedResponse.followUpQuestions.length
            ? parsedResponse.followUpQuestions.map((q) => `- ${q}`).join("\n")
            : "None"
        }`;
  
        await this.saveConversation(chat.id, formattedMarkdown, "assistant");
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
        const fallbackResponse = `**Heading:** Response Format Error\n**Steps:**\n- Error parsing response\n**Prompt:** ${this.cleanPromptText(
          finalResponse
        )}\n**Follow-up Questions:**\n- None`;
        await this.saveConversation(chat.id, fallbackResponse, "assistant");
      }
    } catch (error) {
      console.error("Streaming error:", error);
      const errorResponse = `**Heading:** Error\n**Steps:**\n- Internal server error occurred\n**Prompt:** Unable to process request\n**Follow-up Questions:**\n- None`;
      await this.saveConversation(chat.id, errorResponse, "assistant");
      stream.write(errorResponse);
      stream.end();
    }
  
    return stream;
  }
}