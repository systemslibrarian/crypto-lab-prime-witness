import {factorSmall,trialPrime} from '../truth/sieve';
export function korselt(n:bigint){const factors=factorSmall(n);const squarefree=factors.every(([,e])=>e===1);const divisibility=factors.map(([p])=>({p,divides:(n-1n)%(p-1n)===0n}));return {factors,squarefree,divisibility,carmichael:!trialPrime(n)&&squarefree&&divisibility.every(x=>x.divides)};}
