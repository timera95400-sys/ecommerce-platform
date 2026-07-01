# Guide Administrateur — Gestion de votre boutique

Ce guide vous explique comment utiliser votre espace d'administration pour gérer votre boutique en toute autonomie.

---

## 1. Se connecter à l'espace admin

1. Ouvrez votre navigateur et accédez à : `https://admin.votredomaine.com/admin`
2. Entrez votre **email** et votre **mot de passe** fournis par votre agence
3. Cliquez sur **Connexion**

Si vous oubliez votre mot de passe, cliquez sur "Mot de passe oublié" sur la page de connexion. Un lien valable 1 heure vous sera envoyé par email.

> La session expire après 8 heures d'inactivité. Reconnectez-vous si nécessaire.

---

## 2. Ajouter / modifier / supprimer un produit

### Ajouter un produit

1. Dans le menu gauche, cliquez sur **Produits** (groupe "Catalogue")
2. Cliquez sur le bouton **Créer un produit** en haut à droite
3. Remplissez les champs :
   - **Nom du produit** : nom complet, tel qu'il apparaîtra sur la boutique
   - **Description** : décrivez le produit (éditeur de texte riche)
   - **Prix de vente** : prix affiché en EUR
   - **Prix barré** (optionnel) : ancien prix, affiché barré à côté du prix actuel
   - **Catégorie** : sélectionnez dans la liste déroulante
   - **Badge** : Aucun / Nouveau / Promo / Bestseller
   - **Statut** : choisissez "Publié" pour que le produit soit visible sur la boutique
4. Cliquez sur **Sauvegarder**

### Modifier un produit

1. Dans la liste des produits, cliquez sur le produit à modifier
2. Changez les champs souhaités
3. Cliquez sur **Sauvegarder**

### Supprimer un produit

1. Ouvrez le produit
2. Cliquez sur les trois points en haut à droite
3. Choisissez **Supprimer**

> Attention : supprimer un produit est irréversible. Préférez le statut "Archivé" pour masquer un produit sans le supprimer.

---

## 3. Gérer les stocks et les variantes

### Produit sans variantes (stock simple)

1. Ouvrez le produit
2. Allez dans l'onglet **Variantes & Stock**
3. Modifiez le champ **Stock total**
4. Sauvegardez

### Produit avec variantes (taille, couleur, etc.)

1. Ouvrez le produit > onglet **Variantes & Stock**
2. Dans la section "Variantes", cliquez sur **Ajouter une variante**
3. Donnez un nom à la variante (ex : "Taille")
4. Ajoutez les options avec leur stock respectif :
   - Label : "S" — Stock : 10
   - Label : "M" — Stock : 5
   - Label : "L" — Stock : 0 (affichera "Rupture" pour cette option)
5. Sauvegardez

> Quand une option est à 0, elle est automatiquement grisée et non commandable sur la boutique.

---

## 4. Changer les prix

1. Ouvrez le produit concerné
2. Onglet **Informations**
3. Modifiez le **Prix de vente**
4. Pour afficher un prix barré, remplissez également **Prix barré/original**
5. Sauvegardez

Le nouveau prix est immédiatement visible sur la boutique.

---

## 5. Uploader et remplacer ses images/visuels

### Ajouter des images à un produit

1. Ouvrez le produit > onglet **Images**
2. Cliquez sur **Ajouter une image**
3. Cliquez sur l'image pour uploader depuis votre ordinateur
4. Ajoutez un texte alternatif (description courte de l'image pour le SEO)
5. Glissez-déposez les images pour les réordonner (la première = image principale)
6. Sauvegardez

### Remplacer une image

1. Cliquez sur l'image existante dans la liste
2. Cliquez sur le bouton de suppression de l'image actuelle
3. Ajoutez la nouvelle image
4. Sauvegardez

### Gérer la galerie de médias

Dans le menu gauche, cliquez sur **Medias** pour accéder à toutes vos images. Vous pouvez y uploader des images et les réutiliser dans vos produits, catégories et pages.

---

## 6. Créer un code promo

1. Dans le menu gauche, cliquez sur **Codes Promo** (groupe "Ventes")
2. Cliquez sur **Créer un code promo**
3. Remplissez :
   - **Code** : tapez le code (ex : SOLDES20). Il sera automatiquement en majuscules.
   - **Type de réduction** : Pourcentage (%) ou Montant fixe (EUR)
   - **Valeur** : ex: 20 pour 20% ou 20 EUR
   - **Montant minimum** (optionnel) : montant minimum de commande pour l'activer
   - **Date d'expiration** (optionnel) : date après laquelle le code ne fonctionnera plus
   - **Nombre max d'utilisations** (optionnel) : ex: 100 pour limiter l'usage
   - **Code actif** : cochez pour activer
4. Sauvegardez

Pour désactiver un code sans le supprimer : ouvrez-le et décochez "Code actif".

---

## 7. Traiter une commande

### Voir les commandes

Dans le menu gauche, cliquez sur **Commandes** (groupe "Ventes"). Vous voyez la liste avec le numéro, le statut, le montant et la date.

### Changer le statut d'une commande

1. Cliquez sur la commande
2. Dans le champ **Statut**, choisissez le nouveau statut :
   - En attente → Confirmée → En préparation → Expédiée → Livrée
3. Sauvegardez

> Le client reçoit automatiquement un email à chaque changement de statut.

### Ajouter un numéro de suivi

1. Ouvrez la commande
2. Remplissez le champ **Numéro de suivi (transporteur)**
3. Passez le statut à "Expédiée"
4. Sauvegardez

Le client reçoit un email avec le numéro de suivi.

### Ajouter une note interne

Le champ **Notes internes** est visible uniquement par vous dans l'admin. Le client ne le voit jamais.

---

## 8. Modifier le texte et les images du site

### Modifier le hero (section d'accueil)

1. Dans le menu gauche, cliquez sur **Configuration du site** (groupe "Paramètres")
2. Allez dans l'onglet **Accueil**
3. Modifiez :
   - **Image hero** : l'image de fond grande
   - **Titre hero** : le grand titre
   - **Sous-titre hero**
   - **Texte du bouton** et **lien du bouton**
   - **Bandeau promotionnel** : activez/désactivez et modifiez le texte
4. Sauvegardez

Les changements sont visibles immédiatement sur la boutique.

### Modifier une page statique (CGV, À propos, Contact...)

1. Dans le menu gauche, cliquez sur **Pages** (groupe "Contenu")
2. Choisissez la page à modifier
3. Éditez le contenu avec l'éditeur de texte
4. Sauvegardez

---

## 9. Changer le logo et les couleurs

1. Cliquez sur **Configuration du site**
2. Onglet **Identite** :
   - **Logo** : uploadez votre nouveau logo (PNG ou SVG recommandé)
   - **Favicon** : uploadez votre icône navigateur (ICO ou PNG 32x32)
3. Onglet **Apparence** :
   - **Couleur principale** : entrez le code hex de votre couleur (ex: #e63946)
   - **Couleur secondaire** : couleur d'accentuation
   - **Police de caractères** : choisissez parmi la liste
4. Sauvegardez

> La couleur principale est appliquée à tous les boutons, liens actifs et badges. Un seul champ suffit.

---

## 10. Ajouter une page (CGV, À propos, etc.)

1. Cliquez sur **Pages** > **Créer une page**
2. Remplissez :
   - **Titre** : ex. "Conditions Générales de Vente"
   - **Slug** : ex. "cgv" (l'URL sera `/pages/cgv`)
   - **Contenu** : rédigez votre texte avec l'éditeur
   - **Statut** : "Publiée" pour qu'elle soit visible
3. Sauvegardez

La page est immédiatement accessible sur `https://votredomaine.com/pages/cgv`.

Pour l'ajouter dans le menu du footer, contactez votre agence ou ajoutez le lien manuellement dans la configuration (selon configuration).

---

## Récapitulatif des sections de l'admin

| Section | Ce que vous pouvez faire |
|---|---|
| **Produits** | Ajouter, modifier, publier/archiver des produits |
| **Categories** | Organiser les produits en rayons |
| **Commandes** | Voir, mettre à jour les statuts, ajouter un suivi |
| **Codes Promo** | Créer et gérer des réductions |
| **Pages** | Créer/modifier CGV, À propos, Contact, FAQ... |
| **Avis Clients** | Modérer les avis (approuver/refuser) |
| **Medias** | Gérer votre bibliothèque d'images |
| **Configuration du site** | Logo, couleurs, hero, livraison, paiements |

---

## Besoin d'aide ?

Contactez votre agence pour toute question technique. Pour les questions liées au contenu et à la gestion quotidienne, ce guide couvre l'essentiel.
