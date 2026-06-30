import type { SignalStoryStory } from "signalstory/core";

export declare const formatIconLabel: (icon?: string) => string;
export declare const renderStoryText: (story: SignalStoryStory) => string;
export declare const renderStoryAnsi: (
  story: SignalStoryStory,
  options?: { color?: boolean; icons?: boolean; iconLabels?: Record<string, string> },
) => string;
export { renderPlainText } from "signalstory/core";
