import Constants from "expo-constants";

/**
 * Layanan komunikasi PocketBase untuk Lentera Mobile.
 * Beroperasi secara fleksibel (realtime SSE + REST).
 * Menjaga anonimitas 100%: tidak ada data identitas yang dikirim dari pengguna.
 */

// Dapatkan host IP dari bundler Metro jika berjalan di Expo Go/Tunnel
const debuggerHost =
  Constants.expoConfig?.hostUri ||
  (Constants as any)?.manifest2?.extra?.expoGo?.debuggerHost ||
  "";
const hostIp = debuggerHost ? debuggerHost.split(":")[0] : "192.168.78.79";

export const PB_BASE_URL = `http://${hostIp}:8090`;
export const PB_EMULATOR_URL = "http://10.0.2.2:8090";
export const PB_LAN_URL = "http://192.168.78.79:8090";

let activeBaseUrl = PB_BASE_URL;

export function setPocketBaseUrl(url: string) {
  if (url) {
    activeBaseUrl = url.replace(/\/$/, "");
  }
}

export function getPocketBaseUrl(): string {
  return activeBaseUrl;
}

export interface CounselorInfo {
  id: string;
  name: string;
  university: string;
  bio: string;
  kyc_status: "pending" | "verified" | "rejected";
  is_online?: boolean;
}

export interface ChatMessageRecord {
  id: string;
  session: string;
  sender: "counselor" | "psychologist" | "user";
  text: string;
  created: string;
}

export interface ServerStory {
  id: string;
  author_label: string;
  story: string;
  action_taken: string;
  now_status: string;
  quote: string;
  from_tier: "moderate" | "high";
  tags: string[];
  created?: string;
}

/**
 * Mengirim / membagikan cerita pengguna secara anonim ke backend PocketBase
 */
export async function shareStoryToServer(data: {
  story: string;
  quote?: string;
  action_taken?: string;
  now_status?: string;
  from_tier?: 'moderate' | 'high';
}): Promise<ServerStory | null> {
  const urls = [
    activeBaseUrl,
    PB_LAN_URL,
    PB_EMULATOR_URL,
    "http://127.0.0.1:8090",
  ];
  for (const base of urls) {
    try {
      const res = await fetch(`${base}/api/stories/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        return json.story as ServerStory;
      }
    } catch {
      // lanjut fallback
    }
  }
  return null;
}


/**
 * Mengambil daftar cerita kurasi publik dari PocketBase.
 */
export async function fetchServerStories(): Promise<ServerStory[]> {
  const urls = [
    activeBaseUrl,
    PB_LAN_URL,
    PB_EMULATOR_URL,
    "http://127.0.0.1:8090",
  ];
  for (const base of urls) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(
        `${base}/api/collections/stories/records?filter=(is_approved=true)&sort=-created`,
        {
          signal: controller.signal,
        },
      );
      clearTimeout(timeout);
      if (res.ok) {
        activeBaseUrl = base;
        const data = await res.json();
        return (data.items || []) as ServerStory[];
      }
    } catch {
      // lanjut coba url fallback
    }
  }
  return [];
}

/**
 * Matchmaking konselor psikologi acak (Random match)
 */
export async function matchRandomCounselor(anonymousUserId?: string): Promise<{
  sessionId: string;
  anonymousUserId: string;
  psychologist: CounselorInfo;
}> {
  const urls = [
    activeBaseUrl,
    PB_LAN_URL,
    PB_EMULATOR_URL,
    "http://127.0.0.1:8090",
  ];
  let lastError: Error | null = null;

  for (const base of urls) {
    try {
      const res = await fetch(`${base}/api/chat/match-random`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anonymous_user_id: anonymousUserId,
        }),
      });

      if (res.ok) {
        activeBaseUrl = base;
        const data = await res.json();
        return {
          sessionId: data.session_id,
          anonymousUserId: data.anonymous_user_id,
          psychologist: data.psychologist,
        };
      } else {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "Gagal menghubungkan ke konselor");
      }
    } catch (e: any) {
      lastError = e;
    }
  }

  throw lastError || new Error("Tidak dapat terhubung ke server");
}

/**
 * Melewati (skip) konselor saat ini dan membebaskan sesi
 */
export async function skipCurrentCounselor(
  sessionId: string,
): Promise<boolean> {
  try {
    const res = await fetch(`${activeBaseUrl}/api/chat/skip-counselor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Mengambil pesan pada sesi tertentu
 */
export async function fetchSessionMessages(
  sessionId: string,
): Promise<ChatMessageRecord[]> {
  try {
    const res = await fetch(
      `${activeBaseUrl}/api/collections/chat_messages/records?filter=(session='${sessionId}')&sort=created`,
    );
    if (res.ok) {
      const data = await res.json();
      return (data.items || []) as ChatMessageRecord[];
    }
  } catch {}
  return [];
}

/**
 * Mengirim pesan anonim ke sesi
 */
export async function sendChatMessage(
  sessionId: string,
  text: string,
): Promise<ChatMessageRecord | null> {
  try {
    const res = await fetch(
      `${activeBaseUrl}/api/collections/chat_messages/records`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session: sessionId,
          sender: "user",
          text: text.trim(),
        }),
      },
    );
    if (res.ok) {
      return (await res.json()) as ChatMessageRecord;
    }
  } catch {}
  return null;
}
