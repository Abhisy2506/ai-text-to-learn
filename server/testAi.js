import { generateCourseOutline, generateLessonContent } from './src/services/aiService.js';
import dotenv from 'dotenv';

dotenv.config();

async function runTests() {
  console.log('--- TESTING COURSE OUTLINE GENERATION -=-');
  try {
    const topic = 'Introduction to Docker';
    console.log(`Prompting Gemini for topic: "${topic}"...\n`);
    
    const courseOutline = await generateCourseOutline(topic);
    
    console.log('Course Outline Generated Successfully:');
    console.log(JSON.stringify(courseOutline, null, 2));

    console.log('\n\n--- TESTING LESSON CONTENT GENERATION ---');
    const courseTitle = courseOutline.title;
    const firstLesson = courseOutline.modules[0].lessons[0];
    
    console.log(`Prompting Gemini for Lesson: "${firstLesson.title}"...\n`);
    
    const lessonContent = await generateLessonContent(
      courseTitle, 
      firstLesson.title, 
      firstLesson.objectives || ['Understand the basics']
    );

    console.log('Lesson Content Generated Successfully:');
    console.log(JSON.stringify(lessonContent, null, 2));

  } catch (error) {
    console.error('Test Failed:', error);
  }
}

runTests();