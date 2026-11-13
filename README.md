# Biblio Al Omran — Inventaire produits

Application web responsive de gestion de produits en deux étapes :
une personne ajoute les **photos** et les informations, une autre complète les **prix**
et ajoute le nom s’il manque. Firestore synchronise le tout en temps réel.

- **React 19** + **Vite**
- **Bootstrap 5** + Bootstrap Icons
- **Firestore** (Firebase) comme BaaS
- **Aucune page d’authentification**

---

## 1. Démarrage rapide

Prérequis : **Node.js 20.19+** (ou 22.12+).

```bash
npm install
npm run dev
```

L’application démarre en **mode démo local** tant que Firebase n’est pas configuré :
les produits et les photos sont stockés dans le `localStorage` du navigateur.

Pour tester depuis un téléphone sur le même réseau :

```bash
npm run dev -- --host
```

> La caméra en direct (`getUserMedia`) nécessite **HTTPS ou localhost**.
> Sur une adresse IP locale en HTTP, utilisez le bouton « Appareil natif » / « Galerie »,
> qui ouvre directement l’appareil photo du téléphone.

---

## 2. Configurer Firestore

1. Créez un projet sur [console.firebase.google.com](https://console.firebase.google.com).
2. Ajoutez une application **Web** au projet (`</>`).
3. Dans **Build → Firestore Database**, cliquez sur **Créer une base de données**
   (mode production ou test, au choix).
4. Copiez la configuration Firebase fournie et créez un fichier **`.env.local`** à la racine :

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=mon-projet.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=mon-projet
VITE_FIREBASE_STORAGE_BUCKET=mon-projet.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

`VITE_FIREBASE_MEASUREMENT_ID` est facultatif : s’il est renseigné, Firebase Analytics
est chargé à la demande (sans alourdir le chargement initial).

5. (Facultatif) Choisissez la devise affichée :

```env
VITE_CURRENCY=FCFA
```

6. Redémarrez `npm run dev`. Le badge de l’en-tête doit indiquer **« Firestore connecté »**.

Un modèle est disponible dans [`.env.example`](./.env.example).

### Règles Firestore (sans authentification)

Comme demandé, il n’y a pas de page de connexion. Pour un prototype, autorisez
la collection `products` dans **Firestore → Règles** :

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{productId} {
      allow read, write: if true;
    }
  }
}
```

> ⚠️ Ces règles sont **ouvertes à tous**. Pour une mise en production, ajoutez
> l’authentification Firebase (ou des règles plus strictes) avant d’exposer l’application.

La collection est créée automatiquement au premier ajout de produit.

---

## 3. Utilisation à deux

| Rôle | Onglet | Actions |
| --- | --- | --- |
| Saisie (photos) | **Saisie & inventaire** | Ajoute la photo et le nom s’il est connu. **Aucun prix demandé.** |
| Complétion (prix) | **Prix à compléter** | Voit les produits sans prix, saisit le prix en face de la photo et ajoute le nom s’il manque. |

- Le nom est **facultatif** à la saisie : laissez-le vide s’il est inconnu.
- Un produit créé apparaît immédiatement dans **Prix à compléter**.
- L’onglet **Prix à compléter** est accessible directement via l’URL `/#prix`
  (pratique pour l’envoyer à votre collègue).
- Une fois le prix enregistré, le produit disparaît de la liste « À compléter ».
- L’onglet **Tous** permet de corriger un prix ou de compléter un nom plus tard.
- Pour partager les données entre deux appareils, **Firestore est obligatoire**
  (le mode démo reste limité au navigateur local).

---

## 4. Fonctionnalités

- Prise de photo via la webcam / caméra arrière (modale intégrée), avec bascule avant/arrière.
- Repli automatique vers l’appareil photo natif du téléphone (`capture="environment"`).
- Import depuis la galerie et glisser-déposer sur ordinateur.
- Compression automatique des images (max. 1000 px, JPEG optimisé) pour respecter
  la limite de 1 Mo par document Firestore.
- Formulaire de saisie : photo et nom (facultatif) — **sans prix**.
- Onglet **Prix à compléter** : saisie du prix en face de chaque photo, ajout du nom
  manquant, filtre « À compléter / Tous ».
- Clic sur la photo dans l’onglet des prix : affichage **en plein écran** pour mieux
  identifier le produit (fermeture par la croix, `Échap` ou clic à l’extérieur).
- Inventaire en temps réel grâce à `onSnapshot`.
- Tableau sur ordinateur, cartes sur mobile (100 % responsive).
- Recherche par nom et tri (récents, nom, prix).
- Modification et suppression avec confirmation.
- Statistiques : nombre de produits et **produits à compléter**.
- Notifications, états de chargement et messages d’erreur explicites.
- Mode démo `localStorage` si Firebase n’est pas configuré.

---

## 5. Structure du projet

```
src/
├── App.jsx                       # En-tête, onglets, statistiques, mise en page
├── firebase.js                   # Initialisation Firebase / Firestore
├── config.js                     # Nom de l’app, devise, formatage des prix
├── index.css                     # Thème et styles responsive
├── components/
│   ├── ProductForm.jsx           # Saisie photo + informations (sans prix)
│   ├── CameraModal.jsx           # Webcam / caméra en direct
│   ├── PriceCompletionPanel.jsx  # Onglet de complétion des prix
│   ├── PhotoLightbox.jsx         # Affichage de la photo en plein écran
│   ├── ProductsPanel.jsx         # Recherche, filtres, inventaire
│   ├── ProductTable.jsx          # Vue tableau (desktop)
│   ├── ProductCard.jsx           # Vue cartes (mobile)
│   ├── PriceLabel.jsx            # Prix ou badge « À compléter »
│   ├── ConfirmDeleteModal.jsx
│   ├── ToastStack.jsx
│   ├── Modal.jsx
│   └── ProductThumb.jsx
├── hooks/
│   ├── useProducts.js            # Abonnement Firestore / local
│   └── useMediaQuery.js
└── lib/
    ├── products.js               # CRUD Firestore + repli localStorage
    ├── image.js                  # Compression des photos
    └── format.js                 # Dates, texte, identifiants, prix
```

### Modèle Firestore

Collection `products` (le prix vaut `null` tant qu’il n’a pas été complété) :

```js
{
  name: "Roman « Les Misérables »", // peut être ""
  price: null,                      // devient un nombre après complétion
  photo: "data:image/jpeg;base64,...",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 6. Scripts

```bash
npm run dev      # Serveur de développement
npm run build    # Build de production dans dist/
npm run preview  # Prévisualiser le build
npm run lint     # Oxlint
```

---

## 7. Notes techniques et dépannage

- **Photos stockées dans Firestore** : la photo est convertie en base64 compressé.
  C’est simple et suffisant pour un petit inventaire. Pour un catalogue important,
  utilisez plutôt **Firebase Storage** et stockez uniquement l’URL dans Firestore.
- **`permission-denied`** : vérifiez les règles Firestore (section 2) et que la base
  a bien été créée.
- **Caméra inaccessible** : autorisez la caméra dans le navigateur, servez la page en
  HTTPS (ou `localhost`), ou utilisez le mode « Appareil natif ».
- **Mode démo plein** : le `localStorage` est limité (environ 5 Mo). Supprimez quelques
  produits ou configurez Firestore.
- **Devise** : définissez `VITE_CURRENCY` (ex. `FCFA`, `€`, `DA`, `MAD`). Vide par défaut.
- **Deux appareils** : sans Firestore, chaque navigateur a son propre inventaire local.

---

## 8. Personnalisation

- Nom de l’application : `APP_NAME` dans `src/config.js`.
- Couleurs : variables CSS (`--brand-*`) dans `src/index.css`.
- Collection Firestore : constante `COLLECTION` dans `src/lib/products.js`.
