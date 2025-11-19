<!--
Sync Impact Report
==================
Version change: N/A → 1.0.0
Modified principles: N/A (initial creation)
Added sections:
  - Preamble
  - Principle 1: Documentation Language
  - Governance
Removed sections: N/A
Templates requiring updates:
  - .specify/templates/plan-template.md (⚠️ pending - file not yet created)
  - .specify/templates/spec-template.md (⚠️ pending - file not yet created)
  - .specify/templates/tasks-template.md (⚠️ pending - file not yet created)
Follow-up TODOs: None
-->

# Project Constitution: aibrain

**Constitution Version**: 1.0.0
**Ratification Date**: 2025-11-19
**Last Amended Date**: 2025-11-19

## Preamble

This constitution establishes the foundational principles and governance rules for the aibrain project. All contributors, automated agents, and processes MUST adhere to these principles when developing, documenting, and maintaining this project.

## Principles

### Principle 1: Documentation Language

**Statement**: All project documentation MUST be written in Traditional Chinese (繁體中文), with the sole exception of this constitution which MUST be written in English.

**Scope**:
- Feature specifications (spec.md) MUST be in Traditional Chinese
- Implementation plans (plan.md) MUST be in Traditional Chinese
- Task lists (tasks.md) MUST be in Traditional Chinese
- Research documents (research.md) MUST be in Traditional Chinese
- Data models (data-model.md) MUST be in Traditional Chinese
- API contracts MUST be in Traditional Chinese
- README and quickstart guides MUST be in Traditional Chinese
- Code comments MAY be in Traditional Chinese or English at developer discretion
- This constitution MUST remain in English for international accessibility

**Rationale**: Traditional Chinese is the primary language for the project team and stakeholders. Maintaining documentation in Traditional Chinese ensures clarity and reduces ambiguity for all primary contributors. The constitution remains in English to serve as an internationally accessible reference for the project's governance structure.

## Governance

### Amendment Procedure

1. Propose amendments via pull request with clear rationale
2. All active contributors MUST review proposed changes
3. Amendments require consensus or majority approval
4. Version number MUST be incremented according to semantic versioning:
   - **MAJOR**: Backward incompatible governance/principle removals or redefinitions
   - **MINOR**: New principle/section added or materially expanded guidance
   - **PATCH**: Clarifications, wording, typo fixes, non-semantic refinements

### Versioning Policy

This constitution follows semantic versioning (MAJOR.MINOR.PATCH):
- Current version: 1.0.0
- Version history is tracked via git commits
- Each amendment MUST update the `Last Amended Date` field

### Compliance Review

- All feature specifications MUST be checked against constitutional principles before implementation
- Automated agents MUST verify documentation language compliance
- Non-compliant documentation MUST be flagged for correction before merge

## Signatures

*This constitution was ratified on 2025-11-19 and represents the foundational governance document for the aibrain project.*
