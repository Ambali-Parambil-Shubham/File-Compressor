import java.util.Map;
import java.util.Scanner;

/**
 * STEP 9: Menu-Driven Main Program
 *
 * WHAT: The entry point of the application.
 *       Ties all the components together with a user-friendly console menu.
 * WHY:  A menu-driven interface is beginner-friendly and practical for demos.
 * CONCEPTS:
 *   - OOP: Using all our classes together
 *   - Error Handling: try-catch for invalid input and file errors
 *   - Scanner: for reading user input from the console
 *
 * =====================================================================
 * PROJECT STRUCTURE OVERVIEW (Step 1)
 * =====================================================================
 * HuffmanCompressor/
 * ├── src/
 * │   ├── HuffmanNode.java         → Tree node (character + frequency + children)
 * │   ├── HuffmanTree.java         → Builds the tree + generates binary codes
 * │   ├── FrequencyCalculator.java → Counts character frequencies (HashMap)
 * │   ├── HuffmanCompressor.java   → Encodes and decodes text
 * │   ├── FileHandler.java         → Reads and writes files
 * │   └── Main.java                → Menu interface + program entry point
 * =====================================================================
 * DATA FLOW:
 *   [Text File] → FrequencyCalculator → HuffmanTree → HuffmanCodes
 *              → HuffmanCompressor.compress() → [Compressed File]
 *              → HuffmanCompressor.decompress() → [Decompressed File]
 * =====================================================================
 */
public class Main {

    // These are stored so compression data can be reused for decompression
    private static String encodedBits = null;       // The compressed bit string
    private static HuffmanNode huffmanRoot = null;  // Root of the Huffman Tree
    private static byte[] originalData = null;      // The original raw file bytes

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        // Create instances of helper classes
        FileHandler fileHandler = new FileHandler();
        FrequencyCalculator freqCalc = new FrequencyCalculator();
        HuffmanTree huffmanTree = new HuffmanTree();
        HuffmanCompressor compressor = new HuffmanCompressor();

        System.out.println("===========================================");
        System.out.println("   Binary Huffman Compression Engine");
        System.out.println("   Support for PDFs, Word, Images, etc.");
        System.out.println("===========================================");

        System.out.print("\nEnter file path: ");
        String inputFilePath = scanner.nextLine().trim();

        if (!fileHandler.fileExists(inputFilePath)) {
            System.out.println("Error: File not found.");
            scanner.close();
            return;
        }

        fileHandler.displayFileInfo(inputFilePath);

        try {
            originalData = fileHandler.readFile(inputFilePath);
        } catch (Exception e) {
            System.out.println("Error reading file: " + e.getMessage());
            scanner.close();
            return;
        }

        Map<Integer, Integer> frequencyMap = freqCalc.calculate(originalData);
        huffmanTree.buildTree(frequencyMap);
        huffmanRoot = huffmanTree.getRoot();
        Map<Integer, String> huffmanCodes = huffmanTree.generateCodes();

        freqCalc.displayFrequencyTable(frequencyMap);
        compressor.displayHuffmanCodes(huffmanCodes);

        boolean running = true;
        while (running) {
            System.out.println("============ MENU ============");
            System.out.println("1. Compress File (Binary .huff)");
            System.out.println("2. Decompress File (.huff Archive)");
            System.out.println("3. Exit");
            System.out.print("Choose option: ");

            String choice = scanner.nextLine().trim();

            switch (choice) {
                case "1":
                    try {
                        System.out.println("\n[Compressing binary data...]");
                        encodedBits = compressor.compress(originalData, huffmanCodes);
                        String compressedPath = inputFilePath + ".huff";
                        int totalBytes = fileHandler.writeHuffmanFile(compressedPath, frequencyMap, encodedBits);
                        System.out.println("Compression successful! Saved to: " + compressedPath);
                        compressor.displayStats(originalData, totalBytes);
                    } catch (Exception e) {
                        System.out.println("Compression failed: " + e.getMessage());
                        e.printStackTrace();
                    }
                    break;

                case "2":
                    try {
                        System.out.print("\nEnter .huff file path to decompress (press Enter for default: " + inputFilePath + ".huff): ");
                        String huffPath = scanner.nextLine().trim();
                        if (huffPath.isEmpty()) {
                            huffPath = inputFilePath + ".huff";
                        }

                        if (!fileHandler.fileExists(huffPath)) {
                            System.out.println("Error: Compressed file not found: " + huffPath);
                            break;
                        }

                        System.out.println("\n[Reading archive header and decompressing...]");
                        FileHandler.HuffmanArchiveData archive = fileHandler.readHuffmanFile(huffPath);
                        
                        HuffmanTree treeForDecompress = new HuffmanTree();
                        treeForDecompress.buildTree(archive.frequencyMap);

                        byte[] decodedData = compressor.decompress(archive.bitString, treeForDecompress.getRoot());
                        String outPath = huffPath.endsWith(".huff") 
                                ? huffPath.substring(0, huffPath.length() - 5) + ".decoded"
                                : huffPath + ".decoded";
                        
                        fileHandler.writeFile(outPath, decodedData);
                        System.out.println("Decompression successful! Restored " + decodedData.length + " bytes.");
                        System.out.println("Saved to: " + outPath);
                    } catch (Exception e) {
                        System.out.println("Decompression failed: " + e.getMessage());
                        e.printStackTrace();
                    }
                    break;

                case "3":
                    running = false;
                    break;
                default:
                    System.out.println("Invalid option.");
            }
        }
        scanner.close();
    }
}
