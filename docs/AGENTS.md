# Agents

BrainAuth AI uses deterministic agents for the hackathon MVP. Each agent emits visible action traces: tool call, evidence found, confidence, and verification status. Hidden chain-of-thought is never displayed.

## Triage Extractor Agent

- Input: EHR note
- Tools: `parse_ehr_note`, `verify_grounding`
- Output: age, NIHSS, last-known-well, symptoms, glucose, blood pressure, baseline mRS
- Failure behavior: missing facts become documentation gaps or human-review items

## Imaging Evidence Agent

- Input: CT/CTA report
- Tools: `analyze_cta_report`, `verify_imaging_sources`
- Output: LVO, vessel territory, hemorrhage exclusion, ASPECTS
- Failure behavior: low-confidence imaging evidence requires human review

## Policy Criteria Agent

- Input: synthetic payer policy
- Tools: `read_payer_policy`, `prepare_criteria_matrix`
- Output: normalized documentation criteria
- Failure behavior: ambiguous criteria are marked needs review

## Medical Necessity Agent

- Input: clinical facts and policy criteria
- Tools: `match_policy_criteria`, `verify_grounding`
- Output: criteria documentation view and medical-necessity draft inputs
- Failure behavior: unsupported claims are blocked

## Gap Detector Agent

- Input: facts, criteria, transfer note
- Tools: `detect_documentation_gaps`, `prepare_gap_checklist`
- Output: owner-based missing documentation checklist
- Failure behavior: missing values are not invented

## Packet Builder Agent

- Input: facts, criteria, gaps, audit events
- Tools: `build_packet`, `verify_packet_caveat`
- Output: clinician-review packet draft, medical necessity draft, FHIR-style JSON
- Failure behavior: packet export remains draft-only and requires physician signoff

## Audit Verification Agent

- Input: all agent outputs
- Tools: `verify_source_coverage`, `verify_review_flags`, `verify_grounding`
- Output: unsupported claims count, evidence coverage, human-review items
- Failure behavior: unsupported claims prevent clean export status
