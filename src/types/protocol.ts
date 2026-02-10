/**
 * Types for the protocol management system.
 * Protocols represent structured dosing plans that users follow.
 */

/**
 * Represents a user's dosing protocol.
 */
export interface Protocol {
  id: string;
  userId: string;
  name: string;
  peptideId?: string;
  peptideName: string;
  dosage: string;
  frequency: string;
  route: string;
  cycleDuration: string;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  notes?: string;
  adherence: AdherenceEntry[];
  createdAt: Date;
}

/**
 * Represents a daily adherence record.
 */
export interface AdherenceEntry {
  date: string;
  taken: boolean;
  skipped?: boolean;
  notes?: string;
}

/**
 * Input type for creating a new protocol.
 */
export type CreateProtocolInput = Omit<Protocol, "id" | "adherence" | "createdAt" | "isActive"> & {
  isActive?: boolean;
};

/**
 * Calculate adherence percentage for a protocol.
 * @param protocol - The protocol to calculate for
 * @returns Percentage (0-100)
 */
export function calculateAdherence(protocol: Protocol): number {
  if (protocol.adherence.length === 0) return 0;
  const taken = protocol.adherence.filter((a) => a.taken).length;
  return Math.round((taken / protocol.adherence.length) * 100);
}
