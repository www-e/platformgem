const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

// Path to log file
const logFile = path.join(process.cwd(), "build.txt");

// Clear previous log
fs.writeFileSync(logFile, "", "utf8");

// Write stream for new log
const output = fs.createWriteStream(logFile, { flags: "a" });

// Run npm build
const build = spawn("npm", ["run", "build"], {
  shell: process.platform === "win32",
});

// Output to console & log file
build.stdout.on("data", (data) => {
  process.stdout.write(data);
  output.write(data);
});

build.stderr.on("data", (data) => {
  process.stderr.write(data);
  output.write(data);
});

build.on("close", (code) => {
  output.end();
  // Read log after build
  const logText = fs.readFileSync(logFile, "utf8").toString();

  // Match file paths before errors/warnings
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
