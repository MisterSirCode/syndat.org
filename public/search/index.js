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
            console.log(data);
        }
    } else input.setAttribute('placeholder', 'Search Load Failed. Contact Dev');
}

load();

conf.addEventListener('click', async function(el) {
    if (loading) return;
    const rawtext = input.value.toLowerCase();
    if (rawtext.replace(/\s+/g, '').length < 1) return;
    const tokens = rawtext.split(' ');
    let matches = [];
    for (var i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        for (var s = 0; s < data[0].length; s++) {
            const syn = data[0][s];
            if (syn[1].toLowerCase().includes(token)) matches.push([`syn.${syn[0]}.name`, syn[1]]);
            if (syn[2].length > 0) {
                let filteredAliases = syn[2].filter(str => str.toLowerCase().includes(token));
                if (filteredAliases.length > 0) matches.push([`syn.${syn[0]}.aliases`, filteredAliases]);
            }
            if (syn[3].toLowerCase().includes(token)) matches.push([`syn.${syn[0]}.disc`, syn[3]]);
        }
    }
    console.log('Matches: ', matches);
});