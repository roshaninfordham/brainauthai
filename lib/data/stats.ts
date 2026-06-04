import { MetricCardSchema, type MetricCard, type SourceLink } from "../schemas/packet";

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
  },
  {
    label: "Azure Static Web Apps Pricing",
    url: "https://azure.microsoft.com/en-us/pricing/details/app-service/static/"
  },
  {
    label: "Azure Functions",
    url: "https://azure.microsoft.com/en-us/products/functions"
  },
  {
    label: "GitHub Copilot Coding Agent",
    url: "https://docs.github.com/copilot/concepts/agents/coding-agent/about-coding-agent"
  }
];

export const impactMetrics: MetricCard[] = [
  metric("U.S. strokes/year", "795,000+", "CDC", "CDC Stroke Facts", sourceLinks[0].url),
  metric("Ischemic stroke share", "87%", "CDC", "CDC Stroke Facts", sourceLinks[0].url),
  metric("U.S. stroke cost", "$56.2B", "2019-2020", "CDC Stroke Facts", sourceLinks[0].url),
  metric("Global stroke cases", "93.8M", "WHO 2021", "WHO Stroke Fact Sheet", sourceLinks[1].url),
  metric("New global cases", "11.9M", "WHO 2021", "WHO Stroke Fact Sheet", sourceLinks[1].url),
  metric("Neurons/minute at risk", "1.9M", "Saver, Stroke", "Time Is Brain - Quantified", sourceLinks[2].url),
  metric("Serious PA adverse event", "26%", "AMA survey", "AMA 2025 Prior Authorization Survey", sourceLinks[3].url),
  metric("PAs / physician / week", "~39", "AMA survey", "AMA 2025 Prior Authorization Survey", sourceLinks[3].url),
  metric("Global economic burden", "~$890B", "WSO fact sheet", "World Stroke Organization Impact", sourceLinks[6].url),
  metric("2030 global cost", "~$1T", "WSO", "World Stroke Organization Impact", sourceLinks[6].url)
];

function metric(
  label: string,
  value: string,
  note: string,
  sourceLabel: string,
  sourceUrl: string
): MetricCard {
  return MetricCardSchema.parse({ label, value, note, sourceLabel, sourceUrl });
}
