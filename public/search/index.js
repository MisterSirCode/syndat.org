const conf = document.querySelector('.pageSearchConfirm');
const input = document.querySelector('.pageSearchInput');
const loading = true;

async function load() {
    const res = await fetch("summary.json").catch((err) => { console.error(`Info Failed to Load with Error: ${err}`); });
    const info = await res.json();
}

load();

conf.addEventListener('click', async function(el) {
    if (loading) return;
    const rawtext = input.value.toLowerCase();
    const tokens = rawtext.split(' ');
    for (var i = 0; i < tokens.length; i++) {

    }
});