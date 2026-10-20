# Prime Witness

Fermat · Miller–Rabin · Carmichael numbers

## What It Is

Prime Witness is an interactive, browser-only study of probabilistic primality testing. Its BigInt arithmetic is real: follow Miller–Rabin's square chain, extract and independently check a factor, count all lying bases in small examples, and defeat fixed-base testing with published composites.

This is not production cryptography. Miller–Rabin passing a random sample means **probably prime**, not a certificate. Deterministic tests can prove primality; the introductory wording in `brief.md` is corrected accordingly. The generator follows the sieve-plus-Miller–Rabin testing shape, not the complete FIPS RSA prime-generation procedure.

Built to the [Crypto Lab master standard](https://github.com/systemslibrarian/crypto-lab/blob/main/audits/_MASTER-TEMPLATE.md). The original brief travels with the source. General UI/contrast machinery derives from the MIT-licensed Crypto Lab siblings by Paul Clark.

## Exhibits

1. **Witness stepper:** the 561/base-2 chain, a nontrivial square root, and its factor; also start-at-1, reach-minus-1, and exhausted-chain outcomes.
2. **Count the liars:** exhaustive Fermat and strong-liar counts, Korselt's criterion, and explicit denominators, including the exception n = 9.
3. **Defeat fixed bases:** the published 4-, 12-, and 13-base pseudoprimes, their multiplied-back factors, and a fresh recorded sample of random bases.
4. **Prime density:** 16–2048-bit candidates, counts and timings, a per-run histogram, and the labelled prime-number-theorem estimate.
5. **Liar census:** exact counts for odd composites through a selectable cap of 2,001; larger individual presets include 8,911.
6. **1024-bit generation:** five rounds from FIPS 186-5 Table B.1 (the 2^-112 random-generation target), with the limits of that statement on screen.

## When to Use It

Use this to teach what a probable-prime test establishes, why randomness in base selection matters, and how witnesses differ from certificates. Do **not** use its generated values for real keys or infer FIPS compliance from its table reference.

## Live Demo

Target: [Prime Witness](https://systemslibrarian.github.io/crypto-lab-prime-witness/). The Actions workflow publishes only after correctness, browser claims, accessibility, and mutation gates pass.

## What Can Go Wrong

- A fixed list used beyond its proven strict bound accepts known composites. The list and bound are pinned together in tests.
- Fermat accepts every coprime base for a Carmichael number.
- An exhausted Miller–Rabin chain can prove compositeness without producing a factor.
- Random-candidate posterior error estimates in FIPS Table B.1 are **not** the adversarial fixed-composite 4^-t bound.
- The stronger φ(n)/4 strong-liar bound excludes 9; the all-base quarter bound has a different denominator.
- BigInt is not constant-time. The browser RNG is not established as a FIPS-validated DRBG. No secrets are persisted.
- Workers are terminated on cancellation; changed inputs retire old verdicts. In degraded worker-unavailable mode, bounded computation can occupy the main thread.

## Real-World Usage

Primality tests support RSA keys and many finite-field constructions. The 2018 paper [Prime and Prejudice](https://eprint.iacr.org/2018/749) studies adversarial parameters and historical library configurations; it is not a statement that current releases retain those defects.

Primary references: [HAC Chapter 4](https://cacr.uwaterloo.ca/hac/about/chap4.pdf), [Sorenson–Webster](https://arxiv.org/abs/1509.00864), [FIPS 186-5](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.186-5.pdf) B.3.1 / Table B.1 / C.1, and Katz–Lindell third edition §9.2. Sequence identifiers and attribution are in `src/data/sequences.ts`.

## How to Run Locally

Requires Node 22 or newer.

```sh
npm ci
npm run dev
```

## Related Demos

[Factor Forge](https://systemslibrarian.github.io/crypto-lab-factor-forge/), [Residue Gate](https://systemslibrarian.github.io/crypto-lab-residue-gate/), [Educational RSA](https://systemslibrarian.github.io/crypto-lab-rsa-educational/), [Accumulator](https://systemslibrarian.github.io/crypto-lab-accumulator/), [VDF](https://systemslibrarian.github.io/crypto-lab-vdf/).

The source overlap review found generation/verifier uses of Miller–Rabin rather than this teaching experiment. Reviewed sibling commits match those pinned in the brief; the 12-base / 13-base-bound discrepancy in VDF's comment is not copied here or described as an exploit.

## Build & Verify

```sh
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm run test:mutations
```

Initial local correctness run: **34 tests passed**, including independent small-number enumeration, published pseudoprimes, exact liar counts, large Mersenne-prime and RFC 3526 fixtures, and module-boundary checks. No coverage percentage is claimed. `e2e/claims.spec.ts` independently rederives displayed values; `e2e/gate.ts` checks structure only and runs the fleet's composite-aware contrast and non-text checks. Seven scripted mutations require a passing baseline, changed built bytes, a named failure, immediate restoration, and a passing restored test.

Accessibility scans the production build at 1280 and 320 pixels through real controls, including failure states. Browser QA runs in CI when no supported local browser-control surface is available. A local unit/build pass alone is not publication evidence.

Dependency grouping, gated Dependabot auto-merge, pull-request checks, and `workflow_dispatch` are configured. The deployment follows the same gate after a Dependabot merge.

## Performance

Timings are measured where the lab runs. Large prime generation has a 60-second per-run safety cap and a candidate cap; stopping produces no prime claim. The exhaustive census has its own explicit toy cap. No measured point is extrapolated to a real-world attack.

---

*One of the browser demos in the [Crypto Lab](https://crypto-lab.systemslibrarian.dev/) suite.*

*"So whether you eat or drink or whatever you do, do it all for the glory of God." — 1 Corinthians 10:31*
