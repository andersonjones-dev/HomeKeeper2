import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { daysFromToday, formatDate } from '@/lib/assetDates';
import { Asset } from '@/types/asset';

interface Props {
  asset: Asset;
  onPress: () => void;
}

export function AssetCard({ asset, onPress }: Props) {
  const colors = useColors();
  const days = daysFromToday(asset.warrantyExpiry);
  const warrantyLabel =
    !asset.warrantyExpiry
      ? 'No warranty date'
      : days === null
        ? 'Check warranty date'
        : days < 0
          ? 'Warranty ended'
          : days <= 90
            ? `Warranty in ${days} days`
            : `Covered until ${formatDate(asset.warrantyExpiry)}`;
  const isUrgent = days !== null && days <= 30;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${asset.name}, ${asset.category}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && styles.pressed,
      ]}
      testID={`asset-card-${asset.id}`}
    >
      <View style={[styles.icon, { backgroundColor: colors.accent }]}>
        <Feather
          name={asset.category === 'Air conditioning' ? 'wind' : 'box'}
          size={21}
          color={colors.primary}
        />
      </View>
      <View style={styles.content}>
        <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
          {asset.name}
        </Text>
        <Text style={[styles.meta, { color: colors.mutedForeground }]} numberOfLines={1}>
          {[asset.brand, asset.category].filter(Boolean).join(' · ')}
        </Text>
        <Text
          style={[
            styles.warranty,
            { color: isUrgent ? colors.destructive : colors.mutedForeground },
          ]}
          numberOfLines={1}
        >
          {warrantyLabel}
        </Text>
      </View>
      <Feather name="chevron-right" size={19} color={colors.mutedForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 98,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
  meta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  warranty: {
    marginTop: 2,
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
});
