export interface AzureExtraction {
  mode: "local-demo" | "azure-document-intelligence";
  pagesAnalyzed: number;
  confidence: number;
  message: string;
}

export function getAzureDocumentIntelligenceStatus(): AzureExtraction {
  const endpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
  const key = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY;

  if (!endpoint || !key) {
    return {
      mode: "local-demo",
      pagesAnalyzed: 0,
      confidence: 0.91,
      message:
        "Running deterministic local extraction. Set Azure Document Intelligence env vars to parse uploaded PDFs."
    };
  }

  return {
    mode: "azure-document-intelligence",
    pagesAnalyzed: 4,
    confidence: 0.94,
    message:
      "Azure Document Intelligence credentials detected. Demo packet uses the Azure-ready extraction path."
  };
}

export async function analyzePdfWithAzureDocumentIntelligence(
  file: Uint8Array,
  contentType = "application/pdf"
) {
  const endpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
  const key = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY;

  if (!endpoint || !key) {
    throw new Error(
      "Missing AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT or AZURE_DOCUMENT_INTELLIGENCE_KEY."
    );
  }

  const apiVersion = "2024-11-30";
  const analyzeUrl = `${endpoint.replace(/\/$/, "")}/documentintelligence/documentModels/prebuilt-layout:analyze?api-version=${apiVersion}`;
  const requestBody = file.buffer.slice(
    file.byteOffset,
    file.byteOffset + file.byteLength
  ) as ArrayBuffer;

  const response = await fetch(analyzeUrl, {
    method: "POST",
    headers: {
      "Content-Type": contentType,
      "Ocp-Apim-Subscription-Key": key
    },
    body: requestBody
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Azure Document Intelligence analyze failed: ${body}`);
  }

  const operationLocation = response.headers.get("operation-location");
  if (!operationLocation) {
    throw new Error("Azure Document Intelligence did not return operation-location.");
  }

  for (let attempt = 0; attempt < 20; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const poll = await fetch(operationLocation, {
      headers: {
        "Ocp-Apim-Subscription-Key": key
      }
    });
    const result = await poll.json();
    if (result.status === "succeeded") {
      return result;
    }
    if (result.status === "failed") {
      throw new Error("Azure Document Intelligence operation failed.");
    }
  }

  throw new Error("Azure Document Intelligence operation timed out.");
}
