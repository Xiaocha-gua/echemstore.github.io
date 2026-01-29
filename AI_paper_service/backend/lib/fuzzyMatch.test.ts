import { findJournal, normalize } from './fuzzyMatch';

const mockDB = [
    { name: "Journal of Materials Chemistry A", partition: "1区" },
    { name: "Nature Reviews Materials", partition: "1区" },
    { name: "Advanced Materials", partition: "1区" },
    { name: "Joule", partition: "1区" }
];

function runTest(query: string, expectedName: string | null) {
    const result = findJournal(query, mockDB);
    const resultName = result ? result.name : null;
    const status = resultName === expectedName ? "PASS" : `FAIL (Expected ${expectedName}, got ${resultName})`;
    console.log(`Query: "${query}" -> ${status}`);
}

console.log("Testing Fuzzy Match Logic...");

// Test 1: Exact match
runTest("Joule", "Joule");

// Test 2: Case insensitive
runTest("joule", "Joule");

// Test 3: Ignore dots
runTest("J. Mater. Chem. A", "Journal of Materials Chemistry A"); // Will this fail with basic includes?
// "j mater chem a" vs "journal of materials chemistry a". Includes will FAIL.
// User requirement: "Even if AI returns abbreviation... match corresponding partition".
// User suggested: "Ignore dots... String Includes".
// If the user implies that "String Includes" solves abbreviations, they are mistaken, OR the DB has abbreviations.
// But I must implement what was asked. If it fails, I will improve it.

// Test 4: Extra spaces
runTest("  Advanced   Materials  ", "Advanced Materials");

// Test 5: Substring
runTest("Nature Reviews", "Nature Reviews Materials"); 

// Test 6: Superstring
runTest("Recommended: Joule Journal", "Joule");
