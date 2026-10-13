import OpenAI from 'openai';
import dotenv from 'dotenv';
import { ApiError } from '../utils/ApiError.js';

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

const MODEL_NAME = 'openai/gpt-oss-120b';

/**
 * Resilient JSON parsing helper that strips markdown fences,
 * preamble text, and safely extracts JSON objects/arrays.
 */
function cleanAndParseJSON(rawText) {
  let cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();

  const firstBrace = cleaned.search(/[\{\[]/);
  const lastBrace = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));

  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  return JSON.parse(cleaned);
}

/**
 * Executes API requests with automatic exponential backoff
 * to guard against Groq's 8K tokens/minute (429 Rate Limit) threshold.
 */
async function callGroqWithRetry(fn, retries = 3, delay = 4000) {
  try {
    return await fn();
  } catch (error) {
    const isRateLimited = error?.status === 429 || error?.message?.includes('429');
    if (isRateLimited && retries > 0) {
      console.warn(`[Groq Rate Limit] Received 429. Retrying in ${delay / 1000}s... (${retries} retries left)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return callGroqWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export const generateCourseOutline = async (topic) => {
  console.log('Generating course outline for:', topic);

  // Strict constraint: Limits output to 4-6 modules, 2-3 lessons each (6-10 lessons total)
  const prompt = `
    You are an expert curriculum designer. Create a concise, high-impact course syllabus for the topic: "${topic}".
    
    STRICT STRUCTURE RULES:
    1. Create EXACTLY 3 to 4 modules.
    2. Each module MUST have EXACTLY 2 to 3 lessons (maximum 12-15 lessons across the entire course).
    3. Return ONLY a strictly formatted JSON object with no markdown fences, backticks, or extra text.

    Required JSON Schema:
    {
      "title": "Course Title",
      "description": "Short overview of the course.",
      "tags": ["tag1", "tag2"],
      "modules": [
        {
          "title": "Module Title",
          "lessons": [
            {
              "title": "Lesson Title",
              "objectives": ["Objective 1", "Objective 2"]
            }
          ]
        }
      ]
    }
  `;

  try {
    return await callGroqWithRetry(async () => {
      const response = await client.chat.completions.create({
        model: MODEL_NAME,
        messages: [
          {
            role: 'system',
            content: 'You are an educational assistant that strictly outputs valid JSON with no conversational text or markdown code blocks.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 1400,
      });

      const rawContent = response.choices[0].message.content;
      return cleanAndParseJSON(rawContent);
    });
  } catch (error) {
    console.error('Groq Outline Error:', error);
    throw new ApiError(500, `Failed to generate course outline: ${error.message}`);
  }
};

export const generateLessonContent = async (courseTitle, lessonTitle, objectives = []) => {
  const prompt = `
    You are an expert technical instructor. Create detailed, beautifully formatted lesson content for:
    Course: ${courseTitle}
    Lesson: ${lessonTitle}
    Objectives: ${objectives.join(', ')}

    FORMATTING RULES FOR CONTENT BLOCKS:
    1. For 'paragraph' blocks:
       - Use clean Markdown headers (## for main sections, ### for subsections).
       - Never place inline bullets (•) on one line. Every bullet point MUST start on a new line with "- ".
       - Leave clean line breaks before and after lists, tables, and blockquotes.
    2. Valid block types are strictly: 'heading', 'paragraph', 'code', 'mcq', and 'video'.
    3. Output ONLY a valid JSON array. Do not wrap in markdown \`\`\`json code blocks.
    4. Do NOT include the course title, lesson title, or a 'Learning Objectives' heading/list inside the content blocks. The client UI already renders the title and objectives separately. Begin the content blocks directly with the substantive instructional material.

    Schema:
    [
      {"type": "heading", "text": "Section Title"},
      {"type": "paragraph", "text": "Detailed explanation with clean markdown formatting."},
      {"type": "code", "language": "javascript", "text": "console.log('example');"},
      {"type": "mcq", "question": "Question text?", "options": ["A", "B", "C", "D"], "answer": 0, "explanation": "Why option A is correct."},
      {"type": "video", "query": "YouTube search query"}
    ]
  `;

  try {
    return await callGroqWithRetry(async () => {
      const response = await client.chat.completions.create({
        model: MODEL_NAME,
        messages: [
          {
            role: 'system',
            content: 'You are an educational assistant that strictly outputs a JSON array of lesson blocks with no surrounding text or markdown wrappers.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 2000,
      });

      const rawContent = response.choices[0].message.content;
      return cleanAndParseJSON(rawContent);
    });
  } catch (error) {
    console.error('Groq Lesson Content Error:', error);
    throw new ApiError(500, `Failed to generate lesson content: ${error.message}`);
  }
};