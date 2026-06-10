# Guide — Activer WhatsApp Cloud API sur EduNiger

## Étape 1 — Créer le compte Meta Developer

1. Aller sur **https://developers.facebook.com**
2. Se connecter avec un compte Facebook
3. Cliquer **"Mes applications"** → **"Créer une application"**
4. Choisir le type : **"Business"**
5. Donner un nom : `EduNiger`
6. Dans le tableau de bord de l'app, cliquer **"Ajouter un produit"** → **"WhatsApp"**

---

## Étape 2 — Récupérer les identifiants

Dans **WhatsApp → Configuration** :

| Champ | Où le trouver | Copier dans .env |
|---|---|---|
| Phone Number ID | Section "Numéros de téléphone" | `WHATSAPP_PHONE_ID` |
| Access Token | Section "Jetons d'accès" (token temporaire ou permanent) | `WHATSAPP_TOKEN` |

> ⚠️ Le token temporaire expire après 24h. Pour la production, créer un **token permanent** via Meta Business Manager.

---

## Étape 3 — Créer les 3 Templates

Aller dans **WhatsApp → Gestionnaire de modèles** → **"Créer un modèle"**

### Template 1 : `eduniger_bulletin`

| Champ | Valeur |
|---|---|
| Nom | `eduniger_bulletin` |
| Catégorie | **Utility** (Utilitaire) |
| Langue | **Français** |

**Corps du message :**
```
Le bulletin de *{{1}}* pour le *{{2}}* est maintenant disponible.

📊 Moyenne générale : *{{3}}* — {{4}}

Connectez-vous sur l'espace parent EduNiger pour consulter et télécharger le bulletin PDF.
```

**Exemple de valeurs (obligatoire pour la soumission) :**
- `{{1}}` → `Amina Diallo`
- `{{2}}` → `Trimestre 1`
- `{{3}}` → `14.50/20`
- `{{4}}` → `Bien`

---

### Template 2 : `eduniger_notes`

| Champ | Valeur |
|---|---|
| Nom | `eduniger_notes` |
| Catégorie | **Utility** |
| Langue | **Français** |

**Corps du message :**
```
Les notes du *{{1}}* de *{{2}}* sont disponibles ({{3}}).

Connectez-vous sur l'espace parent EduNiger pour les consulter.
```

**Exemple de valeurs :**
- `{{1}}` → `Trimestre 1`
- `{{2}}` → `Amina Diallo`
- `{{3}}` → `8 matières`

---

### Template 3 : `eduniger_retard`

| Champ | Valeur |
|---|---|
| Nom | `eduniger_retard` |
| Catégorie | **Utility** |
| Langue | **Français** |

**Corps du message :**
```
⚠️ *{{1}}* a été marqué(e) en retard{{2}} le {{3}}{{4}}.

Pour toute question, contactez l'administration de l'école.
```

**Exemple de valeurs :**
- `{{1}}` → `Amina Diallo`
- `{{2}}` → ` en Mathématiques` (ou vide si pas de matière)
- `{{3}}` → `10/06/2026`
- `{{4}}` → ` (08h-09h)` (ou vide si pas de créneau)

---

## Étape 4 — Attendre l'approbation

Meta examine les templates sous **24 à 48 heures**.
Le statut passe de `En attente` à `Approuvé` dans le Gestionnaire de modèles.

---

## Étape 5 — Remplir le .env

```env
WHATSAPP_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxx
WHATSAPP_PHONE_ID=123456789012345

WHATSAPP_TEMPLATE_BULLETIN=eduniger_bulletin
WHATSAPP_TEMPLATE_NOTES=eduniger_notes
WHATSAPP_TEMPLATE_RETARD=eduniger_retard
```

Redémarrer le serveur : `npm start`

---

## Test rapide (optionnel)

Depuis le terminal du serveur :

```bash
curl -X POST http://localhost:3000/api/sms/bulletin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token_admin>" \
  -d '{"eleve_id": 1, "periode": "Trimestre 1"}'
```

La réponse doit contenir `"envoye": true` et `"canal": "whatsapp"`.

---

## Tarifs (rappel)

| Volume mensuel | Prix par message (Niger) |
|---|---|
| 0 – 1 000 | **Gratuit** |
| 1 001 et plus | ~**0,01 $** (~6 FCFA) |

Pour une école de 200 élèves, le coût annuel total est généralement **inférieur à 5 $**.
