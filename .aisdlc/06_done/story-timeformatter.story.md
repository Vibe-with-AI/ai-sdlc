---
id: story-timeformatter
type: story
status: ready
story_points: 3
created_at: '2025-06-08T20:10:00.000Z'
updated_at: '2025-06-08T20:10:00.000Z'
ready_at: '2025-06-08T20:10:00.000Z'
---

# User Story: Time Formatter Utility

## Story
As a developer, I want a utility function that formats timestamps in human-readable relative time so that I can display user-friendly time information in the application.

## Description
Create a utility function that takes a Date object or timestamp and returns a human-readable relative time string like "2 minutes ago", "1 hour ago", "3 days ago", etc.

## Acceptance Criteria
- [ ] Function accepts Date object or timestamp number
- [ ] Returns human-readable relative time strings
- [ ] Handles past times correctly ("X ago")
- [ ] Handles future times correctly ("in X")
- [ ] Handles edge cases (invalid dates, null/undefined)
- [ ] Uses appropriate time units (seconds, minutes, hours, days, weeks, months, years)
- [ ] Includes proper TypeScript types

## Technical Tasks
- Create src/utils/time-formatter.ts with formatRelativeTime function
- Add proper TypeScript interfaces and types
- Implement logic for different time units
- Add error handling for invalid inputs
- Create unit tests in test/utils/time-formatter.test.ts
- Export function from src/utils/index.ts

## File Paths
### Writeable Files
- src/utils/time-formatter.ts
- src/utils/index.ts
- test/utils/time-formatter.test.ts

### Read-only Files
- package.json
- tsconfig.json

## Libraries
- No additional libraries required (use built-in Date functionality)

## Story Points
3

## Definition of Done
- [ ] Function implemented with proper TypeScript types
- [ ] Unit tests written and passing
- [ ] Function exported from utils index
- [ ] Code follows project conventions
- [ ] Error handling implemented

---
*Manual test story for time formatter utility*
