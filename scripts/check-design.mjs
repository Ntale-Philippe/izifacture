#!/usr/bin/env node
/**
 * Garde-fou du design system Izifacture.
 * Lancé automatiquement avant chaque `npm run build` (et via `npm run check:design`).
 * Chaque règle renvoie à une section de DESIGN_SYSTEM.md.
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative, sep, dirname, resolve, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";

// Racine du projet = dossier parent de scripts/, quel que soit le répertoire courant.
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// Mode hook Claude Code : lit l'événement JSON sur stdin, ne contrôle que le fichier modifié,
// et sort en code 2 pour que les violations soient renvoyées à Claude.
const HOOK = process.argv.includes("--hook");
const DIRS = ["app", "components", "lib"];
const EXT = /\.(tsx?|jsx?)$/;

/** @type {{ id: string, section: string, pattern: RegExp, message: string, allow?: string[] }[]} */
const RULES = [
  {
    id: "no-hex",
    section: "§2 Couleurs",
    pattern: /#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b(?![0-9a-fA-F])/g,
    message: "Couleur hexadécimale en dur. Utiliser un token Tailwind (bg-accent…) ou `colors.*` de lib/tokens.ts.",
    allow: ["lib/tokens.ts"],
  },
  {
    id: "no-tailwind-palette",
    section: "§2 Couleurs",
    pattern: /\b(?:bg|text|border|ring|from|to|via|fill|stroke|divide|outline|decoration|shadow)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/g,
    message: "Palette Tailwind par défaut interdite. Utiliser les tokens : ink, muted, line, accent, success, warning, danger…",
  },
  {
    id: "radius",
    section: "§5 Rayons",
    pattern: /\brounded(?:-(?:t|r|b|l|tl|tr|bl|br|s|e))?(?:-(?:sm|md|3xl))?(?=["'`\s}])/g,
    message: "Rayon hors système. Autorisés : rounded-lg (≤36px), rounded-xl (contrôles), rounded-2xl (conteneurs), rounded-full.",
  },
  {
    id: "shadow",
    section: "§6 Élévation",
    pattern: /\bshadow-(?:sm|md|lg|xl|2xl|inner|\[)|\bshadow(?=["'`\s}])/g,
    message: "Ombre hors système. Autorisées : shadow-warm-sm / shadow-warm-md / shadow-warm-lg / shadow-none.",
  },
  {
    id: "text-size",
    section: "§3 Typographie",
    pattern: /\btext-\[\d+(?:\.\d+)?(?:px|rem)\]/g,
    message: "Taille de texte arbitraire. Utiliser l'échelle (text-xs = 12px minimum … text-4xl).",
  },
  {
    id: "font-family",
    section: "§3 Typographie",
    pattern: /\bfont-\[|fontFamily\s*:/g,
    message: "Police arbitraire. Seulement font-display, font-sans, font-mono.",
  },
  {
    id: "spinner",
    section: "§9 États",
    pattern: /\banimate-spin\b/g,
    message: "Spinner interdit pour le chargement de contenu : utiliser <Skeleton> à la forme du contenu.",
    allow: ["components/ui/Button.tsx"],
  },
  {
    id: "native-dialog",
    section: "§9 États",
    pattern: /\b(?:window\.)?(?:alert|confirm|prompt)\(/g,
    message: "Boîte native interdite. Utiliser <Modal> (confirmation) ou useToast() (feedback).",
  },
  {
    id: "money-format",
    section: "§10 Contenu",
    pattern: /\.toLocaleString\(|Intl\.NumberFormat\(/g,
    message: "Formatage de montant ad hoc. Utiliser formatFCFA() / formatNumber() de lib/format.ts ou <CountUp>.",
    allow: ["lib/format.ts"],
  },
  {
    id: "icon-lib",
    section: "§8 Iconographie",
    pattern: /from\s+["'](?:react-icons|@heroicons|@fortawesome|react-feather)[^"']*["']/g,
    message: "Seule la bibliothèque lucide-react est autorisée.",
  },
];

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else if (EXT.test(name)) out.push(p);
  }
  return out;
}

function hookTarget() {
  try {
    const event = JSON.parse(readFileSync(0, "utf8") || "{}");
    const p = event.tool_input?.file_path ?? event.tool_response?.filePath;
    if (!p) return null;
    const abs = isAbsolute(p) ? p : resolve(ROOT, p);
    const rel = relative(ROOT, abs).split(sep).join("/");
    const inScope = DIRS.some((d) => rel.startsWith(d + "/")) && EXT.test(rel) && existsSync(abs);
    return inScope ? abs : null;
  } catch {
    return null;
  }
}

let files;
if (HOOK) {
  const target = hookTarget();
  if (!target) process.exit(0); // fichier hors périmètre (doc, config…) : rien à contrôler
  files = [target];
} else {
  files = DIRS.flatMap((d) => {
    try {
      return walk(join(ROOT, d));
    } catch {
      return [];
    }
  });
}

const violations = [];
for (const file of files) {
  const rel = relative(ROOT, file).split(sep).join("/");
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  lines.forEach((line, i) => {
    // Échappatoire explicite et justifiée : // design-ok: <raison>
    if (line.includes("design-ok:") || lines[i - 1]?.includes("design-ok:")) return;
    for (const rule of RULES) {
      if (rule.allow?.includes(rel)) continue;
      rule.pattern.lastIndex = 0;
      const m = rule.pattern.exec(line);
      if (m) violations.push({ rel, line: i + 1, rule, match: m[0] });
    }
  });
}

if (violations.length === 0) {
  if (!HOOK) console.log(`✓ Design system : ${files.length} fichiers conformes.`);
  process.exit(0);
}

console.error(`\n✗ Design system : ${violations.length} violation(s)\n`);
for (const v of violations) {
  console.error(`  ${v.rel}:${v.line}  [${v.rule.id}] « ${v.match} »`);
  console.error(`    → ${v.rule.message} (DESIGN_SYSTEM.md ${v.rule.section})\n`);
}
if (HOOK) console.error("Corrigez ces violations avant de continuer (voir DESIGN_SYSTEM.md).");
process.exit(HOOK ? 2 : 1);
