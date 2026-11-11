import { StatusBar } from "expo-status-bar";
import { useEffect, useState, type ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Chat from "./src/screens/Chat";
import Help from "./src/screens/Help";
import Onboarding from "./src/screens/Onboarding";
import Proofs from "./src/screens/Proofs";
import { newId, storage, type Profile, type Proof } from "./src/storage";
import { colors } from "./src/theme";

type Tab = "chat" | "proofs" | "help";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "chat", label: "Usap", icon: "💬" },
  { key: "proofs", label: "Patunay", icon: "💪" },
  { key: "help", label: "Tulong", icon: "💛" },
];

export default function App() {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [tab, setTab] = useState<Tab>("chat");
  const [chatKey, setChatKey] = useState(0);

  useEffect(() => {
    Promise.all([storage.getProfile(), storage.getProofs()]).then(([p, pr]) => {
      setProfile(p);
      setProofs(pr);
      setReady(true);
    });
  }, []);

  function updateProofs(next: Proof[]) {
    setProofs(next);
    storage.setProofs(next);
  }

  function addProof(text: string) {
    updateProofs([{ id: newId(), text, at: Date.now() }, ...proofs]);
  }

  async function resetAll() {
    await storage.clearAll();
    setProfile(null);
    setProofs([]);
    setTab("chat");
    setChatKey((k) => k + 1);
  }

  let content: ReactNode;
  if (!ready) {
    content = <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />;
  } else if (!profile) {
    content = (
      <Onboarding
        onDone={(name) => {
          const p = { name, acceptedAt: Date.now() };
          storage.setProfile(p);
          setProfile(p);
        }}
      />
    );
  } else {
    content = (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          {/* Laging naka-mount ang Chat para hindi mawala ang usapan habang lumilipat ng tab */}
          <View style={{ flex: 1, display: tab === "chat" ? "flex" : "none" }}>
            <Chat
              key={chatKey}
              name={profile.name}
              onSaveProof={addProof}
              onOpenHelp={() => setTab("help")}
            />
          </View>
          {tab === "proofs" && (
            <Proofs
              proofs={proofs}
              onAdd={addProof}
              onRemove={(id) => updateProofs(proofs.filter((p) => p.id !== id))}
            />
          )}
          {tab === "help" && <Help onReset={resetAll} />}
        </View>

        <View style={styles.tabs}>
          {TABS.map((t) => (
            <Pressable key={t.key} style={styles.tab} onPress={() => setTab(t.key)}>
              <Text style={styles.tabIcon}>{t.icon}</Text>
              <Text style={[styles.tabLabel, tab === t.key && styles.tabActive]}>{t.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
        <StatusBar style="dark" />
        {content}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  tabs: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 8, gap: 2 },
  tabIcon: { fontSize: 20 },
  tabLabel: { fontSize: 12, color: colors.muted },
  tabActive: { color: colors.primary, fontWeight: "700" },
});
