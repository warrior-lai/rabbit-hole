# 🐇 Rabbit Hole

Un juego de cartas multijugador de imaginación y revelaciones.

> ¿Qué hay en lo profundo de la madriguera?

Rabbit Hole es un juego de cartas online donde jugadores usan arte abstracto y pistas crípticas para explorar los límites de la imaginación. Elegí una carta, dá una pista, engañá a tus rivales — o descubrí quién te está engañando a vos.

Construido para la Hackatón de La Crypta. Arte digital original creado por Artistas.

---

## 🎮 Modos de Juego

### 🎯 Desafío (Individual)
Jugá solo. Aparece una pista con 5 cartas — elegí la correcta. Acumulá victorias ⚡ y coleccioná cartas en tu perfil.

### ⚡ Multijugador (3-10 jugadores)
1. **El Narrador** elige una carta de su mano y da una pista
2. **Los demás** eligen la carta que mejor encaje con la pista
3. **Se revelan todas las cartas** — todos votan cuál es la del Narrador
4. **Puntuación**: las pistas creativas ganan (ni muy obvias, ni muy crípticas)
5. **Gana** el jugador con más puntos al final 🎉

---

## 🚀 Características

| Feature | Descripción |
|---------|-------------|
| 🎯 Modo Desafío | Jugá solo, acumulá victorias, coleccioná cartas |
| ⚡ Multijugador | Creá o unite a salas con código de 5 letras |
| 🔑 Identidad Nostr | Login NIP-07 — trae tu nombre y foto de perfil de los relays |
| 🃏 34 Cartas Originales | Mazo "Bloque Génesis" — arte by Lai |
| 🎨 Galería de Arte | Explorá los mazos, mirá las cartas en lightbox |
| 👤 Perfil | Stats, victorias, colección de cartas ganadas |
| 🏆 Ranking Global | Tabla all-time y semanal |
| 📋 Reglas | Modal completo ES/EN |
| 🌍 Bilingüe | Español 🇪🇸 & English 🇬🇧 |
| 🎉 Confetti | Celebración del ganador |
| 📱 Responsive | Desktop, tablet, celular |
| ✨ Fondo Animado | Blobs de color vibrantes con destellos |
| ⏱️ Timer 30s | Por turno |
| 🚪 Abandonar | Desconexión limpia + transferencia de host |
| 🏁 Finalizar | El host puede terminar con puntajes parciales |

---

## 🎨 Arte

El primer mazo — **Bloque Génesis** — fue creado por Lai. 34 ilustraciones originales con temática Bitcoin, libertad, soberanía y mundos abstractos.

La galería soporta múltiples mazos. Más colecciones próximamente.

---

## 🛠 Stack Técnico

| Capa | Tecnología |
|------|------------|
| Frontend | React + TypeScript + Vite |
| Backend | Node.js + TypeScript + Socket.io |
| Identidad | Nostr (NIP-07) + fetch de perfil desde relays |
| Estilos | CSS con glassmorphism + gradientes animados |
| i18n | ES/EN integrado |
| Deploy | Render (server + client estático) |

---

## 📦 Estructura

```
rabbit-hole/
├── client/                 # Frontend React
│   ├── public/cards/       # 34 imágenes de cartas
│   └── src/
│       ├── components/     # 15 componentes UI
│       ├── pages/          # Landing, Lobby
│       ├── hooks/          # useSocket, useLanguage, useNostrProfile
│       ├── game/           # Lógica del desafío
│       ├── i18n/           # Traducciones
│       └── styles/         # CSS global
├── server/                 # Backend Node.js
│   └── src/
│       ├── game/           # Engine, salas, stats
│       └── socket/         # Handlers WebSocket
├── shared/                 # Tipos compartidos client/server
└── render.yaml             # Config de deploy
```

---

## 🏃 Inicio Rápido

```bash
# Instalar dependencias
cd client && npm install && cd ../server && npm install

# Desarrollo
cd server && npx tsx src/index.ts   # Puerto 3001
cd client && npm run dev            # Puerto 5173
```

Abrí http://localhost:5173 — el cliente se conecta al server automáticamente.

---

## 🌐 Jugar Online

**▶ https://rabbit-hole-v5wp.onrender.com**

---

## 🤝 Contribuir

1. Fork el repo
2. Creá tu branch (`git checkout -b feature/mejora`)
3. Commit (`git commit -m 'Agrega X'`)
4. Push (`git push origin feature/mejora`)
5. Abrí un Pull Request

**Agregar cartas:** poné imágenes JPG en `client/public/cards/` y actualizá `TOTAL_CARDS` en `CardHand.tsx`, `Challenge.tsx`, `ArtGallery.tsx` y `engine.ts`.

---

## 📄 Licencia

MIT

---

*Down the rabbit hole we go.* 🐇⚡

Construido con amor para [La Crypta](https://lacrypta.ar) 💛
