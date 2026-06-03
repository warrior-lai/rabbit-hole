# 🐇 Rabbit Hole

**A multiplayer card game of imagination and revelations — powered by Bitcoin Lightning & Nostr.**

> What lies deep in your unconscious?

Rabbit Hole is an original online multiplayer card game where players use abstract art cards and cryptic clues to explore the depths of imagination. Built for La Crypta Hackathon.

## 🎮 How to Play

1. **The Storyteller** picks a card from their hand and gives a clue — a word, a phrase, a sound, anything
2. **Other players** choose their card that best matches the Storyteller's clue
3. **All cards are revealed** — everyone votes for the Storyteller's card
4. **Scoring** rewards creative clues that are neither too obvious nor too cryptic
5. **The player with the most points wins!**

## 🚀 Play

- **⚡ Quick Game** — Enter your name and play instantly
- **🔑 Nostr Login** — Connect with your npub for identity
- **🚪 Join Room** — Enter a 5-letter code to join friends

## 🌍 Languages

English 🇬🇧 · Español 🇪🇸

## 🛠 Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Backend:** Node.js + TypeScript + Socket.io
- **Identity:** Nostr (NIP-07)
- **i18n:** Built-in EN/ES

## 📦 Project Structure

```
rabbit-hole/
├── client/          # React frontend
├── server/          # Node.js backend
├── shared/          # Shared types & constants
└── package.json
```

## 🏃 Quick Start

```bash
# Install
cd client && npm install && cd ../server && npm install

# Dev
cd server && npx tsx src/index.ts
cd client && npm run dev
```

## ⚡ Built for La Crypta Hackathon

MIT License

---

*Down the rabbit hole we go.* 🐇⚡
