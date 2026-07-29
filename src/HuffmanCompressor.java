import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * STEP 7 & 8: Compression (Encoding) and Decompression (Decoding)
 *
 * WHAT: This class uses the Huffman codes to compress binary data into a bit string,
 *       and decompress it back to the original bytes.
 */
public class HuffmanCompressor {

    public String compress(byte[] data, Map<Integer, String> huffmanCodes) {
        StringBuilder encodedString = new StringBuilder();

        for (byte b : data) {
            encodedString.append(huffmanCodes.get(b & 0xFF));
        }

        return encodedString.toString();
    }

    public byte[] decompress(String encodedText, HuffmanNode root) {
        List<Byte> decodedBytes = new ArrayList<>();
        HuffmanNode current = root;

        for (char bit : encodedText.toCharArray()) {
            if (bit == '0') {
                current = current.left;
            } else {
                current = current.right;
            }

            if (current.left == null && current.right == null) {
                decodedBytes.add((byte) (int) current.byteValue);
                current = root;
            }
        }

        // Convert List<Byte> to primitive byte[]
        byte[] result = new byte[decodedBytes.size()];
        for (int i = 0; i < decodedBytes.size(); i++) {
            result[i] = decodedBytes.get(i);
        }
        return result;
    }

    public void displayHuffmanCodes(Map<Integer, String> codes) {
        System.out.println("\n--- Huffman Code Table ---");
        System.out.printf("%-12s %-12s %-15s%n", "Byte", "Orig bits", "Huffman Code");
        System.out.println("------------------------------------------");

        for (Map.Entry<Integer, String> entry : codes.entrySet()) {
            System.out.printf("%-12d %-12d %-15s%n", entry.getKey(), 8, entry.getValue());
        }
        System.out.println("------------------------------------------\n");
    }

    public static byte[] packBits(String bitString, int paddingBits) {
        if (bitString == null || bitString.isEmpty()) {
            return new byte[0];
        }
        int numBytes = (int) Math.ceil(bitString.length() / 8.0);
        byte[] packed = new byte[numBytes];

        for (int i = 0; i < bitString.length(); i++) {
            int byteIndex = i / 8;
            int bitPos = 7 - (i % 8);
            if (bitString.charAt(i) == '1') {
                packed[byteIndex] |= (1 << bitPos);
            }
        }
        return packed;
    }

    public static String unpackBits(byte[] packed, int paddingBits) {
        if (packed == null || packed.length == 0) return "";
        StringBuilder sb = new StringBuilder();

        for (int i = 0; i < packed.length; i++) {
            int byteVal = packed[i] & 0xFF;
            boolean isLastByte = (i == packed.length - 1);
            int bitsToRead = isLastByte ? paddingBits : 8;

            for (int b = 7; b >= 8 - bitsToRead; b--) {
                sb.append(((byteVal >> b) & 1) == 1 ? '1' : '0');
            }
        }
        return sb.toString();
    }

    public void displayStats(byte[] originalData, int totalCompressedBytes) {
        long originalBits = originalData.length * 8L;
        long compressedBits = totalCompressedBytes * 8L;
        double ratio = originalBits > 0 ? (1.0 - (double) compressedBits / originalBits) * 100 : 0;

        System.out.println("\n--- True Binary Compression Statistics ---");
        System.out.println("Original size    : " + originalData.length + " bytes (" + originalBits + " bits)");
        System.out.println("Compressed size  : " + totalCompressedBytes + " bytes (" + compressedBits + " bits)");
        System.out.printf("Space saved      : %.2f%%%n", ratio);
        System.out.println("-----------------------------------------\n");
    }
}
