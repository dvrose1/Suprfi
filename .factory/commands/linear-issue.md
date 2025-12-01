---
description: Manage Linear issues with planning and progress tracking
argument-hint: <issue-url-or-id>
---

You are managing a Linear issue: $ARGUMENTS

## Your Task

1. **Read the issue details** using Linear tools to get the title, description, current state, and any existing comments
2. **Analyze and plan** the work by breaking down the task into structured, actionable steps
3. **Execute the plan** step by step, documenting your progress as you go
4. **Create a comprehensive comment** on the Linear issue documenting your work
5. **If continuing previous work**:
   - Read existing comments to understand prior progress
   - Resume from where it left off
   - Update with new progress and next steps

## Workflow

### Phase 1: Initial Analysis
- Fetch issue details (title, description, assignee, labels, status, comments)
- **Check if this is a sub-issue** (has a parent issue)
  - If it's a sub-issue, fetch the parent issue details for broader context
  - Review parent issue description, goals, and overall approach
  - Understand how this sub-task fits into the larger work
- Identify the core task and requirements
- Review any existing comments for context and previous progress

### Phase 2: Planning
- Break down the task into specific, actionable steps
- Consider dependencies, risks, and technical approach
- Identify potential blockers or unknowns
- If resuming work, identify what's already been completed

### Phase 3: Execution
- Work through the plan systematically
- Document each major step as you complete it
- Note any deviations from the original plan
- Capture important technical decisions and rationale

### Phase 4: Documentation
Create a detailed Linear comment with these sections:

**Work Summary**
- Brief overview of what was accomplished
- Reference the original task and current status
- If this is a sub-issue, note how it contributes to the parent issue's goals

**Technical Details**
- Key implementation decisions and approaches
- Architecture or design considerations
- Tools and libraries used

**Documentation**
- Important notes for future reference
- Edge cases handled
- Known limitations or assumptions

**Next Steps**
- Clear action items for continuation
- Prioritized checklist format
- Estimated effort if relevant

**Code References**
- Links to changed files with descriptions
- Relevant code snippets
- Related PRs or commits

## Guidelines

- Be thorough in documentation to ensure smooth handoffs
- Use clear, actionable language in next steps
- Always check for existing comments before starting new work
- Update the issue status/assignee if appropriate
- Link to related issues or PRs when relevant
- If the issue is complete, mark it as done and summarize the full scope of work

Begin by fetching the Linear issue details and any existing comments.
