import sanitizeHtml from 'sanitize-html';

console.log('Type of sanitizeHtml:', typeof sanitizeHtml);
console.log('sanitizeHtml:', sanitizeHtml);
try {
  console.log('Sanitized:', sanitizeHtml('<p>test</p>'));
} catch (e) {
  console.error('Error calling sanitizeHtml:', e);
}
