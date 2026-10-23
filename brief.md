# Build brief — `crypto-lab-prime-witness`

**2026-10-20. Brief only; no repository exists yet.** Written against
`audits/_MASTER-TEMPLATE.md` (catalog `f48d9d2f2f06`). §0 through §6 apply unchanged.
Source of the gap: Katz–Lindell, *Introduction to Modern Cryptography* 3rd ed., §9.2.1
(generating random primes) and §9.2.2 (primality testing).

**Verdict: new repository.**

```
NEW DEMO BRIEF
- Repo name:         crypto-lab-prime-witness
- Short name (H1):   Prime Witness
- Subtitle:          Fermat · Miller–Rabin · Carmichael numbers
- One-liner:         Draws random candidates to show how often primes occur, runs the Fermat
                     and Miller–Rabin tests step by step while counting every lying base, and
                     shows composites that pass a fixed list of Miller–Rabin bases but fail
                     random ones.
- Concept to teach:  A primality test never finds proof of primality — it fails to find a
                     witness of compositeness. Fermat's test has composites with no coprime
                     witness at all. Miller–Rabin guarantees that at most a quarter of bases lie
                     for any odd composite, so random bases work. That guarantee is about
                     RANDOM bases: a composite built for a fixed list passes it every time.
- Primitives/spec:   Katz–Lindell 3rd ed. §9.2.1–9.2.2 (Theorem 9.32, Algorithm 9.34,
                     Theorems 9.38 and 9.40, Algorithm 9.44); Miller 1976; Rabin 1980; Monier
                     1980; HAC §4.2 (Algorithm 4.9, Definition 4.10, Definition 4.21,
                     Fact 4.23, Algorithm 4.24); FIPS 186-5 Appendix B.3.1 and Appendix C.1;
                     OEIS A002997, A001567, A001262, A014233 (Jaeschke 1993; Sorenson–Webster
                     2017); Albrecht–Massimo–Paterson–Somorovsky, CCS 2018.
- Accent (--accent): [central assignment]
- Favicon emoji:     [central assignment]
- Category:          [central assignment]
- Section (suggested): foundations
- Level (suggestion only): Intermediate, with Act 1 written so a Beginner can finish it.
- In scope:          prime density and expected tries; the Fermat test with exact liar counts;
                     Carmichael numbers and Korselt's criterion; a Miller–Rabin stepper that
                     extracts a factor from a nontrivial square root of 1; exact strong-liar
                     fractions against the proven bounds; fixed-base versus random-base testing
                     on published strong pseudoprimes; prime generation in the FIPS 186-5 shape;
                     a toy-range recursive Lucas–Pratt certificate generated and independently
                     checked for p ≤ 1,000,000 (added after the original brief).
- Non-goals:         AKS, ECPP, and large-input proof systems; Lucas, Baillie–PSW
                     and Solovay–Strassen (Lucas named as the
                     extension); safe-prime and DH-group generation; factoring beyond the gcd a
                     witness hands you; constant-time code.
```

## Overlap check — what I read, and what I found

Opened from source at the commits shown. Every one of these labs uses Miller–Rabin as a
tool. None teaches it.

- **crypto-lab-factor-forge** `8fd7436210e0`, `src/factor/primality.ts`:
  - `millerRabin()` is a verifier with the first thirteen prime bases. Below
    ψ₁₃ = 3,317,044,064,679,887,385,961,981 they are a proven-deterministic set; above it,
    random bases are added.
  - Its header records an incident worth teaching here. With only twelve bases, ψ₁₂ itself
    (composite) was certified prime. The base count and the bound are one theorem.
  - The header cites Sorenson–Webster as "Math. Comp. 84 (2015) 2483-2496". The paper is
    actually Math. Comp. 86 (2017) 985–1003 (verified below), so do not copy that citation.
- **crypto-lab-rsa-educational** `bc479abe82b5`, `src/rsa/bigint-math.ts:79–110`: 40
  random-base Miller–Rabin. The comment notes it rejects Carmichael numbers a naive Fermat
  test accepts; no page shows that.
- **crypto-lab-accumulator** `8816733764c0`, `src/core/primes.ts`: Miller–Rabin for
  hash-to-prime and safe primes. The comment states the 4^-rounds bound.
- **crypto-lab-time-lock-puzzle** `23c960a73386` (`src/crypto/primes.ts:20`, random bases)
  and **crypto-lab-paillier-gate** `1e102ca4d6b3` (`src/numbers.ts:184`, k = 40) — generation
  only.
- **crypto-lab-vdf** `b0bff11e8fe5`, `src/vdf/wesolowski.ts:25–48`: a fixed set — the first
  twelve prime bases (2 through 37) — on ~128-bit hash-to-prime candidates. That is the exact
  base list Act 5 defeats with ψ₁₂, a 79-bit number. Do not describe the VDF lab as
  vulnerable: its candidates come from SHA-256 output, not an adversary. Use it only as the
  "where fixed bases appear" pointer, after re-reading it.
- **crypto-lab-elgamal-plain** `207b757ca04d`: safe-prime groups from RFC 3526, checked with
  `isProbablePrime(…, 12)` in `src/groups.ts:43–50`.

Before building, grep the sibling clones for `carmichael|korselt|strong liar|fermat liar` and
report anything that appeared after these commits.

## SCOPE — six acts

1. **How common are primes?** (Beginner-readable.)
   - Pick a size (16 to 2048 bits). Draw random odd candidates with the top bit set, the
     shape of Katz–Lindell Algorithm 9.34, test each, and count the tries.
   - Show a histogram against the prime-number-theorem estimate of about (n·ln 2)/2 odd
     candidates per prime (about 355 at 1024 bits, about 710 at 2048). Show Katz–Lindell's
     proven floor beside it (Theorem 9.32: at least 1/(3n) of n-bit integers are prime).
   - The estimate is labelled as an estimate.
2. **Fermat's test and its liars.**
   - For a composite n, count exactly how many bases a ∈ Z*_n satisfy a^(n−1) ≡ 1.
   - Default 341: 100 of 300 coprime bases lie. Then 561 = 3·11·17: all 320 lie.
   - **Korselt panel:** squarefree, and p − 1 | n − 1 for each prime p | n, both computed.
   - The only "witnesses" for 561 are non-coprime bases, so they hand you a factor by gcd.
     Show their fraction, 1 − φ(n)/(n − 1).
   - Theorem 9.38: one coprime witness forces at least half.
3. **Miller–Rabin, one base at a time** — the headline mechanism.
   - Write n − 1 = 2^s·d, then step a^d, a^(2d), … .
   - Three outcomes are drawn distinctly:
     - the chain starts at 1 (liar);
     - the chain hits −1 (liar);
     - the chain reaches 1 without passing −1. The previous value is a nontrivial square
       root of 1, and gcd(x − 1, n) is a factor.
   - Worked default: n = 561, a = 2, s = 4, d = 35. The chain is 263, 166, 67, 1, so 67 is a
     nontrivial square root of 1, and gcd(66, 561) = 33 and gcd(68, 561) = 17.
4. **Counting the strong liars.**
   - Exhaustive count over a ∈ [1, n − 1], against two bounds:
     - Katz–Lindell's proven half (Theorem 9.40, for odd non-prime-powers; Algorithm 9.44
       adds the perfect-power check that proof needs);
     - the Rabin–Monier quarter (HAC Fact 4.23: at most φ(n)/4 for odd composite n ≠ 9).
   - **Search mode:** scan odd composites up to a cap and plot the liar fraction. The maximum
     sits at exactly 1/4; n = 9 (2 of φ = 6) is the exception the theorem names.
   - Below 20,001 the 1/4 cases include 91, 703, 1891, 8911 and 12403 (computed for this
     brief; the test re-derives, never copies).
   - 8911 is a Carmichael number: every coprime base lied to Fermat; exactly a quarter lie
     to Miller–Rabin.
5. **Fixed bases versus chosen composites.**
   - A fixed-base tester using the first k prime bases runs against the ψ_k terms of OEIS
     A014233:
     - 3215031751 = 151·751·28351 passes bases 2, 3, 5 and 7, and fails at 11;
     - ψ₁₂ = 318665857834031151167461 = 399165290221·798330580441 passes all twelve bases
       2–37, and fails at 41;
     - ψ₁₃ = 3317044064679887385961981 = 1287836182261·2575672364521 passes 2–41, and fails
       at 43.
   - Then random bases on the same numbers. Show the measured rejection rate per round
     (labelled as a sample, with its count) next to the guarantee of at least 3/4.
   - The flip side, stated on the page: below ψ₁₃ the first thirteen bases *are* a proof,
     which is why Factor Forge uses them. Fixed bases are deterministic below a proven bound
     and adversarially defeatable above it.
   - The real-world stakes, as reported by Albrecht et al. (CCS 2018) for attacker-supplied
     parameters, scoped to what that paper says: for example OpenSSL's default config
     accepting 2048-bit composites with probability 1/16, and GMP at its recommended minimum
     rounds.
   - **Optional real-size exhibit:** Arnault's 397-digit Carmichael number, a strong
     pseudoprime to every prime base below 307 (J. Symbolic Comput. 20(2), 1995; p. 157 per
     secondary sources).
     - Use it **only** if its digits are taken from the paper itself, then verified in tests
       against every prime base < 307 with its factors multiplied back.
     - Otherwise construct one by Arnault's method and verify it the same way.
     - **Never paste digits from memory.**
6. **Making a real prime, the standard's way.**
   - Generate a 1024-bit prime (nlen = 2048) per FIPS 186-5 Appendix B.3.1, with a
     trial-division sieve first. Show how many candidates the sieve removed, how many
     Miller–Rabin rounds ran, and the time this browser took (not extrapolated).
   - The round count **must** come from FIPS 186-5 Appendix C.1. This brief's author could
     verify that Appendix C.1 is where round counts live, but could not load the table
     itself. Open it, cite the table number and the value in the page, and add a test that
     pins both.

Non-goal notes (in-page, one line each): a deterministic polynomial-time test exists but is
slower (Katz–Lindell §9.2.1 mentions the 2002 result without naming it; it is AKS).
Certificates prove primality to a third party.
Lucas/Baillie–PSW is the stronger combined test (FIPS 186-5 B.3.3); see Extension seams.

## SECURITY / CORRECTNESS INVARIANTS

1. **Verdict language is fixed.** "COMPOSITE — witness a" is a certainty.
   - "PROBABLY PRIME — no witness in t random bases" is a hedge.
   - "PRIME" without qualification appears only when proven: trial division for small n, or
     the first thirteen prime bases below ψ₁₃, citing Sorenson–Webster.
   - The thirteen-base set and the ψ₁₃ bound are one constant pair, pinned together by a test
     (Factor Forge's lesson).
2. **Counts are measured.** Every liar count is exhaustive, or labelled as a sample with
   its size and seed. Never extrapolated.
3. **Factors are re-checked.** A factor from a nontrivial square root is shown only after
   the gcd is computed and the factor is multiplied back.
4. **The fixed-base tester is quarantined.** It is a separately named function, used only
   in Act 5, and never used to label a number prime anywhere else.
5. **Random bases are unbiased.** They come from `crypto.getRandomValues` with rejection
   sampling into [2, n − 2].
6. **Ground truth comes from a different code path.** Tests check against an independent
   sieve and trial-division module that imports nothing from `src/primality/`.
7. **Timings stay local.** All timings are this browser's; no extrapolation.

## ARCHITECTURE

| Path | Holds |
|---|---|
| `src/nt/bigint.ts` | modpow, gcd, isqrt, perfect-power test |
| `src/primality/fermat.ts` | Fermat test |
| `src/primality/millerRabin.ts` | Returns the full chain trace, not just a verdict |
| `src/primality/fixedBase.ts` | Act 5 only |
| `src/primality/liars.ts` | Exhaustive counting, in a worker |
| `src/primality/korselt.ts` | Factor by trial division at toy size, then check |
| `src/gen/fips186.ts` | Sieve + Miller–Rabin rounds from the pinned App. C.1 value |
| `src/truth/sieve.ts` | Ground truth for tests and "proven" small-n verdicts |
| `src/data/sequences.ts` | OEIS terms, each with its A-number and retrieval date |
| `src/worker/` | Workers |
| `src/ui/act1.ts` … `act6.ts` | The six acts |

Everything is hand-rolled BigInt.

## UI

- Plain-language intro: "No test can point at a prime and say why it is prime. A test looks
  for a reason a number is NOT prime, and reports when it cannot find one."
- Act 3's stepper is the core interaction. The learner types n and a, then steps the chain;
  the −1 and the nontrivial-root cases light up differently and name what happened.
- Act 5's two columns, "first k prime bases" and "random bases", run on the same number side
  by side.
- Stacks below 640 px. The histogram and the liar plot are real `<svg>` with text
  alternatives.

## VISUAL SEMANTICS

- "COMPOSITE" is solid and definite. "PROBABLY PRIME" is hedged, with a distinct icon and
  text. They never share a style with "PROVEN PRIME".
- Act 5's fixed-base acceptance of ψ₁₂ is ALARM: "PASSED ALL 12 FIXED BASES — AND
  COMPOSITE", with its two factors multiplied back on screen.
- Act 2's 561 reads "EVERY COPRIME BASE SAYS PRIME — AND COMPOSITE".
- Colour never alone; check in grayscale.

## EDGE CASES

| Input | Fail-closed behaviour |
|---|---|
| n < 2, n = 2, even n | Answered directly; the explanation is shown |
| n = 9 | Shown as the named exception to φ(n)/4 |
| Prime powers (25, 27, 121) | Exact liar counts shown. Note that Katz–Lindell's Algorithm 9.44 rejects perfect powers first because its proof needs it, while the Rabin–Monier bound covers them |
| Bases 1 and n − 1 | Trivial liars; counted and labelled as such |
| Bases sharing a factor with n | Shown as gcd witnesses, not Fermat witnesses |
| Exhaustive count above a cap | Refused with "too large to try every base". A clearly labelled sample is offered instead |
| Non-decimal, negative or over-length input | Refused with the reason |

## EXTENSION SEAMS

- `// [extension] point` in `src/primality/`: the Lucas test and Baillie–PSW (FIPS 186-5
  B.3.3), the remedy Albrecht et al. recommend.
- `// [extension] point` in `src/gen/fips186.ts`: safe primes and provable-prime
  generation.
- `// [extension] point` in `liars.ts`: Euler (Solovay–Strassen) liars side by side.

## Tests

- **OEIS terms as KATs.** Each is asserted equal to an independent search in
  `src/truth/` straight from the definition:
  - A002997, first 10 terms (561 … 29341);
  - A001567, first 10 (341 … 2701);
  - A001262, first 10 (2047 … 52633).
  - For the larger A014233 terms an exhaustive "smallest" check is infeasible. Assert the
    defining property instead (strong pseudoprime to exactly the first k prime bases, failing
    at the next) and credit minimality to Jaeschke 1993 and Sorenson–Webster 2017.
- **Known primes, far beyond 64 bits** so the BigInt paths are exercised, not just
  small-number shortcuts:
  - the Mersenne primes 2^61−1, 2^89−1, 2^107−1, 2^127−1, 2^521−1, 2^607−1, 2^1279−1
    (GIMPS list);
  - the RFC 3526 2048-bit MODP prime, pinned from the RFC's own hex, not copied from
    ElGamal Plain.
- **Known composites:** 2^11−1 = 23·89 and 2^67−1 = 193707721·761838257287, both products
  checked.
- **Exact counts:**
  - 341: 100 Fermat liars, 50 strong.
  - 561: 320 Fermat liars, 10 strong.
  - 703: 162 strong liars of φ = 648 (exactly 1/4).
  - 8911: 7128 Fermat liars, 1782 strong.
  - Computed for this brief; the test re-derives from `src/truth/`.
- **`e2e/claims.spec.ts` (§4.1b):**
  - Parse the displayed chain and recompute each square in the test.
  - Parse the displayed factors and multiply them back to n.
  - Assert the liar fraction equals the displayed count divided by the displayed φ(n).
  - Act 1's mean equals the histogram's rows.
  - Retirement on a new n.
- **§4.1c — one mutation per rendered verdict.** Run from a script with concrete patches:
  1. Loop the chain to s instead of s − 1.
  2. Drop a = n − 1 from the liar count.
  3. Swap `fixedBase` for random bases (the NEG fixture must fail).
  4. Apply "PRIME" to a probabilistic verdict.
  5. Take gcd(x + 1, n) only.
  6. Drop ln 2 from the density estimate.
- **§4.1d negative claims:**
  - **NEG-1:** "Passing Miller–Rabin with a fixed list of bases does not show a number is
    prime."
    - Fixture: ψ₁₂ through the twelve-base tester. All twelve rows read "no witness" (green)
      and the factors multiply back.
  - **NEG-2:** "Passing Fermat's test for every coprime base does not show a number is
    prime."
    - Fixture: 561.

## Honesty notes for the page

- Miller–Rabin is probabilistic, and the page says so on every probable-prime verdict.
- Katz–Lindell proves the 1/2 bound. The 1/4 bound is Rabin and Monier's. The page credits
  each.
- JS BigInt is not constant-time, and prime generation here is a teaching demo.

## Links out (Related Demos)

- **Factor Forge** — Miller–Rabin as a verifier with the proven thirteen-base set.
- **Residue Gate** (same batch) — a nontrivial square root of 1 modulo N factors N there
  too (Katz–Lindell Lemma 15.35).
- **Educational RSA** and **RSA Forge** — where generated primes go.
- **ElGamal Plain** — safe primes.
- **Accumulator** and **VDF** — hash-to-prime.

## Sources (verified 2026-10-20)

- Katz & Lindell, *Introduction to Modern Cryptography*, 3rd ed., CRC Press, 2021, ISBN
  9780815354369. §9.2.1–9.2.2, checked against the book text.
- G. L. Miller, "Riemann's hypothesis and tests for primality", *JCSS* 13:300–317, 1976.
  https://crypto1.krasovs.ky/bib/1976/miller.bibtex
- M. O. Rabin, "Probabilistic algorithm for testing primality", *J. Number Theory*
  12:128–138, 1980. https://cr.yp.to/bib/1980/rabin.bibtex
- L. Monier, "Evaluation and comparison of two efficient probabilistic primality testing
  algorithms", *Theoretical Computer Science* 12(1):97–108, 1980.
  https://ftp.math.utah.edu/pub/tex/bib/idx/tcs1980/12/1/97_108.html
- W. R. Alford, A. Granville, C. Pomerance, "There are infinitely many Carmichael numbers",
  *Annals of Mathematics* 139:703–722, 1994. https://cr.yp.to/bib/1994/alford.bibtex
- K. Conrad, "Carmichael Numbers and Korselt's Criterion" (expository; Theorem 2, and
  Theorem 5(ii) on three prime factors).
  https://kconrad.math.uconn.edu/blurbs/ugradnumthy/carmichaelkorselt.pdf
- HAC §4.2 — Algorithm 4.9, Definition 4.10, Definition 4.21, Fact 4.23, Algorithm 4.24.
  https://cacr.uwaterloo.ca/hac/about/chap4.pdf
- G. Jaeschke, "On strong pseudoprimes to several bases", *Math. Comp.* 61:915–926, 1993,
  https://doi.org/10.1090/S0025-5718-1993-1192971-8 — via https://oeis.org/A014233
- J. Sorenson, J. Webster, "Strong pseudoprimes to twelve prime bases", *Math. Comp.*
  86:985–1003, 2017. https://doi.org/10.1090/mcom/3134
- OEIS: https://oeis.org/A002997, https://oeis.org/A001567, https://oeis.org/A001262,
  https://oeis.org/A014233 (DATA lines read 2026-10-20).
- F. Arnault, "Constructing Carmichael numbers which are strong pseudoprimes to several
  bases", *J. Symbolic Comput.* 20(2):151–161, Aug. 1995 — confirmed on the author's
  publication list:
  https://www.unilim.fr/pages_perso/francois.arnault/oldsite/publications.html
  - The 397-digit / bases-below-307 detail is from https://en.wikipedia.org/wiki/Strong_pseudoprime
    citing p. 157. Confirm it in the paper.
  - Related: F. Arnault, "Rabin-Miller primality test: composite numbers which pass it",
    *Math. Comp.* 64:355–361, 1995.
- M. R. Albrecht, J. Massimo, K. G. Paterson, J. Somorovsky, "Prime and Prejudice:
  Primality Testing Under Adversarial Conditions", ACM CCS 2018.
  https://doi.org/10.1145/3243734.3243787, https://eprint.iacr.org/2018/749
- NIST FIPS 186-5 (2023), Appendix B.3 (B.3.1 Miller–Rabin, B.3.2 Enhanced Miller–Rabin,
  B.3.3 Lucas) and Appendix C.1 (required rounds).
  https://doi.org/10.6028/NIST.FIPS.186-5
  - **Table and values not verified by this brief's author — the agent must read them.**
- T. Kivinen, M. Kojo, RFC 3526 (May 2003), §3: the 2048-bit MODP prime.
  https://www.rfc-editor.org/rfc/rfc3526
- GIMPS list of known Mersenne primes: https://www.mersenne.org/primes/
- C. Damgård, P. Landrock, C. Pomerance, "Average case error estimates for the strong
  probable prime test", *Math. Comp.* 61(203):177–194, 1993 — background for why few rounds
  suffice on random candidates.
  https://www.ams.org/mcom/1993-61-203/S0025-5718-1993-1189518-9/
