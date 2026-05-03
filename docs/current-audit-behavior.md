# Current Audit Behavior

This is the current product behavior for reviewers, demos, and implementation handoff. It is written as a truth boundary, not announcement copy.

## Live Evidence Mode

Live evidence mode is the real investigation path. Depending on the input and configured credentials, HireProof can:

- resolve supported public job URLs before claim extraction;
- run screenshot OCR with Google Vision first and Tesseract fallback when needed;
- extract company, role, salary, location, contact method, apply path, and recruiter fields;
- check web presence, news, comparable jobs, local footprint, apply-path consistency, and salary context;
- score the report with source quality, freshness, recruiter identity, company profile mode, and salary anomaly reasoning;
- stream browser events that become the visible report timeline.

If a provider is unavailable, the report should show a clear operational boundary instead of pretending every check ran.

## Demo Fixture Mode

Demo fixture mode is for walkthroughs and credential-offline testing. It is separate from live evidence mode.

- Demo fixture mode shows a visible warning and snackbar.
- Demo evidence text is labeled as fixture evidence.
- Demo fixture evidence should not be described as live evidence.
- Demo reports do not include fake source links or fake safer alternatives.
- Demo timeline entries are fixture events, not precise live timings.

## Verified-only safer alternatives

Safer alternatives are shown only when comparable job evidence has a real source URL or provider-backed job metadata.

Unsourced comparable snippets, generic generated examples, and demo placeholders are hidden. This keeps HireProof from inventing jobs or implying that a suggested employer was verified when it was not.

## False-positive Controls

HireProof uses explicit false-positive controls so legitimate edge cases are not punished silently.

- Remote startup mode explains why missing local-office evidence may not hurt the score when digital footprint and apply-path signals are consistent.
- Startup and remote roles still need credible company, recruiter, and application-channel evidence.
- User feedback includes structured reasons such as false positive, stale evidence, salary wrong, company match wrong, and recruiter match wrong.

## Abuse and SerpApi Guardrails

Live audits are protected because external evidence checks can be expensive.

- Queue throttling limits concurrent expensive live audits per user or IP.
- The SerpApi circuit breaker opens when errors or quota spikes make live search unhealthy.
- Persistent Redis cache hooks and in-memory cache reuse normalized searches.
- Similarity cache can reuse equivalent company, role, location, and apply-host audits.
- Reports can include operational notes when throttling or circuit state affects live evidence.

## Timeline Meaning

The report timeline should be read as an audit activity log.

- In live browser audits, the timeline uses captured stream events.
- In demo fixture mode, the timeline says it is a fixture.
- If no stream exists, the report shows an honest fallback summary instead of exact fake durations.
