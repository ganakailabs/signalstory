import type { ComponentType, ReactNode } from "react";
import type { SignalStoryPart } from "@signalstory/core";

export declare const SignalStoryText: ComponentType<{
  parts?: SignalStoryPart[];
  components?: {
    Text?: ComponentType<{ part?: SignalStoryPart; children?: ReactNode }>;
    Bold?: ComponentType<{ part?: SignalStoryPart; children?: ReactNode }>;
  };
}>;
