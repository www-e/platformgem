const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

// Path to log file
const logFile = path.join(process.cwd(), "build.txt");

// Always start fresh
fs.writeFileSync(logFile, "", "utf8");

// Create write stream
const output = fs.createWriteStream(logFile, { flags: "a" });

/**
 * Filters build output:
 * - Keeps only file headers if followed by at least one error
 * - Keeps error lines (not warnings)
 * - Keeps fatal TypeScript/compilation errors
 */
function filterErrors(data) {
  const lines = data.toString().split("\n");
  const filtered = [];
  let currentFile = null;
  let errorBuffer = [];

  const isFileLine = (line) => /^\.\/[^\s]+\.(t|j)sx?$/.test(line.trim());
  const isErrorLine = (line) => /^\s*\d+:\d+\s+Error:/i.test(line.trim());
  const isFatalLine = (line) =>
    /error/i.test(line) && !/warning/i.test(line) && !isErrorLine(line);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (isFileLine(line)) {
      // Output previous file's buffered errors (if any)
      if (currentFile && errorBuffer.length) {
        filtered.push(currentFile);
        filtered.push(...errorBuffer);
      }
      // Start buffering errors for new file
      currentFile = line;
      errorBuffer = [];
    } else if (isErrorLine(line)) {
      errorBuffer.push(lines[i]);
    } else if (isFatalLine(line)) {
      // Standalone fatal errors (not tied to a file)
      if (line) filtered.push(lines[i]);
    } else {
      // Empty lines and unrelated, skip
    }
  }

  // Output the last file's errors (if any)
  if (currentFile && errorBuffer.length) {
    filtered.push(currentFile);
    filtered.push(...errorBuffer);
  }

  return filtered.join("\n");
}


// Run build
const build = spawn("npm", ["run", "build"], {
  shell: process.platform === "win32",
});

// Handle stdout (filtered)
build.stdout.on("data", (data) => {
  const filtered = filterErrors(data);
  if (filtered.trim()) {
    process.stdout.write(filtered + "\n");
    output.write(filtered + "\n");
  }
});

// Handle stderr (filtered)
build.stderr.on("data", (data) => {
  const filtered = filterErrors(data);
  if (filtered.trim()) {
    process.stderr.write(filtered + "\n");
    output.write(filtered + "\n");
  }
});

// When build exits
build.on("close", (code) => {
  output.end(() => {
    const logText = fs.readFileSync(logFile, "utf8");

    // Stats
    const fileRegex = /^\.\/[^\s]+\.(t|j)sx?/gm;
    const files = new Set((logText.match(fileRegex) || []).map((f) => f.trim()));

    const errorRegex = /^\s*\d+:\d+\s+Error:/gim;
    const totalErrors = (logText.match(errorRegex) || []).length;

    console.log("\n📊 Build Summary:");
    console.log(`   📄 Files affected: ${files.size}`);
    console.log(`   ❌ Total errors:   ${totalErrors}`);

    if (code === 0 && totalErrors === 0) {
      console.log(`\n✅ Build completed successfully. Log saved to ${logFile}`);
    } else {
      console.error(`\n❌ Build failed (exit code ${code}). Log saved to ${logFile}`);
    }

    process.exit(code);
  });
});
