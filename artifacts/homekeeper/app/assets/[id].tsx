import { Feather } from '@expo/vector-icons';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingState } from '@/components/LoadingState';
import { useAssets } from '@/context/AssetContext';
import { useColors } from '@/hooks/useColors';
import { daysFromToday, formatDate } from '@/lib/assetDates';

export default function AssetDetailsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { assets, loading, error, retryLoad, deleteAsset } = useAssets();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const asset = assets.find((item) => item.id === id);

  if (loading || error) {
    return <LoadingState error={error} onRetry={retryLoad} />;
  }

  if (!asset) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.notFound}>
          <Feather name="search" size={27} color={colors.mutedForeground} />
          <Text style={[styles.notFoundTitle, { color: colors.foreground }]}>Asset not found</Text>
          <Pressable onPress={() => router.replace('/(tabs)/assets' as Href)}>
            <Text style={[styles.link, { color: colors.primary }]}>Back to your assets</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const warrantyDays = daysFromToday(asset.warrantyExpiry);
  const warrantyStatus = !asset.warrantyExpiry
    ? 'No expiry date saved'
    : warrantyDays === null
      ? 'Date needs checking'
      : warrantyDays < 0
        ? 'Warranty has expired'
        : warrantyDays <= 90
          ? `Expires in ${warrantyDays} days`
          : 'Still covered';

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAsset(asset.id);
      router.replace('/(tabs)/assets' as Href);
    } catch {
      setDeleteError('Could not remove this asset. Your saved list has not been changed.');
      setDeleting(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.toolbar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            style={[styles.iconButton, { backgroundColor: colors.card }]}
            testID="asset-details-back"
          >
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Edit asset"
            onPress={() => router.push(`/assets/${asset.id}/edit` as Href)}
            style={[styles.editButton, { backgroundColor: colors.accent }]}
            testID="asset-edit-button"
          >
            <Feather name="edit-2" size={16} color={colors.primary} />
            <Text style={[styles.editText, { color: colors.primary }]}>Edit</Text>
          </Pressable>
        </View>

        <View style={[styles.heroIcon, { backgroundColor: colors.accent }]}>
          <Feather
            name={asset.category === 'Air conditioning' ? 'wind' : 'box'}
            size={29}
            color={colors.primary}
          />
        </View>
        <Text style={[styles.category, { color: colors.primary }]}>{asset.category.toUpperCase()}</Text>
        <Text style={[styles.name, { color: colors.foreground }]}>{asset.name}</Text>
        <Text style={[styles.brand, { color: colors.mutedForeground }]}>
          {asset.brand || 'Brand not added'}
        </Text>

        <View style={[styles.warrantyCard, { backgroundColor: colors.secondary }]}>
          <View style={[styles.warrantyIcon, { backgroundColor: colors.card }]}>
            <Feather name="shield" size={19} color={colors.primary} />
          </View>
          <View style={styles.warrantyCopy}>
            <Text style={[styles.warrantyLabel, { color: colors.mutedForeground }]}>WARRANTY</Text>
            <Text
              style={[
                styles.warrantyStatus,
                { color: warrantyDays !== null && warrantyDays >= 0 && warrantyDays <= 30 ? colors.destructive : colors.foreground },
              ]}
            >
              {warrantyStatus}
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Details</Text>
        <View style={[styles.detailsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <DetailRow
            label="Category"
            value={asset.category}
            icon="grid"
            colors={colors}
          />
          <DetailRow
            label="Brand"
            value={asset.brand || 'Not added'}
            icon="tag"
            colors={colors}
          />
          <DetailRow
            label="Purchase date"
            value={asset.purchaseDate ? formatDate(asset.purchaseDate) : 'Not added'}
            icon="shopping-bag"
            colors={colors}
          />
          <DetailRow
            label="Warranty expiry"
            value={asset.warrantyExpiry ? formatDate(asset.warrantyExpiry) : 'Not added'}
            icon="calendar"
            colors={colors}
            last={!asset.notes}
          />
          {asset.notes ? (
            <View style={styles.notesBlock}>
              <View style={styles.notesTitle}>
                <Feather name="file-text" size={15} color={colors.mutedForeground} />
                <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Notes</Text>
              </View>
              <Text style={[styles.notesText, { color: colors.foreground }]}>{asset.notes}</Text>
            </View>
          ) : null}
        </View>

        {confirmingDelete ? (
          <View
            accessibilityRole="alert"
            style={[styles.confirmDeleteCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.confirmDeleteTitle, { color: colors.foreground }]}>
              Remove {asset.name}?
            </Text>
            <Text style={[styles.confirmDeleteMessage, { color: colors.mutedForeground }]}>
              This deletes the asset from this phone. This can’t be undone.
            </Text>
            {deleteError ? (
              <Text accessibilityRole="alert" style={[styles.deleteError, { color: colors.destructive }]}>
                {deleteError}
              </Text>
            ) : null}
            <View style={styles.confirmActions}>
              <Pressable
                accessibilityRole="button"
                disabled={deleting}
                onPress={() => {
                  setConfirmingDelete(false);
                  setDeleteError(null);
                }}
                style={[styles.keepButton, { backgroundColor: colors.secondary }]}
                testID="asset-delete-cancel"
              >
                <Text style={[styles.keepText, { color: colors.secondaryForeground }]}>Keep asset</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: deleting }}
                disabled={deleting}
                onPress={() => void handleDelete()}
                style={[styles.confirmDeleteButton, { backgroundColor: colors.destructive }]}
                testID="asset-delete-confirm"
              >
                <Text style={[styles.confirmDeleteText, { color: colors.destructiveForeground }]}>
                  {deleting ? 'Removing…' : 'Delete'}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={() => setConfirmingDelete(true)}
            style={[styles.deleteButton, { borderColor: colors.border }]}
            testID="asset-delete-button"
          >
            <Feather name="trash-2" size={17} color={colors.destructive} />
            <Text style={[styles.deleteText, { color: colors.destructive }]}>Delete asset</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({
  label,
  value,
  icon,
  colors,
  last = false,
}: {
  label: string;
  value: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  colors: ReturnType<typeof useColors>;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.detailRow,
        !last && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
      ]}
    >
      <Feather name={icon} size={15} color={colors.mutedForeground} />
      <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: colors.foreground }]} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: 22, paddingTop: 8, paddingBottom: 32 },
  toolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 23 },
  iconButton: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  editButton: { minHeight: 42, paddingHorizontal: 14, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 7 },
  editText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  heroIcon: { width: 68, height: 68, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  category: { fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1.3 },
  name: { fontFamily: 'Inter_700Bold', fontSize: 28, lineHeight: 34, letterSpacing: -0.7, marginTop: 7 },
  brand: { fontFamily: 'Inter_400Regular', fontSize: 14, marginTop: 5 },
  warrantyCard: { borderRadius: 20, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 23, marginBottom: 27 },
  warrantyIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  warrantyCopy: { flex: 1, gap: 4 },
  warrantyLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 9, letterSpacing: 1.1 },
  warrantyStatus: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 19, marginBottom: 12 },
  detailsCard: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 15 },
  detailRow: { minHeight: 57, flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailLabel: { fontFamily: 'Inter_400Regular', fontSize: 12 },
  detailValue: { flex: 1, textAlign: 'right', fontFamily: 'Inter_500Medium', fontSize: 12 },
  notesBlock: { paddingVertical: 15, gap: 10 },
  notesTitle: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  notesText: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20, paddingLeft: 24 },
  deleteButton: { minHeight: 52, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9, marginTop: 22 },
  deleteText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  confirmDeleteCard: { borderWidth: 1, borderRadius: 19, padding: 16, marginTop: 22 },
  confirmDeleteTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  confirmDeleteMessage: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18, marginTop: 6 },
  deleteError: { fontFamily: 'Inter_500Medium', fontSize: 12, lineHeight: 18, marginTop: 9 },
  confirmActions: { flexDirection: 'row', gap: 9, marginTop: 15 },
  keepButton: { flex: 1, minHeight: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  keepText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  confirmDeleteButton: { flex: 1, minHeight: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  confirmDeleteText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 13 },
  notFoundTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 17 },
  link: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
});
