/**
 * CampusPulse Charts Engine
 * Encapsulates Chart.js configurations
 */

window.ChartsEngine = (function () {
    let charts = { line: null, bar: null, radar: null };

    /**
     * Render all charts based on filtered data
     */
    function render(data) {
        const theme = document.documentElement.getAttribute('data-theme') || 'dark';
        const color = theme === 'dark' ? '#94a3b8' : '#64748b';
        const grid = theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

        if (!data || data.length === 0) {
            // Optional: Destroy charts or show placeholder
            return;
        }

        renderLine(data, color, grid);
        renderBar(data, color, grid);
        renderRadar(data, color, grid);
    }

    function renderLine(data, textColor, gridColor) {
        const ctx = document.getElementById('lineChart').getContext('2d');
        const dates = [...new Set(data.map(d => d.Date))].sort();
        const vals = dates.map(date => {
            const recs = data.filter(d => d.Date === date);
            return (recs.reduce((a, b) => a + b.Rating, 0) / recs.length).toFixed(1);
        });

        if (charts.line) charts.line.destroy();
        charts.line = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Satisfaction Index',
                    data: vals,
                    borderColor: '#22d3ee',
                    backgroundColor: 'rgba(34, 211, 238, 0.05)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 1.5,
                    pointHoverRadius: 4,
                    borderWidth: 2
                }]
            },
            options: getOptions(textColor, gridColor)
        });
    }

    function getRadarChart(labels, data, textColor, gridColor) {
        const ctx = document.getElementById('radarChart')?.getContext('2d');
        if (!ctx || !labels.length) return null;

        // Use shorthands for better Bento fitting
        const shortLabels = labels.map(l => {
            if (l.includes("Computer Science")) return "CSE";
            if (l.includes("Electronics")) return "ECE";
            if (l.includes("Mechanical")) return "MECH";
            if (l.includes("Civil")) return "CIVIL";
            if (l.includes("Information")) return "IT";
            return l;
        });

        return new Chart(ctx, {
            type: 'radar',
            data: {
                labels: shortLabels,
                datasets: [{
                    label: 'Satisfaction Index',
                    data: data,
                    borderColor: '#f43f5e',
                    backgroundColor: 'rgba(244, 63, 94, 0.1)',
                    borderWidth: 2,
                    pointBackgroundColor: '#f43f5e',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#f43f5e'
                }]
            },
            options: {
                ...getRadarOptions(textColor, gridColor),
                scales: {
                    r: {
                        angleLines: { color: gridColor },
                        grid: { color: gridColor },
                        pointLabels: {
                            color: textColor,
                            font: { size: 11, weight: '700', family: 'Outfit' }
                        },
                        ticks: {
                            display: false,
                            stepSize: 1
                        },
                        suggestedMin: 0,
                        suggestedMax: 5
                    }
                }
            }
        });
    }

    function renderBar(data, textColor, gridColor) {
        const ctx = document.getElementById('barChart').getContext('2d');
        const facs = [...new Set(data.map(d => d.Facility))].sort();
        const scores = facs.map(f => {
            const recs = data.filter(d => d.Facility === f);
            return (recs.reduce((a, b) => a + b.Rating, 0) / recs.length).toFixed(1);
        });

        if (charts.bar) charts.bar.destroy();
        charts.bar = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: facs,
                datasets: [{
                    data: scores,
                    backgroundColor: '#c084fc',
                    borderRadius: 8
                }]
            },
            options: {
                ...getOptions(textColor, gridColor),
                layout: { padding: { top: 10, bottom: 20, left: 10, right: 10 } },
                scales: {
                    y: { min: 0, max: 5, grid: { color: gridColor }, ticks: { color: textColor, font: { size: 9 } } },
                    x: { grid: { display: false }, ticks: { color: textColor, font: { size: 9 } } }
                }
            }
        });
    }

    function renderRadar(data, textColor, gridColor) {
        const ctx = document.getElementById('radarChart')?.getContext('2d');
        if (!ctx) return;

        const isMobile = window.innerWidth < 768;
        const depts = [...new Set(data.map(d => d.Department))].sort();
        const scores = depts.map(dep => {
            const recs = data.filter(d => d.Department === dep);
            return (recs.reduce((a, b) => a + b.Rating, 0) / recs.length).toFixed(1);
        });

        const shortLabels = depts.map(l => {
            if (l.includes("Computer Science")) return "CSE";
            if (l.includes("Electronics")) return "ECE";
            if (l.includes("Mechanical")) return "MECH";
            if (l.includes("Civil")) return "CIVIL";
            if (l.includes("Information")) return "IT";
            if (l.includes("Business")) return "BBA";
            return l;
        });

        if (charts.radar) charts.radar.destroy();
        charts.radar = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: shortLabels,
                datasets: [{
                    label: 'Satisfaction Index',
                    data: scores,
                    borderColor: '#f43f5e',
                    backgroundColor: 'rgba(244, 63, 94, 0.1)',
                    borderWidth: 2,
                    pointBackgroundColor: '#f43f5e',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#f43f5e'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: { padding: isMobile ? 20 : 40 },
                plugins: { legend: { display: false } },
                scales: {
                    r: {
                        angleLines: { color: gridColor },
                        grid: { color: gridColor },
                        pointLabels: {
                            color: textColor,
                            font: { size: isMobile ? 8 : 11, weight: '700', family: 'Outfit' }
                        },
                        ticks: {
                            display: false,
                            stepSize: 1
                        },
                        suggestedMin: 0,
                        suggestedMax: 5
                    }
                }
            }
        });
    }

    function getOptions(textColor, gridColor) {
        const isMobile = window.innerWidth < 768;
        return {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: isMobile ? { top: 20, bottom: 20, left: 5, right: 5 } : 60
            },
            interaction: {
                intersect: false,
                mode: 'index',
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    enabled: !isMobile,
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleFont: { family: 'Outfit', size: 14, weight: 'bold' },
                    bodyFont: { family: 'Outfit', size: 13 },
                    padding: 12,
                    cornerRadius: 10,
                    displayColors: false
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        color: textColor,
                        font: { family: 'Outfit', size: isMobile ? 8 : 11 },
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                y: {
                    grid: { color: gridColor, drawBorder: false },
                    ticks: { color: textColor, font: { family: 'Outfit', size: isMobile ? 8 : 11 } }
                }
            }
        };
    }

    return { render };
})();
