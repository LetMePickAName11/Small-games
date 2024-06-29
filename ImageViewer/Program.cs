namespace ImageViewer;






/*
1. Bitwise AND (&)
Operation: Each bit of the result is 1 if the corresponding bits of both operands are 1.
Example: 10101100 & 11001001 results in 10001000

2. Bitwise OR (|)
Operation: Each bit of the result is 1 if at least one of the corresponding bits of either operand is 1.
Example: 10101100 | 11001001 results in 11101101

3. Bitwise XOR (^)
Operation: Each bit of the result is 1 if the corresponding bits of the operands are different.
Example: 10101100 ^ 11001001 results in 01100101

4. Bitwise NOT (~)
Operation: Each bit of the result is the inverse of the corresponding bit of the operand (0 becomes 1, and 1 becomes 0).
Example: ~10101100 results in 01010011

5. Bit Shift Left (<<)
Operation: Shifts all the bits in a byte to the left by a specified number of positions. Zeroes are shifted in from the right.
Example: 10101100 << 2 results in 10110000

6. Bit Shift Right (>>)
Operation: Shifts all the bits in a byte to the right by a specified number of positions. The leftmost bits are filled based on the sign bit (0 for unsigned bytes).
Example: 10101100 >> 2 results in 00101011

7. Zero Fill Right Shift (>>>)
Operation: Shifts all the bits in a byte to the right by a specified number of positions. Zeroes are shifted in from the left.
Example: 10101100 >>> 2 results in 00101011 (same as >> for unsigned bytes)

8. Bit Masking
Operation: Uses bitwise AND with a mask to isolate specific bits.
Example: To extract the lower 4 bits: 10101100 & 00001111 results in 00001100

9. Setting Bits
Operation: Uses bitwise OR to set specific bits to 1.
Example: Setting the lower 4 bits: 10100000 | 00001111 results in 10101111

10. Clearing Bits
Operation: Uses bitwise AND with the NOT of a mask to clear specific bits.
Example: Clearing the lower 4 bits: 10101100 & 11110000 results in 10100000

11. Toggling Bits
Operation: Uses bitwise XOR with a mask to flip specific bits.
Example: Toggling the lower 4 bits: 10101100 ^ 00001111 results in 10100011
*/