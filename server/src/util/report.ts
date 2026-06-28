// Sends debug reports to a Discord webhook when something goes wrong during a game
// (a player gets dropped, a rejoin fails, a game is cancelled). Fire-and-forget:
// never throws, never blocks the game loop.
//
// The webhook URL is read from the DISCORD_WEBHOOK_URL env var — it is NEVER hardcoded,
// so the secret can't leak through the public repo. Set it in server/.env for local dev
// (see server/.env.example) or in the Render dashboard for production. If it's unset,
// reporting is silently disabled (warned once). Read lazily (not at module load) so the
// .env file loaded in index.ts is already applied by the time the first report fires.
let warnedMissing = false;

export interface ReportField {
  name: string;
  value: string;
  inline?: boolean;
}

// Throttle so a burst of disconnects can't flood the channel.
const lastSent = new Map<string, number>();
const MIN_INTERVAL_MS = 2000;

export function report(
  title: string,
  fields: ReportField[],
  opts: { color?: number; dedupKey?: string } = {}
): void {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL || '';
  if (!webhookUrl) {
    if (!warnedMissing) {
      warnedMissing = true;
      console.warn('⚠️ DISCORD_WEBHOOK_URL no está configurada — los reportes de debug están desactivados.');
    }
    return;
  }

  const key = opts.dedupKey ?? title;
  const now = Date.now();
  if (now - (lastSent.get(key) ?? 0) < MIN_INTERVAL_MS) return;
  lastSent.set(key, now);

  const payload = {
    username: 'Rabbit Hole 🐇 Debug',
    embeds: [
      {
        title: title.slice(0, 256),
        color: opts.color ?? 0xe74c3c, // red by default
        fields: fields.map((f) => ({
          name: f.name.slice(0, 256) || '—',
          value: (f.value || '—').slice(0, 1024),
          inline: f.inline ?? false,
        })),
        timestamp: new Date().toISOString(),
      },
    ],
  };

  // Node 18+ has global fetch. Never await — debugging must not slow the game.
  fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch((err) => console.warn('⚠️ Discord report failed:', err?.message || err));
}
