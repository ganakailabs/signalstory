import React from "react";

export const SignalStoryText = ({ parts = [], components = {} }) => {
  const Strong = components.strong ?? "strong";
  const Code = components.code ?? "code";
  const Link = components.a ?? "a";
  return React.createElement(
    React.Fragment,
    null,
    ...parts.map((part, index) => {
      let node = String(part?.text ?? "");
      if (part?.href) {
        node = React.createElement(Link, { href: part.href, key: `link-${index}` }, node);
      }
      if (part?.marks?.includes("code")) {
        node = React.createElement(Code, { key: `code-${index}` }, node);
      }
      if (part?.marks?.includes("bold")) {
        node = React.createElement(Strong, { key: `strong-${index}` }, node);
      }
      return React.createElement(React.Fragment, { key: index }, node);
    })
  );
};
