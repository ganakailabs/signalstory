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

export const renderStoryAnsi = (story, options = {}) => {
  const text = renderStoryText(story);
  if (options.color === false) {
    return text;
  }
  const color = SEVERITY_COLOR[story.severity] ?? SEVERITY_COLOR.info;
  return `${color}${BOLD}${text}${RESET}`;
};

export { renderPlainText };
