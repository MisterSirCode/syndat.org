document.addEventListener('DOMContentLoaded', () => siteLoad(), false);

async function siteLoad() {
    const listres = await fetch("generatedList.json").catch((err) => { console.error(`List Failed to Load with Error: ${err}`); FAILTOLOAD = true; });
    list = await listres.json();
    const mainList = document.querySelector('.mainList');
    list.forEach((item) => {
        let el = document.createElement('a');
        let le = document.createElement('li');
        el.href = 'xls/' + item[1];
        el.innerText = item[1];
        if (item[2] == 3)
            el.setAttribute('class', 'statusYellow');
        else if (item[2] <= 2)
            el.setAttribute('class', 'statusRed');
        le.appendChild(el);
        mainList.appendChild(le);
    });
}