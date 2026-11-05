/**
 * Compile-time check that a Zod schema's type is exactly the type generated from openapi.yaml (ADR-0003).
 * Usage: `contractMatches<z.infer<typeof Schema>, ContractType>(true);` fails `pnpm typecheck` on drift.
 */
export type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

export function contractMatches<A, B>(ok: Equal<A, B>): void {
  void ok;
}
