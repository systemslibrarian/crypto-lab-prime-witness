import { makeCertificate, verifyCertificate } from '../primality/certificate';
import { el, escape, field, retirement, setError, table, verdict } from './ui';

/** The verifier consumes only the pasted proof; the generator's trial division is separate. */
export function certificatePanel(panel: HTMLElement): void {
  panel.innerHTML = '<div class="eyebrow">PROVEN PRIME · TOY RANGE</div>' +
    '<h2>Build a proof another verifier can check</h2>' +
    '<p>Miller–Rabin finds no witness to compositeness. Here, a Lucas–Pratt certificate proves a small prime by supplying a full factorization of p−1, a modular witness, and recursive proofs that every listed factor is prime. Change the JSON and see whether the separate verifier still accepts it.</p>' +
    '<div class="row">' + field('certificate-p', 'Candidate p (2 through 1,000,000)', '97', 'number') +
    '<button class="primary" id="certificate-generate">Generate proof</button>' +
    '<button id="certificate-verify">Verify pasted proof</button></div>' +
    '<div class="field"><label for="certificate-json">Editable certificate JSON</label><textarea id="certificate-json" rows="10" spellcheck="false" aria-describedby="certificate-scope"></textarea></div>' +
    '<div id="certificate-out" class="result" role="status" aria-live="polite"></div>' +
    '<p id="certificate-scope" class="note">Generation uses trial division and searches for a witness; verification uses only the supplied factor tree and modular arithmetic. Input is capped at 1,000,000 and JSON at 20,000 characters. This is an educational proof checker, not a production prime generator or a general certificate format.</p>' +
    '<p class="note">Primary source: <a href="https://boole.stanford.edu/pub/SucCert.pdf">Vaughan Pratt, <em>Every Prime Has a Succinct Certificate</em> (1975)</a>. A <a href="https://isa-afp.org/entries/Pratt_Certificate.html">2026 formalization in the Archive of Formal Proofs</a> covers certificate soundness; this browser code is not machine-verified.</p>';

  const candidate = el<HTMLInputElement>('#certificate-p', panel);
  const input = el<HTMLTextAreaElement>('#certificate-json', panel);
  const out = el<HTMLElement>('#certificate-out', panel);
  retirement(panel, out);

  const verify = (): void => {
    try {
      if (input.value.length > 20_000) throw new Error('Certificate JSON exceeds the toy size cap.');
      const proof = JSON.parse(input.value) as unknown;
      const steps = verifyCertificate(proof);
      const top = steps.at(-1)!;
      out.innerHTML = verdict('pass', 'PROVEN PRIME — recursive certificate checks pass',
        'Each factor is certified, the factors multiply to p−1, and the modular witness has full order.', 'certificate') +
        '<p>Top candidate: <code>' + escape(top.p) + '</code>. The table lists each proof node after its factor proofs.</p>' +
        table(['Proved p', 'Witness a', 'Factorization of p−1', 'a^((p−1)/q) mod p for each q'],
          steps.map(step => [step.p, step.witness, step.factorization,
            step.checks.map(({q, residue}) => `${q}: ${residue}`).join('; ') || 'base case']),
          'Recursive certificate verification');
    } catch (error) {
      setError(out, error);
    }
  };

  el<HTMLButtonElement>('#certificate-generate', panel).onclick = () => {
    try {
      if (!/^\d{1,7}$/.test(candidate.value.trim())) throw new Error('Enter an integer from 2 through 1,000,000.');
      input.value = JSON.stringify(makeCertificate(BigInt(candidate.value.trim())), null, 2);
      verify();
    } catch (error) {
      setError(out, error);
    }
  };
  el<HTMLButtonElement>('#certificate-verify', panel).onclick = verify;
  el<HTMLButtonElement>('#certificate-generate', panel).click();
}
