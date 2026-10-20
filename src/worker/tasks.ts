import {countLiars} from '../primality/liars';import {generate} from '../gen/fips186';import {sieve} from '../truth/sieve';import {millerRabin} from '../primality/millerRabin';import {randomBase} from '../nt/bigint';
export async function run(name:string,args:Record<string,unknown>,progress:(data:unknown)=>void):Promise<unknown>{
 if(name==='count')return countLiars(BigInt(String(args.n)));
 if(name==='search'){const max=Number(args.max);if(max>2001||max<9)throw Error('Search cap is 2,001 to bound exhaustive work.');const prime=sieve(max),rows=[];for(let n=9;n<=max;n+=2)if(!prime[n]){const c=countLiars(BigInt(n));rows.push({n,phi:c.phi,strong:c.strong,fraction:c.strong/c.phi});if(n%101===0)progress(n);}return rows;}
 if(name==='random'){const n=BigInt(String(args.n)),count=Number(args.count);if(count<1||count>500)throw Error('Use 1–500 trials.');const rows=[];for(let i=0;i<count;i++){const a=randomBase(n);rows.push({a,rejects:millerRabin(n,a).composite});}return rows;}
 if(name==='generate'){const count=Number(args.count),bits=Number(args.bits),rounds=Number(args.rounds);if(count<1||count>30)throw Error('Use 1–30 runs.');const rows=[];for(let i=0;i<count;i++){rows.push(generate(bits,rounds,undefined,100000,tries=>{if(tries%25===0)progress({run:i+1,tries});}));progress({run:i+1,tries:rows.at(-1)!.tries});await new Promise(r=>setTimeout(r,0));}return rows;}
 throw Error('Unknown experiment');
}
