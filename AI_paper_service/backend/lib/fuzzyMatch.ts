export function normalize(str: string): string {
    return str.toLowerCase()
        .replace(/\./g, ' ')         // Replace dots with space
        .replace(/\s+/g, ' ')        // Collapse spaces
        .trim();
}

export interface Journal {
    name: string;
    partition: string;
}

function isMatch(queryToken: string, dbToken: string): boolean {
    if (queryToken === dbToken) return true;
    if (dbToken.startsWith(queryToken)) return true; // Prefix match (Mater -> Materials)
    if (dbToken[0] === queryToken && queryToken.length === 1) return true; // Acronym match (J -> Journal)
    return false;
}

function sequenceMatch(queryTokens: string[], dbTokens: string[]): boolean {
    let qIdx = 0;
    let dbIdx = 0;
    
    while (qIdx < queryTokens.length && dbIdx < dbTokens.length) {
        if (isMatch(queryTokens[qIdx], dbTokens[dbIdx])) {
            qIdx++;
            dbIdx++;
        } else {
            // If strict sequence, fail? Or skip DB tokens (e.g. skip "of")?
            // "J. Mater. Chem. A" vs "Journal of Materials Chemistry A".
            // "J" matches "Journal".
            // "Mater" doesn't match "of". Skip "of".
            dbIdx++;
        }
    }
    
    return qIdx === queryTokens.length;
}

export function findJournal(query: string, db: Journal[]): Journal | null {
    if (!query) return null;
    const nQuery = normalize(query);
    const queryTokens = nQuery.split(' ');
    
    // 1. Exact / Includes match (Previous Logic)
    // We keep this because it covers cases where tokens might be messy but substring works.
    const cleanQuery = nQuery.replace(/\s/g, ''); // collapsed for includes
    
    // Filter candidates using basic includes or the new sequence match
    const candidates = db.filter(j => {
        const nDb = normalize(j.name);
        const cleanDb = nDb.replace(/\s/g, '');
        
        // Basic Includes
        if (cleanDb.includes(cleanQuery) || cleanQuery.includes(cleanDb)) return true;
        
        // Sequence Match
        const dbTokens = nDb.split(' ');
        if (sequenceMatch(queryTokens, dbTokens)) return true;
        
        return false;
    });

    if (candidates.length > 0) {
        // Prioritize: 
        // 1. Exact match
        // 2. Sequence match with least skipped words?
        // For now, return the first one.
        // Or sort by length difference?
        return candidates[0];
    }

    return null;
}
