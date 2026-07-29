import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Protocol, CreateProtocolInput, AdherenceEntry } from "@/types/protocol";
import {
  convexMutation,
  convexQuery,
  isConvexConfigured,
} from "@/services/backend/convex-client";

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

function toDate(value: unknown): Date {
  if (value instanceof Date) {
    return value;
  }

  return new Date(String(value));
}

function toIso(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  return new Date().toISOString();
}

function parseProtocol(raw: Record<string, any>): Protocol {
  return {
    ...(raw as Protocol),
    startDate: toDate(raw.startDate),
    endDate: raw.endDate ? toDate(raw.endDate) : undefined,
    createdAt: toDate(raw.createdAt),
  };
}

function serializeProtocolInput(input: CreateProtocolInput): Record<string, unknown> {
  return {
    ...input,
    startDate: toIso(input.startDate),
    endDate: input.endDate ? toIso(input.endDate) : undefined,
  };
}

function serializeProtocolUpdates(updates: Partial<Protocol>): Record<string, unknown> {
  const serialized: Record<string, unknown> = { ...updates };

  if (updates.startDate) {
    serialized.startDate = toIso(updates.startDate);
  }

  if (updates.endDate) {
    serialized.endDate = toIso(updates.endDate);
  }

  if (updates.createdAt) {
    serialized.createdAt = toIso(updates.createdAt);
  }

  return serialized;
}

async function loadLocalProtocols(): Promise<Protocol[]> {
  const data = await AsyncStorage.getItem(PROTOCOLS_KEY);
  if (!data) {
    return [];
  }

  const parsed = JSON.parse(data) as Protocol[];
  return parsed.map((protocol) => parseProtocol(protocol as any));
}

async function persistLocalProtocols(protocols: Protocol[]): Promise<void> {
  await AsyncStorage.setItem(PROTOCOLS_KEY, JSON.stringify(protocols));
}

export const useProtocolStore = create<ProtocolStore>((set, get) => ({
  protocols: [],
  isLoading: false,
  error: null,

  loadProtocols: async () => {
    set({ isLoading: true, error: null });

    try {
      if (isConvexConfigured()) {
        const protocols = await convexQuery<Record<string, any>[]>("protocols:list");
        set({
          protocols: protocols.map((protocol) => parseProtocol(protocol)),
          isLoading: false,
        });
        return;
      }

      const protocols = await loadLocalProtocols();
      set({ protocols, isLoading: false });
    } catch {
      set({ error: "Failed to load protocols", isLoading: false });
    }
  },

  createProtocol: async (input: CreateProtocolInput) => {
    if (isConvexConfigured()) {
      const created = await convexMutation<Record<string, any>>("protocols:create", {
        input: serializeProtocolInput(input),
      });
      set({ protocols: [parseProtocol(created), ...get().protocols] });
      return;
    }

    const newProtocol: Protocol = {
      ...input,
      id: `protocol-${Date.now()}`,
      isActive: input.isActive ?? true,
      adherence: [],
      createdAt: new Date(),
    };

    const updated = [...get().protocols, newProtocol];
    set({ protocols: updated });
    await persistLocalProtocols(updated);
  },

  updateProtocol: async (id: string, updates: Partial<Protocol>) => {
    if (isConvexConfigured()) {
      const updated = await convexMutation<Record<string, any>>("protocols:update", {
        id,
        updates: serializeProtocolUpdates(updates),
      });

      set({
        protocols: get().protocols.map((protocol) =>
          protocol.id === id ? parseProtocol(updated) : protocol
        ),
      });
      return;
    }

    const protocols = get().protocols.map((protocol) =>
      protocol.id === id ? { ...protocol, ...updates } : protocol
    );

    set({ protocols });
    await persistLocalProtocols(protocols);
  },

  deleteProtocol: async (id: string) => {
    if (isConvexConfigured()) {
      await convexMutation("protocols:remove", { id });
      set({ protocols: get().protocols.filter((protocol) => protocol.id !== id) });
      return;
    }

    const protocols = get().protocols.filter((protocol) => protocol.id !== id);
    set({ protocols });
    await persistLocalProtocols(protocols);
  },

  toggleActive: async (id: string) => {
    if (isConvexConfigured()) {
      const updated = await convexMutation<Record<string, any>>("protocols:toggleActive", {
        id,
      });
      set({
        protocols: get().protocols.map((protocol) =>
          protocol.id === id ? parseProtocol(updated) : protocol
        ),
      });
      return;
    }

    const protocols = get().protocols.map((protocol) =>
      protocol.id === id ? { ...protocol, isActive: !protocol.isActive } : protocol
    );
    set({ protocols });
    await persistLocalProtocols(protocols);
  },

  logAdherence: async (protocolId: string, entry: AdherenceEntry) => {
    if (isConvexConfigured()) {
      const updated = await convexMutation<Record<string, any>>("protocols:logAdherence", {
        protocolId,
        entry,
      });
      set({
        protocols: get().protocols.map((protocol) =>
          protocol.id === protocolId ? parseProtocol(updated) : protocol
        ),
      });
      return;
    }

    const protocols = get().protocols.map((protocol) => {
      if (protocol.id !== protocolId) {
        return protocol;
      }

      const adherence = [...protocol.adherence];
      const existingIndex = adherence.findIndex((item) => item.date === entry.date);

      if (existingIndex >= 0) {
        adherence[existingIndex] = entry;
      } else {
        adherence.push(entry);
      }

      return {
        ...protocol,
        adherence,
      };
    });

    set({ protocols });
    await persistLocalProtocols(protocols);
  },

  getActiveProtocols: () => {
    return get().protocols.filter((protocol) => protocol.isActive);
  },

  clearError: () => set({ error: null }),
}));

export function useActiveProtocols(): Protocol[] {
  return useProtocolStore((state) => state.protocols.filter((protocol) => protocol.isActive));
}
