import { View, Text, StyleSheet } from "react-native";
import { colors } from "@rynxpense/ui-tokens";

export function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>👤</Text>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>
        Sign in coming soon. Trips sync via the Rynxpense API.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background, padding: 24 },
  emoji: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: "700" },
  subtitle: { textAlign: "center", color: colors.textMuted, marginTop: 8 },
});
