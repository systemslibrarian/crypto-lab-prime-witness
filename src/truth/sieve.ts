// Independent small-number truth. No imports from the primality implementation.
export function sieve(limit:number):boolean[]{const flags=Array<boolean>(limit+1).fill(true);flags[0]=flags[1]=false;for(let p=2;p*p<=limit;p++)if(flags[p])for(let j=p*p;j<=limit;j+=p)flags[j]=false;return flags;}
export function trialPrime(n:bigint):boolean{if(n<2n)return false;if(n>10000000n)throw Error('Ground-truth trial division capped at 10,000,000.');for(let d=2n;d*d<=n;d++)if(n%d===0n)return false;return true;}
export function factorSmall(n:bigint):[bigint,number][]{if(n<2n||n>1000000n)throw Error('Toy factorization accepts 2–1,000,000.');const f:[bigint,number][]=[];for(let d=2n;d*d<=n;d++){let e=0;while(n%d===0n){n/=d;e++;}if(e)f.push([d,e]);}if(n>1n)f.push([n,1]);return f;}
export function checkedFactor(n:bigint,f:bigint|null):boolean{return f!==null&&f>1n&&f<n&&n%f===0n&&f*(n/f)===n;}
