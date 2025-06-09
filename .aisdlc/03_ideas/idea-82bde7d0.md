---
id: idea-82bde7d0
status: idea
created_at: 2025-06-08T20:01:16.236Z
---

# Test Implementation: Simple Utility Function

## Idea
Create a simple utility function that demonstrates the complete AI-powered development workflow from idea to implementation.

## Description
We want to implement a utility function that formats timestamps in a human-readable way. This is a perfect test case because:

1. **Simple scope**: Single function, easy to implement and test
2. **Clear requirements**: Well-defined input/output behavior  
3. **Testable**: Easy to write unit tests for
4. **Useful**: Actually useful utility for the project

## Requirements
- Function should take a Date object or timestamp
- Return human-readable format like "2 minutes ago", "1 hour ago", "3 days ago"
- Handle edge cases (future dates, invalid inputs)
- Include proper TypeScript types
- Include unit tests

## Expected Files
- `src/utils/time-formatter.ts` - Main implementation
- `test/utils/time-formatter.test.ts` - Unit tests
- Update `src/utils/index.ts` - Export the new function

## Success Criteria
- Function works correctly with various inputs
- Tests pass
- Code follows project conventions
- Proper error handling for edge cases
