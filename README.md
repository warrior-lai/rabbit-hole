# 🐇 Rabbit Hole

**A multiplayer card game of imagination and revelations — powered by Bitcoin Lightning & Nostr.**

> ¿Qué hay en lo profundo de la madriguera?
> What lies deep in the rabbit hole?

## 🎮 Game Modes

### 🎯 Challenge (Solo)
Play alone! A clue appears with 5 cards — pick the right one. Track your wins with ⚡ and collect cards in your profile.

### ⚡ Multiplayer (3-10 players)
1. **The Storyteller** picks a card and gives a clue
2. **Other players** choose their best matching card
3. **All cards are revealed** — everyone votes for the Storyteller's card
4. **Scoring** rewards creative clues (not too obvious, not too cryptic!)
5. **The player with the most points wins!** 🎉

## 🚀 Features

- 🎯 **Challenge Mode** — Solo play with streak tracking
- ⚡ **Quick Multiplayer** — Create/join rooms with 5-letter codes
- 🔑 **Nostr Identity** — Login with NIP-07, fetches profile name + picture from relays
- 🃏 **31 Original Cards** — "Bloque Génesis" deck by Lai
- 🎨 **Art Gallery** — Browse card decks with lightbox viewer
- 👤 **Player Profile** — Stats, wins, card collection
- 🏆 **Global Ranking** — All-time and weekly leaderboard
- 📋 **Game Rules** — Full rules modal in ES/EN
- 🌍 **Bilingual** — English 🇬🇧 & Español 🇪🇸
- 🎉 **Confetti** — Winner celebration
- 📱 **Responsive** — Desktop, tablet, mobile
- ✨ **Animated Background** — Vibrant color blobs with sparkles
- ⏱️ **30s Timer** — Per turn
- 🚪 **Leave Game** — Graceful disconnect + host transfer

## 🛠 Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Backend:** Node.js + TypeScript + Socket.io
- **Identity:** Nostr (NIP-07) + relay profile fetch
- **Styling:** CSS with glassmorphism + animated gradients
- **i18n:** Built-in EN/ES
- **Deploy:** Render (server + static client)

## 📦 Project Structure

```
rabbit-hole/
├── client/
│   ├── public/cards/     # 31 card images (Bloque Génesis deck)
│   └── src/
│       ├── components/   # 15 UI components
│       ├── pages/        # Landing, Lobby
│       ├── hooks/        # useSocket, useLanguage, useNostrProfile
│       ├── i18n/         # Translations
│       └── styles/       # Global CSS
├── server/
│   └── src/
│       ├── game/         # Engine, rooms, stats
│       └── socket/       # WebSocket handlers
├── shared/               # Types shared between client/server
└── render.yaml           # Deploy config
```

## 🏃 Quick Start

```bash
# Install
cd client && npm install && cd ../server && npm install

# Dev
cd server && npx tsx src/index.ts   # Port 3001
cd client && npm run dev            # Port 5173
```

## 🌐 Live

**Play:** https://rabbit-hole-v5wp.onrender.com

## 📄 License

MIT

---

*Down the rabbit hole we go.* 🐇⚡
