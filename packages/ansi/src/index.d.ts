import type { SignalStoryStory } from "signalstory/core";

export declare const renderStoryText: (story: SignalStoryStory) => string;
export declare const renderStoryAnsi: (
  story: SignalStoryStory,
  options?: { color?: boolean },
) => string;
export { renderPlainText } from "signalstory/core";
