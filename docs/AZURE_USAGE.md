# Azure Usage

## Service Used

BrainAuth AI is designed to use **Azure AI Document Intelligence** for PDF/form extraction.

Why it fits:

- EHR packet PDFs need structured text extraction.
- CTA reports need page-level source text.
- Payer policy PDFs need tables, clauses, and key-value extraction.
- Confidence scores can be mapped into BrainAuth source evidence and human-review flags.

## Environment Variables

```bash
AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT="https://<resource>.cognitiveservices.azure.com"
AZURE_DOCUMENT_INTELLIGENCE_KEY="<key>"
```

No secrets are committed.

## API Route

```text
GET  /api/azure-document
POST /api/azure-document
```

`GET` reports the current mode.

`POST` accepts a PDF in form field `file`. If Azure credentials are missing, the route returns a truthful fallback response:

```json
{
  "mode": "local-demo",
  "configured": false,
  "result": "Azure not configured; using deterministic local demo parser for the live MVP."
}
```

## Demo Fallback Behavior

The live MVP never depends on Azure availability. Without credentials, BrainAuth runs the deterministic local parser and shows local parser demo mode. With credentials, uploaded files can be analyzed by Azure AI Document Intelligence.

## Judge Screenshot Checklist

- Azure portal resource page for Document Intelligence.
- `.env.local` showing variable names only, with values hidden.
- `/api/azure-document` response showing connected mode.
- Live app badge showing Azure Document Intelligence connected.

## Related Azure Options

- Azure Static Web Apps Free can host the frontend and provide the clearest deployment proof.
- Azure Functions Consumption plan can host a future `/run-packet` endpoint.
- Semantic Kernel is useful Microsoft open-source agent tooling, but it is not by itself proof of consuming an Azure cloud service.
