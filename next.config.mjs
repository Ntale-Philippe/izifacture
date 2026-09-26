/** @type {import('next').NextConfig} */
const nextConfig = {
  // `npm run dev` utilise .next ; les builds de vérification (`npm run build:check`) écrivent
  // dans un dossier séparé pour ne jamais écraser les fichiers d'un serveur de dev en cours.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
