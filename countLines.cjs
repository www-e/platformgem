const fs = require("fs");
const path = require("path");

const baseDir = path.join(process.cwd(), "src");
let index = 1;

// Function to count lines in a file
function countLines(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  return content.split(/\r?\n/).length;
}

// Recursive function to print directory tree with files & line counts
function printDirTree(dirPath, indent = "") {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  const folders = entries.filter((e) => e.isDirectory());
  const files = entries.filter((e) => e.isFile());

  // Print folders first
  for (const folder of folders) {
    console.log(`${indent}📁 ${folder.name}/`);
    printDirTree(path.join(dirPath, folder.name), indent + "    ");
  }

  // Then print files with line counts
  for (const file of files) {
    try {
      const filePath = path.join(dirPath, file.name);
      const lines = countLines(filePath);
      const relPath = path.relative(process.cwd(), filePath);
      console.log(`${indent}📄 ${file.name}   (${lines} lines)`);
    } catch (err) {
      console.log(`${indent}📄 ${file.name}   (error reading)`);
    }
  }
}

if (fs.existsSync(baseDir)) {
  console.log(`Directory report for: ${baseDir}\n`);
  printDirTree(baseDir);
} else {
  console.log(`Directory not found: ${baseDir}`);
}
