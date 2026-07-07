import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { colors } from "@rynxpense/ui-tokens";
import { formatCurrency } from "@rynxpense/shared";
import { fetchTrip } from "../services/api";

export function TripDetailScreen() {
  const route = useRoute<any>();
  const tripId = route.params?.tripId;

  const { data: trip, isLoading } = useQuery({
    queryKey: ["trip", tripId],
    queryFn: () => fetchTrip(tripId),
    enabled: !!tripId,
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.center}>
        <Text>Trip not found</Text>
      </View>
    );
  }

  const budget = trip.totalEstimated ?? trip.budgetAmount;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>{trip.destination}</Text>
        <Text style={styles.heroBudget}>Est. {formatCurrency(budget)}</Text>
      </View>

      {trip.itineraryDays?.map((day: { id: string; dayNumber: number; title: string; estimatedCost: number; activities: { time: string; title: string; estimatedCost: number }[] }) => (
        <View key={day.id} style={styles.dayCard}>
          <View style={styles.dayHeader}>
            <Text style={styles.dayLabel}>Day {day.dayNumber}</Text>
            <Text style={styles.dayCost}>{formatCurrency(day.estimatedCost)}</Text>
          </View>
          <Text style={styles.dayTitle}>{day.title}</Text>
          {day.activities?.map((a, i) => (
            <View key={i} style={styles.activity}>
              <Text style={styles.activityTime}>{a.time}</Text>
              <Text style={styles.activityTitle}>{a.title}</Text>
              <Text style={styles.activityCost}>{formatCurrency(a.estimatedCost)}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  hero: {
    backgroundColor: colors.primary,
    padding: 24,
  },
  heroTitle: { fontSize: 24, fontWeight: "700", color: colors.white },
  heroBudget: { color: "rgba(255,255,255,0.8)", marginTop: 4 },
  dayCard: {
    backgroundColor: colors.card,
    margin: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  dayHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  dayLabel: { color: colors.primary, fontWeight: "700", fontSize: 12 },
  dayCost: { color: colors.primary, fontWeight: "700" },
  dayTitle: { fontWeight: "700", fontSize: 16, marginBottom: 12 },
  activity: { flexDirection: "row", alignItems: "center", paddingVertical: 6, borderTopWidth: 1, borderTopColor: colors.border },
  activityTime: { width: 48, fontSize: 11, color: colors.textMuted },
  activityTitle: { flex: 1, fontSize: 13 },
  activityCost: { fontSize: 13, fontWeight: "600" },
});
