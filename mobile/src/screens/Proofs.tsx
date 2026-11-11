import { useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { Proof } from "../storage";
import { colors, radius } from "../theme";

type Props = {
  proofs: Proof[];
  onAdd: (text: string) => void;
  onRemove: (id: string) => void;
};

// "Mga Patunay" — listahan ng ebidensya na kaya mo. Kapag sinasabi ng isip mo na
// "mahina ako", balikan mo ito.
export default function Proofs({ proofs, onAdd, onRemove }: Props) {
  const [text, setText] = useState("");

  function add() {
    const t = text.trim();
    if (!t) return;
    onAdd(t);
    setText("");
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Mga Patunay 💪</Text>
        <Text style={styles.subtitle}>
          Ebidensya na kaya mo. Kapag sinabi ng isip mong "mahina ako" o "bobo ako", basahin mo
          ito. Kahit maliit na tagumpay, isulat mo.
        </Text>
      </View>

      <View style={styles.addRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Hal. Natapos ko ang report kahit pagod ako."
          placeholderTextColor={colors.muted}
          style={styles.input}
          onSubmitEditing={add}
          returnKeyType="done"
        />
        <Pressable style={[styles.addBtn, !text.trim() && { opacity: 0.4 }]} onPress={add}>
          <Text style={styles.addText}>+</Text>
        </Pressable>
      </View>

      <FlatList
        data={proofs}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Wala pang patunay dito. Ano ang isang bagay na nagawa mo ngayong linggo na hindi mo
            inakalang kaya mo?
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onLongPress={() =>
              Alert.alert("Burahin?", "Aalisin ito sa listahan.", [
                { text: "Huwag", style: "cancel" },
                { text: "Burahin", style: "destructive", onPress: () => onRemove(item.id) },
              ])
            }
          >
            <Text style={styles.cardText}>{item.text}</Text>
            <Text style={styles.date}>{new Date(item.at).toLocaleDateString()}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, gap: 6, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: 22, fontWeight: "800", color: colors.primaryDark },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  addRow: { flexDirection: "row", gap: 8, padding: 16, paddingBottom: 4 },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
  },
  addBtn: {
    width: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  addText: { color: "#fff", fontSize: 24, fontWeight: "700" },
  list: { padding: 16, gap: 10 },
  empty: { color: colors.muted, textAlign: "center", marginTop: 32, lineHeight: 22 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
    gap: 6,
  },
  cardText: { fontSize: 15, lineHeight: 22, color: colors.text },
  date: { fontSize: 12, color: colors.muted },
});
