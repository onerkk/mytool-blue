#!/usr/bin/env node
'use strict';
// stdin: {method,question,answer,sourcePrompt?,evidence?}. Never calls an AI API.
const fs=require('node:fs'),flow=require('../JS/reading-workflow.js');
try{
  const input=JSON.parse(fs.readFileSync(0,'utf8'));
  const output=process.argv.includes('--repair')?flow.repairPrompt(input):flow.review(input);
  process.stdout.write((typeof output==='string'?output:JSON.stringify(output,null,2))+'\n');
}catch(e){process.stderr.write(e.message+'\n');process.exitCode=1;}
