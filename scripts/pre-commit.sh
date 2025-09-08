#!/bin/bash

echo "🔧 Running pre-commit checks..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        return 1
    fi
}

# Function to run check and handle errors
run_check() {
    local cmd="$1"
    local desc="$2"
    
    echo -e "${YELLOW}Running: $desc${NC}"
    
    if eval "$cmd" > /dev/null 2>&1; then
        print_status 0 "$desc passed"
        return 0
    else
        print_status 1 "$desc failed"
        echo "Command: $cmd"
        eval "$cmd"
        return 1
    fi
}

# Exit on first failure
set -e

# 1. TypeScript compilation check
run_check "npx tsc --noEmit" "TypeScript compilation"

# 2. ESLint check
run_check "npm run lint" "ESLint checks"

# 3. Prettier check
run_check "npx prettier --check ." "Code formatting"

# 4. Component import/export validation
echo -e "${YELLOW}Checking component exports...${NC}"
node -e "
const fs = require('fs');
const path = require('path');

const checkExports = (file) => {
  const content = fs.readFileSync(file, 'utf8');
  if (!content.includes('export default') && !content.includes('module.exports')) {
    throw new Error(\`File \${file} missing default export\`);
  }
};

// Check critical components
['src/components/VehiclesGrid.tsx', 'src/components/VehicleFilters.tsx'].forEach(file => {
  if (fs.existsSync(file)) {
    checkExports(file);
  }
});

console.log('Component exports valid');
"
print_status $? "Component export validation"

# 5. Database schema validation
run_check "npx prisma validate" "Prisma schema validation"

# 6. Build test (quick)
run_check "npm run build" "Production build test"

# 7. Basic unit tests
run_check "npm test -- --passWithNoTests" "Unit tests"

echo -e "${GREEN}🎉 All pre-commit checks passed!${NC}"
echo "Ready to commit 🚀"
