// Copy the complete GitHub frontend, verify every original file, then patch only the proposal.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
const source=path.resolve(process.argv[2]||'');
if(!process.argv[2])throw Error('Usage: node build-full-apps.mjs /path/to/Lucas-PULS');
const out=path.dirname(new URL(import.meta.url).pathname);
const commit=execFileSync('git',['rev-parse','HEAD'],{cwd:source,encoding:'utf8'}).trim();
const runtime=path.join(out,'.runtime');
// Generate into a fresh staging directory, preserving any existing running copy on failure.
const staging=fs.mkdtempSync(path.join(out,'.runtime-build-'));
const original=path.join(staging,'original');fs.mkdirSync(original);
const archive=execFileSync('git',['archive','HEAD','dist'],{cwd:source,maxBuffer:20*1024*1024});
execFileSync('tar',['-xf','-','-C',original],{input:archive});
const files=execFileSync('git',['ls-tree','-r','HEAD','dist'],{cwd:source,encoding:'utf8'}).trim().split('\n');
for(const line of files){const [,hash,file]=line.match(/^\d+ blob ([a-f0-9]+)\t(.+)$/)||[];if(!hash)throw Error('Unexpected Git entry');const data=fs.readFileSync(path.join(original,file));const digest=crypto.createHash('sha1').update(`blob ${data.length}\0`).update(data).digest('hex');if(digest!==hash)throw Error('Original differs: '+file)}
const proposal=path.join(staging,'proposal');fs.cpSync(original,proposal,{recursive:true});
execFileSync('patch',['--batch','--forward','-p1','-i',path.join(out,'design-review.patch')],{cwd:proposal});
const changed=[];for(const line of files){const file=line.split('\t')[1];if(!fs.readFileSync(path.join(original,file)).equals(fs.readFileSync(path.join(proposal,file))))changed.push(file)}
if(changed.sort().join(',')!==['dist/branch.css','dist/branch.js','dist/feature-ui.js'].sort().join(','))throw Error('Unexpected changed files: '+changed);
// Only this script's ignored runtime output is replaced.
fs.mkdirSync(runtime,{recursive:true});
for(const name of ['original','proposal']){const destination=path.join(runtime,name);fs.rmSync(destination,{recursive:true,force:true});fs.renameSync(path.join(staging,name),destination)}
fs.rmdirSync(staging);
const report={commit,originalFilesVerified:files.length,changedFiles:changed,verification:'Every original file matches its Git blob byte for byte.'};
fs.writeFileSync(path.join(out,'full-app-verification.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
