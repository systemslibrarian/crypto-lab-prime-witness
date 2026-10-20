import {below,type Fill,systemRandom} from '../nt/bigint';import {probablePrime} from '../primality/millerRabin';
export const FIPS_PROFILE={bits:1024,rounds:5,target:'2^-112',table:'FIPS 186-5 Table B.1',derivation:'Appendix C.1'} as const;
const SMALL=[3n,5n,7n,11n,13n,17n,19n,23n,29n,31n,37n,41n,43n,47n];
export function density(bits:number):number{return bits*Math.LN2/2;}
export function generate(bits:number,rounds:number,fill:Fill=systemRandom,cap=100000,progress:(tries:number)=>void=()=>{}){
 if(!Number.isInteger(bits)||bits<16||bits>2048)throw Error('Size must be 16–2048 bits.');let tries=0,sieved=0,roundsRun=0;const start=performance.now();
 while(tries<cap){tries++;const n=(1n<<BigInt(bits-1))|below(1n<<BigInt(bits-1),fill)|1n;progress(tries);if(SMALL.some(p=>n%p===0n)){sieved++;continue;}const result=probablePrime(n,rounds,fill);roundsRun+=result.bases.length;if(result.prime)return {n,tries,sieved,roundsRun,bases:result.bases,ms:performance.now()-start,bits,rounds};if(performance.now()-start>60000)throw Error('Stopped at 60-second safety cap; no prime claimed.');}throw Error('Candidate cap reached; no prime claimed.');
}
// This is the sieve + MR teaching shape, NOT the full RSA procedure in FIPS A.1.3.
// It does not enforce exponent constraints, p−q distance, approved DRBG or validation.
// [extension] point: safe primes and certificate-producing prime generation.
