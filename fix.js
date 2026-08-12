const fs = require('fs');
const file = 'd:/project/AI project/src/app/dashboard/interview/page.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/\\`/g, '`').replace(/\\\$/g, '$');
fs.writeFileSync(file, content);
