import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

async function test() {
  try {
    const markdown = '# Hello World';
    console.log('Testing marked...');
    const rawHtml = await marked.parse(markdown);
    console.log('Raw HTML:', rawHtml);

    console.log('Testing DOMPurify...');
    const cleanHtml = DOMPurify.sanitize(rawHtml);
    console.log('Clean HTML:', cleanHtml);
    
    console.log('Success!');
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
