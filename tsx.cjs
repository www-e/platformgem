const fs = require('fs');
const path = require('path');

// Function to recursively find all .tsx files
function findTsxFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            // Recursively search subdirectories
            findTsxFiles(filePath, fileList);
        } else if (path.extname(file) === '.tsx') {
            fileList.push(filePath);
        }
    });
    
    return fileList;
}

// Function to extract component name from file content
function extractComponentName(content) {
    // Look for export default, function, const, class declarations
    const patterns = [
        /export\s+default\s+(?:function\s+)?([A-Z][A-Za-z0-9_]*)/,
        /const\s+([A-Z][A-Za-z0-9_]*)\s*[:=]/,
        /function\s+([A-Z][A-Za-z0-9_]*)/,
        /class\s+([A-Z][A-Za-z0-9_]*)/
    ];
    
    for (const pattern of patterns) {
        const match = content.match(pattern);
        if (match) return match[1];
    }
    
    return 'Unknown';
}

// Function to count lines of code (excluding empty lines and comments)
function countLinesOfCode(content) {
    const lines = content.split('\n');
    let loc = 0;
    
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('/*')) {
            loc++;
        }
    }
    
    return loc;
}

// Function to extract imports
function extractImports(content) {
    const importPattern = /import\s+.*?\s+from\s+['"][^'"]+['"]/g;
    return content.match(importPattern) || [];
}

// Main function to generate the report
function generateTsxReport() {
    console.log('🚀 Starting TSX file extraction...');
    
    const srcDir = path.join(process.cwd(), 'src');
    
    // Check if src directory exists
    if (!fs.existsSync(srcDir)) {
        console.error('❌ Error: src directory not found!');
        process.exit(1);
    }
    
    // Find all tsx files
    const tsxFiles = findTsxFiles(srcDir);
    
    if (tsxFiles.length === 0) {
        console.log('⚠️  No TSX files found in src directory');
        return;
    }
    
    console.log(`📁 Found ${tsxFiles.length} TSX files`);
    
    // Sort files alphabetically
    tsxFiles.sort();
    
    let reportContent = '';
    let totalLines = 0;
    const statistics = {
        totalFiles: tsxFiles.length,
        totalLines: 0,
        components: [],
        directories: new Set()
    };
    
    // Generate header
    reportContent += `/*
================================================================================
                           TSX FILES COMPREHENSIVE REPORT
================================================================================
Generated on: ${new Date().toLocaleString()}
Total Files: ${tsxFiles.length}
Source Directory: ./src
================================================================================
*/\n\n`;
    
    // Process each file
    tsxFiles.forEach((filePath, index) => {
        console.log(`📄 Processing: ${filePath}`);
        
        const relativePath = path.relative(process.cwd(), filePath);
        const fileName = path.basename(filePath);
        const directory = path.dirname(relativePath);
        
        statistics.directories.add(directory);
        
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const componentName = extractComponentName(content);
            const linesOfCode = countLinesOfCode(content);
            const imports = extractImports(content);
            
            totalLines += linesOfCode;
            statistics.components.push({
                name: componentName,
                file: fileName,
                path: relativePath,
                lines: linesOfCode
            });
            
            // Add file section to report
            reportContent += `/*
${'='.repeat(80)}
FILE #${index + 1}: ${fileName}
${'='.repeat(80)}
Path: ${relativePath}
Component: ${componentName}
Lines of Code: ${linesOfCode}
Imports: ${imports.length}
${'='.repeat(80)}
*/\n\n`;
            
            // Add the actual file content
            reportContent += `// ==================== START: ${fileName} ====================\n`;
            reportContent += `// File Path: ${relativePath}\n`;
            reportContent += `// Component Name: ${componentName}\n`;
            reportContent += `// Lines of Code: ${linesOfCode}\n`;
            reportContent += `// ${'='.repeat(60)}\n\n`;
            
            reportContent += content;
            
            reportContent += `\n\n// ==================== END: ${fileName} ====================\n\n\n`;
            
        } catch (error) {
            console.error(`❌ Error reading ${filePath}:`, error.message);
            reportContent += `// ERROR: Could not read ${filePath} - ${error.message}\n\n`;
        }
    });
    
    statistics.totalLines = totalLines;
    
    // Generate summary at the end
    reportContent += `/*
${'='.repeat(80)}
                              SUMMARY STATISTICS
${'='.repeat(80)}
Total Files Processed: ${statistics.totalFiles}
Total Lines of Code: ${statistics.totalLines}
Average Lines per File: ${Math.round(statistics.totalLines / statistics.totalFiles)}
Directories Scanned: ${statistics.directories.size}
Components Found: ${statistics.components.length}

COMPONENTS BY SIZE:
${statistics.components
    .sort((a, b) => b.lines - a.lines)
    .map((comp, i) => `${i + 1}. ${comp.name} (${comp.file}) - ${comp.lines} lines`)
    .join('\n')}

DIRECTORIES:
${Array.from(statistics.directories).sort().map(dir => `- ${dir}`).join('\n')}
${'='.repeat(80)}
*/`;
    
    // Write the report file
    const outputPath = path.join(process.cwd(), 'tsx.tsx');
    fs.writeFileSync(outputPath, reportContent, 'utf8');
    
    console.log('✅ Report generated successfully!');
    console.log(`📊 Statistics:`);
    console.log(`   - Total Files: ${statistics.totalFiles}`);
    console.log(`   - Total Lines: ${statistics.totalLines}`);
    console.log(`   - Average Lines per File: ${Math.round(statistics.totalLines / statistics.totalFiles)}`);
    console.log(`   - Directories: ${statistics.directories.size}`);
    console.log(`📁 Report saved as: tsx.tsx`);
}

// Run the script
try {
    generateTsxReport();
} catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
}
