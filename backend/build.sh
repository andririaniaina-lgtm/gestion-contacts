#!/usr/bin/env bash
set -o errexit

# 1. Installer les dépendances Python
pip install -r requirements.txt

# 2. Compiler le frontend React
cd ../frontend
npm install
npm run build
cd ../backend

# 3. Collecter les fichiers statiques Django
python manage.py collectstatic --no-input

# 4. Appliquer les migrations
python manage.py migrate