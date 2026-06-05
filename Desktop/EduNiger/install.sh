#!/bin/bash
# ============================================================
# EduNiger — Script d'installation automatique
# Usage : bash install.sh
# ============================================================

set -e

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✓ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠ $1${NC}"; }
err()  { echo -e "${RED}✗ $1${NC}"; exit 1; }

echo ""
echo "╔══════════════════════════════════════╗"
echo "║     📚  EduNiger — Installation      ║"
echo "║        Système de Gestion Scolaire   ║"
echo "╚══════════════════════════════════════╝"
echo ""

# Vérifications prérequis
command -v node >/dev/null 2>&1 || err "Node.js requis (https://nodejs.org)"
command -v npm  >/dev/null 2>&1 || err "npm requis"
command -v mysql >/dev/null 2>&1 && HAS_MYSQL=true || HAS_MYSQL=false

NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
[ "$NODE_VER" -ge 16 ] || err "Node.js 16+ requis (version actuelle: $(node -v))"
ok "Node.js $(node -v)"

# ── BACKEND ─────────────────────────────────────────────────
echo ""
echo "▸ Installation du backend..."
cd backend
npm install --silent
ok "Dépendances backend installées"

if [ ! -f .env ]; then
  cp .env.example .env
  warn "Fichier .env créé — modifiez vos paramètres DB et JWT_SECRET dans backend/.env"
else
  ok ".env existant conservé"
fi

mkdir -p uploads
ok "Dossier uploads/ créé"
cd ..

# ── FRONTEND ────────────────────────────────────────────────
echo ""
echo "▸ Installation du frontend..."
cd frontend
npm install --silent
ok "Dépendances frontend installées"

if [ ! -f .env ]; then
  cp .env.example .env
  ok "Fichier .env frontend créé"
fi

echo ""
echo "▸ Build de production..."
npm run build --silent
ok "Build frontend terminé → frontend/dist/"
cd ..

# ── BASE DE DONNÉES ─────────────────────────────────────────
echo ""
if [ "$HAS_MYSQL" = true ]; then
  echo "▸ Base de données MySQL détectée"
  read -p "  Voulez-vous importer le schéma ? (o/N) : " IMPORT_DB
  if [[ "$IMPORT_DB" =~ ^[Oo]$ ]]; then
    read -p "  Utilisateur MySQL [root] : " DB_USER
    DB_USER=${DB_USER:-root}
    mysql -u "$DB_USER" -p < database/schema.sql && ok "Schéma importé" || warn "Import échoué — importez manuellement: mysql -u root -p < database/schema.sql"
  fi
else
  warn "MySQL non trouvé — importez manuellement: mysql -u root -p < database/schema.sql"
fi

# ── RÉSUMÉ ──────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  ✅  Installation terminée !                         ║"
echo "╠══════════════════════════════════════════════════════╣"
echo "║                                                      ║"
echo "║  1. Configurez backend/.env avec vos paramètres DB   ║"
echo "║  2. Démarrez le backend : cd backend && npm start     ║"
echo "║  3. Dev frontend        : cd frontend && npm run dev  ║"
echo "║                                                      ║"
echo "║  Comptes de démo :                                   ║"
echo "║    Admin : admin@ecole.com / Admin123!               ║"
echo "║    Prof  : prof@ecole.com  / Prof123!                ║"
echo "║                                                      ║"
echo "║  ⚠ Changez les mots de passe en production !         ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
