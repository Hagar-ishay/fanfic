#!/bin/bash

# Test script for mobile API endpoints
# This script verifies that all mobile API files exist and have correct structure

echo "Testing Mobile API Implementation..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        return 0
    else
        echo -e "${RED}✗${NC} $1 - MISSING"
        return 1
    fi
}

# Check auth library
echo "Checking authentication library:"
check_file "app/lib/auth/mobile.ts"
echo ""

# Check auth endpoints
echo "Checking authentication endpoints:"
check_file "app/api/mobile/auth/google/route.ts"
check_file "app/api/mobile/auth/refresh/route.ts"
echo ""

# Check library endpoints
echo "Checking library endpoints:"
check_file "app/api/mobile/library/sections/route.ts"
check_file "app/api/mobile/library/sections/[id]/route.ts"
check_file "app/api/mobile/library/sections/[id]/fanfics/route.ts"
echo ""

# Check documentation
echo "Checking documentation:"
check_file "MOBILE_API.md"
check_file ".env.example"
echo ""

# Check for required environment variables in .env.example
echo "Checking required environment variables in .env.example:"
grep -q "JWT_SECRET" .env.example && echo -e "${GREEN}✓${NC} JWT_SECRET documented" || echo -e "${RED}✗${NC} JWT_SECRET missing"
grep -q "JWT_EXPIRY" .env.example && echo -e "${GREEN}✓${NC} JWT_EXPIRY documented" || echo -e "${RED}✗${NC} JWT_EXPIRY missing"
grep -q "REFRESH_TOKEN_EXPIRY" .env.example && echo -e "${GREEN}✓${NC} REFRESH_TOKEN_EXPIRY documented" || echo -e "${RED}✗${NC} REFRESH_TOKEN_EXPIRY missing"
echo ""

# Check package.json for required dependencies
echo "Checking required dependencies:"
grep -q "jsonwebtoken" package.json && echo -e "${GREEN}✓${NC} jsonwebtoken installed" || echo -e "${RED}✗${NC} jsonwebtoken missing"
grep -q "google-auth-library" package.json && echo -e "${GREEN}✓${NC} google-auth-library installed" || echo -e "${RED}✗${NC} google-auth-library missing"
echo ""

echo "Mobile API structure verification complete!"
