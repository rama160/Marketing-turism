# WhatsApp Business Platform integration — Nusa Penida Experiences

**Current release: v3.5.0 (prepared, fail-closed).** Website direct chat and public catalog links are already available for `+62 856-1752-525`. The customer-facing chat opens `https://wa.me/628561752525`; the catalog opens `https://wa.me/c/628561752525`.

## 1. What works without any Meta connection
- Homepage contact section, photo/package detail pages and mobile floating WhatsApp link open a real customer chat in WhatsApp Business.
- Owner login → **WhatsApp** lets the owner copy safe Indonesian/English reply templates; no read/write access to the WhatsApp phone app is claimed.
- An isolated Cloudflare D1 inbox and human-approved send adapter are included but **disabled by default**. The owner dashboard describes the connection status. No message is read, synced, sent or stored until official Meta onboarding and configuration.

## 2. Official account connection — owner action required
To manage the same WhatsApp Business App number via the official Cloud API, check whether **WhatsApp Business App coexistence** is available for your number and provider. This can allow the phone app and Cloud API to operate together, but availability and behavior must be verified during Meta's supported Embedded Signup process. Do **not** use a standard number migration that deregisters your working mobile account without understanding its consequences.

1. Open Meta Business Suite / Meta for Developers and sign in as the authorized business owner. Prepare your Meta business portfolio, WhatsApp Business Account and app/partner-approved coexistence onboarding.
2. Follow the **official WhatsApp Business Platform Cloud API** setup and authorize the existing Nusa Penida Experiences number, where coexistence is available. Record its **Phone Number ID** (a Meta identifier, **not** the human-readable telephone number).
3. In Meta's webhook configuration set the callback URL:
   `https://marketing-turism-agent.finchat-ai-gateway.workers.dev/api/webhooks/whatsapp`
   and subscribe to the **messages** field for the corresponding WABA. Meta sends a GET verification challenge and POST webhook events with signed payloads.
4. In **Cloudflare dashboard → Workers & Pages → marketing-turism-agent → Settings → Variables and Secrets**, add the following to **this Worker only** (no GitHub commits, no sharing secrets in chats):
   
   | Binding | Type | Purpose |
   | --- | --- | --- |
   | `WA_APP_SECRET` | Secret | Meta application's App Secret for verifying `X-Hub-Signature-256` |
   | `WA_VERIFY_TOKEN` | Secret | Random 24+ character challenge token, same value configured in Meta |
   | `WA_PHONE_NUMBER_ID` | Text | Meta Phone Number ID |
   | `WA_WEBHOOK_ENABLED` | Text | `true` to allow signed incoming messages after privacy review |
   | `WA_ACCESS_TOKEN` | Secret | Authorized long-lived system-user token with required WhatsApp messaging permissions |
   | `WA_SEND_ENABLED` | Text | Keep `false` until the owner explicitly approves production sending; then change to `true` |
   | `WA_GRAPH_VERSION` | Text (optional) | Default `v25.0`; update after checking Meta's current supported version |

   The webhook is rejected with 503 unless the expected bindings are present. HTTP body signatures are verified before parsing or storing.
5. Confirm the required Meta application permissions such as `whatsapp_business_messaging`; configure `whatsapp_business_management` if your onboarding/subscription process needs it. Avoid using temporary tokens for production.
6. After completing Meta onboarding, test with an authorized test number. Send a single inbound enquiry to `+62 856-1752-525`; in owner dashboard → WhatsApp, choose **Muat Percakapan** and verify the real message appears. No visitor message on the public website is scraped. Inspect the signed webhook and database for one record only; retries must not duplicate messages.
7. Choose a guest conversation and click **Buat Draf AI**, agreeing to process the most recent text with Workers AI. Review the proposed reply. Outgoing messages require the owner to press **Kirim Setelah Saya Setujui** and approve the confirmation dialogue. The server checks the latest incoming message is within approximately 24 hours, applies a 6-message/recipient/hour and 50-message/day limit, and prevents duplicate send requests. There are **no background autoresponders** and **no unsolicited promotional campaigns**.

## 3. Data, cost, safety and launch gates
- Incoming text and telephone numbers are guest personal data, written only to dedicated `marketing-turism-db` after the official webhook has authenticated the Meta signature and matched the configured Phone Number ID.
- Owner-only admin bearer authentication protects inbox reading, draft generation and sends. Individual guest text shown in the dashboard is HTML-escaped. The database also stores an idempotent outbox request ID; network errors do not trigger automatic retry.
- **Cloudflare Workers AI** is optional and invoked only after owner approval; it creates drafts for review, not outgoing messages.
- Meta Cloud API messaging, especially template/outbound messaging, may incur charges depending on category, country and current Meta prices. The integration deliberately does not support marketing broadcasts or templates outside the 24-hour customer service window. No claim of permanently free messaging.
- Complete the privacy notice and decide lawful retention/deletion operations **before switching `WA_WEBHOOK_ENABLED` to `true`**. Do not request guest passwords, OTP, government IDs or payment information through chat.
- `PUBLIC_LEADS_ENABLED` stays `false` independently. Connecting WhatsApp does not automatically activate the booking intake form, confirm any tour, move money, or approve an operator.
- Existing `ADMIN_TOKEN`, D1, AI, photo KV, Turnstile and rate salt bindings must all remain unchanged. Do not modify FinChat/Spenva Workers.
- Additive migration `database/migrations/0010_whatsapp_inbox.sql` is idempotent. **Never bulk-replay legacy migrations** without verifying D1 history.

## 4. Owner operational checklist
- Confirm your WhatsApp Business App remains usable on the phone before enabling coexistence.
- Confirm business ownership, live token permissions, webhook verification, signature check, input validation and thread privacy.
- Review every AI proposal, real guest date, operator availability, inclusion, selling price, trip weather and mandatory disclosures.
- Maintain a written retention policy and owner procedure for guest access/deletion and incident handling. If the backend is not connected, continue manually in the WhatsApp Business App with copied draft replies.

Official references:
- Meta Cloud API overview: https://developers.facebook.com/docs/whatsapp/cloud-api/overview
- Official Meta Postman documentation: https://www.postman.com/meta/whatsapp-business-platform/collection/wlk6lh4/whatsapp-cloud-api
