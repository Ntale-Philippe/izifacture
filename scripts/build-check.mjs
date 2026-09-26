#!/usr/bin/env node
// Build de vérification sans risque : écrit dans .next-check, jamais dans .next
// (le dossier utilisé par `npm run dev`). Lancer : npm run build:check
import { spawnSync } from "node:child_process";

const env = { ...process.env, NEXT_DIST_DIR: ".next-check" };
const run = (cmd, args) => spawnSync(cmd, args, { stdio: "inherit", env, shell: process.platform === "win32" });

let r = run("node", ["scripts/check-design.mjs"]);
if (r.status !== 0) process.exit(r.status ?? 1);
r = run("npx", ["next", "build"]);
process.exit(r.status ?? 1);
