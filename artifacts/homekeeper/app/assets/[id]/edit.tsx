import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AssetForm } from '@/components/AssetForm';
import { LoadingState } from '@/components/LoadingState';
import { useAssets } from '@/context/AssetContext';
import { useColors } from '@/hooks/useColors';

export default function EditAssetScreen() {
  const router = useRouter();
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { assets, loading, error, retryLoad, updateAsset } = useAssets();
  const asset = assets.find((item) => item.id === id);

  if (loading || error) return <LoadingState error={error} onRetry={retryLoad} />;
  if (!asset) return <LoadingState error="This asset could not be found." onRetry={() => router.back()} />;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: colors.background }}>
      <AssetForm
        initialAsset={asset}
        onCancel={() => router.back()}
        onSave={async (input) => {
          await updateAsset(asset.id, input);
          router.back();
        }}
      />
    </SafeAreaView>
  );
}
