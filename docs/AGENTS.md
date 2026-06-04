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

## B.E. FAST Video Intake Agent

- Input: uploaded video or synthetic demo clip metadata
- Tools: `sample_video_frames`, `check_frame_quality`
- Output: representative frame set, stream readiness status, source clip metadata
- Failure behavior: insufficient video quality becomes a review item; no diagnosis is made

## Azure Vision Frame Agent

- Input: sampled video frames
- Tools: `analyze_be_fast_frames`
- Output: visual findings for balance, eye/vision cue, face asymmetry, arm drift, and speech cue proxy
- Failure behavior: missing or low-confidence signals are marked needs review; Azure is never shown as connected unless credentials exist

## B.E. FAST Classifier Agent

- Input: visual findings and B.E. FAST signal definitions
- Tools: `score_be_fast_signals`, `apply_time_action_rule`
- Output: B.E. FAST alert score and signal-level confidence bars
- Failure behavior: uncertain cases prompt human/caregiver review; sudden symptoms still trigger emergency-first language

## EHR Fusion Agent

- Input: B.E. FAST findings and longitudinal synthetic EHR context
- Tools: `fuse_ehr_risk_context`, `verify_context_sources`
- Output: risk-context summary for monitoring escalation
- Failure behavior: missing EHR context is shown as missing context, not inferred

## Escalation Agent

- Input: B.E. FAST alert score, EHR fusion output, care-circle contacts
- Tools: `prepare_emergency_alert`, `notify_care_circle`, `request_clinician_callback`
- Output: emergency prompt, loved-one notification, urgent stroke clinician callback request
- Failure behavior: emergency services remain primary; routine appointment language is not used for sudden stroke symptoms

## Monitoring Audit Agent

- Input: video events, B.E. FAST signals, EHR context, escalation actions
- Tools: `verify_monitoring_safety`, `log_monitoring_actions`
- Output: monitoring audit trail with no diagnostic claim
- Failure behavior: any unsupported monitoring claim is blocked or marked for human review

## Monitoring Agent Flow

```mermaid
flowchart LR
  Video[Upload or Demo Video] --> Intake[B.E. FAST Video Intake Agent]
  Intake --> Vision[Azure Vision Frame Agent]
  Vision --> Classifier[B.E. FAST Classifier Agent]
  Classifier --> Fusion[EHR Fusion Agent]
  Fusion --> Escalation[Escalation Agent]
  Escalation --> Audit[Monitoring Audit Agent]
  Audit --> Human[Emergency-first human response]
```
