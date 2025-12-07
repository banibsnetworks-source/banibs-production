#!/usr/bin/env python3
# TIES Test Suite - Version 1.0

from backend.services.bps.ties import TIESEngine
from backend.models.bps.models import TIESInput, Verdict


def test_absolute_statements():
    engine = TIESEngine()
    result = engine.analyze(TIESInput(
        content="BANIBS never tracks users and always protects privacy."
    ))
    assert result.verdict in [Verdict.WARN, Verdict.BLOCK]
    assert len(result.issues) > 0
    print("✅ Test absolute statements: PASSED")


def test_capability_misstatements():
    engine = TIESEngine()
    result = engine.analyze(TIESInput(
        content="BANIBS uses no algorithms to rank content."
    ))
    assert result.verdict == Verdict.BLOCK
    print("✅ Test capability misstatements: PASSED")


def test_safe_content():
    engine = TIESEngine()
    result = engine.analyze(TIESInput(
        content="BANIBS is an ad-free platform designed for Black businesses."
    ))
    assert result.verdict == Verdict.OK
    assert len(result.issues) == 0
    print("✅ Test safe content: PASSED")


if __name__ == "__main__":
    print("\nTIES TEST SUITE - Version 1.0\n")
    test_absolute_statements()
    test_capability_misstatements()
    test_safe_content()
    print("\nALL TESTS PASSED ✅\n")
