import { writeFile, mkdir } from "node:fs/promises";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const outputPath = new URL("../public/demo/brainauth-stroke-demo-record.pdf", import.meta.url);

const sections = [
  ["Patient", "John Doe, 64-year-old male"],
  ["Facility", "Rural Community Emergency Department"],
  ["Chief Concern", "Suspected acute ischemic stroke with disabling neurologic deficit"],
  ["Last Known Well", "08:12 AM"],
  ["Arrival", "09:01 AM"],
  ["NIHSS", "18"],
  ["Symptoms", "Right facial droop, aphasia, left gaze preference, dense right arm weakness"],
  ["Vitals", "Blood pressure 168/92; glucose 116 mg/dL"],
  ["CT Head", "No acute intracranial hemorrhage; ASPECTS 8"],
  ["CTA Head/Neck", "Left M1 middle cerebral artery occlusion with reduced distal MCA opacification"],
  ["Transfer Note", "Transfer requested for comprehensive stroke center review"],
  ["Medication History", "Anticoagulant history not documented in this packet"],
  ["Human Review", "Physician review and signoff required before submission"]
];

const pdf = await PDFDocument.create();
const page = pdf.addPage([612, 792]);
const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
const regular = await pdf.embedFont(StandardFonts.Helvetica);
const mono = await pdf.embedFont(StandardFonts.Courier);
const ink = rgb(0.06, 0.09, 0.16);
const muted = rgb(0.29, 0.34, 0.42);
const blue = rgb(0.15, 0.39, 0.92);
const border = rgb(0.88, 0.91, 0.94);

page.drawText("BrainAuth AI Synthetic Stroke Record", {
  x: 44,
  y: 744,
  size: 21,
  font: bold,
  color: ink
});
page.drawText("Demo PDF for document parsing, source-grounding, and packet generation", {
  x: 44,
  y: 722,
  size: 10.5,
  font: regular,
  color: muted
});
page.drawText("Synthetic demo only. Not clinical decision support.", {
  x: 374,
  y: 744,
  size: 8.5,
  font: bold,
  color: blue
});

let y = 682;
for (const [label, value] of sections) {
  page.drawLine({
    start: { x: 44, y: y + 12 },
    end: { x: 568, y: y + 12 },
    thickness: 0.8,
    color: border
  });
  page.drawText(label, {
    x: 54,
    y,
    size: 9.5,
    font: bold,
    color: blue
  });
  page.drawText(value, {
    x: 190,
    y,
    size: 9.5,
    font: regular,
    color: ink
  });
  y -= 34;
}

page.drawText("Document ID: ehr-demo-pdf-001", {
  x: 44,
  y: 44,
  size: 9,
  font: mono,
  color: muted
});
page.drawText("Generated for BrainAuth AI hackathon MVP", {
  x: 338,
  y: 44,
  size: 9,
  font: regular,
  color: muted
});

await mkdir(new URL("../public/demo/", import.meta.url), { recursive: true });
await writeFile(outputPath, await pdf.save());
console.log(`Generated ${outputPath.pathname}`);
