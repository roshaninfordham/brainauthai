import type { AgentRun, AgentStep, AuditEntry } from "../schemas/audit";

export function auditFromAgents(agents: AgentRun[], baseTime: string): AuditEntry[] {
  const start = new Date(baseTime).getTime();
  let offset = 0;
  return agents.flatMap((agent) =>
    agent.steps.map((step) => {
      offset += 1;
      return {
        at: new Date(start + offset * 1000).toISOString(),
        agent: agent.name,
        action: step.toolName ? `Tool call: ${step.toolName}` : step.phase,
        result: step.detail,
        confidence: step.confidence,
        sources: step.sources
      };
    })
  );
}
