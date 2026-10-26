import {readFileSync} from "node:fs";
import assert from "node:assert/strict";
// Deployment fail-closed: never use this repository to update Spenva or FinChat.
const config=JSON.parse(readFileSync(new URL("../wrangler.jsonc",import.meta.url),"utf8"));
assert.equal(config.name,"marketing-turism-agent","Deployment Worker target changed: refusing");
assert.equal(config.main,"src/worker.mjs","Worker entry has changed unexpectedly");
assert.equal(config.keep_vars,true,"Preserve existing dashboard Meta, WhatsApp and other production variables on Wrangler deploy");
assert.equal(config.d1_databases?.length,1,"Expected dedicated tourism D1 only");
assert.equal(config.d1_databases[0].binding,"DB","Database binding mismatched");
assert.equal(config.d1_databases[0].database_name,"marketing-turism-db","Database target changed: refusing");
assert.equal(config.d1_databases[0].database_id,"d2409026-8e01-43b0-8e4c-8fa0617f45dc","Database ID changed: refusing");
assert.deepEqual(config.triggers?.crons,["0 1 * * 1","0 2 * * *","0 * * * *"],"Tourism campaign schedule changed unexpectedly");
if((config.routes||[]).length || config.route)throw Error("Custom routes are forbidden here; protect existing FinChat/Spenva domains");
if((config.workers_dev??true)===false)throw Error("Tourism pilot must retain its isolated workers.dev origin");
console.log("Marketing Turism deployment target isolation verified.");

assert.equal(config.vars?.META_APPROVED_AUTOPOST_ENABLED,"true","Approval-only automated publishing configuration changed");
assert.ok(config.vars?.META_EXTERNAL_POST_DATES?.includes("2026-10-30"),"Preserve existing Metricool scheduled dates as no-post buffer");

assert.equal(config.vars?.GROWTH_PUBLIC_RESEARCH_ENABLED,"true","Daily acquisition research flag must remain explicit; no new Free-plan cron");
