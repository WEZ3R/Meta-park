# ServerMetaPark

Serveur local avec gestion d'état `isShutdown` pour afficher des vidéos ou un écran d'erreur.

## Structure

```
serverMetaPark/
├── server.py          # Serveur Python standalone (port 8080)
├── my-app/            # Application Next.js (port 3000)
│   ├── app/
│   │   ├── a/         # Page vidéo camera-1
│   │   ├── b/         # Page vidéo camera-2
│   │   ├── admin/     # Panel de contrôle
│   │   └── api/       # Routes API (status, updateState)
│   └── public/        # Vidéos (camera-1.mp4, camera-2.mp4, ...)
└── README.md
```

## Option 1 : Serveur Next.js (recommandé)

### Installation

```bash
cd my-app
npm install
```

### Lancement

```bash
cd my-app
npm run dev
```

### URLs

| URL | Description |
|-----|-------------|
| http://localhost:3000/a | Vidéo camera-1.mp4 plein écran |
| http://localhost:3000/b | Vidéo camera-2.mp4 plein écran |
| http://localhost:3000/admin | Panel Admin |

---

## Option 2 : Serveur Python (léger, sans npm)

### Lancement

```bash
python3 server.py
```

### URLs

| URL | Description |
|-----|-------------|
| http://localhost:8080/a | Vidéo camera-1.mp4 |
| http://localhost:8080/b | Vidéo camera-2.mp4 |
| http://localhost:8080/admin | Panel Admin |
| http://localhost:8080/status | API JSON |

### Accès réseau (autres machines)

Remplacer `localhost` par votre IP locale :
```
http://10.14.73.129:8080/a
http://10.14.73.129:8080/b
```

---

## Fonctionnement

1. Ouvrir `/a` ou `/b` sur un navigateur (ou plusieurs machines)
2. Ouvrir `/admin` sur votre machine
3. Cliquer sur **"Activate Error"** → toutes les pages affichent "SYSTEM ERROR"
4. Cliquer sur **"Reset"** → les vidéos reprennent

Les pages poll le serveur toutes les **500ms** pour détecter les changements automatiquement.

## Vidéos

Placer vos fichiers vidéo dans :
- **Next.js** : `my-app/public/camera-1.mp4`, `camera-2.mp4`
- **Python** : à la racine `serverMetaPark/camera-1.mp4`, `camera-2.mp4`
