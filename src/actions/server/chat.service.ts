import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ConversationChain } from "langchain/chains";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
import { Role } from "@prisma/client";
import { UpstashVectorStore } from "@langchain/community/vectorstores/upstash";
import { Index } from "@upstash/vector";
import prisma from "@/lib/prisma";

export class ChatService {
  private outputParser = StructuredOutputParser.fromZodSchema(
    z.object({
      heading: z.string().describe("The heading of the prompt"),
      steps: z.array(z.string()).describe("include the step of prompt for other ai to get context of the overall prompt in array"),
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

    // Initialize embeddings model
    this.embeddings = new GoogleGenerativeAIEmbeddings({
      model: "embedding-001",
      apiKey: process.env.GOOGLE_API_KEY,
    });

    // Initialize Upstash Vector store
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
    // Update chat timestamp
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    // Save to database
    const conversation = await prisma.conversation.create({
      data: {
        content,
        role,
        chatId,
      },
    });

    // Save to vector store with metadata
    console.log("adding document to vector store");
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
      // Use the correct filter format for Upstash Vector
      const filterString = `chatId = "${chatId}"`;

      // Search for relevant messages in the chat history
      const vectorSearchResults = await this.vectorStore.similaritySearch(userInput, limit, filterString);

      // Format the results into a string context
      let formattedContext = "";
      for (const doc of vectorSearchResults) {
        const role = doc.metadata.role;
        formattedContext += `${role.toUpperCase()}: ${doc.pageContent}\n\n`;
      }
      console.log("done")
      return formattedContext;
    } catch (error) {
      console.error("Error retrieving relevant chat history:", error);
      return ""; // Fallback to empty string if vector search fails
    }
  }

  async processUserInput(params: {
    userInput: string;
    promptType: "normal" | "detailed";
    userId: string;
    chatId?: string;
  }) {
    const { userInput, promptType, userId, chatId } = params;
  
    // Create or get chat
    const chat = chatId
      ? await prisma.chat.findUnique({ where: { id: chatId } })
      : await prisma.chat.create({
          data: {
            title: userInput.substring(0, 50) + "...",
            userId,
          },
        });
  
    if (!chat) {
      throw new Error("Chat not found");
    }
  
    try {
      // Save user message
      await this.saveConversation(chat.id, userInput, "user");
  
      // Retrieve relevant chat history using vector search
      const relevantHistory = await this.getRelevantChatHistory(chat.id, userInput);
  
      // Get the system prompts
      const updatedSystemPrompt = this.getUpdatedSystemPrompts()[promptType];
      
      // Use PromptTemplate to properly escape the system content
      const systemTemplate = updatedSystemPrompt + "\n\nHere is relevant conversation history:\n" + relevantHistory;
      
      // Escape any curly braces in the system content by replacing { with {{ and } with }}
      const escapedSystemContent = systemTemplate.replace(/\{/g, "{{").replace(/\}/g, "}}");
  
      // Define prompt template with single input key
      const prompt = ChatPromptTemplate.fromMessages([
        ["system", escapedSystemContent], 
        ["human", "{input}"], 
      ]);
  
      // Create chain without default memory
      const chain = new ConversationChain({
        llm: this.model,
        prompt,
        verbose: true,
      });
  
      // Call chain with single input key
      const response = await chain.invoke({
        input: userInput, // Only pass 'input' key
      });
  
      if (!response.response) {
        throw new Error("Empty response received from AI model");
      }
  
      // Save assistant response
      await this.saveConversation(chat.id, response.response, "assistant");
  
      try {
        const parsedResponse = await this.outputParser.parse(response.response);
        parsedResponse.prompt = this.cleanPromptText(parsedResponse.prompt);
  
        return {
          result: parsedResponse,
          chatId: chat.id,
        };
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
        return {
          result: {
            heading: "Response Format Error",
            steps: [],
            prompt: this.cleanPromptText(response.response),
            followUpQuestions: [],
          },
          parsingError: true,
          chatId: chat.id,
        };
      }
    } catch (error) {
      console.error("Error in processUserInput:", error);
      throw error;
    }
  }
}