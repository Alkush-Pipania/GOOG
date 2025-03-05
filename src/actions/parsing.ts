const formatAssistantMessage = (content: string): {
  heading?: string;
  steps?: string[];
  prompt?: string;
  followUpQuestions?: string[];
} => {
  const jsonData: {
    heading?: string;
    steps?: string[];
    prompt?: string;
    followUpQuestions?: string[];
  } = {};

  try {
    const headingMatch = content.match(/\*\*Heading:\*\* (.+)/);
    if (headingMatch) jsonData.heading = headingMatch[1].trim();

    const stepsMatch = content.match(/\*\*Steps:\*\*\n([\s\S]*?)\n\*\*Prompt:\*\*/);
    if (stepsMatch) {
      jsonData.steps = stepsMatch[1]
        .trim()
        .split("\n")
        .map((step) => step.replace(/^- /, "").trim())
        .filter((step) => step);
    }

    const promptMatch = content.match(/\*\*Prompt:\*\*([\s\S]*?)\n\*\*Follow-up Questions:\*\*/);
    if (promptMatch) jsonData.prompt = promptMatch[1].trim();

    const questionsMatch = content.match(/\*\*Follow-up Questions:\*\*\n([\s\S]*)/);
    if (questionsMatch) {
      jsonData.followUpQuestions = questionsMatch[1]
        .trim()
        .split("\n")
        .map((q) => q.replace(/^- /, "").trim())
        .filter((q) => q && q !== "None");
    }

    return jsonData;
  } catch (error) {
    console.error("Error parsing assistant message:", error);
    return { prompt: content }; // Fallback to raw content
  }
};

export default formatAssistantMessage;