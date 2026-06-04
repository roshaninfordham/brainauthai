import type { MetricCard, SourceLink } from "./types";

export const impactMetrics: MetricCard[] = [
  {
    label: "U.S. strokes/year",
    value: "795,000+",
    note: "CDC"
  },
  {
    label: "Ischemic stroke share",
    value: "87%",
    note: "CDC"
  },
  {
    label: "U.S. stroke cost",
    value: "$56.2B",
    note: "2019-2020"
  },
  {
    label: "Global stroke cases",
    value: "93.8M",
    note: "WHO 2021"
  },
  {
    label: "New global cases",
    value: "11.9M",
    note: "WHO 2021"
  },
  {
    label: "Neurons/minute at risk",
    value: "1.9M",
    note: "Saver, Stroke"
  },
  {
    label: "Serious PA adverse event",
    value: "26%",
    note: "AMA survey"
  },
  {
    label: "PAs / physician / week",
    value: "~39",
    note: "AMA survey"
  },
  {
    label: "Global economic burden",
    value: "~$890B",
    note: "WSO fact sheet"
  },
  {
    label: "2030 global cost",
    value: "~$1T",
    note: "WSO"
  }
];

export const sourceLinks: SourceLink[] = [
  {
    label: "CDC Stroke Facts",
    url: "https://www.cdc.gov/stroke/data-research/facts-stats/index.html"
  },
  {
    label: "WHO Stroke Fact Sheet",
    url: "https://www.who.int/news-room/fact-sheets/detail/stroke"
  },
  {
    label: "Time Is Brain - Quantified",
    url: "https://pubmed.ncbi.nlm.nih.gov/16339467/"
  },
  {
    label: "AMA 2025 Prior Authorization Survey",
    url: "https://www.ama-assn.org/system/files/prior-authorization-survey.pdf"
  },
  {
    label: "CMS EMTALA",
    url: "https://www.cms.gov/medicare/regulations-guidance/legislation/emergency-medical-treatment-labor-act"
  },
  {
    label: "Azure Document Intelligence Pricing",
    url: "https://azure.microsoft.com/en-us/pricing/details/document-intelligence/"
  },
  {
    label: "World Stroke Organization Impact",
    url: "https://www.world-stroke.org/world-stroke-day-campaign/about-stroke/impact-of-stroke"
  }
];

export const syntheticDocuments = {
  ehrNote: `Emergency department note. Patient: John Doe, 64-year-old male.
Last known well 08:12. Arrival 09:01. Sudden right facial droop, aphasia,
left gaze preference, dense right arm weakness. NIHSS 18. Glucose 116.
Blood pressure 174/92. No known intracranial hemorrhage history. Baseline
modified Rankin score 1. Transfer requested for endovascular evaluation.`,
  ctaReport: `CT head without contrast: no acute intracranial hemorrhage.
ASPECTS 8. CTA head and neck: left M1 middle cerebral artery occlusion with
reduced distal MCA opacification. Impression: acute left MCA large-vessel
occlusion, thrombectomy-capable center recommended.`,
  payerPolicy: `Coverage criteria for emergent endovascular thrombectomy:
document disabling acute ischemic stroke, NIHSS generally >=6, last known
well within accepted treatment window or advanced imaging rationale, vessel
imaging confirming anterior circulation LVO, hemorrhage excluded by CT/MRI,
baseline functional status documented, contraindications and anticoagulant
history reviewed, transfer note and treating physician attestation included.`,
  transferNote: `Rural ED requests transfer to comprehensive stroke center.
Reason: suspected acute ischemic stroke with CTA-confirmed left M1 occlusion.
Patient accepted by neurointerventional service pending packet completion.`
};
