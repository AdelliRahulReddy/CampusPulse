/**
 * CampusPulse UI Manager (Bento Edition)
 */

document.addEventListener('DOMContentLoaded', async () => {
    let currentPage = 1;
    const itemsPerPage = 5;
    let currentSearch = "";

    // DOM Bindings
    const timeEl = document.getElementById('currentTime');
    const tableBody = document.getElementById('tableBody');
    const pageDetail = document.getElementById('pageDetail');
    const recordCount = document.getElementById('recordCount');
    const tableSearch = document.getElementById('tableSearch');

    const facF = document.getElementById('facFilter');
    const depF = document.getElementById('deptFilter');
    const yrF = document.getElementById('yearFilter');
    const ratF = document.getElementById('ratingFilter');
    const ratV = document.getElementById('ratingVal');

    // Stats
    const totalV = document.getElementById('kpiTotal');
    const vibeV = document.getElementById('kpiSatisfaction');

    // --- Init ---
    try {
        await DataEngine.loadData();
        startTime();
        initFilters();
        updateUI();
    } catch (e) {
        console.error("Pulse Engine Error:", e);
    }

    // --- Event Listeners ---
    document.getElementById('themeToggle').addEventListener('click', () => {
        const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        updateUI();
    });

    [facF, depF, yrF].forEach(el => el.addEventListener('change', () => { currentPage = 1; sync(); }));
    ratF.addEventListener('input', (e) => { ratV.textContent = `${e.target.value}★`; sync(); });
    tableSearch.addEventListener('input', (e) => { currentSearch = e.target.value.toLowerCase(); currentPage = 1; renderFeed(); });

    document.getElementById('prevBtn').addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderFeed(); } });
    document.getElementById('nextBtn').addEventListener('click', () => {
        const total = Math.ceil(getFilteredList().length / itemsPerPage);
        if (currentPage < total) { currentPage++; renderFeed(); }
    });

    function sync() {
        DataEngine.filterRecords(facF.value, depF.value, yrF.value, parseInt(ratF.value));
        updateUI();
    }

    function updateUI() {
        const data = DataEngine.getData();
        const kpis = DataEngine.getKPIs();

        totalV.textContent = kpis.total;
        vibeV.textContent = kpis.avg;
        recordCount.textContent = `${kpis.total} RECORDS LOADED`;

        ChartsEngine.render(data);
        renderFeed();
        renderBentoInsights(data, kpis);
    }

    function initFilters() {
        const data = DataEngine.getData();
        const facs = [...new Set(data.map(d => d.Facility))].sort();
        const depts = [...new Set(data.map(d => d.Department))].sort();
        const years = [...new Set(data.map(d => d.Year))].sort();

        fillS(facF, facs, "FACILITIES");
        fillS(depF, depts, "BRANCHES");
        fillS(yrF, years, "ACADEMIC YEARS");
    }

    function fillS(el, items, label) {
        el.innerHTML = `<option value="All">ALL ${label}</option>`;
        items.forEach(i => {
            const o = document.createElement('option');
            o.value = i; o.textContent = i;
            el.appendChild(o);
        });
    }

    function getFilteredList() {
        const data = DataEngine.getData();
        if (!currentSearch) return data;
        return data.filter(d => d.Name.toLowerCase().includes(currentSearch) || d.Comment.toLowerCase().includes(currentSearch));
    }

    function renderFeed() {
        const list = getFilteredList();
        const total = Math.ceil(list.length / itemsPerPage) || 1;
        const pageData = list.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

        if (list.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 60px; color:var(--text-dim);">NO PULSE DATA MATCHES YOUR SEARCH.</td></tr>`;
        } else {
            tableBody.innerHTML = pageData.map(d => `
                <tr>
                    <td><b style="color:var(--text-primary)">${d.Name}</b></td>
                    <td style="color:var(--text-dim)">${d.Facility}</td>
                    <td><span class="stars">${'★'.repeat(d.Rating)}${'☆'.repeat(5 - d.Rating)}</span></td>
                    <td><span class="branch-pill">${d.Department}</span></td>
                    <td style="color:var(--text-dim)">${d.Comment}</td>
                </tr>
            `).join('');
        }

        pageDetail.textContent = `PAGE ${currentPage} / ${total}`;
        document.getElementById('prevBtn').disabled = (currentPage === 1);
        document.getElementById('nextBtn').disabled = (currentPage === total);
    }

    function renderBentoInsights(data, kpis) {
        const container = document.getElementById('insightFeed');
        let html = [];
        const cse = data.filter(d => d.Department === 'Computer Science & Engineering');

        if (cse.length > 0) {
            const cave = (cse.reduce((a, b) => a + b.Rating, 0) / cse.length).toFixed(1);
            const status = parseFloat(cave) >= parseFloat(kpis.avg) ? "OUTPERFORMING" : "UNDER";
            html.push(`<div class="insight-bento-card"><b>CSE BRANCH:</b> Currently <b>${status}</b> the campus average with a score of <b>${cave}</b>.</div>`);
        }

        if (parseFloat(kpis.avg) < 3.5) {
            html.push(`<div class="insight-bento-card" style="border-color:var(--neon-magenta)"><b>CRITICAL ALERT:</b> Overall campus vibe is dipping. Top concern found in <b>${kpis.worst}</b>.</div>`);
        }

        const highRes = data.filter(d => d.Rating >= 4).length;
        if (highRes > data.length * 0.5) {
            html.push(`<div class="insight-bento-card" style="border-color:var(--neon-gold)"><b>ELITE PERFORMANCE:</b> 50%+ of current feed shows high-tier student satisfaction.</div>`);
        }

        container.innerHTML = html.join('') || `<div class="insight-bento-card">NO CRITICAL TRENDS DETECTED.</div>`;
    }

    function startTime() {
        setInterval(() => {
            const now = new Date();
            timeEl.textContent = now.toLocaleTimeString();
        }, 1000);
    }
});
