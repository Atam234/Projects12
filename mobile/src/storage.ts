import AsyncStorage from "@react-native-async-storage/async-storage";

export type Message = { id: string; role: "user" | "assistant"; text: string; at: number };
export type Proof = { id: string; text: string; at: number };
export type Profile = { name: string; acceptedAt: number };

const KEYS = {
  profile: "kayamo.profile",
  messages: "kayamo.messages",
  proofs: "kayamo.proofs",
};

async function read<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function write(key: string, value: unknown) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Hindi kritikal kung hindi ma-save; tuloy pa rin ang app.
  }
}

export const storage = {
  getProfile: () => read<Profile | null>(KEYS.profile, null),
  setProfile: (p: Profile) => write(KEYS.profile, p),
  getMessages: () => read<Message[]>(KEYS.messages, []),
  setMessages: (m: Message[]) => write(KEYS.messages, m),
  getProofs: () => read<Proof[]>(KEYS.proofs, []),
  setProofs: (p: Proof[]) => write(KEYS.proofs, p),
  clearAll: () => AsyncStorage.multiRemove(Object.values(KEYS)),
};

export const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
