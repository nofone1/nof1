/**
 * Zustand store for managing user protocols.
 * Handles CRUD operations, adherence tracking, and persistence.
 */

import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Protocol, CreateProtocolInput, AdherenceEntry } from "@/types/protocol";
import { getTodayDateString } from "@/types/tracking";

const PROTOCOLS_KEY = "@nof1/protocols";

interface ProtocolState {
  protocols: Protocol[];
  isLoading: boolean;
  error: string | null;
}

interface ProtocolActions {
  loadProtocols: () => Promise<void>;
  createProtocol: (input: CreateProtocolInput) => Promise<void>;
  updateProtocol: (id: string, updates: Partial<Protocol>) => Promise<void>;
  deleteProtocol: (id: string) => Promise<void>;
  toggleActive: (id: string) => Promise<void>;
  logAdherence: (protocolId: string, entry: AdherenceEntry) => Promise<void>;
  getActiveProtocols: () => Protocol[];
  clearError: () => void;
}

type ProtocolStore = ProtocolState & ProtocolActions;

async function persistProtocols(protocols: Protocol[]): Promise<void> {
  await AsyncStorage.setItem(PROTOCOLS_KEY, JSON.stringify(protocols));
}

export const useProtocolStore = create<ProtocolStore>((set, get) => ({
  protocols: [],
  isLoading: false,
  error: null,

  loadProtocols: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await AsyncStorage.getItem(PROTOCOLS_KEY);
      if (data) {
        const parsed = JSON.parse(data) as Protocol[];
        const protocols = parsed.map((p) => ({
          ...p,
          startDate: new Date(p.startDate),
          endDate: p.endDate ? new Date(p.endDate) : undefined,
          createdAt: new Date(p.createdAt),
        }));
        set({ protocols, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ error: "Failed to load protocols", isLoading: false });
    }
  },

  createProtocol: async (input: CreateProtocolInput) => {
    const originalProtocols = get().protocols;
    const newProtocol: Protocol = {
      ...input,
      id: `protocol-${Date.now()}`,
      isActive: input.isActive ?? true,
      adherence: [],
      createdAt: new Date(),
    };

    const updated = [...originalProtocols, newProtocol];
    set({ protocols: updated });

    try {
      await persistProtocols(updated);
    } catch {
      set({ protocols: originalProtocols, error: "Failed to create protocol" });
    }
  },

  updateProtocol: async (id: string, updates: Partial<Protocol>) => {
    const originalProtocols = get().protocols;
    const updated = originalProtocols.map((p) =>
      p.id === id ? { ...p, ...updates } : p,
    );
    set({ protocols: updated });

    try {
      await persistProtocols(updated);
    } catch {
      set({ protocols: originalProtocols, error: "Failed to update protocol" });
    }
  },

  deleteProtocol: async (id: string) => {
    const originalProtocols = get().protocols;
    const updated = originalProtocols.filter((p) => p.id !== id);
    set({ protocols: updated });

    try {
      await persistProtocols(updated);
    } catch {
      set({ protocols: originalProtocols, error: "Failed to delete protocol" });
    }
  },

  toggleActive: async (id: string) => {
    const originalProtocols = get().protocols;
    const updated = originalProtocols.map((p) =>
      p.id === id ? { ...p, isActive: !p.isActive } : p,
    );
    set({ protocols: updated });

    try {
      await persistProtocols(updated);
    } catch {
      set({ protocols: originalProtocols, error: "Failed to toggle protocol" });
    }
  },

  logAdherence: async (protocolId: string, entry: AdherenceEntry) => {
    const originalProtocols = get().protocols;
    const updated = originalProtocols.map((p) => {
      if (p.id !== protocolId) return p;
      // Replace existing entry for same date, or add new
      const existing = p.adherence.findIndex((a) => a.date === entry.date);
      const adherence = [...p.adherence];
      if (existing >= 0) {
        adherence[existing] = entry;
      } else {
        adherence.push(entry);
      }
      return { ...p, adherence };
    });
    set({ protocols: updated });

    try {
      await persistProtocols(updated);
    } catch {
      set({ protocols: originalProtocols, error: "Failed to log adherence" });
    }
  },

  getActiveProtocols: () => {
    return get().protocols.filter((p) => p.isActive);
  },

  clearError: () => set({ error: null }),
}));

/**
 * Selector hook for active protocols.
 */
export function useActiveProtocols(): Protocol[] {
  return useProtocolStore((state) => state.protocols.filter((p) => p.isActive));
}
