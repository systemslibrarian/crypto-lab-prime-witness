import {gcd,pow} from '../nt/bigint';
export function fermat(n:bigint,a:bigint):{passes:boolean;factor:bigint|null;value:bigint}{if(n<3n||n%2n===0n||a<1n||a>=n)throw Error('Use odd n >= 3 and a in [1,n−1].');const f=gcd(a,n),value=pow(a,n-1n,n);return {passes:f===1n&&value===1n,factor:f>1n?f:null,value};}
