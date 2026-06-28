from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


SEVERITY_WEIGHT = {
    "critical": 5,
    "high": 4,
    "medium": 3,
    "low": 2,
    "info": 1,
}


def _value_at_path(source: dict[str, Any] | None, path: str | None) -> Any:
    if not source or not path:
        return None
    current: Any = source
    for segment in str(path).split("."):
        if isinstance(current, dict) and segment in current:
            current = current[segment]
        else:
            return None
    return current


def _signal_value(context: dict[str, Any], path: str | None) -> Any:
    signals = context.get("signals") or {}
    evidence = context.get("evidence") or {}
    value = _value_at_path(signals, path)
    return _value_at_path(evidence, path) if value is None else value


def _matches(condition: dict[str, Any] | None, context: dict[str, Any]) -> bool:
    if not condition:
        return True
    if "all" in condition:
        return all(_matches(entry, context) for entry in condition["all"])
    if "any" in condition:
        return any(_matches(entry, context) for entry in condition["any"])

    value = _signal_value(context, condition.get("signal"))
    if "exists" in condition:
        return bool(condition["exists"]) == (value is not None)
    if "eq" in condition and value != condition["eq"]:
        return False
    if "gt" in condition and not isinstance(value, (int, float)):
        return False
    if "gt" in condition and not value > condition["gt"]:
        return False
    if "gte" in condition and not isinstance(value, (int, float)):
        return False
    if "gte" in condition and not value >= condition["gte"]:
        return False
    if "lt" in condition and not isinstance(value, (int, float)):
        return False
    if "lt" in condition and not value < condition["lt"]:
        return False
    if "lte" in condition and not isinstance(value, (int, float)):
        return False
    if "lte" in condition and not value <= condition["lte"]:
        return False
    return True


def _part(part: Any, context: dict[str, Any]) -> dict[str, Any]:
    if isinstance(part, str):
        return {"text": part}
    if not isinstance(part, dict):
        return {"text": str(part)}
    if "text" in part:
        result = {"text": str(part.get("text") or "")}
    else:
        result = {
            "text": f"{_signal_value(context, part.get('path')) or ''}{part.get('suffix') or ''}"
        }
    if isinstance(part.get("marks"), list):
        result["marks"] = part["marks"]
    if part.get("tone"):
        result["tone"] = part["tone"]
    if part.get("href"):
        result["href"] = part["href"]
    return result


def render_plain_text(parts: list[dict[str, Any]] | list[str]) -> str:
    return "".join(part if isinstance(part, str) else str(part.get("text") or "") for part in parts)


def _rank_key(story: dict[str, Any]) -> tuple[int, int, float, str]:
    return (
        SEVERITY_WEIGHT.get(story.get("severity"), 0),
        int(story.get("priority") or 0),
        float(story.get("confidence") or 0),
        str(story.get("id") or ""),
    )


@dataclass
class SignalStoryEngine:
    rule_packs: list[dict[str, Any]] = field(default_factory=list)
    plugins: list[Any] = field(default_factory=list)

    def generate(self, payload: dict[str, Any] | None = None) -> list[dict[str, Any]]:
        payload = payload or {}
        context = {
            "signals": payload.get("signals") or {},
            "evidence": payload.get("evidence") or payload.get("signals") or {},
            "metadata": payload.get("metadata") or {},
        }
        stories: list[dict[str, Any]] = []
        for pack in self.rule_packs:
            for rule in pack.get("rules") or []:
                if _matches(rule.get("when"), context):
                    stories.append(self._build_story(pack, rule, context))
        deduped: dict[str, dict[str, Any]] = {}
        for story in stories:
            key = story.get("key") or story.get("id")
            current = deduped.get(key)
            if current is None or _rank_key(story) > _rank_key(current):
                deduped[key] = story
        return sorted(deduped.values(), key=_rank_key, reverse=True)

    def _build_story(
        self,
        pack: dict[str, Any],
        rule: dict[str, Any],
        context: dict[str, Any],
    ) -> dict[str, Any]:
        draft = rule.get("story") or {}
        sentence = draft.get("sentence") or []
        if not isinstance(sentence, list):
            sentence = [sentence]
        evidence_refs = []
        for entry in draft.get("evidence") or []:
            evidence_refs.append(
                {
                    "label": str(entry.get("label") or entry.get("path") or "Evidence"),
                    "path": str(entry.get("path") or entry.get("label") or "evidence"),
                    "value": entry.get("value", _signal_value(context, entry.get("path"))),
                }
            )
        return {
            "id": str(draft.get("id") or rule.get("id")),
            "key": str(draft.get("key") or rule.get("key") or draft.get("id") or rule.get("id")),
            "ruleId": str(rule.get("id")),
            "rulePackId": str(pack.get("id") or "default"),
            "severity": draft.get("severity") or "info",
            "priority": draft.get("priority", rule.get("priority", 0)),
            "confidence": draft.get("confidence", rule.get("confidence", 1)),
            "tone": draft.get("tone") or "neutral",
            "icon": draft.get("icon"),
            "title": draft.get("title"),
            "sentence": [_part(part, context) for part in sentence],
            "rationale": [_part(part, context) for part in draft.get("rationale") or []],
            "action": draft.get("action"),
            "evidenceRefs": evidence_refs,
            "metadata": {**context.get("metadata", {}), **(draft.get("metadata") or {})},
        }
