let hasInitialized = false;
let analyticsEnabled = false;

const API_BASE = 'https://sethgran.my.id';

const countryNames = {
    "AF": "Afghanistan", "AL": "Albania", "DZ": "Algeria", "AS": "American Samoa", "AD": "Andorra", "AO": "Angola", "AI": "Anguilla", "AQ": "Antarctica", "AG": "Antigua and Barbuda", "AR": "Argentina", "AM": "Armenia", "AW": "Aruba", "AU": "Australia", "AT": "Austria", "AZ": "Azerbaijan", "BS": "Bahamas", "BH": "Bahrain", "BD": "Bangladesh", "BB": "Barbados", "BY": "Belarus", "BE": "Belgium", "BZ": "Belize", "BJ": "Benin", "BM": "Bermuda", "BT": "Bhutan", "BO": "Bolivia", "BA": "Bosnia and Herzegovina", "BW": "Botswana", "BR": "Brazil", "IO": "British Indian Ocean Territory", "VG": "British Virgin Islands", "BN": "Brunei", "BG": "Bulgaria", "BF": "Burkina Faso", "BI": "Burundi", "KH": "Cambodia", "CM": "Cameroon", "CA": "Canada", "CV": "Cape Verde", "KY": "Cayman Islands", "CF": "Central African Republic", "TD": "Chad", "CL": "Chile", "CN": "China", "CX": "Christmas Island", "CC": "Cocos Islands", "CO": "Colombia", "KM": "Comoros", "CK": "Cook Islands", "CR": "Costa Rica", "HR": "Croatia", "CU": "Cuba", "CW": "Curacao", "CY": "Cyprus", "CZ": "Czech Republic", "CD": "Democratic Republic of the Congo", "DK": "Denmark", "DJ": "Djibouti", "DM": "Dominica", "DO": "Dominican Republic", "TL": "East Timor", "EC": "Ecuador", "EG": "Egypt", "SV": "El Salvador", "GQ": "Equatorial Guinea", "ER": "Eritrea", "EE": "Estonia", "ET": "Ethiopia", "FK": "Falkland Islands", "FO": "Faroe Islands", "FJ": "Fiji", "FI": "Finland", "FR": "France", "PF": "French Polynesia", "GA": "Gabon", "GM": "Gambia", "GE": "Georgia", "DE": "Germany", "GH": "Ghana", "GI": "Gibraltar", "GR": "Greece", "GL": "Greenland", "GD": "Grenada", "GU": "Guam", "GT": "Guatemala", "GG": "Guernsey", "GN": "Guinea", "GW": "Guinea-Bissau", "GY": "Guyana", "HT": "Haiti", "HN": "Honduras", "HK": "Hong Kong", "HU": "Hungary", "IS": "Iceland", "IN": "India", "ID": "Indonesia", "IR": "Iran", "IQ": "Iraq", "IE": "Ireland", "IM": "Isle of Man", "IL": "Israel", "IT": "Italy", "CI": "Ivory Coast", "JM": "Jamaica", "JP": "Japan", "JE": "Jersey", "JO": "Jordan", "KZ": "Kazakhstan", "KE": "Kenya", "KI": "Kiribati", "XK": "Kosovo", "KW": "Kuwait", "KG": "Kyrgyzstan", "LA": "Laos", "LV": "Latvia", "LB": "Lebanon", "LS": "Lesotho", "LR": "Liberia", "LY": "Libya", "LI": "Liechtenstein", "LT": "Lithuania", "LU": "Luxembourg", "MO": "Macau", "MK": "Macedonia", "MG": "Madagascar", "MW": "Malawi", "MY": "Malaysia", "MV": "Maldives", "ML": "Mali", "MT": "Malta", "MH": "Marshall Islands", "MR": "Mauritania", "MU": "Mauritius", "YT": "Mayotte", "MX": "Mexico", "FM": "Micronesia", "MD": "Moldova", "MC": "Monaco", "MN": "Mongolia", "ME": "Montenegro", "MS": "Montserrat", "MA": "Morocco", "MZ": "Mozambique", "MM": "Myanmar", "NA": "Namibia", "NR": "Nauru", "NP": "Nepal", "NL": "Netherlands", "AN": "Netherlands Antilles", "NC": "New Caledonia", "NZ": "New Zealand", "NI": "Nicaragua", "NE": "Niger", "NG": "Nigeria", "NU": "Niue", "KP": "North Korea", "MP": "Northern Mariana Islands", "NO": "Norway", "OM": "Oman", "PK": "Pakistan", "PW": "Palau", "PS": "Palestine", "PA": "Panama", "PG": "Papua New Guinea", "PY": "Paraguay", "PE": "Peru", "PH": "Philippines", "PN": "Pitcairn", "PL": "Poland", "PT": "Portugal", "PR": "Puerto Rico", "QA": "Qatar", "CG": "Republic of the Congo", "RE": "Reunion", "RO": "Romania", "RU": "Russia", "RW": "Rwanda", "BL": "Saint Barthelemy", "SH": "Saint Helena", "KN": "Saint Kitts and Nevis", "LC": "Saint Lucia", "MF": "Saint Martin", "PM": "Saint Pierre and Miquelon", "VC": "Saint Vincent and the Grenadines", "WS": "Samoa", "SM": "San Marino", "ST": "Sao Tome and Principe", "SA": "Saudi Arabia", "SN": "Senegal", "RS": "Serbia", "SC": "Seychelles", "SL": "Sierra Leone", "SG": "Singapore", "SX": "Sint Maarten", "SK": "Slovakia", "SI": "Slovenia", "SB": "Solomon Islands", "SO": "Somalia", "ZA": "South Africa", "KR": "South Korea", "SS": "South Sudan", "ES": "Spain", "LK": "Sri Lanka", "SD": "Sudan", "SR": "Suriname", "SJ": "Svalbard and Jan Mayen", "SZ": "Swaziland", "SE": "Sweden", "CH": "Switzerland", "SY": "Syria", "TW": "Taiwan", "TJ": "Tajikistan", "TZ": "Tanzania", "TH": "Thailand", "TG": "Togo", "TK": "Tokelau", "TO": "Tonga", "TT": "Trinidad and Tobago", "TN": "Tunisia", "TR": "Turkey", "TM": "Turkmenistan", "TC": "Turks and Caicos Islands", "TV": "Tuvalu", "VI": "U.S. Virgin Islands", "UG": "Uganda", "UA": "Ukraine", "AE": "United Arab Emirates", "GB": "United Kingdom", "US": "United States", "UY": "Uruguay", "UZ": "Uzbekistan", "VU": "Vanuatu", "VA": "Vatican", "VE": "Venezuela", "VN": "Vietnam", "WF": "Wallis and Futuna", "EH": "Western Sahara", "YE": "Yemen", "ZM": "Zambia", "ZW": "Zimbabwe",
    "UK": "United Kingdom", "EU": "Europe"
};

export default function init() {
    document.addEventListener('consentUpdated', handleConsentUpdate);
    setupDropdownLogic();
}

function setupDropdownLogic() {
    const container = document.getElementById('view-stats-container');
    const details = document.getElementById('view-details');
    
    if (!container || !details) return;

    container.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = details.classList.contains('opacity-100');
        if (isExpanded) {
            closeDropdown(details);
        } else {
            openDropdown(details);
        }
    });

    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
            closeDropdown(details);
        }
    });

    container.addEventListener('mouseenter', () => {
        if (window.innerWidth >= 768) openDropdown(details);
    });

    container.addEventListener('mouseleave', () => {
        if (window.innerWidth >= 768) closeDropdown(details);
    });
}

function openDropdown(el) {
    el.classList.add('opacity-100', 'pointer-events-auto', 'translate-y-0');
    el.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-[-10px]');
}

function closeDropdown(el) {
    el.classList.remove('opacity-100', 'pointer-events-auto', 'translate-y-0');
    el.classList.add('opacity-0', 'pointer-events-none', 'translate-y-[-10px]');
}

function handleConsentUpdate(event) {
    const prefs = event.detail;

    if (prefs && prefs.analytics) {
        analyticsEnabled = true;
        if (!hasInitialized) {
            hasInitialized = true;
            trackEvent('page');
        } else {
            fetchViewCount();
        }
    } else {
        analyticsEnabled = false;
        updateViewDisplay('DISABLED');
    }
}

export async function trackEvent(type = 'page') {
    if (!analyticsEnabled) return;

    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
    const dailyCookie = `portfolio_daily_${type}_${today}`;
    const allTimeCookie = `portfolio_visited_${type}`;

    const hasDaily = document.cookie.includes(`${dailyCookie}=true`);
    const hasAllTime = document.cookie.includes(`${allTimeCookie}=true`);

    let isNewVisitor = false;
    let isReturningVisitor = false;
    let isDailyUnique = false;

    if (!hasAllTime) {
        isNewVisitor = true;
        isDailyUnique = true;
        
        const tenYears = new Date();
        tenYears.setFullYear(tenYears.getFullYear() + 10);
        document.cookie = `${allTimeCookie}=true; expires=${tenYears.toUTCString()}; path=/; SameSite=Strict`;
    } else if (!hasDaily) {
        isReturningVisitor = true;
        isDailyUnique = true;
    }

    if (!hasDaily) {
        const now = new Date();
        const tomorrow = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
        tomorrow.setHours(24, 0, 0, 0);
        document.cookie = `${dailyCookie}=true; expires=${tomorrow.toUTCString()}; path=/; SameSite=Strict`;
    }

    try {
        const response = await fetch(`${API_BASE}/api/views/increment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, isNewVisitor, isReturningVisitor, isDailyUnique })
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        if (type === 'page') {
            updateViewDisplay(data);
        }
    } catch (error) {
        console.error(`[Analytics] API Error for ${type}:`, error);
        if (type === 'page') updateViewDisplay('API Error');
    }
}

async function fetchViewCount() {
    try {
        const response = await fetch(`${API_BASE}/api/views`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        if (data && typeof data.allTimeVisitors === 'number') {
            updateViewDisplay(data);
        }
    } catch (error) {
        console.error('[Analytics] API Error:', error);
        updateViewDisplay('API Error');
    }
}

function getCountryName(code) {
    if (!code || code === 'N/A' || code === 'Unknown') return code;
    const cleanCode = String(code).trim().toUpperCase();
    return countryNames[cleanCode] || code;
}

function formatRegionNameToday(name) {
    if (name.length > 11) {
        return `<div class="overflow-hidden w-[75px] marquee-mask ml-auto shrink-0 flex items-center">
                    <div class="animate-marquee whitespace-nowrap text-accent font-medium">
                        ${name} &nbsp;&nbsp;&nbsp; ${name} &nbsp;&nbsp;&nbsp; ${name} &nbsp;&nbsp;&nbsp;
                    </div>
                </div>`;
    }
    return `<span class="text-accent font-medium text-right truncate ml-auto max-w-[75px]">${name}</span>`;
}

function formatRegionNameAllTime(name, index) {
    const fullName = `#${index} ${name}`;
    if (fullName.length > 15) {
        return `<div class="overflow-hidden flex-1 marquee-mask mr-2 shrink-0 flex items-center">
                    <div class="animate-marquee whitespace-nowrap text-text-muted">
                        ${fullName} &nbsp;&nbsp;&nbsp; ${fullName} &nbsp;&nbsp;&nbsp; ${fullName} &nbsp;&nbsp;&nbsp;
                    </div>
                </div>`;
    }
    return `<span class="text-text-muted truncate mr-2 flex-1">${fullName}</span>`;
}

function updateViewDisplay(data) {
    const displayElement = document.getElementById('view-count');
    const detailsElement = document.getElementById('view-details');
    
    if (!displayElement) return;

    if (data === 'DISABLED' || data === 'API Error') {
        displayElement.textContent = `Views: ${data}`;
        displayElement.classList.add('text-red-400', 'border-red-400/30', 'bg-red-400/10');
        displayElement.classList.remove('border-secondary/30', 'bg-surface/50');
        if (detailsElement) {
            detailsElement.innerHTML = `<div class="text-xs text-red-400 text-center">${data === 'DISABLED' ? 'Analytics Disabled' : 'Failed to load data'}</div>`;
        }
    } else {
        const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
        const dailyStats = data.daily[today] || { visitors: 0, new: 0, returning: 0, raw: 0, countries: {} };
        
        // Calculate top country today
        let topCountryToday = 'N/A';
        if (dailyStats.countries && Object.keys(dailyStats.countries).length > 0) {
            const topCode = Object.entries(dailyStats.countries).sort((a, b) => b[1] - a[1])[0][0];
            topCountryToday = getCountryName(topCode);
        }

        // Calculate top 5 regions all-time
        let topRegionsHtml = '<div class="text-xs text-text-muted italic">Not enough data</div>';
        if (data.countries && Object.keys(data.countries).length > 0) {
            const sortedCountries = Object.entries(data.countries).sort((a, b) => b[1] - a[1]);
            const top5 = sortedCountries.slice(0, 5);
            
            topRegionsHtml = top5.map((item, index) => 
                `<div class="flex justify-between text-xs items-center h-5 w-full">
                    ${formatRegionNameAllTime(getCountryName(item[0]), index + 1)} 
                    <span class="text-accent font-medium shrink-0 text-right">${item[1].toLocaleString()}</span>
                </div>`
            ).join('');
        }
        
        displayElement.textContent = `Views: ${data.allTimeVisitors.toLocaleString()}`;
        displayElement.classList.remove('text-red-400', 'border-red-400/30', 'bg-red-400/10');
        displayElement.classList.add('border-secondary/30', 'bg-surface/50');

        if (detailsElement) {
            detailsElement.innerHTML = `
                <div class="text-xs font-bold text-text-primary border-b border-secondary/30 pb-2 mb-1">Page Traffic Today</div>
                <div class="flex justify-between text-xs"><span class="text-text-muted">Visitors Today:</span> <span class="text-accent font-medium">${dailyStats.visitors.toLocaleString()}</span></div>
                <div class="flex justify-between text-xs"><span class="text-text-muted">New Today:</span> <span class="text-accent font-medium">${dailyStats.new.toLocaleString()}</span></div>
                <div class="flex justify-between text-xs"><span class="text-text-muted">Returning Today:</span> <span class="text-accent font-medium">${dailyStats.returning.toLocaleString()}</span></div>
                <div class="flex justify-between text-xs items-center h-5">
                    <span class="text-text-muted shrink-0">Top Region Today:</span> 
                    ${formatRegionNameToday(topCountryToday)}
                </div>
                
                <div class="text-xs font-bold text-text-primary border-b border-secondary/30 pb-2 mt-3 mb-1">All-Time Stats</div>
                <div class="flex justify-between text-xs"><span class="text-text-muted">Total Visitors:</span> <span class="text-primary font-medium">${data.allTimeVisitors.toLocaleString()}</span></div>
                <div class="flex justify-between text-xs"><span class="text-text-muted">Total Returning:</span> <span class="text-primary font-medium">${data.allTimeReturning.toLocaleString()}</span></div>
                <div class="flex justify-between text-xs"><span class="text-text-muted">Total Page Loads:</span> <span class="text-primary font-medium">${data.totalRaw.toLocaleString()}</span></div>
                
                <div class="text-xs font-bold text-text-primary border-b border-secondary/30 pb-2 mt-3 mb-1">Top Regions (All-Time)</div>
                ${topRegionsHtml}
            `;
        }
    }
}