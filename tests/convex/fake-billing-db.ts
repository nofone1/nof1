/**
 * In-memory stand-in for the Convex database handle used by billing helpers.
 *
 * Only the surface `convex/billing.ts` actually touches is implemented:
 * indexed reads via equality constraints, plus insert, patch, and delete.
 * Index names are ignored — constraints are matched against document fields —
 * which is enough to exercise ordering and deduplication behavior.
 */

import type { BillingDb } from "../../convex/billing";

/** A stored document with the synthetic ID the fake assigns on insert. */
export interface FakeDoc extends Record<string, unknown> {
  _id: string;
}

interface EqConstraint {
  field: string;
  value: unknown;
}

/**
 * Records the equality constraints a `withIndex` callback declares.
 */
class ConstraintCollector {
  readonly constraints: EqConstraint[] = [];

  /**
   * Records one equality constraint.
   *
   * Params:
   *   field: Document field to match.
   *   value: Value the field must equal.
   *
   * Returns:
   *   This collector, so constraints can be chained.
   */
  eq(field: string, value: unknown): ConstraintCollector {
    this.constraints.push({ field, value });
    return this;
  }
}

/**
 * A queryable, in-memory Convex database used in unit tests.
 */
export class FakeBillingDb implements BillingDb {
  private readonly tables = new Map<string, FakeDoc[]>();
  private nextId = 1;

  /**
   * Starts a query against a table.
   *
   * Params:
   *   table: Table name.
   *
   * Returns:
   *   A query builder exposing `withIndex`, `collect`, and `first`.
   */
  query(table: string): unknown {
    const rows = this.tables.get(table) ?? [];

    const build = (matches: FakeDoc[]) => ({
      withIndex: (
        _index: string,
        constrain: (q: ConstraintCollector) => ConstraintCollector
      ) => {
        const collector = constrain(new ConstraintCollector());
        return build(
          matches.filter((row) =>
            collector.constraints.every(({ field, value }) => row[field] === value)
          )
        );
      },
      collect: async (): Promise<FakeDoc[]> => matches.map((row) => ({ ...row })),
      first: async (): Promise<FakeDoc | null> =>
        matches.length > 0 ? { ...matches[0] } : null,
    });

    return build(rows);
  }

  /**
   * Inserts a document and assigns it an ID.
   *
   * Params:
   *   table: Table name.
   *   doc: Document fields to store.
   *
   * Returns:
   *   The assigned document ID.
   */
  async insert(table: string, doc: Record<string, unknown>): Promise<string> {
    const id = `doc_${this.nextId}`;
    this.nextId += 1;

    const rows = this.tables.get(table) ?? [];
    rows.push({ ...doc, _id: id });
    this.tables.set(table, rows);

    return id;
  }

  /**
   * Merges updates into an existing document.
   *
   * Params:
   *   id: Document ID returned by insert.
   *   updates: Fields to merge.
   *
   * Returns:
   *   void.
   *
   * Throws:
   *   Error when no document has that ID.
   */
  async patch(id: unknown, updates: Record<string, unknown>): Promise<void> {
    for (const rows of this.tables.values()) {
      const index = rows.findIndex((row) => row._id === id);

      if (index >= 0) {
        rows[index] = { ...rows[index], ...updates, _id: rows[index]._id };
        return;
      }
    }

    throw new Error(`No document with id ${String(id)}`);
  }

  /**
   * Removes a document.
   *
   * Params:
   *   id: Document ID returned by insert.
   *
   * Returns:
   *   void.
   */
  async delete(id: unknown): Promise<void> {
    for (const [table, rows] of this.tables.entries()) {
      this.tables.set(
        table,
        rows.filter((row) => row._id !== id)
      );
    }
  }

  /**
   * Reads every row in a table, for assertions.
   *
   * Params:
   *   table: Table name.
   *
   * Returns:
   *   Copies of the stored documents.
   */
  rows(table: string): FakeDoc[] {
    return (this.tables.get(table) ?? []).map((row) => ({ ...row }));
  }
}
