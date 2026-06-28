import assert from "node:assert/strict";
import test from "node:test";
import {
  createSignalStoryEngine,
  rankStories,
  dedupeStories,
  renderPlainText,
} from "../src/index.mjs";

test("generates ranked evidence-grounded stories from rule packs", () => {
  const engine = createSignalStoryEngine({
    rulePacks: [
      {
        id: "review",
        rules: [
          {
            id: "critical-findings",
            when: { signal: "critical_findings", gt: 0 },
            story: {
              id: "critical-findings",
              severity: "critical",
              tone: "risk",
              icon: "alert-triangle",
              priority: 90,
              sentence: [
                { path: "critical_findings", suffix: " critical findings", marks: ["bold"] },
                { text: " remain unresolved and should stay at the top of the queue." },
              ],
              rationale: [
                { text: "Critical findings dominate the current risk profile." },
              ],
              action: { label: "Prioritize critical remediation" },
              evidence: [{ label: "Critical findings", path: "critical_findings" }],
            },
          },
        ],
      },
    ],
  });

  const stories = engine.generate({
    signals: { critical_findings: 3 },
    evidence: { critical_findings: 3 },
  });

  assert.equal(stories.length, 1);
  assert.equal(stories[0].id, "critical-findings");
  assert.equal(stories[0].severity, "critical");
  assert.equal(renderPlainText(stories[0].sentence), "3 critical findings remain unresolved and should stay at the top of the queue.");
  assert.deepEqual(stories[0].evidenceRefs, [
    { label: "Critical findings", path: "critical_findings", value: 3 },
  ]);
});

test("dedupes by story key and ranks by severity, priority, confidence, and id", () => {
  const stories = [
    { id: "b", key: "same", severity: "medium", priority: 10, confidence: 0.9, sentence: [] },
    { id: "a", key: "same", severity: "critical", priority: 10, confidence: 0.5, sentence: [] },
    { id: "c", key: "other", severity: "high", priority: 90, confidence: 0.9, sentence: [] },
  ];

  assert.deepEqual(dedupeStories(stories).map((story) => story.id), ["a", "c"]);
  assert.deepEqual(rankStories(dedupeStories(stories)).map((story) => story.id), ["a", "c"]);
});

test("runs plugins after deterministic story generation", () => {
  const engine = createSignalStoryEngine({
    rulePacks: [
      {
        id: "coverage",
        rules: [
          {
            id: "coverage",
            when: { signal: "sources", gte: 1 },
            story: {
              id: "coverage",
              severity: "info",
              sentence: [{ text: "Coverage is available." }],
            },
          },
        ],
      },
    ],
    plugins: [
      {
        id: "append-action",
        afterGenerate(stories) {
          return stories.map((story) => ({
            ...story,
            action: { label: "Open the source evidence" },
          }));
        },
      },
    ],
  });

  assert.equal(engine.generate({ signals: { sources: 2 } })[0].action.label, "Open the source evidence");
});
