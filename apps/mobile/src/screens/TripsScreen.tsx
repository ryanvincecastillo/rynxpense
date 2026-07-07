import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { colors } from "@rynxpense/ui-tokens";
import { formatCurrency } from "@rynxpense/shared";
import { fetchTrips } from "../services/api";

export function TripsScreen() {
  const navigation = useNavigation<any>();
  const { data: trips = [], isLoading, refetch } = useQuery({
    queryKey: ["trips"],
    queryFn: fetchTrips,
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Trips</Text>
      <FlatList
        data={trips}
        keyExtractor={(item: { id: string }) => item.id}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No trips yet</Text>
            <TouchableOpacity style={styles.cta} onPress={() => navigation.navigate("Plan")}>
              <Text style={styles.ctaText}>Plan your first trip</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }: { item: { id: string; destination: string; budgetAmount: number; status: string } }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("TripDetail", { tripId: item.id })}
          >
            <Text style={styles.cardTitle}>{item.destination}</Text>
            <Text style={styles.cardMeta}>
              {formatCurrency(item.budgetAmount)} · {item.status}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 60, paddingHorizontal: 16 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  cardMeta: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  empty: { alignItems: "center", paddingTop: 60 },
  emptyText: { color: colors.textMuted, marginBottom: 16 },
  cta: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 12 },
  ctaText: { color: colors.white, fontWeight: "600" },
});
