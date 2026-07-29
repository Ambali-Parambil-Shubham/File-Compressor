/**
 * STEP 4: Node Class for the Huffman Tree
 *
 * WHAT: This class represents a single node in the Huffman Binary Tree.
 * WHY:  Every tree is made of nodes. Each node stores a character and its frequency.
 *       Leaf nodes hold actual characters; internal nodes just hold combined frequencies.
 * CONCEPT: Binary Tree + OOP (Encapsulation)
 */
public class HuffmanNode implements Comparable<HuffmanNode> {

    Integer byteValue;   // The byte value (0-255) (only meaningful in leaf nodes)
    int frequency;       // How often this byte appears in the file
    HuffmanNode left;    // Left child in the tree
    HuffmanNode right;   // Right child in the tree

    // Constructor for leaf nodes (actual bytes)
    public HuffmanNode(Integer byteValue, int frequency) {
        this.byteValue = byteValue;
        this.frequency = frequency;
        this.left = null;
        this.right = null;
    }

    // Constructor for internal nodes (merged nodes, no real byte)
    public HuffmanNode(int frequency, HuffmanNode left, HuffmanNode right) {
        this.byteValue = null; // null — not a real byte
        this.frequency = frequency;
        this.left = left;
        this.right = right;
    }

    /**
     * compareTo() is required by PriorityQueue.
     * WHY: The PriorityQueue needs to know how to order nodes.
     *      We want the LOWEST frequency node to come out first (min-heap behavior).
     * CONCEPT: Comparable interface + Greedy Algorithm
     */
    @Override
    public int compareTo(HuffmanNode other) {
        return this.frequency - other.frequency; // smaller frequency = higher priority
    }
}
