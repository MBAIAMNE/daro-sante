# Guide de Déploiement Gratuit sur Render (Render.com)

Ce guide vous explique pas à pas comment mettre en ligne votre application **DARÔ** sur Render gratuitement, avec votre base de données Cloud Firestore connectée.

---

## 🚀 Étape 1 : Mettre votre code sur GitHub ou GitLab

1. Si ce n'est pas déjà fait, créez un compte sur [GitHub.com](https://github.com).
2. Créez un nouveau dépôt (Repository), par exemple `daro-sante` (en Public ou Privé).
3. Poussez l'ensemble des fichiers du projet sur ce dépôt.
   *(Le fichier `firebase-applet-config.json` et le fichier `render.yaml` sont déjà configurés pour fonctionner directement).*

---

## 🚀 Étape 2 : Créer votre compte sur Render

1. Allez sur **[https://render.com](https://render.com)**.
2. Cliquez sur **Sign Up** et connectez-vous avec votre compte **GitHub** (c'est le plus simple pour lier vos projets en 1 clic).

---

## 🚀 Étape 3 : Créer le Web Service sur Render

1. Dans le tableau de bord Render, cliquez sur le bouton **New +** (en haut à droite) puis sélectionnez **Web Service**.
2. Choisissez votre dépôt GitHub `daro-sante` et cliquez sur **Connect**.
3. Remplissez les champs suivants (la plupart sont déjà pré-remplis grâce au fichier `render.yaml`) :
   - **Name** : `daro-sante` (ou le nom de votre choix)
   - **Region** : `Frankfurt (EU Central)` *(Idéal pour l'Afrique et l'Europe, faible latence)*
   - **Branch** : `main` (ou `master`)
   - **Root Directory** : *(laisser vide)*
   - **Runtime** : `Node`
   - **Build Command** : `npm install && npm run build`
   - **Start Command** : `npm run start`
   - **Instance Type** : `Free` (0 $ / mois)

---

## 🚀 Étape 4 : Variables d'Environnement (Optionnel mais recommandé)

Render configure automatiquement la variable `PORT`. 

Si vous souhaitez renseigner des clés personnalisées, rendez-vous dans l'onglet **Environment** de votre Web Service sur Render :
- `NODE_ENV` = `production`
- *(Optionnel)* `GEMINI_API_KEY` = *votre clé API Gemini si vous utilisez l'IA*

---

## 🚀 Étape 5 : Lancer le Déploiement

1. Cliquez sur **Create Web Service** (ou **Deploy**).
2. Render va automatiquement :
   - Installer les dépendances (`npm install`)
   - Compiler l'interface Vite React et le serveur Express (`npm run build`)
   - Démarrer le serveur sécurisé (`npm run start`)
3. Après 2 à 3 minutes, vous obtiendrez votre URL HTTPS sécurisée gratuite :
   `https://daro-sante-xxxx.onrender.com`

---

## 💡 Astuces & Bonnes Pratiques sur Render Gratuit

1. **Mise en veille automatique :** Sur le plan gratuit de Render, le serveur s'endort après 15 minutes d'inactivité. À la première visite, il met environ 30 secondes à se réveiller, puis fonctionne à pleine vitesse.
2. **Nom de domaine personnalisé :** Vous pouvez connecter gratuitement votre propre nom de domaine (ex: `app.daro-sante.td` ou `masante.td`) avec certificat SSL HTTPS automatique dans l'onglet **Settings > Custom Domains** de Render !
3. **Mises à jour automatiques :** À chaque fois que vous ferez un `git push` sur GitHub, Render redéploiera automatiquement votre application sans aucune coupure !
