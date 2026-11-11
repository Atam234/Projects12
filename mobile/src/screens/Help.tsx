import { useEffect, useState } from "react";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { DEFAULT_API_URL } from "../api";
import { HOTLINES } from "../hotlines";
import { storage } from "../storage";
import { colors, radius } from "../theme";

type Props = { onReset: () => void };

function call(num: string) {
  Linking.openURL(`tel:${num}`).catch(() =>
    Alert.alert("Hindi matawagan", `I-dial nang manu-mano: ${num}`),
  );
}

function pretty(num: string) {
  if (num.length === 11 && num.startsWith("09")) return `${num.slice(0, 4)}-${num.slice(4, 7)}-${num.slice(7)}`;
  if (num.length === 10 && num.startsWith("02")) return `(02) ${num.slice(2, 6)}-${num.slice(6)}`;
  return num;
}

export default function Help({ onReset }: Props) {
  const [url, setUrl] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    storage.getApiUrl().then((u) => setUrl(u || DEFAULT_API_URL));
  }, []);

  async function saveUrl() {
    await storage.setApiUrl(url.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Tulong Ngayon 💛</Text>
      <Text style={styles.body}>
        Kung naiisip mong saktan ang sarili mo o pakiramdam mo ay hindi ka ligtas, tumawag ka ngayon.
        May mga taong handang makinig sa'yo — 24 oras, libre, at kumpidensyal.
      </Text>

      {HOTLINES.map((h) => (
        <View key={h.name} style={styles.card}>
          <Text style={styles.cardTitle}>{h.name}</Text>
          <Text style={styles.note}>{h.note}</Text>
          <View style={styles.nums}>
            {h.numbers.map((n) => (
              <Pressable key={n} style={styles.num} onPress={() => call(n)}>
                <Text style={styles.numText}>📞 {pretty(n)}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ))}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Huminga muna tayo (Box Breathing)</Text>
        <Text style={styles.body}>
          1. Huminga nang malalim sa ilong — bilang ng 4{"\n"}2. Pigilan — bilang ng 4{"\n"}3.
          Ilabas nang dahan-dahan sa bibig — bilang ng 4{"\n"}4. Pigilan — bilang ng 4{"\n"}Ulitin
          nang 4 na beses.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>5-4-3-2-1 Grounding</Text>
        <Text style={styles.body}>
          Pansinin ang 5 bagay na nakikita mo, 4 na nahahawakan mo, 3 na naririnig mo, 2 na naaamoy
          mo, at 1 na nalalasahan mo. Ibinabalik ka nito sa kasalukuyan.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Server ng AI ⚙️</Text>
        <Text style={styles.note}>Ang address ng Kaya Mo server (hal. https://kaya-mo.onrender.com).</Text>
        <TextInput
          value={url}
          onChangeText={setUrl}
          placeholder="https://..."
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          style={styles.input}
        />
        <Pressable style={styles.save} onPress={saveUrl}>
          <Text style={styles.saveText}>{saved ? "Na-save ✓" : "I-save"}</Text>
        </Pressable>
      </View>

      <Text style={styles.disclaimer}>
        Ang Kaya Mo ay isang AI na kasama para sa suporta at hindi kapalit ng propesyonal na
        tulong medikal o pang-mental health. Ang mga usapan ay naka-save lamang sa phone mo.
      </Text>

      <Pressable
        onPress={() =>
          Alert.alert("Burahin lahat?", "Mabubura ang usapan, mga Patunay, at pangalan mo sa phone na ito.", [
            { text: "Huwag", style: "cancel" },
            { text: "Burahin", style: "destructive", onPress: onReset },
          ])
        }
      >
        <Text style={styles.reset}>Burahin ang lahat ng data ko</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 14, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: "800", color: colors.danger },
  body: { fontSize: 15, lineHeight: 22, color: colors.text },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { fontSize: 17, fontWeight: "700", color: colors.text },
  note: { fontSize: 13, color: colors.muted },
  nums: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 },
  num: {
    backgroundColor: colors.dangerBg,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  numText: { color: colors.danger, fontWeight: "700", fontSize: 15 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
    marginTop: 4,
  },
  save: {
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 6,
  },
  saveText: { color: "#fff", fontWeight: "700" },
  disclaimer: { fontSize: 12, color: colors.muted, lineHeight: 18, marginTop: 8 },
  reset: { color: colors.danger, textAlign: "center", marginTop: 8, textDecorationLine: "underline" },
});
