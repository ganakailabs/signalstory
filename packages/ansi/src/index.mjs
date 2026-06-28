import { renderPlainText } from "@signalstory/core";

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

const renderPartsAnsi = (parts = []) =>
  parts
    .map((part) => {
      const text = typeof part === "string" ? part : String(part?.text ?? "");
      return part?.marks?.includes("bold") ? `${BOLD}${text}${RESET}` : text;
    })
    .join("");

export const renderStoryAnsi = (story, options = {}) => {
  const icon = story.icon && options.icons !== false ? `${story.icon} ` : "";
  const text = `${icon}${renderPartsAnsi(story.sentence ?? [])}`;
  if (options.color === false) {
    return text;
  }
  const color = SEVERITY_COLOR[story.severity] ?? SEVERITY_COLOR.info;
  return `${color}${text}${RESET}`;
};

export { renderPlainText };
