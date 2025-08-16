const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

// Path to log file
const logFile = path.join(process.cwd(), "build.txt");

// Clear previous log
fs.writeFileSync(logFile, "", "utf8");

// Write stream for new log
const output = fs.createWriteStream(logFile, { flags: "a" });

// Function to filter out warnings and keep only errors
function filterErrors(data) {
  const lines = data.toString().split('\n');
  const filteredLines = lines.filter(line => {
    const trimmed = line.trim();
    
    // Keep empty lines for formatting
    if (trimmed === '') return true;
    
    // Keep file paths (lines starting with ./)
    if (/^\.\/[^\s]+\.(t|j)sx?/.test(trimmed)) return true;
    
    // Keep errors but exclude warnings
    if (/^\s*\d+:\d+\s+(Error|error):/i.test(trimmed)) return true;
    
    // Keep compilation errors and fatal errors
    if (/error/i.test(trimmed) && !/warning/i.test(trimmed)) return true;
    
    return false;
  });
  
  return filteredLines.join('\n');
}

// Run npm build
const build = spawn("npm", ["run", "build"], {
  shell: process.platform === "win32",
});

// Filter and output stdout data
build.stdout.on("data", (data) => {
  const filteredData = filterErrors(data);
  
  if (filteredData.trim()) {
    process.stdout.write(filteredData + '\n');
    output.write(filteredData + '\n');
  }
});

// Keep stderr as is (compilation errors usually come through stderr)
build.stderr.on("data", (data) => {
  const filteredData = filterErrors(data);
  
  if (filteredData.trim()) {
    process.stderr.write(filteredData + '\n');
    output.write(filteredData + '\n');
  }
});

build.on("close", (code) => {
  output.end();
  
  // Read filtered log after build
  const logText = fs.readFileSync(logFile, "utf8").toString();

  // Match file paths before errors
  const fileRegex = /^\.\/[^\s]+\.(t|j)sx?/gm;
  const files = new Set((logText.match(fileRegex) || []).map((f) => f.trim()));

  // Match only real "Error:" lines (case-insensitive)
  const errorRegex = /^\s*\d+:\d+\s+Error:/gim;
  const totalErrors = (logText.match(errorRegex) || []).length;

  console.log("\n📊 Build Summary:");
  console.log(`   📄 Files affected: ${files.size}`);
  console.log(`   ❌ Total errors:   ${totalErrors}`);

  if (code === 0) {
    console.log(`\n✅ Build completed successfully. Log saved to ${logFile}`);
  } else {
    console.error(
      `\n❌ Build failed with code ${code}. Log saved to ${logFile}`
    );
    process.exit(code);
  }
});
