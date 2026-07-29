/**
 * Huffman Coding Algorithm — True Binary Implementation v1.0
 * Handles Uint8Array for true binary support (PDFs, Images, Word Docs, Executables)
 * and exports/imports self-contained .huff binary archives with embedded tree headers.
 */

// ── Priority Queue (min-heap) ─────────────────────────────────────────────────
class MinHeap {
  constructor() { this.heap = []; }

  push(node) {
    this.heap.push(node);
    this._bubbleUp(this.heap.length - 1);
  }

  pop() {
    if (this.heap.length === 0) return null;
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._sinkDown(0);
    }
    return top;
  }

  get size() { return this.heap.length; }

  _bubbleUp(i) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[parent].freq <= this.heap[i].freq) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }

  _sinkDown(i) {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this.heap[l].freq < this.heap[smallest].freq) smallest = l;
      if (r < n && this.heap[r].freq < this.heap[smallest].freq) smallest = r;
      if (smallest === i) break;
      [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
      i = smallest;
    }
  }
}

// ── Node ──────────────────────────────────────────────────────────────────────
function makeNode(byte, freq, left = null, right = null) {
  return { byte, freq, left, right };
}

// ── Step 1: Build frequency map ───────────────────────────────────────────────
export function buildFrequencyMap(data) {
  const map = new Map();
  for (let i = 0; i < data.length; i++) {
    const byte = data[i];
    map.set(byte, (map.get(byte) || 0) + 1);
  }
  return map; // Map<byte, count>
}

// ── Step 2: Build Huffman tree ────────────────────────────────────────────────
export function buildHuffmanTree(freqMap) {
  if (!freqMap || freqMap.size === 0) return null;

  const heap = new MinHeap();
  for (const [byte, freq] of freqMap) {
    heap.push(makeNode(byte, freq));
  }

  // Edge case: single unique byte
  if (heap.size === 1) {
    const only = heap.pop();
    return makeNode(null, only.freq, only, null);
  }

  while (heap.size > 1) {
    const left = heap.pop();
    const right = heap.pop();
    heap.push(makeNode(null, left.freq + right.freq, left, right));
  }

  return heap.pop(); // root
}

// ── Step 3: Generate binary codes ────────────────────────────────────────────
export function generateCodes(root) {
  const codes = new Map(); // Map<byte, binaryString>
  if (!root) return codes;

  function traverse(node, code) {
    if (!node) return;
    if (node.left === null && node.right === null) {
      codes.set(node.byte, code || '0');
      return;
    }
    if (node.left) traverse(node.left, code + '0');
    if (node.right) traverse(node.right, code + '1');
  }

  traverse(root, '');
  return codes;
}

// ── Step 4: Compress bits into bitstring ──────────────────────────────────────
export function compressBits(data, codes) {
  let bits = '';
  for (let i = 0; i < data.length; i++) {
    bits += codes.get(data[i]) || '';
  }
  return bits;
}

// ── Step 5: Bit Packing & Unpacking ───────────────────────────────────────────
export function packBitsToBytes(bitString) {
  if (!bitString || bitString.length === 0) {
    return { packedBytes: new Uint8Array(0), paddingBits: 8 };
  }
  const numBytes = Math.ceil(bitString.length / 8);
  const packedBytes = new Uint8Array(numBytes);

  for (let i = 0; i < bitString.length; i++) {
    const byteIndex = Math.floor(i / 8);
    const bitPos = 7 - (i % 8);
    if (bitString[i] === '1') {
      packedBytes[byteIndex] |= (1 << bitPos);
    }
  }

  const remainder = bitString.length % 8;
  const paddingBits = remainder === 0 ? 8 : remainder;
  return { packedBytes, paddingBits };
}

export function unpackBytesToBits(packedBytes, paddingBits) {
  if (!packedBytes || packedBytes.length === 0) return '';
  let bits = '';

  for (let i = 0; i < packedBytes.length; i++) {
    const byteVal = packedBytes[i];
    const isLastByte = (i === packedBytes.length - 1);
    const bitsToRead = isLastByte ? paddingBits : 8;

    for (let b = 7; b >= 8 - bitsToRead; b--) {
      bits += ((byteVal >> b) & 1) ? '1' : '0';
    }
  }
  return bits;
}

// ── Binary File Serialization (.huff v1.0) ───────────────────────────────────
// Header Format:
// [2B Magic: 'H','F'] [2B EntryCount N] [N x (1B byte + 4B freq)] [1B paddingBits] [Packed Payload]
export function serializeHuffmanFile(freqMap, bitString) {
  const { packedBytes, paddingBits } = packBitsToBytes(bitString);
  const numEntries = freqMap ? freqMap.size : 0;
  
  // Calculate total byte length
  // Magic(2) + EntryCount(2) + Entries(N * 5) + Padding(1) + Payload
  const headerLen = 2 + 2 + (numEntries * 5) + 1;
  const buffer = new Uint8Array(headerLen + packedBytes.length);
  const view = new DataView(buffer.buffer);

  let offset = 0;
  // Magic 'H' 'F'
  buffer[offset++] = 0x48; // 'H'
  buffer[offset++] = 0x46; // 'F'

  // Entry count N
  view.setUint16(offset, numEntries, false); // Big endian
  offset += 2;

  // Entries
  if (freqMap) {
    for (const [byteVal, freq] of freqMap.entries()) {
      buffer[offset++] = byteVal & 0xFF;
      view.setUint32(offset, freq, false); // Big endian
      offset += 4;
    }
  }

  // Padding bits (1-8)
  buffer[offset++] = paddingBits & 0xFF;

  // Packed bytes payload
  buffer.set(packedBytes, offset);

  return buffer;
}

export function deserializeHuffmanFile(fileBytes) {
  if (!fileBytes || fileBytes.length < 5) {
    throw new Error('Invalid .huff file: File is empty or corrupt.');
  }

  const view = new DataView(fileBytes.buffer, fileBytes.byteOffset, fileBytes.byteLength);
  let offset = 0;

  // Check Magic
  const m1 = fileBytes[offset++];
  const m2 = fileBytes[offset++];
  if (m1 !== 0x48 || m2 !== 0x46) {
    throw new Error('Invalid .huff header: Missing magic bytes ("HF").');
  }

  // Read Entry Count N
  const numEntries = view.getUint16(offset, false);
  offset += 2;

  const freqMap = new Map();
  for (let i = 0; i < numEntries; i++) {
    const byteVal = fileBytes[offset++];
    const freq = view.getUint32(offset, false);
    offset += 4;
    freqMap.set(byteVal, freq);
  }

  // Padding bits
  const paddingBits = fileBytes[offset++];

  // Remaining bytes are payload
  const packedPayload = fileBytes.subarray(offset);
  const bitString = unpackBytesToBits(packedPayload, paddingBits);

  const root = buildHuffmanTree(freqMap);
  return { freqMap, root, bitString };
}

// ── Step 6: Decompress Bitstring to Uint8Array ───────────────────────────────
export function decompress(encodedBitString, root) {
  if (!root || !encodedBitString) return new Uint8Array(0);
  let current = root;
  const result = [];

  for (let i = 0; i < encodedBitString.length; i++) {
    const bit = encodedBitString[i];
    current = bit === '0' ? current.left : current.right;
    
    if (!current) {
      // Safety guard against corrupted bitstreams
      break;
    }

    if (current.left === null && current.right === null) {
      result.push(current.byte);
      current = root;
    }
  }

  return new Uint8Array(result);
}

// ── Full Pipeline ─────────────────────────────────────────────────────────────
export function runCompression(data) {
  const buffer = data instanceof Uint8Array ? data : new TextEncoder().encode(String(data));
  
  if (buffer.length === 0) {
    return {
      freqMap: new Map(),
      root: null,
      codes: new Map(),
      encoded: '',
      binaryPayload: serializeHuffmanFile(new Map(), ''),
      stats: { originalBits: 0, compressedBits: 0, ratio: 0 }
    };
  }

  const freqMap = buildFrequencyMap(buffer);
  const root = buildHuffmanTree(freqMap);
  const codes = generateCodes(root);
  const encoded = compressBits(buffer, codes);
  const binaryPayload = serializeHuffmanFile(freqMap, encoded);

  const originalBits = buffer.length * 8;
  const compressedBits = binaryPayload.length * 8;
  const ratio = originalBits > 0 ? ((1 - compressedBits / originalBits) * 100) : 0;

  const stats = { originalBits, compressedBits, ratio };

  return { freqMap, root, codes, encoded, binaryPayload, stats };
}

export function decompressFromFile(fileBytes) {
  const { freqMap, root, bitString } = deserializeHuffmanFile(fileBytes);
  const decompressedBytes = decompress(bitString, root);
  return { decompressedBytes, freqMap, root };
}
