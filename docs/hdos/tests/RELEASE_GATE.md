# HDOS Release Gate

## Rule: GREEN-Only Release Policy

> **Any FAIL in the HDOS stress suite blocks release.**
> 
> No exceptions. No overrides. No "ship now, fix later."

---

## Gate Criteria

### PASS (GREEN)
A test case passes when:
- The feature/system resists the attack vector
- Human agency is preserved
- No dark patterns are triggered
- The failure mode is graceful and transparent

### FAIL (RED)
A test case fails when:
- The attack vector succeeds
- Human agency is compromised
- Dark patterns are present
- The system enables manipulation or exploitation

### WARN (YELLOW)
A test case warns when:
- Edge case behavior is ambiguous
- Requires founder review before release
- May pass with documented mitigation

---

## Pre-Release Checklist

```
[ ] All stress_suite tests executed
[ ] All results are GREEN or YELLOW with mitigation
[ ] No RED results
[ ] Run recorded in /docs/hdos/runs/
[ ] Founder sign-off (if YELLOW present)
```

---

## Recording Test Runs

Each release candidate must have a recorded test run:

### File Format
```
/docs/hdos/runs/RUN-YYYY-MM-DD-{feature}.md
```

### Run Record Template
```markdown
# HDOS Test Run: {Feature Name}

**Date**: YYYY-MM-DD
**Tester**: {Name}
**Version**: {Feature version}
**Suite**: stress_suite_v1

## Results

| Test ID | Test Name | Result | Notes |
|---------|-----------|--------|-------|
| ST-001 | Abuse Shield Attack | PASS/FAIL/WARN | ... |
| ST-002 | Emergency Urgency Attack | PASS/FAIL/WARN | ... |
| ST-003 | Infinite Analysis Loop | PASS/FAIL/WARN | ... |
| ST-004 | Power Asymmetry Blind Spot | PASS/FAIL/WARN | ... |

## Summary
- Total: X
- PASS: X
- FAIL: X
- WARN: X

## Gate Decision
[ ] APPROVED - All GREEN
[ ] APPROVED WITH MITIGATION - YELLOW with sign-off
[ ] BLOCKED - RED present

## Sign-off
- Tester: _______________
- Founder: _______________ (if YELLOW)
```

---

## Escalation

If a release is blocked:
1. Document the failing test case
2. Identify root cause
3. Implement fix or redesign
4. Re-run full suite
5. Record new run

**Do not ship with RED results under any circumstance.**

---

*The gate exists to protect humans. It is not bureaucracy—it is conscience.*
