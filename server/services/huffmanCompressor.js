import crypto from 'crypto';
import zlib from 'zlib';

class HuffmanNode {
  constructor(char, freq, left = null, right = null) {
    this.char = char;
    this.freq = freq;
    this.left = left;
    this.right = right;
  }
}

export function buildHuffmanTree(freqMap) {
  const nodes = [];
  freqMap.forEach((freq, char) => {
    nodes.push(new HuffmanNode(char, freq));
  });

  if (nodes.length === 0) return null;
  if (nodes.length === 1) {
    const single = nodes[0];
    return new HuffmanNode(null, single.freq, single, null);
  }

  while (nodes.length > 1) {
    nodes.sort((a, b) => a.freq - b.freq);
    const left = nodes.shift();
    const right = nodes.shift();
    const parent = new HuffmanNode(null, left.freq + right.freq, left, right);
    nodes.push(parent);
  }

  return nodes[0];
}

export function generateCodes(root, code = "", codeMap = new Map()) {
  if (!root) return codeMap;
  if (root.left === null && root.right === null) {
    codeMap.set(root.char, code || "0");
    return codeMap;
  }
  if (root.left) generateCodes(root.left, code + "0", codeMap);
  if (root.right) generateCodes(root.right, code + "1", codeMap);
  return codeMap;
}

export function computeSHA256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * 0-Copy Bitwise Memory-Efficient Huffman Packing:
 * Handles multi-megabyte payloads without V8 string length limits.
 */
export function packHuffmanBytes(buffer) {
  let preprocessed;
  try {
    preprocessed = zlib.deflateSync(buffer, { level: 9, memLevel: 9 });
  } catch (e) {
    preprocessed = buffer;
  }

  const freqMap = new Map();
  for (let i = 0; i < preprocessed.length; i++) {
    const byteVal = preprocessed[i];
    freqMap.set(byteVal, (freqMap.get(byteVal) || 0) + 1);
  }

  const root = buildHuffmanTree(freqMap);
  const codes = generateCodes(root);

  // Pre-calculate total bit count
  let totalBits = 0;
  for (let i = 0; i < preprocessed.length; i++) {
    totalBits += codes.get(preprocessed[i]).length;
  }

  const paddingCount = (8 - (totalBits % 8)) % 8;
  const totalPaddedBits = totalBits + paddingCount;
  const packedBytes = new Uint8Array(Math.ceil(totalPaddedBits / 8));

  let bitOffset = 0;
  for (let i = 0; i < preprocessed.length; i++) {
    const codeStr = codes.get(preprocessed[i]);
    for (let j = 0; j < codeStr.length; j++) {
      if (codeStr[j] === '1') {
        const byteIdx = bitOffset >> 3;
        const bitPos = 7 - (bitOffset & 7);
        packedBytes[byteIdx] |= (1 << bitPos);
      }
      bitOffset++;
    }
  }

  const compressedPayload = zlib.deflateRawSync(Buffer.from(packedBytes), {
    level: 9,
    memLevel: 9,
  });

  const hashHex = computeSHA256(buffer);
  const hashBytes = Buffer.from(hashHex, 'hex');

  const entryCount = freqMap.size;
  const headerSize = 2 + 32 + 2 + entryCount * 5 + 1 + 4;
  const result = new Uint8Array(headerSize + compressedPayload.length);

  result[0] = 0x48; // 'H'
  result[1] = 0x46; // 'F'
  result.set(hashBytes, 2);

  const view = new DataView(result.buffer);
  view.setUint16(34, entryCount, false);

  let offset = 36;
  freqMap.forEach((freq, val) => {
    result[offset] = val;
    view.setUint32(offset + 1, freq, false);
    offset += 5;
  });

  result[offset] = paddingCount;
  offset += 1;

  view.setUint32(offset, compressedPayload.length, false);
  offset += 4;

  result.set(compressedPayload, offset);
  return Buffer.from(result);
}
