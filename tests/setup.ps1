# Comprehensive Student Journey Testing Framework Setup Script (Windows)
# This script sets up the complete testing environment on Windows

param(
    [switch]$SkipBrowserInstall,
    [switch]$SkipTestData,
    [switch]$Quiet
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Cyan"

function Write-Status {
    param($Message)
    if (-not $Quiet) {
        Write-Host "[INFO] $Message" -ForegroundColor $Blue
    }
}

function Write-Success {
    param($Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param($Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param($Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

function Test-NodeJS {
    Write-Status "Checking Node.js installation..."
    
    try {
        $nodeVersion = node --version
        Write-Success "Node.js is installed: $nodeVersion"
        
        # Check if version is 16 or higher
        $majorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
        if ($majorVersion -lt 16) {
            Write-Error "Node.js version 16 or higher is required. Current version: $nodeVersion"
            exit 1
        }
    }
    catch {
        Write-Error "Node.js is not installed. Please install Node.js 16 or higher from https://nodejs.org/"
        exit 1
    }
}

function Test-NPM {
    Write-Status "Checking npm installation..."
    
    try {
        $npmVersion = npm --version
        Write-Success "npm is installed: $npmVersion"
    }
    catch {
        Write-Error "npm is not installed. Please install npm."
        exit 1
    }
}

function Install-Dependencies {
    Write-Status "Installing test dependencies..."
    
    if (Test-Path "package.json") {
        try {
            npm install
            Write-Success "Dependencies installed successfully"
        }
        catch {
            Write-Error "Failed to install dependencies: $_"
            exit 1
        }
    }
    else {
        Write-Error "package.json not found. Make sure you're in the tests directory."
        exit 1
    }
}

function Install-PlaywrightBrowsers {
    if ($SkipBrowserInstall) {
        Write-Warning "Skipping browser installation as requested"
        return
    }
    
    Write-Status "Installing Playwright browsers..."
    
    try {
        npx playwright install
        Write-Success "Playwright browsers installed successfully"
    }
    catch {
        Write-Warning "Failed to install Playwright browsers: $_"
        Write-Status "You can install them later with: npx playwright install"
    }
}

function New-TestDirectories {
    Write-Status "Creating necessary directories..."
    
    $directories = @(
        "reports",
        "test-results",
        "test-results\screenshots",
        "fixtures\test-data"
    )
    
    foreach ($dir in $directories) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-Success "Created directory: $dir"
        }
        else {
            Write-Status "Directory already exists: $dir"
        }
    }
}

function New-TestData {
    if ($SkipTestData) {
        Write-Warning "Skipping test data generation as requested"
        return
    }
    
    Write-Status "Generating test data..."
    
    if (Test-Path "fixtures\test-data-generator.ts") {
        try {
            npx tsx fixtures/test-data-generator.ts
            Write-Success "Test data generated successfully"
        }
        catch {
            Write-Warning "Failed to generate test data: $_"
            Write-Status "You can generate it later with: npx tsx fixtures/test-data-generator.ts"
        }
    }
    else {
        Write-Warning "Test data generator not found. Skipping test data generation."
    }
}

function New-EnvironmentFile {
    Write-Status "Creating environment configuration..."
    
    if (-not (Test-Path ".env")) {
        $envContent = @"
# Test Environment Configuration
TEST_BASE_URL=http://localhost:3000
TEST_TIMEOUT=30000
TEST_RETRIES=2
HEADLESS=true
SLOW_MO=0

# Test User Credentials
TEST_STUDENT_PHONE=01012345678
TEST_STUDENT_PASSWORD=TestPassword123!
TEST_PROFESSOR_PHONE=01087654321
TEST_PROFESSOR_PASSWORD=TestPassword123!
TEST_ADMIN_PHONE=01055555555
TEST_ADMIN_PASSWORD=TestPassword123!

# Database Configuration (if needed)
TEST_DATABASE_URL=postgresql://test_user:test_password@localhost:5432/test_db

# Payment Test Configuration
PAYMENT_TEST_MODE=true
PAYMENT_TEST_CARD_NUMBER=4111111111111111
PAYMENT_TEST_CARD_EXPIRY=12/25
PAYMENT_TEST_CARD_CVV=123
"@
        
        $envContent | Out-File -FilePath ".env" -Encoding UTF8
        Write-Success "Environment file created: .env"
        Write-Warning "Please update the .env file with your actual test configuration"
    }
    else {
        Write-Status "Environment file already exists: .env"
    }
}

function Test-Application {
    Write-Status "Checking if main application is running..."
    
    $baseUrl = $env:TEST_BASE_URL
    if (-not $baseUrl) {
        $baseUrl = "http://localhost:3000"
    }
    
    try {
        $response = Invoke-WebRequest -Uri $baseUrl -Method Head -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Success "Main application is running at $baseUrl"
        }
        else {
            Write-Warning "Main application returned status code: $($response.StatusCode)"
        }
    }
    catch {
        Write-Warning "Main application is not running at $baseUrl"
        Write-Warning "Please start the main application before running tests"
    }
}

function Invoke-VerificationTest {
    Write-Status "Running verification test..."
    
    try {
        # Run a simple test to verify everything is working
        $result = npx playwright test --grep "should display" --timeout=10000 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Verification test passed - setup is working correctly"
        }
        else {
            Write-Warning "Verification test failed - please check the setup"
            Write-Status "You can run 'npm run test:debug' to troubleshoot"
        }
    }
    catch {
        Write-Warning "Could not run verification test: $_"
        Write-Status "You can manually verify by running: npm run test:debug"
    }
}

function Show-Usage {
    Write-Host ""
    Write-Host "🎉 Setup completed successfully!" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Available Commands:" -ForegroundColor Yellow
    Write-Host "  npm run test                    - Run all tests"
    Write-Host "  npm run test:student-journey    - Run student journey tests"
    Write-Host "  npm run test:student-auth       - Run authentication tests"
    Write-Host "  npm run test:student-courses    - Run course-related tests"
    Write-Host "  npm run test:student-payments   - Run payment tests"
    Write-Host "  npm run test:student-dashboard  - Run dashboard tests"
    Write-Host "  npm run test:student-profile    - Run profile tests"
    Write-Host "  npm run test:ui                 - Run tests in UI mode"
    Write-Host "  npm run test:headed             - Run tests with visible browser"
    Write-Host "  npm run test:debug              - Run tests in debug mode"
    Write-Host "  npm run test:report             - Generate and view test report"
    Write-Host ""
    Write-Host "🚀 Comprehensive Test Runner:" -ForegroundColor Yellow
    Write-Host "  npx tsx run-student-tests.ts    - Run complete test suite with reports"
    Write-Host ""
    Write-Host "📊 Test Data Generation:" -ForegroundColor Yellow
    Write-Host "  npx tsx fixtures/test-data-generator.ts - Generate fresh test data"
    Write-Host ""
    Write-Host "⚙️  Configuration:" -ForegroundColor Yellow
    Write-Host "  - Update .env file with your test environment settings"
    Write-Host "  - Modify playwright.config.ts for browser and test settings"
    Write-Host "  - Check utils/test-data.ts for test user credentials"
    Write-Host ""
    Write-Host "📖 Documentation:" -ForegroundColor Yellow
    Write-Host "  - Read README.md for detailed information"
    Write-Host "  - Check individual test files for specific test scenarios"
    Write-Host ""
    Write-Host "🆘 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  - Ensure the main application is running at http://localhost:3000"
    Write-Host "  - Check that test users exist in the database"
    Write-Host "  - Verify network connectivity and permissions"
    Write-Host "  - Run 'npm run test:debug' for step-by-step debugging"
    Write-Host ""
}

function Main {
    Write-Host "🚀 Setting up Comprehensive Student Journey Testing Framework" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host ""
    
    try {
        Test-NodeJS
        Test-NPM
        Install-Dependencies
        Install-PlaywrightBrowsers
        New-TestDirectories
        New-EnvironmentFile
        New-TestData
        Test-Application
        Invoke-VerificationTest
        
        Show-Usage
        
        Write-Success "Setup completed! You can now run comprehensive student journey tests."
        Write-Host ""
        Write-Host "🎯 Quick Start:" -ForegroundColor Green
        Write-Host "   npx tsx run-student-tests.ts" -ForegroundColor White
        Write-Host ""
    }
    catch {
        Write-Error "Setup failed: $_"
        exit 1
    }
}

# Handle Ctrl+C
$null = Register-EngineEvent PowerShell.Exiting -Action {
    Write-Error "Setup interrupted by user"
}

# Run main function
Main