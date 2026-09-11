---
name: ui-ux-designer
description: Audits UI/UX, validates requirements, and enforces visual checks before modifying frontend code.
triggers:
  - "fix ui"
  - "redesign"
  - "update styling"
  - "layout issue"
  - "improve design"
---

# UI/UX & Frontend Architect Skill

Whenever the user requests UI design, layout changes, or visual bug fixes, enforce the following workflow:

## Rules & Workflow

### 1. Mandatory Audit Phase (No Code Changes Yet)
- Inspect the affected components, styles, and visual hierarchy first.
- Provide a concise critique of current alignment, spacing, contrast, and responsive layout flaws.
- Ask for any missing design specs (tokens, breakpoints, reference images, or behavior constraints) before modifying any code.

### 2. Implementation & Artifact Generation
- Create an implementation plan as an Artifact before executing.
- Preserve existing logic and state; only refactor structure and styling.
- Follow the project's existing styling conventions (e.g., Tailwind, CSS modules).

### 3. Integrated Browser Verification
- Launch the integrated Antigravity browser on mobile (390px) and desktop (1440px) viewports.
- Confirm visual alignment and absence of horizontal overflow before declaring the task complete.