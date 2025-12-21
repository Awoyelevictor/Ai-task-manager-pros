
import { GoogleGenAI } from "@google/genai";
import { Task, ChatMessage } from "../types";

const APP_CONTEXT = `
You are the "AI Task Master Pro Assistant". 
Features of the app you support:
- AI Prioritization: You can analyze tasks and suggest an MVP (Most Valuable Priority).
- Smart Alarms: Users can set alarms for tasks that ring even when the screen is locked (if the app is open).
- Seasonal Themes: The app automatically changes its appearance based on seasons (Spring, Summer, Autumn, Winter) and holidays (Christmas, Halloween, Birthdays).
- Multi-speaker TTS: Not fully implemented in UI but supported by the engine.
- Voice Input: Users can speak their tasks.

Your goal is to help users manage their life better. You can provide recipes, instructions, productivity tips, and explain app features.
`;

export const getAIInsights = async (tasks: Task[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  if (tasks.length === 0) return "Your list is empty! Add some missions so we can build a plan.";

  const pendingTasks = tasks.filter(t => !t.completed);
  const taskSummary = pendingTasks.map(t => 
    `- ${t.text}${t.dueDate ? ` (Due: ${new Date(t.dueDate).toLocaleString()})` : ''}`
  ).join('\n');

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are the 'AI Task Master'—a high-performance productivity strategist. 
Review this task list and provide a "Daily Strategy" response.

### GUIDELINES:
1. **The MVP (Most Valuable Priority)**: Identify the one task that will create the most momentum. Explain WHY using "Eat the Frog" or "80/20 Rule" logic.
2. **The Motivation**: Provide a customized, high-energy motivational punchline based on the tasks listed.
3. **Execution Tip**: Give one specific trick (like Pomodoro or Time Boxing) for the identified MVP.

Keep the response structured with headers, bold text, and emojis. Be punchy and professional.

### MISSION LIST:
${taskSummary}`,
    config: { temperature: 0.8 }
  });

  return response.text || "Strategy generation offline.";
};

export const sendMessageToAI = async (history: ChatMessage[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const contents = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: msg.parts.map(p => {
      if (p.text) return { text: p.text };
      if (p.inlineData) return { inlineData: p.inlineData };
      return { text: "" };
    })
  }));

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: contents as any,
    config: {
      systemInstruction: APP_CONTEXT,
      temperature: 0.9,
    },
  });

  return response.text || "I'm having trouble processing that right now.";
};

export const generateLogo = async (style: string, prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const finalPrompt = `Professional mobile app icon for a productivity app called "Task Master Pro". 
  Style: ${style}. 
  Description: ${prompt}. 
  High quality, centered composition, minimalist background, optimized for a launcher icon, no text unless artistic, 4k resolution, studio lighting.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: finalPrompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("Failed to generate image.");
};
