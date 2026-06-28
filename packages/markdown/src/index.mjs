import { renderPlainText } from "@signalstory/core";

const escapeMarkdown = (value) =>
  String(value ?? "").replace(/([\\`*_{}\[\]()#+|>])/g, "\\$1");

const renderPartMarkdown = (part) => {
  if (typeof part === "string") {
    return escapeMarkdown(part);
  }
  let text = escapeMarkdown(part?.text ?? "");
  if (part?.href) {
    text = `[${text}](${String(part.href).replace(/\)/g, "%29")})`;
  }
  if (part?.marks?.includes("code")) {
    text = `\`${String(part.text ?? "").replace(/`/g, "\\`")}\``;
  }
  if (part?.marks?.includes("bold")) {
    text = `**${text}**`;
  }
  return text;
};

export const renderPartsMarkdown = (parts = []) => parts.map(renderPartMarkdown).join("");

const renderIconMarkdown = (story) => (story.icon ? `${escapeMarkdown(story.icon)} ` : "");

export const renderStoryMarkdown = (story) => {
  const lines = [`${renderIconMarkdown(story)}${renderPartsMarkdown(story.sentence ?? [])}`];
  if (story.rationale?.length) {
    lines.push("", `**Why it matters:** ${renderPartsMarkdown(story.rationale)}`);
  }
  if (story.action?.label) {
    lines.push("", `**Recommended action:** ${escapeMarkdown(story.action.label)}`);
  }
  if (story.evidenceRefs?.length) {
    lines.push("", "**Evidence:**");
    for (const entry of story.evidenceRefs) {
      const suffix = entry.value === undefined || entry.value === null ? "" : `: ${entry.value}`;
      lines.push(`- ${escapeMarkdown(entry.label)}${escapeMarkdown(suffix)}`);
    }
  }
  return lines.join("\n");
};

export const renderGithubSummary = (stories = [], options = {}) => {
  const title = options.title ?? "SignalStory summary";
  const lines = [`### ${escapeMarkdown(title)}`, ""];
  for (const story of stories) {
    lines.push(`- ${renderIconMarkdown(story)}${renderPartsMarkdown(story.sentence ?? [])}`);
  }
  const details = stories.map(renderStoryMarkdown).join("\n\n---\n\n");
  lines.push("", "<details>", "<summary>Details</summary>", "", details || "No stories generated.", "", "</details>");
  return `${lines.join("\n")}\n`;
};

export { renderPlainText };
