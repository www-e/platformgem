const fs = require("fs");
const path = require("path");

// Configuration
const LIB_DIR = "src/lib";
const OUTPUT_FILE = "extraction.txt";
const CODE_EXTENSIONS = [
  ".js",
  ".ts",
  ".jsx",
  ".tsx",
  ".json",
  ".css",
  ".html",
  ".py",
  ".java",
  ".cpp",
  ".c",
  ".h",
];

function getAllFiles(dirPath, arrayOfFiles = []) {
  try {
    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
      const fullPath = path.join(dirPath, file);

      try {
        if (fs.statSync(fullPath).isDirectory()) {
          arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
        } else {
          const ext = path.extname(file).toLowerCase();
          if (CODE_EXTENSIONS.includes(ext)) {
            arrayOfFiles.push(fullPath);
          }
        }
      } catch (err) {
        console.warn(`Warning: Could not process ${fullPath}: ${err.message}`);
      }
    });
  } catch (err) {
    console.error(`Error reading directory ${dirPath}: ${err.message}`);
  }

  return arrayOfFiles;
}

function getFileStats(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n").length;
    const size = fs.statSync(filePath).size;
    const chars = content.length;

    return {
      path: filePath,
      size: size,
      lines: lines,
      chars: chars,
      content: content,
    };
  } catch (err) {
    console.warn(`Warning: Could not read ${filePath}: ${err.message}`);
    return null;
  }
}

function formatSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function main() {
  console.log("Starting code extraction...");

  // Check if lib directory exists
  if (!fs.existsSync(LIB_DIR)) {
    console.error(`Error: Directory '${LIB_DIR}' does not exist!`);
    process.exit(1);
  }

  // Get all code files
  const allFiles = getAllFiles(LIB_DIR);
  console.log(`Found ${allFiles.length} code files`);

  if (allFiles.length === 0) {
    console.log("No code files found in the lib directory");
    return;
  }

  // Get file stats and content
  const fileStats = [];
  let totalSize = 0;
  let totalLines = 0;
  let totalChars = 0;

  allFiles.forEach((filePath) => {
    const stats = getFileStats(filePath);
    if (stats) {
      fileStats.push(stats);
      totalSize += stats.size;
      totalLines += stats.lines;
      totalChars += stats.chars;
    }
  });

  // Sort by size to find biggest files
  const biggestFiles = [...fileStats]
    .sort((a, b) => b.size - a.size)
    .slice(0, 5);

  // Generate extraction report
  let extractionContent = "";

  // Header
  extractionContent += "=".repeat(80) + "\n";
  extractionContent += "CODE EXTRACTION REPORT\n";
  extractionContent += `Generated on: ${new Date().toLocaleString()}\n`;
  extractionContent += "=".repeat(80) + "\n\n";

  // Summary
  extractionContent += "SUMMARY:\n";
  extractionContent += `-`.repeat(40) + "\n";
  extractionContent += `Total Files: ${fileStats.length}\n`;
  extractionContent += `Total Size: ${formatSize(
    totalSize
  )} (${totalSize.toLocaleString()} bytes)\n`;
  extractionContent += `Total Lines: ${totalLines.toLocaleString()}\n`;
  extractionContent += `Total Characters: ${totalChars.toLocaleString()}\n\n`;

  // Top 5 biggest files
  extractionContent += "TOP 5 BIGGEST FILES:\n";
  extractionContent += `-`.repeat(40) + "\n";
  biggestFiles.forEach((file, index) => {
    extractionContent += `${index + 1}. ${file.path}\n`;
    extractionContent += `   Size: ${formatSize(
      file.size
    )} | Lines: ${file.lines.toLocaleString()} | Characters: ${file.chars.toLocaleString()}\n\n`;
  });

  // File contents
  extractionContent += "FILE CONTENTS:\n";
  extractionContent += "=".repeat(80) + "\n\n";

  fileStats.forEach((file, index) => {
    extractionContent += `FILE ${index + 1}: ${file.path}\n`;
    extractionContent += `-`.repeat(60) + "\n";
    extractionContent += `Size: ${formatSize(file.size)} | Lines: ${
      file.lines
    } | Characters: ${file.chars}\n`;
    extractionContent += `-`.repeat(60) + "\n";
    extractionContent += file.content + "\n";
    extractionContent += "\n" + "=".repeat(80) + "\n\n";
  });

  // Write to file
  try {
    fs.writeFileSync(OUTPUT_FILE, extractionContent, "utf8");
    console.log(`\n✅ Extraction complete!`);
    console.log(`📊 Report saved to: ${OUTPUT_FILE}`);
    console.log(`📁 Files processed: ${fileStats.length}`);
    console.log(`📏 Total size: ${formatSize(totalSize)}`);
    console.log(`📄 Total lines: ${totalLines.toLocaleString()}`);
    console.log(`🔤 Total characters: ${totalChars.toLocaleString()}`);

    console.log("\n🏆 Top 5 biggest files:");
    biggestFiles.forEach((file, index) => {
      console.log(
        `   ${index + 1}. ${path.basename(file.path)} (${formatSize(
          file.size
        )})`
      );
    });
  } catch (err) {
    console.error(`Error writing to ${OUTPUT_FILE}: ${err.message}`);
    process.exit(1);
  }
}

// Run the script
main();
