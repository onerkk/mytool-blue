'use strict';
const fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'JS/shared/decision-parser.js'), 'utf8').split("\nif (typeof module")[0];
const region = '// BEGIN SHARED DECISION PARSER\n' + source + '\n// END SHARED DECISION PARSER';
for (const file of ['JS/tarot-foundation.js', 'JS/lenormand.js']) {
  const target = path.join(root, file), text = fs.readFileSync(target, 'utf8');
  if (!text.includes('// BEGIN SHARED DECISION PARSER')) throw Error('Missing insertion marker: ' + file);
  fs.writeFileSync(target, text.replace(/\/\/ BEGIN SHARED DECISION PARSER[\s\S]*?\/\/ END SHARED DECISION PARSER/, region));
}
