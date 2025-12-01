---
description: Run all pre-deployment, error, and linting checks on ohhi-nextjs
argument-hint: "[additional-checks]"
allowed-tools:
  - Execute
  - Read
  - TodoWrite
  - Grep
---

# Vercel Deploy Check for ohhi-nextjs

Run comprehensive pre-deployment checks for the ohhi-nextjs backend to ensure it's ready for Vercel deployment.

## Your Task

You are running pre-deployment checks for the ohhi-nextjs project. Additional checks requested: {{additional-checks}}

## Process

### Phase 1: Environment Setup
1. Locate and navigate to the ohhi-nextjs project directory
2. Verify package.json exists and contains necessary scripts
3. Check Node.js and npm/yarn versions

### Phase 2: Type Checking
1. Run TypeScript compiler in check mode (`tsc --noEmit` or `npm run type-check`)
2. Report any type errors found
3. Categorize errors by severity

### Phase 3: Linting
1. Run ESLint on the entire project
2. Check for:
   - Code quality issues
   - Potential bugs
   - Style violations
   - Unused variables/imports
3. Report all linting errors and warnings

### Phase 4: Build Verification
1. Run production build (`npm run build` or `next build`)
2. Verify build completes successfully
3. Check build output size and warnings
4. Verify no build-time errors

### Phase 5: Code Quality Checks
1. Search for console.log statements that should be removed
2. Check for TODO/FIXME comments that need attention
3. Look for hardcoded credentials or API keys
4. Verify environment variable usage is correct

### Phase 6: Additional Checks
If {{additional-checks}} is provided, run those specific checks

### Phase 7: Summary Report
Create a comprehensive report with:
- ✅ All checks that passed
- ❌ All checks that failed with details
- ⚠️  Warnings that need attention
- 📝 Recommendations for deployment readiness
- Overall deployment readiness status: READY / NOT READY

## Guidelines

- Use TodoWrite to track progress through all check phases
- Run checks in parallel where possible to save time
- Provide detailed error messages for failures
- Include file paths and line numbers for issues found
- If any critical check fails, clearly state deployment should be blocked
- Provide actionable next steps for fixing any issues
- Summary should be clear and easy to understand at a glance

## Execution Notes

- Always check that you're in the correct project directory
- Handle cases where scripts might not exist in package.json
- Capture full error output for debugging
- Time each phase to identify slow checks
- If additional-checks is empty, skip Phase 6

Begin by locating the ohhi-nextjs directory and verifying the project structure.
