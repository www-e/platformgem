/* mock.cjs */
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const SRC_DIR = path.resolve(process.cwd(), 'src');

// Terms related to mocks, stubs, fixtures, test helpers, etc.
const TERMS = [
  'mock','mocks','jest.mock','vi.mock','jest.fn','vi.fn',
  'stub','stubs','fake','fakes','spy','spies','sandbox',
  'fixture','fixtures','__mocks__','__fixtures__','__tests__','__snapshots__',
  'nock','msw','handlers','axios-mock-adapter','fetch-mock','supertest',
  'toMatchSnapshot','toMatchInlineSnapshot','snapshot',
  'testUtils','test-utils','renderWith','setupTests','seed','seeder',
  'sample','samples','example','examples','testdata','test-data',
  '.test','.spec','stories'
];

// Build case-insensitive regexes for each term; no global flag to avoid lastIndex issues
const SEARCHES = TERMS.map(s => ({
  term: s,
  regex: new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
}));

async function* walk(dir) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip common heavy or irrelevant directories under src if present
      if (['node_modules', '.next', 'dist', 'build', 'coverage'].includes(entry.name)) continue;
      yield* walk(fullPath);
    } else if (entry.isFile()) {
      // Optionally skip obvious binaries
      const ext = path.extname(entry.name).toLowerCase();
      if (['.png','.jpg','.jpeg','.gif','.pdf','.zip','.exe','.dll','.ico','.webp','.svg','.mp3','.mp4','.mov','.wav','.woff','.woff2'].includes(ext)) continue;
      yield fullPath;
    }
  }
}

function findTermsInLine(line) {
  const foundTerms = [];
  for (const { term, regex } of SEARCHES) {
    if (regex.test(line)) {
      foundTerms.push(term);
    }
  }
  return foundTerms;
}

async function findMatchesInFile(fullPath) {
  return new Promise((resolve, reject) => {
    const input = fs.createReadStream(fullPath);
    const rl = readline.createInterface({ input, crlfDelay: Infinity });

    let lineNo = 0;
    const matches = [];

    rl.on('line', (line) => {
      lineNo += 1;
      const foundTerms = findTermsInLine(line);
      if (foundTerms.length > 0) {
        matches.push({
          lineNo,
          terms: foundTerms,
          content: line.trim()
        });
      }
    });

    rl.on('close', () => resolve(matches));
    rl.on('error', reject);
    input.on('error', reject);
  });
}

(async function main() {
  try {
    await fs.promises.access(SRC_DIR, fs.constants.R_OK);
  } catch {
    console.error('Error: src directory not found or not readable at', SRC_DIR);
    process.exit(1);
  }

  let totalFiles = 0;
  const results = [];
  const termCounts = {};
  const filesByExtension = {};

  // Initialize term counts
  TERMS.forEach(term => termCounts[term] = 0);

  console.log('🔍 Scanning src directory for mock-like keywords...\n');

  for await (const fullPath of walk(SRC_DIR)) {
    try {
      const matches = await findMatchesInFile(fullPath);
      if (matches.length > 0) {
        totalFiles += 1;
        const relToSrc = path.relative(SRC_DIR, fullPath) || path.basename(fullPath);
        const ext = path.extname(fullPath).toLowerCase() || 'no-ext';
        
        // Track file extensions
        filesByExtension[ext] = (filesByExtension[ext] || 0) + 1;
        
        // Count terms
        const uniqueTermsInFile = new Set();
        matches.forEach(match => {
          match.terms.forEach(term => {
            uniqueTermsInFile.add(term);
          });
        });
        uniqueTermsInFile.forEach(term => termCounts[term]++);
        
        results.push({ file: relToSrc, matches });
      }
    } catch {
      // Skip unreadable files silently
    }
  }

  if (results.length === 0) {
    console.log('❌ No files containing mock-like keywords found under src');
    return;
  }

  // Sort results by file path for consistent output
  results.sort((a, b) => a.file.localeCompare(b.file));

  // Display detailed results
  console.log('📋 DETAILED RESULTS:');
  console.log('=' .repeat(60));
  
  for (const { file, matches } of results) {
    console.log(`\n📁 ${file}`);
    for (const { lineNo, terms, content } of matches) {
      const termsList = terms.join(', ');
      console.log(`  Line ${lineNo}: [${termsList}]`);
      console.log(`    ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`);
    }
  }

  // Summary statistics
  console.log('\n' + '=' .repeat(60));
  console.log('📊 SUMMARY STATISTICS:');
  console.log('=' .repeat(60));
  console.log(`Total files with mock-like keywords: ${totalFiles}`);
  console.log(`Total lines with matches: ${results.reduce((sum, r) => sum + r.matches.length, 0)}`);

  // Term frequency
  console.log('\n🏷️  KEYWORD FREQUENCY:');
  const sortedTerms = Object.entries(termCounts)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a);
  
  for (const [term, count] of sortedTerms) {
    console.log(`  ${term}: ${count} file${count > 1 ? 's' : ''}`);
  }

  // File extension breakdown
  console.log('\n📄 FILE TYPES:');
  const sortedExts = Object.entries(filesByExtension)
    .sort(([, a], [, b]) => b - a);
  
  for (const [ext, count] of sortedExts) {
    console.log(`  ${ext}: ${count} file${count > 1 ? 's' : ''}`);
  }

  console.log('\n✅ Scan complete!');
})().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});


//to run the script run (node mock.cjs)