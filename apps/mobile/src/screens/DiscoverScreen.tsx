import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { colors, popularDestinations } from "@rynxpense/ui-tokens";
import { formatCurrency } from "@rynxpense/shared";
import { API_URL } from "../../App";

function destinationImageUri(path: string) {
  return path.startsWith("/") ? `${API_URL}${path}` : path;
}

export function DiscoverScreen() {
  const navigation = useNavigation<any>();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Discover your next trip</Text>
      <Text style={styles.subtitle}>AI-powered itineraries within your budget</Text>

      <TouchableOpacity
        style={styles.cta}
        onPress={() => navigation.navigate("Plan")}
      >
        <Text style={styles.ctaText}>✨ Plan a new trip</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Popular destinations</Text>
      {popularDestinations.map((dest) => (
        <TouchableOpacity
          key={dest.id}
          style={styles.card}
          onPress={() =>
            navigation.navigate("Plan", { destination: dest.name, budget: dest.budgetFrom })
          }
        >
          <Image source={{ uri: destinationImageUri(dest.image) }} style={styles.cardImage} />
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{dest.name}</Text>
            <Text style={styles.cardMeta}>
              from {formatCurrency(dest.budgetFrom)} / {dest.days} days
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: "700", color: colors.text },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 4, marginBottom: 20 },
  cta: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  ctaText: { color: colors.white, fontWeight: "700", fontSize: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardImage: { width: "100%", height: 140 },
  cardBody: { padding: 12 },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  cardMeta: { fontSize: 13, color: colors.primary, marginTop: 4 },
});
