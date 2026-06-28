import assert from "node:assert/strict";
import test from "node:test";
import { renderStoryMarkdown, renderGithubSummary } from "../src/index.mjs";

test("renders story parts to Markdown with bold marks and evidence", () => {
  const markdown = renderStoryMarkdown({
    id: "critical-findings",
    severity: "critical",
    icon: "alert-triangle",
    sentence: [
      { text: "3 critical findings", marks: ["bold"] },
      { text: " remain unresolved." },
    ],
    rationale: [{ text: "Critical findings dominate risk." }],
    action: { label: "Prioritize remediation" },
    evidenceRefs: [{ label: "Critical findings", path: "critical_findings", value: 3 }],
  });

  assert.match(markdown, /alert-triangle \*\*3 critical findings\*\* remain unresolved\./);
  assert.match(markdown, /Why it matters/);
  assert.match(markdown, /Prioritize remediation/);
  assert.match(markdown, /Critical findings: 3/);
});

test("renders a GitHub-safe details summary", () => {
  const markdown = renderGithubSummary([
    {
      id: "gate",
      severity: "high",
      icon: "git-pull-request",
      sentence: [{ text: "Gate failed." }],
      rationale: [{ text: "Validation failed." }],
    },
  ]);

  assert.match(markdown, /^### SignalStory summary/);
  assert.match(markdown, /<details>/);
  assert.match(markdown, /git-pull-request Gate failed\./);
  assert.match(markdown, /<summary>Details<\/summary>/);
});
