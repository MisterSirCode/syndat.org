function isNumeric(str) {
    if (typeof str != "string") return false; 
    return !isNaN(str) && !isNaN(parseFloat(str));
}

let matdb;
let syndb;
let materials;
let synthesis;

async function loadSite() {
    const params = new URL(document.location.toString()).searchParams;
    const el = document.querySelector(".pageContent");
    let FAILTOLOAD = false;

    // Begin Fetch Catcher (The Fatcher)

    const infores = await fetch("../data/info.json").catch((err) => { console.error(`Info Failed to Load with Error: ${err}`); FAILTOLOAD = true; });
    if (FAILTOLOAD) return;
    const info = await infores.json();

    // Break in Fatcher to check if database is downloaded (save bandwidth)

    let needsUpdate = false;

    if (localStorage.getItem('matdb')) {
        materials = JSON.parse(localStorage.getItem('matdb'));
        let stored = materials[0].version;
        if (stored != info.mat_version) needsUpdate = true;
    } else needsUpdate = true;

    // TURN OFF ON DISTRIBUTION TO SAVE BANDWIDTH
    //needsUpdate = true;

    if (needsUpdate) {
        const matres = await fetch("../data/materials.json").catch((err) => { console.error(`Info Failed to Load with Error: ${err}`); FAILTOLOAD = true; });
        if (FAILTOLOAD) return;
        materials = await matres.json();
        localStorage.setItem('mat_version', materials[0].version);
        localStorage.setItem('matdb', JSON.stringify(materials));
    }

    // Split off to Solo Material or Main Page

    if (params.size >= 1) {
        // Continue Fatcher in Solo Page

        const synres = await fetch("../data/synthesis.json").catch((err) => { console.error(`Info Failed to Load with Error: ${err}`); FAILTOLOAD = true; });
        if (FAILTOLOAD) return;
        synthesis = await synres.json();
        const tempres = await fetch("tempmat.html").catch((err) => { console.error(`Info Failed to Load with Error: ${err}`); FAILTOLOAD = true; });
        if (FAILTOLOAD) return;
        let template = await tempres.text();

        // Begin Page Construction 

        const id = Array.from(params.keys())[0];
        el.innerHTML = '';
        let mat;
        document.querySelector("a.target").setAttribute('href', '../materials/');
        materials.shift(); // Clear extra info sector from the working database
        if (isNumeric(id)) {
            if (materials[id].id)
                mat = materials[id];
        } else {
            materials.forEach(element => {
                if (element.label.toLowerCase() == id.toLowerCase()) mat = element;
                // TODO -> Add "search" support for partial keywords / matches
            });
        }
        if (mat.id) {
            let chem = mat.chem_prop;
            let optic = mat.optic_prop;
            let cry = mat.cry_prop;
            const fix = (tag, value) => { template = template.replace(tag, value); }
            fix('TITLE', mat.label);
            const delPair = (locator) => { 
                let tmp = document.querySelector(locator);
                tmp.nextElementSibling.remove();
                tmp.remove();
            };
            const del = (locator) => { document.querySelector(locator).remove(); }

            if (mat.minID) fix('MINID', mat.minID);

            if (mat.aliases.length > 0) fix('ALIAS', mat.aliases);

            fix('FORMULA', chem.formula);
            fix('CHEM', chem.chemical);

            if (!chem.grav_min) fix('GRAV', 'Missing Information')
            if (chem.grav_min == chem.grav_max) fix('GRAV', chem.grav_min);
            else fix('GRAV', `${chem.grav_min} - ${chem.grav_max}`);

            if (chem.mohs_min == chem.mohs_max) fix('MOHS', chem.mohs_min);
            else fix('MOHS', `${chem.mohs_min} - ${chem.mohs_max}`);

            if (cry.parent) fix('PARENT', cry.parent);
            if (cry.system) fix('CRYSTM', cry.system);

            if (optic.type) fix('OPTYPE', optic.type);

            if (optic.ref_min) {
                if (Array.isArray(optic.ref_min)) {
                    if (optic.ref_min.length == 2 && optic.ref_min[0] == optic.ref_max[0])
                        fix('REF', `n<sub>ω</sub> = ${optic.ref_min[0]}<br>
                                    n<sub>ε</sub> = ${optic.ref_min[1]}`);
                    else if (optic.ref_min.length == 2)
                        fix('REF', `n<sub>ω</sub> = ${optic.ref_min[0]} - ${optic.ref_max[0]}<br>
                                    n<sub>ε</sub> = ${optic.ref_min[1]} - ${optic.ref_max[1]}`);
                } else {
                    if (optic.ref_min == optic.ref_max) fix('REF', optic.ref_min);
                    else fix('REF', `${optic.ref_min} - ${optic.ref_max}`);
                }
            }

            if (optic.disp_min) {
                if (optic.disp_min == optic.disp_max) fix('DISP', optic.disp_min);
                else fix('DISP', `${optic.disp_min} - ${optic.disp_max}`);
            }

            if (optic.bir_min) {
                if (optic.bir_min == optic.bir_max) fix('BIREF', 'δ = ' + optic.bir_min);
                else fix('BIREF', `δ = ${optic.bir_min} - ${optic.bir_max}`);
            }

            el.innerHTML = template;

            if (mat.aliases.length == 0) delPair('.aliases');
            if (!optic.type) delPair('.optype');
            if (!optic.ref_min) delPair('.refractive');
            if (!optic.disp_min) delPair('.dispersion');
            if (!optic.bir_min) delPair('.birefringence');
            if (Object.keys(optic).length == 0) {
                del('.opticProps');
                document.querySelector('.cryProps').setAttribute('class', 'pageRegionRight');
            }
            if (!cry.parent) delPair('.parent');
            if (!cry.system) delPair('.system');
            if (Object.keys(cry).length == 0) del('.cryProps');
            if (!mat.minID) { del('.minSubTitle'); del('.mindatMicroLink'); };
        }
    } else {
        const tempres = await fetch("tempmats.html").catch((err) => { console.error(`Info Failed to Load with Error: ${err}`); FAILTOLOAD = true; });
        if (FAILTOLOAD) return;
        let template = await tempres.text();
        
        el.innerHTML = '';  
        el.innerHTML = template;

        let mainList = document.querySelector('.mainList');

        materials.shift();

        materials.forEach((mat) => {
            let el = document.createElement('a');
            let le = document.createElement('li');
            el.href = '?' + mat.label;
            el.innerText = mat.label;
            le.appendChild(el);
            mainList.appendChild(le);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => loadSite(), false);