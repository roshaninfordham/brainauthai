import { readFile } from "node:fs/promises";
import { PDFParse } from "pdf-parse";

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: node scripts/parse-demo-pdf.mjs <pdf-path>");
  process.exit(1);
}

const data = await readFile(filePath);
const parser = new PDFParse({ data });
const result = await parser.getText();
await parser.destroy();

process.stdout.write(
  JSON.stringify({
    total: result.total,
    text: result.text
  })
);
