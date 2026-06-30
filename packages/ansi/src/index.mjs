import { renderPlainText } from "../../core/src/index.mjs";

const SEVERITY_COLOR = {
  critical: "\u001b[31m",
  high: "\u001b[33m",
  medium: "\u001b[36m",
  low: "\u001b[34m",
  info: "\u001b[37m",
};

const RESET = "\u001b[0m";
const BOLD = "\u001b[1m";

export const renderStoryText = (story) => renderPlainText(story.sentence ?? []);

export const formatIconLabel = (icon) =>
  String(icon ?? "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (letter) => letter.toUpperCase());

const renderPartsAnsi = (parts = []) =>
  parts
    .map((part) => {
      const text = typeof part === "string" ? part : String(part?.text ?? "");
      return part?.marks?.includes("bold") ? `${BOLD}${text}${RESET}` : text;
    })
    .join("");

export const renderStoryAnsi = (story, options = {}) => {
  const iconLabel =
    story.icon && options.icons !== false
      ? options.iconLabels?.[story.icon] ?? formatIconLabel(story.icon)
      : "";
  const icon = iconLabel ? `${iconLabel} ` : "";
  const text = `${icon}${renderPartsAnsi(story.sentence ?? [])}`;
  if (options.color === false) {
    return text;
  }
  const color = SEVERITY_COLOR[story.severity] ?? SEVERITY_COLOR.info;
  return `${color}${text}${RESET}`;
};

export { renderPlainText };
