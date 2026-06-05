#!/bin/bash

echo "=================================="
echo "🚀 Démarrage de l'application"
echo "=================================="
echo ""

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    echo "Téléchargez-le depuis https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Vérifier MySQL
if ! command -v mysql &> /dev/null; then
    echo "⚠️ MySQL n'est pas trouvé dans le PATH"
    echo "Assurez-vous que MySQL est installé et démarré"
fi

echo ""
echo "📦 Installation des dépendances..."
echo ""

# Backend
echo "Backend..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
fi

# Frontend
echo "Frontend..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    npm install
fi

cd ..

echo ""
echo "=================================="
echo "✅ Installation terminée !"
echo "=================================="
echo ""
echo "Pour démarrer l'application :"
echo ""
echo "1. Terminal 1 - Backend :"
echo "   cd backend && npm start"
echo ""
echo "2. Terminal 2 - Frontend :"
echo "   cd frontend && npm run dev"
echo ""
echo "3. Ouvrir http://localhost:5173"
echo ""
echo "Comptes de test :"
echo "  Admin: admin@ecole.com / Admin123!"
echo "  Prof: prof@ecole.com / Prof123!"
echo ""
