#!/usr/bin/env node
/**
 * Applique les migrations de supabase/migrations/ au projet Supabase distant,
 * via l'API Management (même suivi que la CLI : supabase_migrations.schema_migrations).
 *
 *   SUPABASE_ACCESS_TOKEN=sbp_... node scripts/apply-migrations.mjs          (applique)
 *   SUPABASE_ACCESS_TOKEN=sbp_... node scripts/apply-migrations.mjs --status (liste)
 *
 * Le jeton personnel n'est jamais stocké dans le projet. Alternative : coller chaque
 * fichier, dans l'ordre, dans Supabase > SQL Editor (ou via le MCP d'Antigravity).
 */
import { readdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const REF = process.env.SUPABASE_PROJECT_REF || "nuhsjznwbaiibnqfwuvv";
// Jeton : variable d'environnement, sinon celui du serveur MCP Supabase d'Antigravity (poste local).
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN || (() => {
  try {
    const f = join(homedir(), ".gemini", "config", "mcp_config.json");
    return JSON.parse(readFileSync(f, "utf8")).mcpServers?.supabase?.env?.SUPABASE_ACCESS_TOKEN;
  } catch {
    return undefined;
  }
})();
if (!TOKEN) {
  console.error("SUPABASE_ACCESS_TOKEN manquant (jeton personnel sbp_...).");
  process.exit(1);
}

async function sql(query) {
  const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(body.message || JSON.stringify(body));
  return body;
}

await sql(`create schema if not exists supabase_migrations;
create table if not exists supabase_migrations.schema_migrations (version text primary key, statements text[], name text);`);
const done = new Set((await sql("select version from supabase_migrations.schema_migrations")).map((r) => r.version));
const dir = join(ROOT, "supabase", "migrations");
const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();

for (const f of files) {
  const [version, ...rest] = f.replace(/\.sql$/, "").split("_");
  const name = rest.join("_");
  if (done.has(version)) {
    console.log(`  déjà appliquée  ${f}`);
    continue;
  }
  if (process.argv.includes("--status")) {
    console.log(`  EN ATTENTE      ${f}`);
    continue;
  }
  const body = readFileSync(join(dir, f), "utf8");
  // Tout ou rien : la migration et son enregistrement dans une seule transaction.
  const tag = "$izi$";
  await sql(`begin;\n${body}\ninsert into supabase_migrations.schema_migrations (version, name, statements) values ('${version}', '${name}', array[${tag}${body}${tag}]);\ncommit;`);
  console.log(`✓ appliquée       ${f}`);
}
