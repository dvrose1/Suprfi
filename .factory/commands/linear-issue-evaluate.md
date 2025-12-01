---
description: Evaluate and validate a Linear issue before starting work
argument-hint: <issue-url-or-id>
---

You are evaluating a Linear issue: $ARGUMENTS

## Your Task

Perform a comprehensive evaluation of the Linear issue against the current state of the application to determine if it should be pursued, and provide actionable recommendations.

## Workflow

### Phase 1: Issue Context Gathering
1. **Fetch issue details** using Linear tools:
   - Title, description, acceptance criteria
   - Current state, assignee, labels, priority
   - Any existing comments or progress
   - Check if this is a sub-issue and fetch parent context if applicable

2. **Understand the request**:
   - What problem does this issue aim to solve?
   - What are the stated requirements or goals?
   - Are there any technical constraints mentioned?
   - What is the expected outcome?

### Phase 2: Current Application State Analysis
1. **Explore the codebase** to understand:
   - Existing architecture and patterns related to the issue
   - Current implementation of similar features
   - Technology stack and frameworks in use
   - Code organization and structure

2. **Identify relevant components**:
   - Files, modules, or services that would be affected
   - Dependencies and integrations
   - Existing utilities or helpers that could be leveraged
   - Test coverage and testing patterns

3. **Check for existing solutions**:
   - Does this functionality already exist (fully or partially)?
   - Are there similar features that could be referenced?
   - Have there been previous attempts at this?

### Phase 3: Feasibility Assessment
Evaluate the following dimensions:

**Technical Feasibility**
- Is the requested functionality technically achievable with current stack?
- Are there any architectural blockers or conflicts?
- What technical risks or challenges exist?
- Are required dependencies available and compatible?

**Implementation Scope**
- Estimated complexity (simple, moderate, complex)
- Approximate effort required (hours/days)
- Number of components/files likely to be affected
- Required testing scope

**Dependencies & Blockers**
- Are there prerequisite tasks or issues that must be completed first?
- Does this require external APIs, services, or data?
- Are there team dependencies or need for design/product input?
- Any infrastructure or deployment requirements?

**Alignment & Impact**
- Does this align with current application patterns and architecture?
- What is the potential impact on existing functionality?
- Are there backwards compatibility concerns?
- Performance implications?
- Security or privacy considerations?

### Phase 4: Recommendation & Documentation

Create a detailed Linear comment with:

**📋 Issue Evaluation Summary**

**Issue Overview**
- Brief restatement of the issue request
- Current status and context
- If sub-issue: How it relates to parent issue

**Current Application State**
- Relevant existing functionality
- Current architecture/patterns in affected areas
- Any existing similar implementations

**Feasibility Analysis**

*Technical Feasibility:* ✅ Feasible / ⚠️ Feasible with concerns / ❌ Not feasible
- [Explanation of technical assessment]

*Implementation Scope:* Simple / Moderate / Complex
- Estimated effort: [hours/days]
- Components affected: [number/list]
- Testing requirements: [description]

*Dependencies & Blockers:*
- [List any dependencies or blockers]
- [Or state "None identified"]

*Alignment & Impact:*
- Architecture alignment: [assessment]
- Impact on existing functionality: [assessment]
- Risk level: Low / Medium / High

**🎯 Recommendation**

**Proceed / Proceed with Modifications / Do Not Proceed / Needs Clarification**

[Clear explanation of the recommendation]

**Recommended Approach**
1. [Step-by-step suggested approach if proceeding]
2. [Alternative approaches if applicable]
3. [Required preparations or prerequisites]

**Potential Challenges**
- [Challenge 1 and mitigation strategy]
- [Challenge 2 and mitigation strategy]

**Questions for Clarification** _(if applicable)_
- [Question 1]
- [Question 2]

**Alternative Solutions** _(if applicable)_
- [Alternative approach 1: pros/cons]
- [Alternative approach 2: pros/cons]

**Next Steps**
If approved to proceed:
- [ ] [First concrete action]
- [ ] [Second concrete action]
- [ ] [Etc.]

**Code References**
- [Relevant existing files/components for context]
- [Similar implementations to reference]

---

## Evaluation Criteria

### ✅ Strong Proceed Signals
- Clear, well-defined requirements
- Aligns with existing architecture
- Reasonable scope and effort
- No significant blockers
- Clear value/benefit

### ⚠️ Proceed with Caution Signals
- Requirements need minor clarification
- Some architectural adjustments needed
- Moderate complexity or effort
- Dependencies manageable but require coordination
- Requires careful implementation to avoid issues

### ❌ Do Not Proceed Signals
- Vague or contradictory requirements
- Conflicts with architecture or other work in progress
- Massive scope or unclear boundaries
- Critical blockers or missing prerequisites
- Technical infeasibility
- Existing functionality already addresses the need
- Security or performance concerns that can't be mitigated

### ❓ Needs Clarification Signals
- Ambiguous requirements
- Missing critical information
- Unclear success criteria
- Need product/design input
- Requires architectural decision

## Guidelines

- Be honest and direct in your assessment
- Provide specific, actionable feedback
- Reference concrete code examples where relevant
- Consider both short-term implementation and long-term maintenance
- If recommending against proceeding, suggest alternatives
- If issues need clarification, ask specific questions
- Always explain your reasoning clearly
- Consider the broader context and roadmap if visible
- Err on the side of thoroughness in evaluation

Begin by fetching the Linear issue details and performing the evaluation.
