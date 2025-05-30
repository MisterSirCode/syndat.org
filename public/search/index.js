const conf = document.querySelector('.pageSearchConfirm');
const input = document.querySelector('.pageSearchInput');
let data;
let loading = true;

async function load() {
    const res = await fetch("summary.json").catch((err) => { 
        console.error(`Info Failed to Load with Error: ${err}`); 
    });
    if (res.ok) {
        const info = await res.json();
        if (info.length > 0) {
            loading = false;
            input.setAttribute('placeholder', 'Search...');
            data = info;
        }
    } else input.setAttribute('placeholder', 'Search Load Failed. Contact Dev');
}

load();

const levDist = (s, t) => {
    if (!s.length) return t.length;
    if (!t.length) return s.length;
    const arr = [];
    for (let i = 0; i <= t.length; i++) {
        arr[i] = [i];
        for (let j = 1; j <= s.length; j++) {
            arr[i][j] = i === 0 ? j : Math.min(
                arr[i - 1][j] + 1,
                arr[i][j - 1] + 1,
                arr[i - 1][j - 1] + (s[j - 1] === t[i - 1] ? 0 : 1)
            );
        }
    }
    return arr[t.length][s.length];
};  

conf.addEventListener('click', async function(el) {
    if (loading) return;
    const rawtext = input.value.toLowerCase();
    if (rawtext.replace(/\s+/g, '').length < 1) return;
    const tokens = rawtext.split(' ');

    const rawTokens = input.value.split(' ');

    let matches = [];
    for (var i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const rawToken = rawTokens[i];
        for (var s = 0; s < data[0].length; s++) {
        
        }
    }
    let total = '';
    for (var i = 0; i < matches.length; i++) {
        let match = matches[i];
        let sel = match[0].split('.');
        let temp = `
        <div class="linkGridItem">
            <a href="${sel[0] == 'mat' ? `../materials/xls/${sel[1]}` :
                       sel[0] == 'syn' ? `../synthesis/methods/${sel[1]}` : sel[0]}" class="linkGridLink">${
                       sel[0] == 'mat' ? `Materials - ${sel[1]}` :
                       sel[0] == 'syn' ? `Synthesis - ${data[0][match[2]][1]}` : sel[0]}</a>
        </div>`;
        total += temp;
    }
    document.querySelector('.pageLinkGrid').innerHTML = total;
    console.log('Matches: ', matches);
});