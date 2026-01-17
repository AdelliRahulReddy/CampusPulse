/**
 * CampusPulse Data Engine
 * Handles CSV Parsing, Cleaning, and Sentiment Heuristics
 */

window.DataEngine = (function () {
    let rawData = [];
    let filteredData = [];

    /**
     * Parse CSV or Load from Embedded Database
     */
    async function loadData(url) {
        return new Promise((resolve, reject) => {
            // Check if database is already embedded (Local File Support)
            if (window.CAMPUS_DB) {
                console.log("Loading from Embedded Database...");
                rawData = processData(window.CAMPUS_DB);
                filteredData = [...rawData];
                resolve(rawData);
                return;
            }

            // Fallback to Fetch (Only works on Servers)
            Papa.parse(url, {
                download: true,
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                complete: function (results) {
                    rawData = processData(results.data);
                    filteredData = [...rawData];
                    resolve(rawData);
                },
                error: (err) => reject(err)
            });
        });
    }

    /**
     * Data Normalization and Sentiment tagging
     */
    function processData(data) {
        return data.map(row => ({
            ...row,
            Rating: parseInt(row.Rating) || 0,
            Sentiment: runSentimentCheck(row.Comment),
            Date: row.Date || '2025-01-01'
        }));
    }

    /**
     * Heuristic Sentiment Analysis
     */
    function runSentimentCheck(comment) {
        if (!comment) return 'Neutral';
        const lower = comment.toLowerCase();
        const pos = ['excellent', 'amazing', 'great', 'life saver', 'top notch', 'good', 'satisfied', 'clean', 'modern'];
        const neg = ['slow', 'wait times', 'leaking', 'noisy', 'poor', 'bad', 'overpriced', 'old', 'rude'];

        let score = 0;
        pos.forEach(w => { if (lower.includes(w)) score++; });
        neg.forEach(w => { if (lower.includes(w)) score--; });

        if (score > 0) return 'Positive';
        if (score < 0) return 'Negative';
        return 'Neutral';
    }

    /**
     * Filtering Core Logic
     */
    function filterRecords(fac, dept, year, minRating) {
        filteredData = rawData.filter(d => {
            const mFac = (fac === "All" || d.Facility === fac);
            const mDept = (dept === "All" || d.Department === dept);
            const mYear = (year === "All" || d.Year === year);
            const mRating = (d.Rating >= minRating);
            return mFac && mDept && mYear && mRating;
        });
        return filteredData;
    }

    /**
     * KPI Calculations
     */
    function getKPIs() {
        const count = filteredData.length;
        if (count === 0) return { total: 0, avg: 0, best: 'N/A', worst: 'N/A' };

        const avg = (filteredData.reduce((a, b) => a + b.Rating, 0) / count).toFixed(1);

        // Facility scores
        const facs = {};
        filteredData.forEach(d => {
            if (!facs[d.Facility]) facs[d.Facility] = { s: 0, c: 0 };
            facs[d.Facility].s += d.Rating;
            facs[d.Facility].c++;
        });

        let bestFac = 'N/A', worstFac = 'N/A';
        let high = -1, low = 6;
        Object.keys(facs).forEach(f => {
            const score = facs[f].s / facs[f].c;
            if (score > high) { high = score; bestFac = f; }
            if (score < low) { low = score; worstFac = f; }
        });

        return { total: count, avg, best: bestFac, worst: worstFac };
    }

    function getData() { return filteredData; }

    return { loadData, filterRecords, getKPIs, getData };
})();
