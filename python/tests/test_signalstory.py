from signalstory import SignalStoryEngine, render_plain_text


def test_python_runtime_generates_same_basic_story_shape():
    engine = SignalStoryEngine(
        rule_packs=[
            {
                "id": "review",
                "rules": [
                    {
                        "id": "critical-findings",
                        "when": {"signal": "critical_findings", "gt": 0},
                        "story": {
                            "id": "critical-findings",
                            "severity": "critical",
                            "sentence": [
                                {
                                    "path": "critical_findings",
                                    "suffix": " critical findings",
                                    "marks": ["bold"],
                                },
                                {
                                    "text": " remain unresolved and should stay at the top of the queue."
                                },
                            ],
                            "evidence": [
                                {
                                    "label": "Critical findings",
                                    "path": "critical_findings",
                                }
                            ],
                        },
                    }
                ],
            }
        ]
    )

    stories = engine.generate({"signals": {"critical_findings": 3}})

    assert stories[0]["id"] == "critical-findings"
    assert render_plain_text(stories[0]["sentence"]) == (
        "3 critical findings remain unresolved and should stay at the top of the queue."
    )
    assert stories[0]["evidenceRefs"] == [
        {"label": "Critical findings", "path": "critical_findings", "value": 3}
    ]
