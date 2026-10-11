import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Asset, AssetInput } from '@/types/asset';
import { shiftDate } from '@/lib/assetDates';

const STORAGE_KEY = 'homekeeper.assets.v1';

interface AssetContextValue {
  assets: Asset[];
  loading: boolean;
  error: string | null;
  retryLoad: () => void;
  addAsset: (input: AssetInput) => Promise<void>;
  updateAsset: (id: string, input: AssetInput) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
}

const AssetContext = createContext<AssetContextValue | null>(null);

function sampleAssets(): Asset[] {
  return [
    {
      id: 'sample-air-conditioner',
      name: 'Living room air conditioner',
      category: 'Air conditioning',
      brand: 'Daikin',
      purchaseDate: shiftDate(-18),
      warrantyExpiry: shiftDate(2, 10),
      notes: 'Clean the filters at the start of each season.',
    },
    {
      id: 'sample-dishwasher',
      name: 'Dishwasher',
      category: 'Kitchen',
      brand: 'Bosch',
      purchaseDate: shiftDate(-9),
      warrantyExpiry: shiftDate(15),
      notes: 'Keep the rinse-aid reservoir topped up.',
    },
  ];
}

function isAsset(value: unknown): value is Asset {
  if (!value || typeof value !== 'object') return false;
  const asset = value as Record<string, unknown>;
  return (
    typeof asset.id === 'string' &&
    typeof asset.name === 'string' &&
    typeof asset.category === 'string' &&
    typeof asset.brand === 'string' &&
    typeof asset.purchaseDate === 'string' &&
    typeof asset.warrantyExpiry === 'string' &&
    typeof asset.notes === 'string'
  );
}

export function AssetProvider({ children }: PropsWithChildren) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const assetsRef = useRef<Asset[]>([]);
  const writeQueue = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    AsyncStorage.getItem(STORAGE_KEY)
      .then(async (saved) => {
        if (!active) return;
        if (saved === null) {
          const samples = sampleAssets();
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(samples));
          if (!active) return;
          assetsRef.current = samples;
          setAssets(samples);
          return;
        }
        const parsed: unknown = JSON.parse(saved);
        if (!Array.isArray(parsed) || !parsed.every(isAsset)) {
          throw new Error('The saved asset list has an unexpected format.');
        }
        assetsRef.current = parsed;
        setAssets(parsed);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setError(
          cause instanceof Error
            ? `Your saved assets could not be loaded. ${cause.message}`
            : 'Your saved assets could not be loaded. Try again.',
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [loadAttempt]);

  const commit = useCallback(
    (change: (current: Asset[]) => Asset[]) => {
      const transaction = writeQueue.current.then(async () => {
        const next = change(assetsRef.current);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        assetsRef.current = next;
        setAssets(next);
      });
      writeQueue.current = transaction.catch(() => undefined);
      return transaction;
    },
    [],
  );

  const addAsset = useCallback(
    (input: AssetInput) =>
      commit((current) => [
        {
          ...input,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        },
        ...current,
      ]),
    [commit],
  );

  const updateAsset = useCallback(
    (id: string, input: AssetInput) =>
      commit((current) =>
        current.map((asset) => (asset.id === id ? { ...input, id } : asset)),
      ),
    [commit],
  );

  const deleteAsset = useCallback(
    (id: string) =>
      commit((current) => current.filter((asset) => asset.id !== id)),
    [commit],
  );

  const value = useMemo(
    () => ({
      assets,
      loading,
      error,
      retryLoad: () => setLoadAttempt((attempt) => attempt + 1),
      addAsset,
      updateAsset,
      deleteAsset,
    }),
    [assets, loading, error, addAsset, updateAsset, deleteAsset],
  );

  return <AssetContext.Provider value={value}>{children}</AssetContext.Provider>;
}

export function useAssets() {
  const context = useContext(AssetContext);
  if (!context) {
    throw new Error('useAssets must be used within AssetProvider.');
  }
  return context;
}
