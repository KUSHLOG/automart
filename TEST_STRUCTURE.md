# Test Structure Documentation

## Overview

All tests are now consolidated into a single `tests/` directory to maintain consistency and avoid duplication. The previous `src/__tests__/` directory has been removed as it contained empty files.

## Directory Structure

```
tests/
├── unit/                    # Unit tests for individual functions and components
│   ├── format.test.ts      # Tests for formatting utilities
│   ├── search.test.ts      # Tests for search functionality
│   └── views.test.ts       # Tests for view tracking utilities
├── integration/             # Integration tests
│   └── search.test.tsx     # Tests for search API integration
├── e2e/                    # End-to-end tests with Playwright
│   ├── accessibility.spec.ts
│   ├── auth.spec.ts
│   ├── basic-auth.spec.ts
│   ├── bidding.spec.ts
│   ├── buyer-flow.spec.ts
│   ├── live-auction.spec.ts
│   ├── performance.spec.ts
│   ├── security.spec.ts
│   └── seller-flow.spec.ts
└── mocks/                  # Mock data and server setup
    ├── handlers.ts         # MSW request handlers
    └── server.ts           # MSW server configuration
```

## Test Commands

### Individual Test Types

- `npm run test:unit` - Run only unit tests
- `npm run test:integration` - Run only integration tests
- `npm run test:e2e` - Run only end-to-end tests with Playwright
- `npm run test` - Run Jest tests (unit + integration)

### Comprehensive Test Suites

- `npm run test:ci` - Full CI suite: lint + prettier + type-check + Jest tests
- `npm run test:all` - Complete test suite: lint + prettier + type-check + Jest tests + E2E tests

### Code Quality

- `npm run lint` - Run ESLint
- `npm run prettier` - Format code with Prettier
- `npm run prettier:check` - Check if code is formatted correctly
- `npm run format` - Alias for prettier
- `npm run type-check` - Run TypeScript type checking

## Test Configuration

### Jest Configuration (`jest.config.js`)

- Uses Next.js Jest preset
- Tests match: `tests/**/*.test.[jt]s?(x)` and `tests/**/*.(spec|test).[jt]s?(x)`
- Excludes: `.next/`, `node_modules/`, `tests/e2e/`
- Module aliases: `@/*` maps to `src/*`
- Environment: jsdom

### Prettier Configuration (`.prettierrc`)

- Semi-colons: disabled
- Single quotes: enabled
- Tab width: 2 spaces
- Trailing commas: ES5 style
- Print width: 100 characters
- Line endings: LF

### ESLint Configuration (`eslint.config.mjs`)

- Extends Next.js core web vitals and TypeScript rules
- Ignores build directories and test results
- Custom rule: Image element warnings

## Test Statistics

### Current Test Count

- **Unit Tests**: 55 tests across 3 files
  - `format.test.ts`: Tests for price/currency formatting utilities
  - `search.test.ts`: Tests for search parameter parsing and pagination
  - `views.test.ts`: Tests for view tracking functionality
- **Integration Tests**: 1 test in 1 file
  - `search.test.tsx`: Integration test for search API
- **E2E Tests**: 9 comprehensive test suites covering:
  - Accessibility compliance
  - Authentication flows
  - Bidding system
  - Buyer and seller workflows
  - Live auction functionality
  - Performance metrics
  - Security measures

### Total: 56 Jest tests + 9 E2E test suites

## Quality Assurance Pipeline

The test suite enforces:

1. **Code Linting** - ESLint rules for code quality
2. **Code Formatting** - Prettier for consistent code style
3. **Type Safety** - TypeScript compilation check
4. **Unit Testing** - Individual component/function tests
5. **Integration Testing** - API and component integration
6. **End-to-End Testing** - Full user workflow testing

## Running Tests

### Development Workflow

```bash
# Run tests in watch mode during development
npm run test:watch

# Run specific test types
npm run test:unit
npm run test:integration

# Format code before committing
npm run format
```

### CI/CD Pipeline

```bash
# Run the complete CI test suite
npm run test:ci

# Or run everything including E2E tests
npm run test:all
```

## Mock Data

The `tests/mocks/` directory contains:

- **MSW (Mock Service Worker)** setup for API mocking
- Request handlers for vehicle, user, and bidding APIs
- Mock data for consistent testing

This ensures tests run independently of external services and database state.

## Migration Notes

### What Was Changed

1. **Removed**: Empty `src/__tests__/` directory
2. **Consolidated**: All tests moved to single `tests/` directory
3. **Added**: Prettier configuration and integration
4. **Enhanced**: Test scripts with formatting checks
5. **Improved**: ESLint configuration with better ignores

### No Tests Were Lost

- All functional tests from both directories were preserved
- The `src/__tests__/` contained only empty files
- All actual test content was already in `tests/` directory

This consolidation provides a cleaner, more maintainable test structure while ensuring comprehensive coverage and code quality enforcement.
