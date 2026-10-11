import { Feather } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface Props {
  error?: string | null;
  onRetry?: () => void;
}

export function LoadingState({ error, onRetry }: Props) {
  const colors = useColors();
  return (
    <View style={[styles.wrap, { backgroundColor: colors.background }]}>
      {error ? (
        <>
          <View style={[styles.icon, { backgroundColor: colors.accent }]}>
            <Feather name="alert-circle" size={23} color={colors.destructive} />
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>Couldn’t open your assets</Text>
          <Text style={[styles.message, { color: colors.mutedForeground }]}>{error}</Text>
          {onRetry ? (
            <Pressable onPress={onRetry} style={[styles.button, { backgroundColor: colors.primary }]}>
              <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>Try again</Text>
            </Pressable>
          ) : null}
        </>
      ) : (
        <ActivityIndicator color={colors.primary} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  icon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    textAlign: 'center',
  },
  message: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 14,
    marginTop: 18,
  },
  buttonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
});
