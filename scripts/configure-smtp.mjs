#!/usr/bin/env node
/**
 * Branche un service d'envoi (SMTP) sur l'authentification Supabase, installe les e-mails
 * en français (supabase/templates/*.html) et relève la limite d'envoi.
 *
 *   SUPABASE_ACCESS_TOKEN=sbp_... node scripts/configure-smtp.mjs
 *   SUPABASE_ACCESS_TOKEN=sbp_... node scripts/configure-smtp.mjs --test vous@exemple.com
 *
 * Identifiants SMTP lus dans un fichier HORS du projet (jamais versionné) :
 *   %USERPROFILE%\.izifacture\smtp.json   (ou chemin passé via SMTP_CONFIG=...)
 * Format : { "host", "port", "user", "pass", "senderEmail", "senderName", "emailsPerHour" }
 */
import { existsSync, readFileSync } from "node:fs";
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
const CONFIG = process.env.SMTP_CONFIG || join(homedir(), ".izifacture", "smtp.json");
const fail = (msg) => {
  console.error(`✗ ${msg}`);
  process.exit(1);
};

if (!TOKEN) fail("SUPABASE_ACCESS_TOKEN manquant (jeton personnel sbp_...).");
if (!existsSync(CONFIG)) fail(`Fichier introuvable : ${CONFIG}`);

let cfg;
try {
  cfg = JSON.parse(readFileSync(CONFIG, "utf8"));
} catch (e) {
  fail(`${CONFIG} n'est pas un JSON valide : ${e.message}`);
}

// Vérifications avant d'envoyer quoi que ce soit à Supabase.
const missing = ["host", "port", "user", "pass", "senderEmail", "senderName"].filter((k) => !cfg[k] || /À_REMPLIR/i.test(String(cfg[k])));
if (missing.length) fail(`Champs à remplir dans ${CONFIG} : ${missing.join(", ")}`);
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cfg.senderEmail)) fail("senderEmail n'est pas une adresse e-mail valide.");

const tpl = (name) => readFileSync(join(ROOT, "supabase", "templates", `${name}.html`), "utf8");
const body = {
  smtp_host: cfg.host,
  smtp_port: String(cfg.port),
  smtp_user: cfg.user,
  smtp_pass: cfg.pass,
  smtp_admin_email: cfg.senderEmail,
  smtp_sender_name: cfg.senderName,
  smtp_max_frequency: 30, // secondes minimum entre deux e-mails au même destinataire
  rate_limit_email_sent: Number(cfg.emailsPerHour) || 60,
  mailer_subjects_confirmation: "Confirmez votre compte Izifacture",
  mailer_templates_confirmation_content: tpl("confirmation"),
  mailer_subjects_recovery: "Réinitialisez votre mot de passe Izifacture",
  mailer_templates_recovery_content: tpl("recovery"),
  mailer_subjects_email_change: "Confirmez votre nouvelle adresse e-mail",
  mailer_templates_email_change_content: tpl("email_change"),
};

const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/config/auth`, {
  method: "PATCH",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
const out = await res.json().catch(() => ({}));
if (!res.ok) fail(`Supabase a refusé la configuration (${res.status}) : ${out.message || JSON.stringify(out)}`);

console.log(`✓ SMTP configuré : ${out.smtp_host}:${out.smtp_port}, expéditeur « ${out.smtp_sender_name} » <${out.smtp_admin_email}>`);
console.log(`✓ Limite : ${out.rate_limit_email_sent} e-mails / heure`);
console.log(`✓ E-mails en français : « ${out.mailer_subjects_confirmation} », « ${out.mailer_subjects_recovery} »`);

// Test réel : e-mail « mot de passe oublié » envoyé par le nouveau SMTP.
const testIdx = process.argv.indexOf("--test");
if (testIdx > -1) {
  const to = process.argv[testIdx + 1];
  if (!to) fail("Indiquez l'adresse de test après --test.");
  const env = Object.fromEntries(
    readFileSync(join(ROOT, ".env.local"), "utf8")
      .split("\n")
      .filter((l) => l.includes("=") && !l.startsWith("#"))
      .map((l) => l.split(/=(.*)/s).slice(0, 2).map((s) => s.trim()))
  );
  const r = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/recover?redirect_to=${encodeURIComponent("http://localhost:3000/auth/session?next=/reinitialiser")}`, {
    method: "POST",
    headers: { apikey: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email: to }),
  });
  const t = await r.json().catch(() => ({}));
  if (r.ok) console.log(`✓ E-mail de test envoyé à ${to} (vérifiez aussi les indésirables).`);
  else fail(`Échec de l'e-mail de test (${r.status}) : ${t.msg || t.message || JSON.stringify(t)} — vérifiez l'identifiant, la clé SMTP et que l'expéditeur est validé chez le fournisseur.`);
}
