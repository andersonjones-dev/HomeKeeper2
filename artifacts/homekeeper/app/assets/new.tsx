import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AssetForm } from '@/components/AssetForm';
import { useAssets } from '@/context/AssetContext';
import { useColors } from '@/hooks/useColors';

export default function NewAssetScreen() {
  const router = useRouter();
  const colors = useColors();
  const { addAsset } = useAssets();

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: colors.background }}>
      <AssetForm
        onCancel={() => router.back()}
        onSave={async (input) => {
          await addAsset(input);
          router.back();
        }}
      />
    </SafeAreaView>
  );
}
