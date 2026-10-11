import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useColors } from '@/hooks/useColors';
import { isValidDateString } from '@/lib/assetDates';
import { ASSET_CATEGORIES, Asset, AssetCategory, AssetInput } from '@/types/asset';

interface Props {
  initialAsset?: Asset;
  onSave: (input: AssetInput) => Promise<void>;
  onCancel: () => void;
}

type FormErrors = Partial<Record<'name' | 'category' | 'purchaseDate' | 'warrantyExpiry', string>>;

export function AssetForm({ initialAsset, onSave, onCancel }: Props) {
  const colors = useColors();
  const [name, setName] = useState(initialAsset?.name ?? '');
  const [category, setCategory] = useState<AssetCategory | ''>(
    initialAsset?.category ?? '',
  );
  const [brand, setBrand] = useState(initialAsset?.brand ?? '');
  const [purchaseDate, setPurchaseDate] = useState(initialAsset?.purchaseDate ?? '');
  const [warrantyExpiry, setWarrantyExpiry] = useState(initialAsset?.warrantyExpiry ?? '');
  const [notes, setNotes] = useState(initialAsset?.notes ?? '');
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const validate = () => {
    const nextErrors: FormErrors = {};
    if (!name.trim()) nextErrors.name = 'Add a name for this item.';
    if (!category) nextErrors.category = 'Choose a category.';
    if (purchaseDate.trim() && !isValidDateString(purchaseDate.trim())) {
      nextErrors.purchaseDate = 'Use a real date in YYYY-MM-DD format.';
    }
    if (warrantyExpiry.trim() && !isValidDateString(warrantyExpiry.trim())) {
      nextErrors.warrantyExpiry = 'Use a real date in YYYY-MM-DD format.';
    }
    if (
      purchaseDate.trim() &&
      warrantyExpiry.trim() &&
      isValidDateString(purchaseDate.trim()) &&
      isValidDateString(warrantyExpiry.trim()) &&
      warrantyExpiry.trim() < purchaseDate.trim()
    ) {
      nextErrors.warrantyExpiry = 'Warranty expiry must be after the purchase date.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || saving || !category) return;
    setSaving(true);
    setSaveError(null);
    try {
      await onSave({
        name: name.trim(),
        category,
        brand: brand.trim(),
        purchaseDate: purchaseDate.trim(),
        warrantyExpiry: warrantyExpiry.trim(),
        notes: notes.trim(),
      });
    } catch {
      setSaveError('Could not save this item. Check your phone storage and try again.');
    } finally {
      setSaving(false);
    }
  };

  const fieldStyle = [
    styles.input,
    { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground },
  ];

  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      bottomOffset={72}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.intro}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onCancel}
          style={[styles.backButton, { backgroundColor: colors.card }]}
          testID="asset-form-back"
        >
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>
          {initialAsset ? 'YOUR HOME' : 'ADD TO YOUR HOME'}
        </Text>
        <Text style={[styles.title, { color: colors.foreground }]}>
          {initialAsset ? 'Edit asset' : 'Add an asset'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Keep the important details in one easy place.
        </Text>
      </View>

      <Text style={[styles.label, { color: colors.foreground }]}>Asset name *</Text>
      <TextInput
        accessibilityLabel="Asset name"
        autoCapitalize="sentences"
        onChangeText={setName}
        placeholder="e.g. Living room air conditioner"
        placeholderTextColor={colors.mutedForeground}
        returnKeyType="next"
        style={fieldStyle}
        testID="asset-name-input"
        value={name}
      />
      {errors.name ? <FieldError message={errors.name} /> : null}

      <Text style={[styles.label, { color: colors.foreground }]}>Category *</Text>
      <View style={styles.categoryGrid}>
        {ASSET_CATEGORIES.map((item) => {
          const selected = category === item;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={item}
              onPress={() => setCategory(item)}
              style={[
                styles.categoryOption,
                {
                  backgroundColor: selected ? colors.primary : colors.card,
                  borderColor: selected ? colors.primary : colors.border,
                },
              ]}
              testID={`category-${item.toLowerCase().replaceAll(' ', '-')}`}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: selected ? colors.primaryForeground : colors.foreground },
                ]}
              >
                {item}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {errors.category ? <FieldError message={errors.category} /> : null}

      <Text style={[styles.label, { color: colors.foreground }]}>Brand</Text>
      <TextInput
        accessibilityLabel="Brand"
        autoCapitalize="words"
        onChangeText={setBrand}
        placeholder="e.g. Bosch"
        placeholderTextColor={colors.mutedForeground}
        returnKeyType="next"
        style={fieldStyle}
        testID="asset-brand-input"
        value={brand}
      />

      <Text style={[styles.label, { color: colors.foreground }]}>Purchase date</Text>
      <TextInput
        accessibilityLabel="Purchase date"
        keyboardType="numbers-and-punctuation"
        onChangeText={setPurchaseDate}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={colors.mutedForeground}
        returnKeyType="next"
        style={fieldStyle}
        testID="asset-purchase-date-input"
        value={purchaseDate}
      />
      {errors.purchaseDate ? <FieldError message={errors.purchaseDate} /> : null}

      <Text style={[styles.label, { color: colors.foreground }]}>Warranty expiry</Text>
      <TextInput
        accessibilityLabel="Warranty expiry date"
        keyboardType="numbers-and-punctuation"
        onChangeText={setWarrantyExpiry}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={colors.mutedForeground}
        returnKeyType="next"
        style={fieldStyle}
        testID="asset-warranty-date-input"
        value={warrantyExpiry}
      />
      {errors.warrantyExpiry ? <FieldError message={errors.warrantyExpiry} /> : null}

      <Text style={[styles.label, { color: colors.foreground }]}>Notes</Text>
      <TextInput
        accessibilityLabel="Notes"
        multiline
        onChangeText={setNotes}
        placeholder="Anything helpful to remember..."
        placeholderTextColor={colors.mutedForeground}
        style={[fieldStyle, styles.notes]}
        testID="asset-notes-input"
        textAlignVertical="top"
        value={notes}
      />

      {saveError ? (
        <Text accessibilityRole="alert" style={[styles.saveError, { color: colors.destructive }]}>
          {saveError}
        </Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: saving }}
        disabled={saving}
        onPress={handleSave}
        style={({ pressed }) => [
          styles.saveButton,
          { backgroundColor: colors.primary },
          (pressed || saving) && styles.buttonPressed,
        ]}
        testID="asset-save-button"
      >
        <Text style={[styles.saveText, { color: colors.primaryForeground }]}>
          {saving ? 'Saving…' : initialAsset ? 'Save changes' : 'Save asset'}
        </Text>
        {!saving ? <Feather name="arrow-right" size={18} color={colors.primaryForeground} /> : null}
      </Pressable>
      <Text style={[styles.optionalHint, { color: colors.mutedForeground }]}>
        Purchase date and warranty expiry are optional. Use YYYY-MM-DD when you add them.
      </Text>
    </KeyboardAwareScrollViewCompat>
  );
}

function FieldError({ message }: { message: string }) {
  const colors = useColors();
  return (
    <Text accessibilityRole="alert" style={[styles.fieldError, { color: colors.destructive }]}>
      {message}
    </Text>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 34,
  },
  intro: {
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  eyebrow: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 30,
    letterSpacing: -0.7,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    marginTop: 8,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    minHeight: 52,
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 15,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  categoryText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  fieldError: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    marginTop: 6,
  },
  notes: {
    minHeight: 108,
    paddingTop: 14,
  },
  saveError: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    marginTop: 14,
  },
  saveButton: {
    minHeight: 56,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 24,
  },
  saveText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
  optionalHint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 17,
    marginTop: 12,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
});
