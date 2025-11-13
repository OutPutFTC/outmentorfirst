export function getGravatarUrl(email: string, size = 200) {
  const normalized = (email || '').trim().toLowerCase();
  const hash = md5(normalized);
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
}

/**
 * Minimal JS MD5 implementation (small, public-domain style)
 * Note: kept compact to avoid new dependencies.
 */
function md5(str: string) {
  // simple implementation adapted from common public domain snippets
  function rotateLeft(lValue: number, iShiftBits: number) { return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits)); }
  function addUnsigned(lX:number,lY:number){ const lX4=(lX&0x40000000), lY4=(lY&0x40000000), lX8=(lX&0x80000000), lY8=(lY&0x80000000); const lResult=(lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF); if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8); if (lX4 | lY4) { if (lResult & 0x40000000) return (lResult ^ 0xC0000000 ^ lX8 ^ lY8); else return (lResult ^ 0x40000000 ^ lX8 ^ lY8); } else return (lResult ^ lX8 ^ lY8); }
  function F(x:number,y:number,z:number){return (x & y) | ((~x) & z);}
  function G(x:number,y:number,z:number){return (x & z) | (y & (~z));}
  function H(x:number,y:number,z:number){return x ^ y ^ z;}
  function I(x:number,y:number,z:number){return y ^ (x | (~z));}
  function FF(a:number,b:number,c:number,d:number,x:number,s:number,ac:number){ a=addUnsigned(a, addUnsigned(addUnsigned(F(b,c,d), x), ac)); return addUnsigned(rotateLeft(a, s), b); }
  function GG(a:number,b:number,c:number,d:number,x:number,s:number,ac:number){ a=addUnsigned(a, addUnsigned(addUnsigned(G(b,c,d), x), ac)); return addUnsigned(rotateLeft(a, s), b); }
  function HH(a:number,b:number,c:number,d:number,x:number,s:number,ac:number){ a=addUnsigned(a, addUnsigned(addUnsigned(H(b,c,d), x), ac)); return addUnsigned(rotateLeft(a, s), b); }
  function II(a:number,b:number,c:number,d:number,x:number,s:number,ac:number){ a=addUnsigned(a, addUnsigned(addUnsigned(I(b,c,d), x), ac)); return addUnsigned(rotateLeft(a, s), b); }

  function convertToWordArray(strParam:string) {
    const lWordCount = [];
    const lMessageLength = strParam.length;
    let lNumberOfWords_temp1 = lMessageLength + 8;
    let lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
    const lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
    let lBytePosition = 0, lByteCount = 0;
    for (let i = 0; i < lNumberOfWords; i++) lWordCount[i] = 0;
    while (lByteCount < lMessageLength) {
      const j = strParam.charCodeAt(lByteCount);
      lWordCount[(lBytePosition - (lBytePosition % 4)) / 4] |= (j << ((lBytePosition % 4) * 8));
      lBytePosition++;
      lByteCount++;
    }
    const j = 0x80;
    lWordCount[(lBytePosition - (lBytePosition % 4)) / 4] |= (j << ((lBytePosition % 4) * 8));
    lWordCount[lNumberOfWords - 2] = lMessageLength << 3;
    lWordCount[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordCount;
  }

  function wordToHex(lValue:number) {
    let wordToHexValue = '', wordToHexValue_temp = '', lByte, lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      wordToHexValue_temp = '0' + lByte.toString(16);
      wordToHexValue += wordToHexValue_temp.substr(wordToHexValue_temp.length - 2, 2);
    }
    return wordToHexValue;
  }

  let x = convertToWordArray(str);
  let a = 0x67452301, b = 0xEFCDAB89, c = 0x98BADCFE, d = 0x10325476;

  for (let k = 0; k < x.length; k += 16) {
    const AA = a, BB = b, CC = c, DD = d;
    a = FF(a, b, c, d, x[k+0], 7 , 0xD76AA478);
    d = FF(d, a, b, c, x[k+1], 12, 0xE8C7B756);
    c = FF(c, d, a, b, x[k+2], 17, 0x242070DB);
    b = FF(b, c, d, a, x[k+3], 22, 0xC1BDCEEE);
    a = FF(a, b, c, d, x[k+4], 7 , 0xF57C0FAF);
    d = FF(d, a, b, c, x[k+5], 12, 0x4787C62A);
    c = FF(c, d, a, b, x[k+6], 17, 0xA8304613);
    b = FF(b, c, d, a, x[k+7], 22, 0xFD469501);
    a = FF(a, b, c, d, x[k+8], 7 , 0x698098D8);
    d = FF(d, a, b, c, x[k+9], 12, 0x8B44F7AF);
    c = FF(c, d, a, b, x[k+10], 17, 0xFFFF5BB1);
    b = FF(b, c, d, a, x[k+11], 22, 0x895CD7BE);
    a = FF(a, b, c, d, x[k+12], 7 , 0x6B901122);
    d = FF(d, a, b, c, x[k+13], 12, 0xFD987193);
    c = FF(c, d, a, b, x[k+14], 17, 0xA679438E);
    b = FF(b, c, d, a, x[k+15], 22, 0x49B40821);
    a = GG(a, b, c, d, x[k+1], 5 , 0xF61E2562);
    d = GG(d, a, b, c, x[k+6], 9 , 0xC040B340);
    c = GG(c, d, a, b, x[k+11],14, 0x265E5A51);
    b = GG(b, c, d, a, x[k+0], 20, 0xE9B6C7AA);
    a = GG(a, b, c, d, x[k+5], 5 , 0xD62F105D);
    d = GG(d, a, b, c, x[k+10],9 , 0x2441453);
    c = GG(c, d, a, b, x[k+15],14, 0xD8A1E681);
    b = GG(b, c, d, a, x[k+4], 20, 0xE7D3FBC8);
    a = GG(a, b, c, d, x[k+9], 5 , 0x21E1CDE6);
    d = GG(d, a, b, c, x[k+14],9 , 0xC33707D6);
    c = GG(c, d, a, b, x[k+3], 14, 0xF4D50D87);
    b = GG(b, c, d, a, x[k+8], 20, 0x455A14ED);
    a = GG(a, b, c, d, x[k+13],5 , 0xA9E3E905);
    d = GG(d, a, b, c, x[k+2], 9 , 0xFCEFA3F8);
    c = GG(c, d, a, b, x[k+7], 14, 0x676F02D9);
    b = GG(b, c, d, a, x[k+12],20, 0x8D2A4C8A);
    a = HH(a, b, c, d, x[k+5], 4 , 0xFFFA3942);
    d = HH(d, a, b, c, x[k+8], 11, 0x8771F681);
    c = HH(c, d, a, b, x[k+11],16, 0x6D9D6122);
    b = HH(b, c, d, a, x[k+14],23, 0xFDE5380C);
    a = HH(a, b, c, d, x[k+1], 4 , 0xA4BEEA44);
    d = HH(d, a, b, c, x[k+4], 11, 0x4BDECFA9);
    c = HH(c, d, a, b, x[k+7], 16, 0xF6BB4B60);
    b = HH(b, c, d, a, x[k+10],23, 0xBEBFBC70);
    a = HH(a, b, c, d, x[k+13],4 , 0x289B7EC6);
    d = HH(d, a, b, c, x[k+0], 11, 0xEAA127FA);
    c = HH(c, d, a, b, x[k+3], 16, 0xD4EF3085);
    b = HH(b, c, d, a, x[k+6], 23, 0x04881D05);
    a = II(a, b, c, d, x[k+0], 6 , 0xD9D4D039);
    d = II(d, a, b, c, x[k+7], 10, 0xE6DB99E5);
    c = II(c, d, a, b, x[k+14],15, 0x1FA27CF8);
    b = II(b, c, d, a, x[k+5], 21, 0xC4AC5665);
    a = II(a, b, c, d, x[k+12],6 , 0xF4292244);
    d = II(d, a, b, c, x[k+3], 10, 0x432AFF97);
    c = II(c, d, a, b, x[k+10],15, 0xAB9423A7);
    b = II(b, c, d, a, x[k+1], 21, 0xFC93A039);
    a = II(a, b, c, d, x[k+8], 6 , 0x655B59C3);
    d = II(d, a, b, c, x[k+15],10, 0x8F0CCC92);
    c = II(c, d, a, b, x[k+6], 15, 0xFFEFF47D);
    b = II(b, c, d, a, x[k+13],21, 0x85845DD1);
    a = II(a, b, c, d, x[k+4], 6 , 0x6FA87E4F);
    d = II(d, a, b, c, x[k+11],10, 0xFE2CE6E0);
    c = II(c, d, a, b, x[k+2], 15, 0xA3014314);
    b = II(b, c, d, a, x[k+9], 21, 0x4E0811A1);
    a = addUnsigned(a, AA);
    b = addUnsigned(b, BB);
    c = addUnsigned(c, CC);
    d = addUnsigned(d, DD);
  }

  return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
}