const fs = require('fs');
const xml = fs.readFileSync('f:/Sovereign-Audit-AI/docs/ds_extracted/word/document.xml', 'utf8');
const text = xml.match(/<w:t[^>]*>(.*?)<\/w:t>/g).map(val => val.replace(/<[^>]*>/g, '')).join(' ');
fs.writeFileSync('f:/Sovereign-Audit-AI/docs/ds_text.txt', text);
