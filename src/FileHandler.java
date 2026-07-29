import java.io.*;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Map;
import java.util.HashMap;

/**
 * STEP 2: File Input/Output Setup
 *
 * WHAT: This class handles all file reading and writing operations.
 * WHY:  Separating file I/O into its own class keeps code modular and clean.
 *       If we want to support more file types later, we only change this class.
 * CONCEPTS:
 *   - File Handling: BufferedReader, FileWriter, FileInputStream
 *   - OOP: Encapsulation — file logic is isolated in one place
 *   - Error Handling: try-catch for IOException
 */
public class FileHandler {

    /**
     * Read entire file content as a byte array
     */
    public byte[] readFile(String filePath) throws IOException {
        return Files.readAllBytes(Paths.get(filePath));
    }

    /**
     * Write a byte array to a file
     */
    public void writeFile(String filePath, byte[] data) throws IOException {
        try (FileOutputStream fos = new FileOutputStream(filePath)) {
            fos.write(data);
        }
    }

    public static class HuffmanArchiveData {
        public final Map<Integer, Integer> frequencyMap;
        public final String bitString;

        public HuffmanArchiveData(Map<Integer, Integer> frequencyMap, String bitString) {
            this.frequencyMap = frequencyMap;
            this.bitString = bitString;
        }
    }

    /**
     * Write binary .huff file with embedded header
     */
    public int writeHuffmanFile(String filePath, Map<Integer, Integer> freqMap, String bitString) throws IOException {
        int remainder = bitString.length() % 8;
        int paddingBits = (remainder == 0) ? 8 : remainder;
        byte[] packedBytes = HuffmanCompressor.packBits(bitString, paddingBits);

        try (DataOutputStream dos = new DataOutputStream(new FileOutputStream(filePath))) {
            // Magic Bytes 'H' 'F'
            dos.writeByte('H');
            dos.writeByte('F');

            // Entry Count N (uint16)
            dos.writeShort(freqMap.size());

            // Write Frequency Entries
            for (Map.Entry<Integer, Integer> entry : freqMap.entrySet()) {
                dos.writeByte(entry.getKey() & 0xFF);
                dos.writeInt(entry.getValue());
            }

            // Write Padding Bits
            dos.writeByte(paddingBits);

            // Write Packed Payload
            dos.write(packedBytes);
        }

        return (int) new File(filePath).length();
    }

    /**
     * Read binary .huff file and extract frequency map and bitstream
     */
    public HuffmanArchiveData readHuffmanFile(String filePath) throws IOException {
        try (DataInputStream dis = new DataInputStream(new FileInputStream(filePath))) {
            byte m1 = dis.readByte();
            byte m2 = dis.readByte();
            if (m1 != 'H' || m2 != 'F') {
                throw new IOException("Invalid .huff file header: Missing magic bytes ('HF')");
            }

            int numEntries = dis.readUnsignedShort();
            Map<Integer, Integer> freqMap = new java.util.HashMap<>();

            for (int i = 0; i < numEntries; i++) {
                int byteVal = dis.readByte() & 0xFF;
                int freq = dis.readInt();
                freqMap.put(byteVal, freq);
            }

            int paddingBits = dis.readByte() & 0xFF;
            byte[] packedBytes = dis.readAllBytes();

            String bitString = HuffmanCompressor.unpackBits(packedBytes, paddingBits);
            return new HuffmanArchiveData(freqMap, bitString);
        }
    }

    /**
     * Display useful file information to the user
     */
    public void displayFileInfo(String filePath) {
        File file = new File(filePath);

        System.out.println("\n--- File Details ---");
        System.out.println("Name      : " + file.getName());
        System.out.println("Path      : " + file.getAbsolutePath());
        System.out.println("Size      : " + file.length() + " bytes (" +
                            String.format("%.2f", file.length() / 1024.0) + " KB)");
        System.out.println("Readable  : " + file.canRead());
        System.out.println("--------------------\n");
    }

    /**
     * Check if a file exists at the given path
     */
    public boolean fileExists(String filePath) {
        return new File(filePath).exists();
    }
}
