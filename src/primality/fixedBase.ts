import {millerRabin} from './millerRabin';
// Sorenson–Webster, Math. Comp. 86 (2017), 985–1003, Theorem 1.1.
// The bound is strict. Equality is the first counterexample for these 13 bases.
export const THIRTEEN_BASES=[2n,3n,5n,7n,11n,13n,17n,19n,23n,29n,31n,37n,41n] as const;
export const STRICT_BOUND=3317044064679887385961981n;
// Quarantined adversarial exhibit. Never used by generation or a prime verdict.
export function fixedBaseExhibit(n:bigint,k:number){if(k<1||k>13)throw Error('Fixed list has 1–13 bases');return THIRTEEN_BASES.slice(0,k).map(a=>({a,passes:!millerRabin(n,a).composite}));}
