import { Feather } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AssetCard } from '@/components/AssetCard';
import { LoadingState } from '@/components/LoadingState';
import { useColors } from '@/hooks/useColors';
import { daysFromToday, formatDate } from '@/lib/assetDates';
import { useAssets } from '@/context/AssetContext';

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { assets, loading, error, retryLoad } = useAssets();

  if (loading || error) {
    return <LoadingState error={error} onRetry={retryLoad} />;
  }

  const upcoming = assets
    .filter((asset) => {
      const days = daysFromToday(asset.warrantyExpiry);
      return days !== null && days >= 0 && days <= 90;
    })
    .sort((a, b) => a.warrantyExpiry.localeCompare(b.warrantyExpiry));

  const goToAsset = (id: string) => router.push(`/assets/${id}` as Href);
  const goToAdd = () => router.push('/assets/new' as Href);

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <View>
            <Text style={[styles.brand, { color: colors.primary }]}>HOMEKEEPER</Text>
            <Text style={[styles.greeting, { color: colors.foreground }]}>Your home, cared for.</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add an asset"
            onPress={goToAdd}
            style={({ pressed }) => [
              styles.addButton,
              { backgroundColor: colors.primary },
              pressed && styles.pressed,
            ]}
            testID="dashboard-add-asset"
          >
            <Feather name="plus" size={22} color={colors.primaryForeground} />
          </Pressable>
        </View>

        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          A little care goes a long way.
        </Text>

        <View style={[styles.summary, { backgroundColor: colors.secondary }]}>
          <View style={styles.summaryTop}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.card }]}>
              <Feather name="home" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.summaryLabel, { color: colors.secondaryForeground }]}>
              YOUR HOME AT A GLANCE
            </Text>
          </View>
          <View style={styles.summaryNumbers}>
            <View style={styles.summaryMetric}>
              <Text style={[styles.summaryNumber, { color: colors.foreground }]}>{assets.length}</Text>
              <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>
                {assets.length === 1 ? 'saved asset' : 'saved assets'}
              </Text>
            </View>
            <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryMetric}>
              <Text style={[styles.summaryNumber, { color: colors.foreground }]}>{upcoming.length}</Text>
              <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>
                warranty watch
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Upcoming maintenance</Text>
            <Text style={[styles.sectionCaption, { color: colors.mutedForeground }]}>
              Warranty milestones in the next 90 days
            </Text>
          </View>
          {upcoming.length > 0 ? (
            <View style={[styles.countBadge, { backgroundColor: colors.accent }]}>
              <Text style={[styles.countText, { color: colors.primary }]}>{upcoming.length}</Text>
            </View>
          ) : null}
        </View>

        {upcoming.length > 0 ? (
          <View style={[styles.upcomingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {upcoming.slice(0, 3).map((asset, index) => {
              const days = daysFromToday(asset.warrantyExpiry) ?? 0;
              return (
                <Pressable
                  accessibilityRole="button"
                  key={asset.id}
                  onPress={() => goToAsset(asset.id)}
                  style={[
                    styles.upcomingRow,
                    index < Math.min(upcoming.length, 3) - 1 && {
                      borderBottomColor: colors.border,
                      borderBottomWidth: 1,
                    },
                  ]}
                >
                  <View style={[styles.calendarIcon, { backgroundColor: colors.accent }]}>
                    <Feather name="calendar" size={17} color={colors.primary} />
                  </View>
                  <View style={styles.upcomingInfo}>
                    <Text style={[styles.upcomingName, { color: colors.foreground }]} numberOfLines={1}>
                      {asset.name}
                    </Text>
                    <Text style={[styles.upcomingDate, { color: colors.mutedForeground }]}>
                      {formatDate(asset.warrantyExpiry)}
                    </Text>
                  </View>
                  <Text style={[styles.daysLeft, { color: colors.primary }]}>
                    {days === 0 ? 'Today' : `${days}d`}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={[styles.quietCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.quietIcon, { backgroundColor: colors.accent }]}>
              <Feather name="check" size={18} color={colors.primary} />
            </View>
            <View style={styles.quietCopy}>
              <Text style={[styles.quietTitle, { color: colors.foreground }]}>All clear for now</Text>
              <Text style={[styles.quietText, { color: colors.mutedForeground }]}>
                We’ll show upcoming warranty dates here.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Your assets</Text>
            <Text style={[styles.sectionCaption, { color: colors.mutedForeground }]}>
              The things that make home, home
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/assets' as Href)}
            testID="dashboard-view-all-assets"
          >
            <Text style={[styles.viewAll, { color: colors.primary }]}>See all</Text>
          </Pressable>
        </View>

        {assets.length > 0 ? (
          <View style={styles.assetList}>
            {assets.slice(0, 3).map((asset) => (
              <AssetCard key={asset.id} asset={asset} onPress={() => goToAsset(asset.id)} />
            ))}
          </View>
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="package" size={25} color={colors.primary} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Start your home list</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Add an appliance to keep its details and warranty close at hand.
            </Text>
            <Pressable onPress={goToAdd} style={[styles.emptyButton, { backgroundColor: colors.primary }]}>
              <Text style={[styles.emptyButtonText, { color: colors.primaryForeground }]}>Add your first asset</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: 21, paddingTop: 13, paddingBottom: 112 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 2.1, marginBottom: 7 },
  greeting: { fontFamily: 'Inter_700Bold', fontSize: 25, letterSpacing: -0.6 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, marginTop: 7, marginBottom: 23 },
  addButton: { width: 48, height: 48, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  summary: { borderRadius: 24, padding: 19, marginBottom: 28 },
  summaryTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryIcon: { width: 36, height: 36, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  summaryLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1.05 },
  summaryNumbers: { flexDirection: 'row', marginTop: 20, alignItems: 'center' },
  summaryMetric: { flex: 1 },
  summaryNumber: { fontFamily: 'Inter_700Bold', fontSize: 31, letterSpacing: -1 },
  metricLabel: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 1 },
  metricDivider: { height: 42, width: 1, marginHorizontal: 15 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 19, letterSpacing: -0.35 },
  sectionCaption: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 4 },
  countBadge: { minWidth: 30, height: 30, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  countText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  upcomingCard: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 14, marginBottom: 27 },
  upcomingRow: { minHeight: 71, flexDirection: 'row', alignItems: 'center', gap: 11 },
  calendarIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  upcomingInfo: { flex: 1, gap: 4 },
  upcomingName: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  upcomingDate: { fontFamily: 'Inter_400Regular', fontSize: 11 },
  daysLeft: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  quietCard: { borderRadius: 20, borderWidth: 1, minHeight: 83, flexDirection: 'row', alignItems: 'center', padding: 15, gap: 13, marginBottom: 27 },
  quietIcon: { width: 39, height: 39, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  quietCopy: { flex: 1 },
  quietTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  quietText: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4 },
  viewAll: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  assetList: { gap: 10 },
  emptyCard: { alignItems: 'center', borderRadius: 20, borderWidth: 1, padding: 24 },
  emptyTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15, marginTop: 13 },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 6, maxWidth: 245 },
  emptyButton: { borderRadius: 14, paddingHorizontal: 17, paddingVertical: 12, marginTop: 16 },
  emptyButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
});
