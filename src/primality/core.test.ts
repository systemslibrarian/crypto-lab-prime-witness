import {describe,it,expect} from 'vitest';import {readFileSync} from 'node:fs';import {millerRabin,probablePrime} from './millerRabin';import {fermat} from './fermat';import {countLiars} from './liars';import {korselt} from './korselt';import {fixedBaseExhibit,STRICT_BOUND,THIRTEEN_BASES} from './fixedBase';import {fixedFixtures,carmichael,fermatBase2,strongBase2} from '../data/sequences';import {pow,gcd,isqrt,perfectPower,below} from '../nt/bigint';import {sieve,checkedFactor} from '../truth/sieve';import {density,FIPS_PROFILE,generate} from '../gen/fips186';
// Independent oracle: repeated-multiplication modular exponentiation for small fixtures.
function slowPow(a:number,e:number,n:number){let r=1;for(let i=0;i<e;i++)r=r*a%n;return r;}
function euclid(a:number,b:number):number{return b?euclid(b,a%b):a;}
function truthCounts(n:number){let phi=0,f=0,s=0;let d=n-1,k=0;while(d%2===0){d/=2;k++;}for(let a=1;a<n;a++){if(euclid(a,n)!==1)continue;phi++;if(slowPow(a,n-1,n)===1)f++;let x=slowPow(a,d,n);let pass=x===1||x===n-1;for(let j=1;j<k;j++){x=x*x%n;if(x===n-1)pass=true;}if(pass)s++;}return {phi,f,s};}
function seeded(){let x=123456789;return (bytes:Uint8Array)=>{for(let i=0;i<bytes.length;i++){x^=x<<13;x^=x>>>17;x^=x<<5;bytes[i]=x&255;}};}
describe('Miller–Rabin mechanism',()=>{
 it('561 base 2 shows the full nontrivial-root chain and multiply-back',()=>{const r=millerRabin(561n,2n);expect(r.chain).toEqual([263n,166n,67n,1n]);expect(r.s).toBe(4);expect(r.d).toBe(35n);expect(r.factor).toBe(33n);expect(checkedFactor(561n,r.factor)).toBe(true);});
 it('exhausted chain is a witness even without a factor',()=>{const r=millerRabin(15n,2n);expect(r.composite).toBe(true);expect(r.chain).toEqual([8n]);expect(r.factor).toBeNull();});
 it('accepts both start-at-one and minus-one patterns',()=>{expect(millerRabin(17n,16n).composite).toBe(false);expect(millerRabin(17n,3n).chain).toEqual([3n,9n,13n,16n]);expect(millerRabin(17n,1n).reason).toContain('starts at 1');});
 it('agrees with independent sieve for every n <= 2000 using all bases',()=>{const truth=sieve(2000);for(let n=2;n<=2000;n++){const allPass=Array.from({length:Math.max(1,n-1)},(_,i)=>BigInt(i+1)).every(a=>!millerRabin(BigInt(n),a).composite);expect(allPass,'n='+n).toBe(truth[n]);}});
 it('rejects nonunit and invalid bases',()=>{expect(millerRabin(561n,3n).factor).toBe(3n);expect(()=>millerRabin(561n,0n)).toThrow();expect(()=>millerRabin(561n,561n)).toThrow();});
 it.each([61,89,107,127,521,607,1279])('known Mersenne prime exponent %i passes BigInt path',e=>{expect(probablePrime((1n<<BigInt(e))-1n,5,seeded()).prime).toBe(true);});
 it('known Mersenne composites multiply back and reject',()=>{expect(23n*89n).toBe((1n<<11n)-1n);expect(193707721n*761838257287n).toBe((1n<<67n)-1n);expect(probablePrime((1n<<67n)-1n,8,seeded()).prime).toBe(false);});
});
describe('liar counts and published sequences',()=>{
 it.each([341,561,703])('exact counts at %i match independent repeated multiplication',n=>{const c=countLiars(BigInt(n)),t=truthCounts(n);expect([c.phi,c.fermatLiars,c.strong]).toEqual([t.phi,t.f,t.s]);});
 it('8911 is Carmichael with one quarter strong liars',()=>{const c=countLiars(8911n);expect([c.phi,c.fermatLiars,c.strong]).toEqual([7128,7128,1782]);expect(korselt(8911n).carmichael).toBe(true);});
 it('includes both trivial liars and names n=9 exception',()=>{const c=countLiars(9n);expect(c.phi).toBe(6);expect(c.strong).toBe(2);expect(c.rows.filter(r=>r.strong).map(r=>r.base)).toEqual([1,8]);});
 it('refuses exhaustive unbounded work',()=>{expect(()=>countLiars(20003n)).toThrow();});
 it('rederives OEIS A002997 first ten by independent Korselt definition',()=>{const primes=sieve(29341),terms=[];for(let n=3;n<=29341;n+=2){if(primes[n])continue;let m=n,ok=true;for(let p=2;p*p<=m;p++){if(m%p)continue;m/=p;if(m%p===0||(n-1)%(p-1)!==0){ok=false;break;}}if(m>1&&(n-1)%(m-1)!==0)ok=false;if(ok)terms.push(n);}expect(terms).toEqual(carmichael);});
 it('rederives A001567 and A001262 by independent arithmetic',()=>{const prime=sieve(52633),f:number[]=[],s:number[]=[];for(let n=3;n<=52633;n+=2){if(prime[n])continue;const pow2=(e:number)=>{let r=1,b=2;while(e){if(e%2)r=r*b%n;b=b*b%n;e=Math.floor(e/2);}return r;};if(f.length<10&&pow2(n-1)===1)f.push(n);let d=n-1,k=0;while(d%2===0){d/=2;k++;}let x=pow2(d),pass=x===1||x===n-1;for(let i=1;i<k;i++){x=x*x%n;if(x===n-1)pass=true;}if(pass&&s.length<10)s.push(n);}expect(f).toEqual(fermatBase2);expect(s).toEqual(strongBase2);});
 it('Fermat every coprime base accepts 561, but gcd bases factor it',()=>{expect(fermat(561n,2n).passes).toBe(true);expect(fermat(561n,3n).factor).toBe(3n);expect(korselt(561n).carmichael).toBe(true);expect(korselt(25n).squarefree).toBe(false);});
});
describe('fixed-base boundary and generator',()=>{
 it.each(fixedFixtures)('published $k-base counterexample passes and next base rejects',f=>{expect(f.p*f.q).toBe(f.n);expect(fixedBaseExhibit(f.n,f.k).every(r=>r.passes)).toBe(true);expect(millerRabin(f.n,f.next).composite).toBe(true);});
 it('pins thirteen bases and strict bound as one theorem',()=>{expect(THIRTEEN_BASES).toEqual([2n,3n,5n,7n,11n,13n,17n,19n,23n,29n,31n,37n,41n]);expect(STRICT_BOUND).toBe(fixedFixtures[2].n);});
 it('fixed-base code is absent from generation and task worker',()=>{for(const path of ['src/gen/fips186.ts','src/worker/tasks.ts'])expect(readFileSync(path,'utf8')).not.toMatch(/fixedBase/);});
 it('pins actual FIPS table and distinction from full generation',()=>{expect(FIPS_PROFILE).toEqual({bits:1024,rounds:5,target:'2^-112',table:'FIPS 186-5 Table B.1',derivation:'Appendix C.1'});});
 it('density estimate retains ln2 and is only an estimate',()=>{expect(density(1024)).toBeCloseTo(354.8913564467,8);});
 it('generates exact-width odd candidates with recorded bases and counters',()=>{const r=generate(32,8,seeded());expect(r.n.toString(2).length).toBe(32);expect(r.n%2n).toBe(1n);expect(r.tries).toBeGreaterThan(r.sieved);expect(r.bases).toHaveLength(8);expect(r.roundsRun).toBeGreaterThanOrEqual(8);expect(r.bases.every(a=>!millerRabin(r.n,a).composite)).toBe(true);});
 it('rejection sampler rejects rather than reducing modulo',()=>{let call=0;const x=below(5n,b=>{b.fill(call++===0?7:4);});expect(x).toBe(4n);expect(call).toBe(2);});
 it('independent truth imports no primality module',()=>{expect(readFileSync('src/truth/sieve.ts','utf8')).not.toMatch(/from\s+['"].*primality/);});
 it('arithmetic boundaries and perfect powers',()=>{expect(pow(2n,10n,17n)).toBe(4n);expect(gcd(-66n,561n)).toBe(33n);expect(isqrt(80n)).toBe(8n);expect(perfectPower(121n)).toEqual({base:11n,exponent:2});expect(perfectPower(27n)).toEqual({base:3n,exponent:3});expect(perfectPower(31n)).toBeNull();});
});
