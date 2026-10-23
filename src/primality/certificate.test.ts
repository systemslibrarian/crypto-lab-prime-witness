import { describe, expect, it } from 'vitest';
import { makeCertificate, verifyCertificate, type PrimeCertificate } from './certificate';

describe('recursive primality certificates', () => {
  it.each([2n, 3n, 17n, 97n, 65537n, 999983n])('independently verifies every factor proof for %s', p => {
    const proof = makeCertificate(p);
    const steps = verifyCertificate(JSON.parse(JSON.stringify(proof)));
    expect(steps.at(-1)?.p).toBe(p);
    for (const step of steps) {
      const claimed = step.p === 2n ? 1n : step.p - 1n;
      expect(step.checks.every(({ residue }) => residue !== 1n)).toBe(true);
      expect(claimed).toBeGreaterThan(0n);
    }
  });

  it.each([0n, 1n, 4n, 9n, 15n, 561n, 999981n])('does not generate a prime proof for %s', n => {
    expect(() => makeCertificate(n)).toThrow();
  });

  it('refuses a forged factor, missing proof, witness mutation and oversized tree', () => {
    const proof = makeCertificate(97n);
    const copy = (): PrimeCertificate => JSON.parse(JSON.stringify(proof));
    const wrongFactor = copy();
    wrongFactor.factors[0]!.q = '3';
    expect(() => verifyCertificate(wrongFactor)).toThrow();
    const missingFactor = copy();
    missingFactor.factors.pop();
    expect(() => verifyCertificate(missingFactor)).toThrow();
    const wrongWitness = copy();
    wrongWitness.witness = '1';
    expect(() => verifyCertificate(wrongWitness)).toThrow();
    const malformed = copy();
    malformed.factors[0]!.proof = malformed;
    expect(() => verifyCertificate(malformed)).toThrow();
  });
});
