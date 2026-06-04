import { ArrowLeft, Bot, CheckCircle2, FileText, GitCommitHorizontal, Workflow } from "lucide-react";
import Link from "next/link";

const assistedAreas = [
  "Light clinical SaaS UI refactor",
  "Source-grounded Zod schemas",
  "Deterministic agent runner",
  "Evidence and criteria components",
  "Azure fallback integration",
  "Architecture, safety, and demo docs"
];

const artifacts = [
  ".github/copilot-instructions.md",
  "docs/COPILOT_BUILD_LOG.md",
  "docs/PROMPTS_USED.md",
  "docs/DEMO_SCRIPT.md",
  "docs/HALLUCINATION_SAFETY.md",
  "docs/FINAL_QA.md"
];

const workflow = ["Research", "Plan", "Implement", "Review", "Test", "Iterate"];

export default function CopilotProofPage() {
  return (
    <main className="copilotShell">
      <nav className="copilotNav">
        <Link className="navButton" href="/">
          <ArrowLeft size={15} aria-hidden="true" />
          Landing
        </Link>
        <Link className="primaryButton" href="/demo">
          Live MVP
        </Link>
      </nav>

      <section className="copilotHero">
        <span className="heroBadge">
          <Bot size={16} aria-hidden="true" />
          Copilot-assisted build
        </span>
        <h1>Built with GitHub Copilot as an AI pair programmer.</h1>
        <p>
          BrainAuth AI uses repo-level instructions, atomic commits, prompt logs,
          and QA docs to make the AI-assisted build story visible and defensible.
        </p>
      </section>

      <section className="copilotGrid">
        <article className="copilotCard">
          <Workflow size={20} aria-hidden="true" />
          <h2>Prompting workflow</h2>
          <div className="copilotSteps">
            {workflow.map((step) => (
              <span key={step}>{step}</span>
            ))}
          </div>
        </article>

        <article className="copilotCard">
          <CheckCircle2 size={20} aria-hidden="true" />
          <h2>Copilot-assisted areas</h2>
          <ul>
            {assistedAreas.map((area) => (
              <li key={area}>{area}</li>
            ))}
          </ul>
        </article>

        <article className="copilotCard">
          <FileText size={20} aria-hidden="true" />
          <h2>Proof artifacts</h2>
          <ul>
            {artifacts.map((artifact) => (
              <li key={artifact}>{artifact}</li>
            ))}
          </ul>
        </article>

        <article className="copilotCard">
          <GitCommitHorizontal size={20} aria-hidden="true" />
          <h2>Atomic commit story</h2>
          <p>
            Commits are organized around audit, Copilot instructions, light UI,
            landing page, source-grounded schemas, agent runner, packet preview,
            Azure integration, documentation, and final QA.
          </p>
        </article>
      </section>
    </main>
  );
}
