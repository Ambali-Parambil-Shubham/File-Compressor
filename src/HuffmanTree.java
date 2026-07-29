import java.util.HashMap;
import java.util.Map;
import java.util.PriorityQueue;

/**
 * STEP 5 & 6: Build the Huffman Tree and Generate Codes
 *
 * WHAT: This class builds the Huffman Tree from frequency data and
 *       generates binary codes for each character using tree traversal.
 * WHY:  The Huffman Tree is the core of the compression algorithm.
 *       Characters that appear more often get shorter codes → smaller file size.
 * CONCEPTS:
 *   - Greedy Algorithm: always merge the two LEAST frequent nodes first
 *   - PriorityQueue (Min-Heap): efficiently finds the two smallest nodes
 *   - Recursive Tree Traversal: walk left = "0", walk right = "1"
 */
public class HuffmanTree {

    private HuffmanNode root; // The root of our Huffman Tree

    /**
     * STEP 5: Build the Huffman Tree
     *
     * ALGORITHM (Greedy Approach):
     *   1. Create one leaf node per unique character
     *   2. Add all nodes into a Min-Heap (PriorityQueue)
     *   3. Repeatedly:
     *      a. Remove the two nodes with smallest frequency
     *      b. Merge them into one new internal node (sum of frequencies)
     *      c. Add the merged node back into the queue
     *   4. When only one node remains → that's the root of our tree
     */
    public void buildTree(Map<Integer, Integer> frequencyMap) {
        if (frequencyMap == null || frequencyMap.isEmpty()) {
            this.root = null;
            return;
        }

        // PriorityQueue automatically sorts by compareTo() → smallest frequency first
        PriorityQueue<HuffmanNode> minHeap = new PriorityQueue<>();

        // Create one leaf node for every unique byte value
        for (Map.Entry<Integer, Integer> entry : frequencyMap.entrySet()) {
            minHeap.add(new HuffmanNode(entry.getKey(), entry.getValue()));
        }

        // Edge case: Single unique byte file
        if (minHeap.size() == 1) {
            HuffmanNode single = minHeap.poll();
            this.root = new HuffmanNode(single.frequency, single, null);
            return;
        }

        // Merge nodes until only one remains (the root)
        while (minHeap.size() > 1) {
            HuffmanNode left = minHeap.poll();  // Smallest frequency
            HuffmanNode right = minHeap.poll(); // Second smallest

            // Create a parent node: frequency = sum of both children
            int combinedFrequency = left.frequency + right.frequency;
            HuffmanNode parent = new HuffmanNode(combinedFrequency, left, right);

            minHeap.add(parent); // Put the merged node back
        }

        root = minHeap.poll(); // The last remaining node is the root
    }

    public Map<Integer, String> generateCodes() {
        Map<Integer, String> codes = new HashMap<>();
        if (root == null) return codes;
        generateCodesRecursive(root, "", codes);
        return codes;
    }

    // Recursive helper: walks the tree and builds codes
    private void generateCodesRecursive(HuffmanNode node, String currentCode,
                                         Map<Integer, String> codes) {
        if (node == null) return;

        // Leaf node: this is an actual byte value — save its code
        if (node.left == null && node.right == null) {
            codes.put(node.byteValue, currentCode.isEmpty() ? "0" : currentCode);
            return;
        }

        // Go left → add "0" to the code
        generateCodesRecursive(node.left, currentCode + "0", codes);

        // Go right → add "1" to the code
        generateCodesRecursive(node.right, currentCode + "1", codes);
    }

    public HuffmanNode getRoot() {
        return root;
    }
}
