const conf = document.querySelector('.pageSearchConfirm');
const input = document.querySelector('.pageSearchInput');

conf.addEventListener('click', (el) => {
    const rawtext = input.value.toLowerCase();
    const tokens = rawtext.split(' ');
    for (var i = 0; i < tokens.length; i++) {
        
    }
});