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
import { useAssets } from '@/context/AssetContext';
import { useColors } from '@/hooks/useColors';

export default function AssetsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { assets, loading, error, retryLoad } = useAssets();

  if (loading || error) {
    return <LoadingState error={error} onRetry={retryLoad} />;
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>YOUR HOME</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>Assets</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              {assets.length} {assets.length === 1 ? 'item' : 'items'} saved
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add an asset"
            onPress={() => router.push('/assets/new' as Href)}
            style={({ pressed }) => [
              styles.addButton,
              { backgroundColor: colors.primary },
              pressed && styles.pressed,
            ]}
            testID="assets-add-button"
          >
            <Feather name="plus" size={21} color={colors.primaryForeground} />
          </Pressable>
        </View>

        {assets.length > 0 ? (
          <View style={styles.list}>
            {assets.map((asset) => (
              <AssetCard
                asset={asset}
                key={asset.id}
                onPress={() => router.push(`/assets/${asset.id}` as Href)}
              />
            ))}
          </View>
        ) : (
          <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.accent }]}>
              <Feather name="package" size={25} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Nothing here just yet</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Add your appliances and keep their details, purchase dates, and warranties together.
            </Text>
            <Pressable
              onPress={() => router.push('/assets/new' as Href)}
              style={[styles.emptyButton, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.emptyButtonText, { color: colors.primaryForeground }]}>Add an asset</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: 21, paddingTop: 20, paddingBottom: 112 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 25 },
  eyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1.7, marginBottom: 8 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 30, letterSpacing: -0.6 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 5 },
  addButton: { width: 48, height: 48, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  list: { gap: 11 },
  empty: { alignItems: 'center', borderRadius: 23, borderWidth: 1, padding: 25, marginTop: 28 },
  emptyIcon: { width: 56, height: 56, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 16, marginTop: 16 },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 8 },
  emptyButton: { borderRadius: 15, paddingHorizontal: 18, paddingVertical: 13, marginTop: 17 },
  emptyButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
});
