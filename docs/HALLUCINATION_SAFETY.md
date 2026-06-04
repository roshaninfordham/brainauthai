# Hallucination Safety

BrainAuth AI is designed around source-grounded documentation. It does not generate clinical conclusions without source evidence.

## Rules

```text
No source quote -> do not include as a clinical fact.
Conflicting values -> mark conflict.
Confidence < 0.85 -> needs human review.
Missing field -> documentation gap, not hallucinated value.
Packet claim without evidence -> blocked as unsupported.
Physician review required before submission.
```

## Source Evidence Shape

```ts
{
  id: "evidence-nihss",
  documentId: "ehr-note-001",
  documentTitle: "Emergency Department Stroke Note",
  sourcePage: 1,
  sourceQuote: "NIHSS documented as 18 on arrival.",
  confidence: 0.96
}
```

## Visible Safety Metrics

- Unsupported claims
- Evidence coverage
- Human review items
- Documents parsed
- Criteria matched
- Gaps found

## Clinical Boundary

BrainAuth AI does not diagnose, order treatment, approve care, deny care, replace clinicians, or delay emergency stabilization. It prepares documentation drafts for human review.
