import { renderPlainText } from "../../core/src/index.mjs";

const escapeMarkdown = (value) =>
  String(value ?? "").replace(/([\\`*_{}\[\]()#+|>])/g, "\\$1");

export const formatIconLabel = (icon) =>
  String(icon ?? "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (letter) => letter.toUpperCase());

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

const renderIconMarkdown = (story, options = {}) => {
  if (!story.icon || options.icons === false) {
    return "";
  }
  const iconLabel = options.iconLabels?.[story.icon] ?? formatIconLabel(story.icon);
  return iconLabel ? `${escapeMarkdown(iconLabel)} ` : "";
};

export const renderStoryMarkdown = (story, options = {}) => {
  const lines = [`${renderIconMarkdown(story, options)}${renderPartsMarkdown(story.sentence ?? [])}`];
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
    lines.push(`- ${renderIconMarkdown(story, options)}${renderPartsMarkdown(story.sentence ?? [])}`);
  }
  const details = stories.map((story) => renderStoryMarkdown(story, options)).join("\n\n---\n\n");
  lines.push("", "<details>", "<summary>Details</summary>", "", details || "No stories generated.", "", "</details>");
  return `${lines.join("\n")}\n`;
};

export { renderPlainText };
