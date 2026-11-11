import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { sendChat } from "../api";
import { newId, storage, type Message } from "../storage";
import { colors, radius } from "../theme";

type Props = {
  name: string;
  onSaveProof: (text: string) => void;
  onOpenHelp: () => void;
};

const STARTERS = [
  "Pakiramdam ko bobo ako.",
  "Napag-iwanan na ako ng mga kaedad ko.",
  "Ang malas ko talaga sa buhay.",
  "Lagi na lang akong mali.",
  "Kinakabahan ako at hindi ko alam bakit.",
  "Pakiramdam ko mag-isa lang ako.",
];

function greeting(name: string): Message {
  const hi = name ? `Hi ${name}! ` : "Hi! ";
  return {
    id: "greeting",
    role: "assistant",
    text: `${hi}Ako si Kaya. 🌅 Nandito ako para makinig at samahan ka. Ano ang bumabagabag sa'yo ngayon? Puwede kang magsimula sa isa sa mga nasa ibaba, o isulat mo lang ang nasa isip mo.`,
    at: Date.now(),
  };
}

export default function Chat({ name, onSaveProof, onOpenHelp }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [crisis, setCrisis] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    storage.getMessages().then((saved) => {
      setMessages(saved.length ? saved : [greeting(name)]);
      setLoaded(true);
    });
  }, [name]);

  useEffect(() => {
    if (loaded) storage.setMessages(messages);
  }, [messages, loaded]);

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || loading) return;
    const userMsg: Message = { id: newId(), role: "user", text: clean, at: Date.now() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      // Hindi ipinapadala ang lokal na pagbati; ang server ang may sariling gabay.
      const history = next.filter((m) => m.id !== "greeting");
      const { reply, crisis: isCrisis } = await sendChat(history, name);
      if (isCrisis) setCrisis(true);
      setMessages((cur) => [
        ...cur,
        {
          id: newId(),
          role: "assistant",
          text: reply || "Nandito pa rin ako. Puwede mo bang ikuwento pa?",
          at: Date.now(),
        },
      ]);
    } catch (e) {
      const code = e instanceof Error ? e.message : "";
      const busy = code === "busy";
      setMessages((cur) => [
        ...cur,
        {
          id: newId(),
          role: "assistant",
          text: code === "no_server"
            ? "Wala pang nakatakdang server. Pumunta sa tab na \"Tulong\" → \"Server ng AI\" at ilagay ang server URL."
            : busy
            ? "Medyo maraming gumagamit ngayon. Subukan mo ulit pagkalipas ng ilang segundo. Hindi kita iniiwan. 💛"
            : "Hindi ako makakonekta ngayon. Pakisuri ang internet mo at subukan ulit. Kung kailangan mo ng kausap agad, pindutin ang \"Tulong\" sa ibaba.",
          at: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onLongPress(m: Message) {
    Alert.alert("I-save bilang patunay?", "Ilalagay ito sa listahan ng mga Patunay ng lakas mo.", [
      { text: "Huwag", style: "cancel" },
      { text: "I-save", onPress: () => onSaveProof(m.text) },
    ]);
  }

  function resetChat() {
    Alert.alert("Bagong usapan?", "Mabubura ang kasalukuyang usapan (mananatili ang mga Patunay).", [
      { text: "Huwag", style: "cancel" },
      {
        text: "Oo",
        style: "destructive",
        onPress: () => {
          setCrisis(false);
          setMessages([greeting(name)]);
        },
      },
    ]);
  }

  const showStarters = messages.length <= 1 && !loading;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kaya 🌅</Text>
        <Pressable onPress={resetChat} hitSlop={10}>
          <Text style={styles.headerAction}>Bagong usapan</Text>
        </Pressable>
      </View>

      {crisis && (
        <Pressable style={styles.crisis} onPress={onOpenHelp}>
          <Text style={styles.crisisText}>
            💛 Mahalaga ka. Kung naiisip mong saktan ang sarili mo, tumawag ngayon sa NCMH 1553 o
            0917-899-8727. Pindutin dito para sa mga hotline.
          </Text>
        </Pressable>
      )}

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <Pressable
            onLongPress={() => onLongPress(item)}
            style={[styles.bubble, item.role === "user" ? styles.user : styles.ai]}
          >
            <Text style={item.role === "user" ? styles.userText : styles.aiText}>{item.text}</Text>
          </Pressable>
        )}
        ListFooterComponent={
          <View>
            {loading && (
              <View style={[styles.bubble, styles.ai, styles.typing]}>
                <ActivityIndicator color={colors.primary} />
                <Text style={styles.typingText}>Nag-iisip si Kaya…</Text>
              </View>
            )}
            {showStarters && (
              <View style={styles.starters}>
                {STARTERS.map((s) => (
                  <Pressable key={s} style={styles.chip} onPress={() => send(s)}>
                    <Text style={styles.chipText}>{s}</Text>
                  </Pressable>
                ))}
              </View>
            )}
            <Text style={styles.hint}>Tip: pindutin nang matagal ang isang mensahe para i-save bilang Patunay.</Text>
          </View>
        }
      />

      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Isulat ang nasa isip mo…"
          placeholderTextColor={colors.muted}
          style={styles.input}
          multiline
          maxLength={4000}
        />
        <Pressable
          style={[styles.send, (!input.trim() || loading) && { opacity: 0.4 }]}
          disabled={!input.trim() || loading}
          onPress={() => send(input)}
        >
          <Text style={styles.sendText}>➤</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: colors.primaryDark },
  headerAction: { color: colors.accent, fontWeight: "600" },
  crisis: {
    backgroundColor: colors.dangerBg,
    margin: 12,
    marginBottom: 0,
    padding: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  crisisText: { color: colors.danger, fontSize: 14, lineHeight: 20 },
  list: { padding: 16, gap: 10 },
  bubble: { maxWidth: "85%", padding: 12, borderRadius: radius.md },
  user: { alignSelf: "flex-end", backgroundColor: colors.userBubble, borderBottomRightRadius: 4 },
  ai: {
    alignSelf: "flex-start",
    backgroundColor: colors.aiBubble,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userText: { color: "#fff", fontSize: 16, lineHeight: 22 },
  aiText: { color: colors.text, fontSize: 16, lineHeight: 23 },
  typing: { flexDirection: "row", gap: 8, alignItems: "center", marginTop: 10 },
  typingText: { color: colors.muted },
  starters: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  chip: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.card,
  },
  chipText: { color: colors.primaryDark, fontSize: 14 },
  hint: { color: colors.muted, fontSize: 12, textAlign: "center", marginTop: 16 },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendText: { color: "#fff", fontSize: 18 },
});
