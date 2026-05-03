# HireProof Make Custom App Source

This folder contains the source pack for a Make.com Custom App.

## Modules

- `Audit job post`: synchronous `POST /api/v1/audit`.
- `Audit job post async`: `POST /api/v1/audit` with `webhook_url`.
- `Get API health`: `GET /api/health`.

## Connection

The app uses API key header auth:

```text
x-api-key: {{connection.apiKey}}
```

Use `hireproof_agent_demo_key` for deterministic demo fixtures, or a real HireProof API key for live/provider-backed audits.

## Submission Boundary

The source pack is repo-shipped and statically validated. Creating/submitting the app in Make requires a Make developer account and Make review approval.
