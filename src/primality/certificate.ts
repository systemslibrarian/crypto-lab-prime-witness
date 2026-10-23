import { pow } from '../nt/bigint';

/** A recursive Lucas–Pratt certificate. All integers are decimal strings for JSON portability. */
export interface PrimeCertificate {
  p: string;
  witness: string;
  factors: { q: string; exponent: number; proof: PrimeCertificate }[];
}

export interface CertificateStep {
  p: bigint;
  witness: bigint;
  factorization: string;
  checks: { q: bigint; residue: bigint }[];
}

const LIMIT = 1_000_000n; // This browser exhibit factors p-1 by trial division.
const DECIMAL = /^(0|[1-9][0-9]*)$/;

function isPrimeForGeneration(n: bigint): boolean {
  if (n < 2n) return false;
  for (let d = 2n; d * d <= n; d += d === 2n ? 1n : 2n) {
    if (n % d === 0n) return false;
  }
  return true;
}

function parseInteger(value: unknown): bigint {
  if (typeof value !== 'string' || !DECIMAL.test(value) || value.length > 7) {
    throw new Error('Certificate integers must be canonical decimal strings within the toy limit.');
  }
  return BigInt(value);
}

function factorSmall(n: bigint): { q: bigint; exponent: number }[] {
  const factors: { q: bigint; exponent: number }[] = [];
  let rest = n;
  for (let q = 2n; q * q <= rest; q += q === 2n ? 1n : 2n) {
    if (rest % q !== 0n) continue;
    let exponent = 0;
    do { rest /= q; exponent++; } while (rest % q === 0n);
    factors.push({ q, exponent });
  }
  if (rest > 1n) factors.push({ q: rest, exponent: 1 });
  return factors;
}

/** Generation may search and factor; verification below does neither. */
export function makeCertificate(p: bigint): PrimeCertificate {
  if (p < 2n || p > LIMIT) throw new Error('Choose an integer from 2 through 1,000,000.');
  if (p === 2n) return { p: '2', witness: '1', factors: [] };
  if (!isPrimeForGeneration(p)) throw new Error('No prime certificate exists for this composite input.');
  const factors = factorSmall(p - 1n);
  let a: bigint | undefined;
  for (let candidate = 2n; candidate < p; candidate++) {
    if (pow(candidate, p - 1n, p) === 1n &&
        factors.every(({ q }) => pow(candidate, (p - 1n) / q, p) !== 1n)) {
      a = candidate;
      break;
    }
  }
  if (a === undefined) throw new Error('No certificate for this input: it is composite.');
  return {
    p: String(p),
    witness: String(a),
    factors: factors.map(({ q, exponent }) => ({ q: String(q), exponent, proof: makeCertificate(q) })),
  };
}

/**
 * Verify only the supplied proof: recursively prove each factor q, check that
 * their powers multiply to p-1, and establish that a has order exactly p-1.
 * No probable-prime oracle, factorization, or generator call is used here.
 */
export function verifyCertificate(input: unknown): CertificateStep[] {
  let nodes = 0;
  const steps: CertificateStep[] = [];
  const visit = (value: unknown, depth: number): bigint => {
    if (++nodes > 128 || depth > 32 || !value || typeof value !== 'object' || Array.isArray(value)) {
      throw new Error('Malformed or oversized certificate tree.');
    }
    const node = value as Record<string, unknown>;
    const p = parseInteger(node.p);
    const a = parseInteger(node.witness);
    if (p < 2n || p > LIMIT || !Array.isArray(node.factors)) {
      throw new Error('Candidate or factor list is out of bounds.');
    }
    if (p === 2n) {
      if (a !== 1n || node.factors.length !== 0) throw new Error('The base case for 2 is invalid.');
      steps.push({ p, witness: a, factorization: '1', checks: [] });
      return p;
    }
    if (p % 2n === 0n || a < 2n || a >= p || node.factors.length === 0) {
      throw new Error('A non-base node needs an odd candidate and a valid witness.');
    }
    let product = 1n;
    const seen = new Set<string>();
    const checks: { q: bigint; residue: bigint }[] = [];
    const terms: string[] = [];
    for (const factor of node.factors) {
      if (!factor || typeof factor !== 'object' || Array.isArray(factor)) {
        throw new Error('Malformed factor.');
      }
      const f = factor as Record<string, unknown>;
      const q = parseInteger(f.q);
      if (!Number.isInteger(f.exponent) || (f.exponent as number) < 1 || (f.exponent as number) > 20 || seen.has(String(q))) {
        throw new Error('Duplicate factor or invalid exponent.');
      }
      seen.add(String(q));
      if (visit(f.proof, depth + 1) !== q) throw new Error('A factor proof certifies another number.');
      product *= q ** BigInt(f.exponent as number);
      if (product > p - 1n) throw new Error('Claimed factors exceed p−1.');
      const residue = pow(a, (p - 1n) / q, p);
      checks.push({ q, residue });
      terms.push(`${q}${f.exponent === 1 ? '' : `^${f.exponent}`}`);
    }
    if (product !== p - 1n) throw new Error('Claimed prime factors do not multiply to p−1.');
    if (pow(a, p - 1n, p) !== 1n || checks.some(({ residue }) => residue === 1n)) {
      throw new Error('Witness fails the full-order congruence checks.');
    }
    steps.push({ p, witness: a, factorization: terms.join(' × '), checks });
    return p;
  };
  visit(input, 0);
  return steps;
}
