import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { colors } from "@rynxpense/ui-tokens";
import { generateTrip } from "../services/api";

export function NewTripScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const today = new Date().toISOString().split("T")[0];
  const defaultEnd = new Date(Date.now() + 4 * 86400000).toISOString().split("T")[0];

  const [destination, setDestination] = useState(route.params?.destination || "");
  const [budget, setBudget] = useState(String(route.params?.budget || "50000"));
  const [travelers, setTravelers] = useState("2");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!destination) {
      Alert.alert("Required", "Please enter a destination");
      return;
    }
    setLoading(true);
    try {
      const trip = await generateTrip({
        destination,
        startDate,
        endDate,
        budgetAmount: Number(budget),
        travelers: Number(travelers),
      });
      navigation.navigate("TripDetail", { tripId: trip.id });
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Plan your trip</Text>
      <Text style={styles.subtitle}>AI will build your itinerary and budget</Text>

      <Text style={styles.label}>Destination</Text>
      <TextInput style={styles.input} value={destination} onChangeText={setDestination} placeholder="e.g. Tokyo" />

      <Text style={styles.label}>Budget (₱)</Text>
      <TextInput style={styles.input} value={budget} onChangeText={setBudget} keyboardType="numeric" />

      <Text style={styles.label}>Travelers</Text>
      <TextInput style={styles.input} value={travelers} onChangeText={setTravelers} keyboardType="numeric" />

      <TouchableOpacity style={styles.button} onPress={handleGenerate} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.buttonText}>✨ Generate AI itinerary</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: "700" },
  subtitle: { color: colors.textMuted, marginBottom: 24 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    fontSize: 15,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
  },
  buttonText: { color: colors.white, fontWeight: "700", fontSize: 16 },
});
