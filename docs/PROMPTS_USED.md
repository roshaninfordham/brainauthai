# Prompts Used

This file records the high-level prompt themes used during the Copilot-assisted build. It is intentionally summarized and does not include hidden chain-of-thought.

## Product Framing

Build BrainAuth AI as a clinician-reviewed documentation support tool for acute stroke transfer and payer-submission workflows. Avoid claims that the system approves care, replaces clinicians, or delays emergency stabilization.

## UI Direction

Convert the dark dashboard into a light clinical SaaS with a landing page, a live MVP demo page, source-grounded evidence surfaces, and polished agent observability.

## Agentic Workflow

Implement deterministic agents that show action traces, tool calls, evidence, confidence, and verification without exposing hidden reasoning.

## Safety

Every clinical fact must have a source quote and confidence score. Missing fields must become gaps. Unsupported claims must be counted and blocked.

## Azure

Use Azure AI Document Intelligence and Azure AI Vision only when credentials exist. Otherwise, keep truthful deterministic local parser and local vision demo fallbacks.

## B.E. FAST Monitoring

Add a monitoring demo that accepts uploaded video or a synthetic demo clip, shows B.E. FAST frame analysis, fuses EHR context, and prepares emergency-first care-circle actions without making diagnostic claims.
