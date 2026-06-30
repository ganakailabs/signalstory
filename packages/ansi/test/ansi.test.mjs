import assert from "node:assert/strict";
import test from "node:test";
import { renderStoryText, renderStoryAnsi } from "../src/index.mjs";

const stripAnsi = (text) => text.replace(/\u001b\[[0-9;]*m/g, "");

test("renders plain text without markdown control characters", () => {
  const text = renderStoryText({
    id: "cost",
    severity: "high",
    sentence: [{ text: "$420/month", marks: ["bold"] }, { text: " can be saved." }],
  });

  assert.equal(text, "$420/month can be saved.");
});

test("renders ANSI output when color is enabled", () => {
  const text = renderStoryAnsi(
    {
      id: "cost",
      severity: "high",
      icon: "coins",
      sentence: [{ text: "Savings", marks: ["bold"] }, { text: " are available." }],
    },
    { color: true }
  );

  assert.match(text, /\u001b\[/);
  assert.match(text, /Coins /);
  assert.match(text, /\u001b\[1mSavings/);
  assert.equal(stripAnsi(text), "Coins Savings are available.");
});

test("supports custom icon labels and hidden icons", () => {
  const story = {
    id: "cost",
    severity: "high",
    icon: "alert-triangle",
    sentence: [{ text: "Risk increased." }],
  };

  assert.equal(
    renderStoryAnsi(story, { color: false, iconLabels: { "alert-triangle": "Warning" } }),
    "Warning Risk increased."
  );
  assert.equal(renderStoryAnsi(story, { color: false, icons: false }), "Risk increased.");
});
