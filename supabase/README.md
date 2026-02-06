# Supabase Edge Functions – Setup and Workflow

> ⚠️ This flow is **only** for writing and exporting Edge Functions.
> It does **not** involve running Supabase locally (`supabase start`), local databases, or Docker.

---

## 1. Prerequisites

### Supabase CLI

```bash
npm i -D supabase
```

### Deno (required runtime for Edge Functions)

Install the **Deno VS Code extension**

> Deno is only used for files under `supabase/functions/**`.

---


## 2. Link This Repo to the Project

From the repo root:

```bash
npx supabase login
npx supabase link --project-ref <PROJECT_REF>
```

This tells the CLI **where to deploy functions**.
It does **not** modify schema or data.

### To find the project ref:

List accessible projects:

```bash
npx supabase projects list
```

Copy the **project ref** you want to deploy to.

---

## 3. Creating Edge Functions

Create a new Edge Function using the Supabase CLI:

```bash
npx supabase functions new <function-name>
```

This creates the following structure:

```
supabase/functions/<function-name>/index.ts
```

Each function runs in a **Deno edge runtime**.

---


## 4. Deploying Edge Functions

Deploy a single function:

```bash
npx supabase functions deploy <function-name>
```

Deploy all functions:

```bash
npx supabase functions deploy
```
The function will be viewable on the Supabase dashboard now.

---

## 5. Testing with Postman (No Docker)

### Disable JWT Verification (for testing only)

In `supabase/config.toml`:

```toml
[functions.<function-name>]
verify_jwt = false
```

Redeploy after changing config:

```bash
npx supabase functions deploy <function-name>
```

**What this does:**
Disables Supabase Auth JWT checks so the function can be called without a user session.

---

### Postman Request

**Method:** `POST`
**URL:**

```
https://<PROJECT_REF>.supabase.co/functions/v1/<function-name>
```

**Headers:**

```
Content-Type: application/json
```

**Body (raw JSON):**

```json
{ "test": "hello" }
```

---

## 6. Security Note (Important)

Edge Function endpoints are **public URLs**.

If we want a function to be **trigger-only (DB → function)**:

* Keep `verify_jwt = false`
* Add **custom authorization** (e.g. shared secret header)
* Reject all requests without the secret inside the function

This will be implemented later when database triggers are added.

---

## 7. Database -> Edge Function Trigger Security Model

This project uses database triggers to invoke Supabase Edge Functions for additional processing. Because Edge Functions are public HTTP endpoints, we need to take certain security measures.

## Handling Secrets and Authentication

* A shared webhook secret is stored in two places:
  * Supabase Vault (Dashboard -> Settings -> Vault) Used by Postgres trigger functions to authenticate outbound HTTP requests.
  * Edge Function Secrets (Dashboard -> Edge Functions -> Secrets) Used by the Edge Function to verify incoming requests
* The secrets must have an identical name and value in both locations
* Secrets are never accessible to client roles (anon, authenticated)

## Trigger -> Edge Function Invocation Flow

A database trigger fires on table events

The trigger calls a server-side plpgsql function which:
* Uses `pg_net` extention to make an async HTTP POST request
* Sends the payload in body
* Includes the secret in a custom header:

```
x-webhook-secret: <shared-secret>
```

> `pg_net` does not wait for a response. The HTTP response from the edge function is only stored in logs

All trigger-invoked functions must:
* Be declared as the following to ensure it runs with the owner's privileges (access to vault) and cannot be shadowed by malicious user-defined objects:

```
SECURITY DEFINER
SET search_path = pg_catalog, public
```

* Revoke execution from all client-facing roles:

```
REVOKE EXECUTE ON FUNCTION <function_name> FROM public, anon, authenticated;
```

## Edge Function Authentication and Database Writes

* The Edge Function rejects all requests without a valid `x-webhook-secret`
* When writing back to the database, the Edge Function uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS intentionally for system-managed updates

## Row-Level Security
* RLS must be enabled on tables touched by clients
* Recommended pattern:
  * User-owned columns (e.g. title, content)
  * System-owned columns (e.g. status, difficulty)

---

## 8. Do / Don’t Checklist

### ✅ Do

* Keep Edge Functions small and single-purpose
* Deploy and test functions independently
* Use `verify_jwt = false` only for testing or internal workflows
* Store secrets using:

```bash
npx supabase secrets set KEY=value
```

* Assume Edge Functions are **public unless protected**

### ❌ Don’t

* Don’t use service role keys in client code
* Don’t treat publishable keys as JWTs
* Don’t require Docker for Edge Function development
* Don’t add DB triggers until the function is fully tested
* Don’t assume Edge Functions are private by default

---

## 9. To Do / Open Decisions

This section tracks upcoming backend decisions and implementation work related to Edge Functions.

### Edge Function Architecture

* Decide final list of Edge Functions (`compute-difficulty`, `process-reading`, etc.)
* Decide naming conventions and versioning strategy for functions
* Decide whether to orchestrate multi-step processing via a single "pipeline" function or DB-driven stages

### Authentication & Authorization

* Decide how to restrict Edge Functions to **internal-only** usage (DB triggers, not clients)
* Choose custom authorization approach (e.g. shared secret header vs signed payload)
* Define where secrets live and how they are rotated
* Decide when (if ever) `verify_jwt = true` should be re-enabled

### Keys & Secrets Management

* Decide which secrets are required per function (service role key, internal webhook secret, external API keys)
* Standardize naming for Supabase secrets (`INTERNAL_*`, `SERVICE_*`, etc.)
* Document which keys are safe for clients vs server-only
* Decide whether to use different secrets for dev / prod

### External Python Functions
* Calling external Python libraries: Supabase Edge Functions run in a Deno runtime and cannot directly execute Python. If a function requires a python library, those computations will need to live behind a separate service (e.g., AWS Lambda, Cloud Run, or a lightweight Python API) that Edge Functions invoke over HTTP.
* Security and integration model: This external service would expose a private API endpoint and be protected via a shared secret, API key, or signed request (e.g., HMAC). Secrets would be stored as Supabase project secrets and injected into Edge Functions at runtime. No user credentials would be forwarded directly; the Edge Function acts as a trusted intermediary between Supabase triggers and the Python service.

### Database Triggers & Workflow

* Design DB trigger(s) that invoke Edge Functions (likely via `pg_net`)
* Decide trigger conditions (on insert, on status change, manual enqueue table, etc.)
* Decide how failures are recorded and retried

### Reading Processing Pipeline

* Define how readings move through processing stages (difficulty → tokenization → definitions, etc.)
* Decide which steps are synchronous vs asynchronous
* Decide where intermediate results are stored (tables vs JSON columns vs derived tables)

### Testing & Observability

* Decide minimal logging standard for Edge Functions
* Decide how to inspect failures (Supabase logs vs DB audit tables)
* Add lightweight test payloads / fixtures for Postman testing

### Local vs Remote Development

* Decide if / when local Supabase (`supabase start`) becomes part of the workflow
* Document optional Docker-based local testing for advanced use cases
* Decide if a staging Supabase project is ever needed

---

## Summary

* This workflow is **only** for Edge Functions.
* No `supabase start`
* No local DB
* No Docker required
* Project targeting is controlled via `supabase link`
* ⚠️ If local testing with full Supabase integration (tables, triggers, storage) is ever needed, we can use `supabase start` with Docker, but this is intentionally avoided for now to reduce OS and version compatibility issues.
