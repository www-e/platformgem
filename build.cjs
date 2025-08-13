const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Path to log file
const logFile = path.join(process.cwd(), 'build.txt');

// Clear/overwrite log file before starting
fs.writeFileSync(logFile, '', 'utf8');

// Open write stream for logging
const output = fs.createWriteStream(logFile, { flags: 'a' }); // append during this run

// Spawn npm run build
const build = spawn('npm', ['run', 'build'], {
  shell: process.platform === 'win32'
});

// Pipe stdout and stderr to both terminal and file in real time
build.stdout.on('data', (data) => {
  process.stdout.write(data);
  output.write(data);
});

build.stderr.on('data', (data) => {
  process.stderr.write(data);
  output.write(data);
});

build.on('close', (code) => {
  output.end();
  if (code === 0) {
    console.log(`\n✅ Build completed successfully. Log saved to ${logFile}`);
  } else {
    console.error(`\n❌ Build failed with code ${code}. Log saved to ${logFile}`);
    process.exit(code);
  }
});
