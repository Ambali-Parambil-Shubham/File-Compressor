import java.util.HashMap;
import java.util.Map;

/**
 * STEP 3: Byte Frequency Calculation
 *
 * WHAT: Count how many times each raw byte value (0-255) appears in the data.
 */
public class FrequencyCalculator {

    public Map<Integer, Integer> calculate(byte[] data) {
        Map<Integer, Integer> frequencyMap = new HashMap<>();

        for (byte b : data) {
            // Convert to unsigned int to get 0-255 range
            int val = b & 0xFF;
            frequencyMap.put(val, frequencyMap.getOrDefault(val, 0) + 1);
        }

        return frequencyMap;
    }

    public void displayFrequencyTable(Map<Integer, Integer> frequencyMap) {
        System.out.println("\n--- Byte Frequency Table ---");
        System.out.printf("%-12s %-10s%n", "Byte Value", "Frequency");
        System.out.println("---------------------------------");

        for (Map.Entry<Integer, Integer> entry : frequencyMap.entrySet()) {
            System.out.printf("%-12d %-10d%n", entry.getKey(), entry.getValue());
        }
        System.out.println("---------------------------------\n");
    }
}
