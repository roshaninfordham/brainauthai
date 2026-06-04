"use client";

import {
  Activity,
  ArrowRight,
  Brain,
  CheckCircle2,
  ClipboardCheck,
  Cloud,
  Database,
  FileText,
  Route,
  SearchCheck,
  ShieldCheck,
  Timer
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { impactMetrics } from "../lib/sample-case";

const neuronData = [0, 10, 20, 30, 60].map((minutes) => ({
  minutes,
  neurons: minutes * 1900000,
  label: `${minutes * 1.9}M`
}));

const beforeWorkflow = [
  "Manual chart review",
  "Payer policy lookup",
  "Missing documentation chase",
  "Packet assembly",
  "Delayed handoff"
];

const afterWorkflow = [
  "Upload records",
  "Agents extract evidence",
  "Criteria documentation view",
  "Gap detection",
  "Clinician review packet"
];

const agents = [
  ["Triage", "Extract NIHSS, LKW, vitals, symptoms"],
  ["Imaging", "Map CT/CTA evidence and hemorrhage exclusion"],
  ["Policy", "Normalize payer policy into criteria"],
  ["Necessity", "Connect source facts to documentation needs"],
  ["Gap", "Flag missing fields without inventing data"],
  ["Packet", "Prepare draft packet and FHIR-style JSON"],
  ["Audit", "Check grounding, confidence, and review items"]
];

function formatNeurons(value: number) {
  if (value === 0) return "0";
  return `${Math.round(value / 1000000)}M`;
}

export default function LandingPage() {
  return (
    <main className="landingShell">
      <nav className="landingNav" aria-label="Primary navigation">
        <Link className="brandBlock" href="/">
          <span className="brandMark">
            <Brain size={23} aria-hidden="true" />
          </span>
          <span>
            <span className="eyebrow">Agentic stroke documentation</span>
            <strong>BrainAuth AI</strong>
          </span>
        </Link>
        <div className="landingNavActions">
          <a href="#architecture">Architecture</a>
          <Link className="navButton" href="/copilot">Copilot proof</Link>
          <Link className="primaryButton" href="/demo">
            Launch Live MVP
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </nav>

      <section className="landingHero">
        <motion.div
          className="heroCopy"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <span className="heroBadge">
            <ShieldCheck size={16} aria-hidden="true" />
            Human review required before submission
          </span>
          <h1>Review-ready stroke packet drafts before brain dies.</h1>
          <p>
            BrainAuth AI turns EHR notes, CTA reports, transfer notes, and payer
            policies into a source-grounded stroke documentation packet in one
            agentic run.
          </p>
          <div className="heroActions">
            <Link className="primaryButton" href="/demo">
              Launch Live MVP
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <a className="secondaryButton" href="#workflow">
              See workflow
            </a>
          </div>
        </motion.div>

        <motion.div
          className="heroProduct"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          aria-label="BrainAuth product preview"
        >
          <div className="heroProductHeader">
            <div>
              <span>Stroke packet run</span>
              <strong>John Doe · NIHSS 18 · LKW 08:12</strong>
            </div>
            <span className="statusPill done">Review draft</span>
          </div>
          <div className="heroTimeGrid">
            <div>
              <span>Manual baseline</span>
              <strong>30 min</strong>
            </div>
            <div>
              <span>BrainAuth demo</span>
              <strong>2 min</strong>
            </div>
            <div>
              <span>Neurons at risk avoided</span>
              <strong>53.2M</strong>
            </div>
          </div>
          <div className="miniAgentList">
            {[
              ["Imaging Agent", "Evidence found: left M1 MCA occlusion", "96%"],
              ["Policy Agent", "6 criteria matched, 1 needs review", "91%"],
              ["Audit Agent", "Unsupported claims: 0", "95%"]
            ].map(([agent, output, confidence]) => (
              <div className="miniAgentRow" key={agent}>
                <CheckCircle2 size={16} aria-hidden="true" />
                <div>
                  <strong>{agent}</strong>
                  <span>{output}</span>
                </div>
                <small>{confidence}</small>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="landingMetrics" aria-label="Stroke and prior authorization metrics">
        {impactMetrics.slice(0, 8).map((metric) => (
          <article className="landingMetricCard" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.note}</small>
          </article>
        ))}
      </section>

      <section className="landingSection chartSection" id="time-brain">
        <div className="sectionCopy">
          <span className="eyebrow">Time Is Brain</span>
          <h2>Administrative minutes have biological stakes.</h2>
          <p>
            The demo uses the accepted time-is-brain hook: about 1.9 million
            neurons per untreated ischemic stroke minute. BrainAuth reports
            “neurons at risk avoided,” not guaranteed neurons saved.
          </p>
        </div>
        <div className="chartCard">
          <ResponsiveContainer width="100%" height={290}>
            <LineChart data={neuronData} margin={{ top: 16, right: 20, bottom: 8, left: 0 }}>
              <CartesianGrid stroke="#E2E8F0" vertical={false} />
              <XAxis
                dataKey="minutes"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748B", fontSize: 12 }}
                label={{ value: "Minutes delayed", position: "insideBottom", offset: -4, fill: "#475569" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748B", fontSize: 12 }}
                tickFormatter={formatNeurons}
              />
              <Tooltip
                formatter={(value) => [formatNeurons(Number(value)), "Neurons at risk"]}
                labelFormatter={(label) => `${label} minutes`}
              />
              <Line
                type="monotone"
                dataKey="neurons"
                stroke="#2563EB"
                strokeWidth={3}
                dot={{ r: 4, fill: "#2563EB", strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="landingSection" id="workflow">
        <div className="sectionCopy">
          <span className="eyebrow">Workflow</span>
          <h2>From paperwork chase to source-grounded packet draft.</h2>
          <p>
            BrainAuth does not make treatment decisions. It prepares evidence,
            flags missing documentation, and gives clinicians a reviewable packet.
          </p>
        </div>
        <div className="workflowCompare">
          <WorkflowColumn title="Current workflow" items={beforeWorkflow} tone="warning" />
          <WorkflowColumn title="BrainAuth workflow" items={afterWorkflow} tone="success" />
        </div>
      </section>

      <section className="landingSection architectureSection" id="architecture">
        <div className="sectionCopy">
          <span className="eyebrow">Agentic System</span>
          <h2>Observable agents, source evidence, and packet output.</h2>
          <p>
            Each agent emits tool calls, evidence found, confidence, verification
            status, and human-review flags. Hidden chain-of-thought is never shown.
          </p>
        </div>
        <div className="agentArchitecture">
          {agents.map(([name, description], index) => (
            <article className="agentArchitectureCard" key={name}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{name}</strong>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landingSection marketSection">
        <div className="marketCard">
          <Route size={22} aria-hidden="true" />
          <h2>Beachhead: acute stroke documentation.</h2>
          <p>
            Start with transfer and payer-submission packet drafts. Expand into
            prior-auth automation, transfer coordination, and stroke network operations.
          </p>
        </div>
        <div className="marketCard">
          <Cloud size={22} aria-hidden="true" />
          <h2>Azure-ready document parsing.</h2>
          <p>
            Azure AI Document Intelligence can parse EHR PDFs, CTA reports, and
            payer policies when credentials are configured. Local demo fallback stays reliable.
          </p>
        </div>
        <div className="marketCard">
          <Database size={22} aria-hidden="true" />
          <h2>Source-grounded by design.</h2>
          <p>
            Facts without source quotes become gaps, conflicts, or human-review items.
            Unsupported packet claims are blocked.
          </p>
        </div>
      </section>

      <footer className="landingFooter">
        <div>
          <strong>BrainAuth AI</strong>
          <span>Synthetic demo only. Not clinical decision support.</span>
        </div>
        <Link href="/demo">
          Launch Live MVP
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </footer>
    </main>
  );
}

function WorkflowColumn({
  title,
  items,
  tone
}: {
  title: string;
  items: string[];
  tone: "warning" | "success";
}) {
  const Icon = tone === "warning" ? Timer : SearchCheck;
  return (
    <article className={`workflowColumn ${tone}`}>
      <div className="workflowTitle">
        <Icon size={18} aria-hidden="true" />
        <h3>{title}</h3>
      </div>
      {items.map((item) => (
        <div className="workflowStep" key={item}>
          {tone === "warning" ? (
            <FileText size={15} aria-hidden="true" />
          ) : (
            <ClipboardCheck size={15} aria-hidden="true" />
          )}
          <span>{item}</span>
        </div>
      ))}
    </article>
  );
}
