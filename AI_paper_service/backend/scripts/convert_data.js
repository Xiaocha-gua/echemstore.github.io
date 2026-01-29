const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '../../');
const outputDir = path.join(__dirname, '../data');
const outputFile = path.join(outputDir, '中科院分区.json');

// Ensure output dir exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.xlsx'));
console.log(`Found ${files.length} Excel files.`);

let allJournals = [];

files.forEach(file => {
    const filePath = path.join(dataDir, file);
    console.log(`Processing ${file}...`);
    try {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        // Assuming Col 1 is Name, Col 3 is Partition
        // Skip header if it exists? Based on inspection, row 0 looked like data (Rank 1).
        // But maybe "1" is a rank. Let's assume all rows with valid string in col 1 are journals.
        
        rows.forEach(row => {
            if (row.length >= 4) {
                const name = row[1];
                const partition = row[3];
                
                if (typeof name === 'string' && typeof partition === 'string') {
                    // Check if it looks like a partition (contains "区")
                    if (partition.includes('区')) {
                         allJournals.push({
                            name: name.trim(),
                            partition: partition.trim()
                        });
                    }
                }
            }
        });
    } catch (e) {
        console.error(`Error processing ${file}:`, e.message);
    }
});

console.log(`Total journals extracted: ${allJournals.length}`);
fs.writeFileSync(outputFile, JSON.stringify(allJournals, null, 2));
console.log(`Saved to ${outputFile}`);
