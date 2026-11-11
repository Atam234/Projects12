import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { colors, radius } from "../theme";

type Props = { onDone: (name: string) => void };

export default function Onboarding({ onDone }: Props) {
  const [name, setName] = useState("");
  const [agreed, setAgreed] = useState(false);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.sun}>🌅</Text>
        <Text style={styles.title}>Kaya Mo</Text>
        <Text style={styles.subtitle}>Hindi ka nag-iisa. Kasama mo ako.</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ano ang gagawin natin dito?</Text>
          <Text style={styles.body}>
            • Pakikinggan kita nang walang panghuhusga.{"\n"}• Tatanungin kita ng mga tanong na
            tutulong sa'yong makita ang totoo — na hindi ka mahina, hindi ka bobo, hindi ka malas,
            at hindi ka napag-iwanan.{"\n"}• Iipunin natin ang mga patunay ng lakas mo.
          </Text>
        </View>

        <Text style={styles.label}>Ano ang gusto mong itawag ko sa'yo?</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Pangalan o palayaw (opsyonal)"
          placeholderTextColor={colors.muted}
          style={styles.input}
          maxLength={40}
        />

        <Pressable style={styles.check} onPress={() => setAgreed((a) => !a)}>
          <View style={[styles.box, agreed && styles.boxOn]}>
            {agreed && <Text style={styles.tick}>✓</Text>}
          </View>
          <Text style={styles.checkText}>
            Naiintindihan ko na ang Kaya ay isang AI na kasama at hindi kapalit ng doktor,
            psychologist, o therapist. Kung nasa panganib ako, tatawag ako sa hotline o 911.
          </Text>
        </Pressable>

        <Pressable
          style={[styles.button, !agreed && styles.buttonDisabled]}
          disabled={!agreed}
          onPress={() => onDone(name.trim())}
        >
          <Text style={styles.buttonText}>Simulan natin</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 48, gap: 16 },
  sun: { fontSize: 56, textAlign: "center" },
  title: { fontSize: 36, fontWeight: "800", color: colors.primaryDark, textAlign: "center" },
  subtitle: { fontSize: 17, color: colors.muted, textAlign: "center", marginBottom: 8 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: colors.text },
  body: { fontSize: 15, lineHeight: 23, color: colors.text },
  label: { fontSize: 15, fontWeight: "600", color: colors.text, marginTop: 8 },
  input: {
    backgroundColor: colors.card,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  check: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  box: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  boxOn: { backgroundColor: colors.primary },
  tick: { color: "#fff", fontWeight: "800" },
  checkText: { flex: 1, fontSize: 14, lineHeight: 20, color: colors.muted },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: "#fff", fontSize: 17, fontWeight: "700" },
});
