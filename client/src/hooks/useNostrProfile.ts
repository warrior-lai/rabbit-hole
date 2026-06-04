// Fetch Nostr profile (name + picture) from relays
const DEFAULT_RELAYS = [
  'wss://relay.damus.io',
  'wss://relay.nostr.band',
  'wss://nos.lol',
  'wss://relay.snort.social',
];

export interface NostrProfile {
  name: string;
  picture?: string;
  npub: string;
}

export async function fetchNostrProfile(pubkey: string): Promise<NostrProfile> {
  // Try each relay until we get a profile
  for (const relayUrl of DEFAULT_RELAYS) {
    try {
      const profile = await fetchFromRelay(relayUrl, pubkey);
      if (profile) return profile;
    } catch {
      continue;
    }
  }

  // Fallback: use short pubkey
  return {
    name: `nostr:${pubkey.substring(0, 8)}`,
    npub: pubkey,
  };
}

function fetchFromRelay(relayUrl: string, pubkey: string): Promise<NostrProfile | null> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      ws.close();
      resolve(null);
    }, 5000);

    const ws = new WebSocket(relayUrl);

    ws.onopen = () => {
      // Request kind 0 (metadata) for this pubkey
      const subId = Math.random().toString(36).substring(2, 10);
      ws.send(JSON.stringify([
        'REQ',
        subId,
        { kinds: [0], authors: [pubkey], limit: 1 }
      ]));
    };

    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);
        if (data[0] === 'EVENT' && data[2]?.kind === 0) {
          const meta = JSON.parse(data[2].content);
          clearTimeout(timeout);
          ws.close();
          resolve({
            name: meta.display_name || meta.name || `nostr:${pubkey.substring(0, 8)}`,
            picture: meta.picture || undefined,
            npub: pubkey,
          });
        }
        if (data[0] === 'EOSE') {
          clearTimeout(timeout);
          ws.close();
          resolve(null);
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onerror = () => {
      clearTimeout(timeout);
      resolve(null);
    };
  });
}
