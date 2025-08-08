const fs = require('fs');
const path = require('path');
const readline = require('readline');

const baseDir = 'src';
let globalIndex = 1;
let totalFiles = 0;
const allFiles = []; // Track files with line counts and sizes

function countLines(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return content.split(/\r?\n/).length;
}

function formatSize(bytes) {
  return (bytes / 1024).toFixed(2) + ' KB';
}

function printDirTree(dirPath, indent = '') {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  const folders = entries.filter(e => e.isDirectory());
  const files = entries.filter(e => e.isFile());

  const folderName = path.basename(dirPath);
  console.log(`${indent}📁 ${folderName}/`);

  const newIndent = indent + '    ';

  // Recurse into subfolders first
  for (const folder of folders) {
    printDirTree(path.join(dirPath, folder.name), newIndent);
  }

  // Then print files with line counts and sizes, track info
  for (const file of files) {
    try {
      const filePath = path.join(dirPath, file.name);
      const lines = countLines(filePath);
      const stats = fs.statSync(filePath);
      const sizeKB = formatSize(stats.size);
      totalFiles++;
      allFiles.push({ path: path.relative(process.cwd(), filePath), lines, sizeKB });

      console.log(`${newIndent}${globalIndex++}- 📄 ${file.name}   (${lines} lines, ${sizeKB})`);
    } catch (err) {
      console.log(`${newIndent}${globalIndex++}- 📄 ${file.name}   (error reading)`);
    }
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const fullBasePath = path.join(process.cwd(), baseDir);
if (!fs.existsSync(fullBasePath)) {
  console.log(`Directory not found: ${baseDir}`);
  rl.close();
  process.exit(1);
}

console.log(`Directory tree and file line counts for: ${baseDir}\n`);
printDirTree(fullBasePath);

console.log(`\nTotal files in '${baseDir}': ${totalFiles}\n`);

// Prompt user for how many top files to show
rl.question('How many top files with most lines of code do you want to list? Enter an integer: ', (answer) => {
  let n = parseInt(answer);
  if (isNaN(n) || n <= 0) {
    console.log(`Invalid number '${answer}', defaulting to top 10 files.`);
    n = 10;
  }

  // Sort files by line count desc and slice top n
  const topN = allFiles
    .sort((a, b) => b.lines - a.lines)
    .slice(0, n);

  console.log(`\nTop ${n} files with most lines of code in '${baseDir}':`);
  topN.forEach((file, idx) => {
    console.log(`${idx + 1}- ${file.path}   (${file.lines} lines, ${file.sizeKB})`);
  });

  rl.close();
});


//to run the script run (node KNOWHOWMANYFILES.cjs)