import OpenAI from 'openai';
import dotenv from 'dotenv';
import { ApiError } from '../utils/ApiError.js';

dotenv.config();

//I have tried Gemini API but it is very time taking and giving peak usage alert..
//So i am using Hugging Face API 

const client = new OpenAI({
  baseURL: 'https://router.huggingface.co/v1',
  apiKey: process.env.HUGGINGFACE_API_KEY,
});

const MODEL_NAME = 'Qwen/Qwen2.5-72B-Instruct';

function cleanAndParseJSON(rawText) {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```/, '').replace(/```$/, '');
  }
  return JSON.parse(cleaned.trim());
}


export const generateCourseOutline = async (topic) => {
  const prompt = `
    You are an expert curriculum designer. Create a comprehensive, well-structured course syllabus for the topic: "${topic}".
    Return ONLY a strictly formatted JSON object with no introductory or closing text.
    
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
    const response = await client.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        {
          role: 'system',
          content: 'You are an educational assistant that strictly outputs valid JSON with no markdown wrapping or extra commentary.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    });

    const rawContent = response.choices[0].message.content;
    return cleanAndParseJSON(rawContent);
  } catch (error) {
    throw new ApiError(500, 'Failed to generate course outline via Hugging Face', [error.message]);
  }
};


export const generateLessonContent = async (courseTitle, lessonTitle, objectives = []) => {
  const prompt = `
    You are an expert technical instructor. Create detailed lesson content for:
    Course: ${courseTitle}
    Lesson: ${lessonTitle}
    Objectives: ${objectives.join(', ')}

    Return ONLY a strictly formatted JSON array of content blocks. Valid block types are: 'heading', 'paragraph', 'code', 'mcq', and 'video'.
    Schema:
    [
      {"type": "heading", "text": "Section Title"},
      {"type": "paragraph", "text": "Detailed explanation."},
      {"type": "code", "language": "javascript", "text": "console.log('example');"},
      {"type": "mcq", "question": "Question text?", "options": ["A", "B", "C", "D"], "answer": 0, "explanation": "Why option A is correct."},
      {"type": "video", "query": "YouTube search query"}
    ]
  `;

  try {
    const response = await client.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        {
          role: 'system',
          content: 'You are an educational assistant that strictly outputs a JSON array of lesson blocks with no surrounding text or commentary.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    });

    const rawContent = response.choices[0].message.content;
    return cleanAndParseJSON(rawContent);
  } catch (error) {
    throw new ApiError(500, 'Failed to generate lesson content via Hugging Face', [error.message]);
  }
};