const fs = require('fs');
const materials = require('./json/materials.json');
const revision = materials[0].revision;
const synthesis = require('./json/synthesis.json');
let materialTemplate = fs.readFileSync('./materialTemplate.html', { encoding: 'utf-8', flag: 'r' });
let matHomeTemplate = fs.readFileSync('./matHomepageTemplate.html', { encoding: 'utf-8', flag: 'r' });

function completionStatus(mat) {
    let points = 0;
    if (Object.keys(mat.chem_prop).length > 0) points++;
    if (Object.keys(mat.optic_prop).length > 0 || mat.bypass_optic) points++;
    if (Object.keys(mat.cry_prop).length > 0) points++;
    if (mat.desc) points++;
    return points;
}

function generateTemplates() {
    materials.shift(); // Clear extra info sector from the working database
    let genlist = [];
    for (let i = 0; i < materials.length; i++) {
        console.clear();
        console.log(`Finishing Template ${i + 1} / ${materials.length}`);
        let mat = materials[i];
        let template = materialTemplate;

        // Create Truncated List

        let status = completionStatus(mat);
        genlist.push([
            mat.id,
            mat.label,
            status
        ]);

        // Begin Template Construction

        let chem = mat.chem_prop;
        let optic = mat.optic_prop;
        let cry = mat.cry_prop;

        const fix = (tag, value) => { template = template.replace(tag, value); }
        const delPair = (tag, repl) => {
            template = template.replace(`<div class="pageSectionItem">${tag}</div><div class="pageSectionValue">${repl}</div>`, '');
        }

        // Adjust Template As Needed

        //if (mat.aliases.length == 0) delPair('.aliases');
        fix('MATREF', 'Information about ' + mat.label)
        if (!optic.type) delPair('Type:', 'OPTYPE');
        if (!optic.ref_min) delPair('Refractive Index:', 'REF');
        if (!optic.disp_min) delPair('Dispersion Factor:', 'DISP');
        if (!optic.bir_min) delPair('Birefringence:', 'BIREF');
        if (Object.keys(optic).length == 0)
            fix('<div class="pageRegionRight opticProps"><div class="pageSectionTitle">Optical Properties:</div></div>', '');
        if (!cry.parent) delPair('Member of:', 'PARENT');
        if (!cry.system) delPair('Crystal System:', 'CRYSTM');
        if (mat.minID) { fix('TITLE</h1>', `TITLE <a href="https://mindat.org/min-MINID.html" class="mindatMicroLink"><img src="../../../content/social/mindat_16x16.png" target="_blank" rel="noopener noreferrer" class="mindatMicroIcon"></a></h1>
        <h4 class="minSubTitle">IMA-Approved Mineral Species</h4>`) };

        // Smaller Replacements

        fix('TITLE', mat.label);
        if (mat.minID) fix('MINID', mat.minID);
        if (mat.aliases.length > 0) fix('ALIASES', `<span>Material Varieties or Aliases: ${mat.aliases}</span><br><br>`);
        else fix('ALIASES', '');
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
                if (optic.ref_min == optic.ref_max) fix('REF', `n = ${optic.ref_min}`);
                else fix('REF', `n = ${optic.ref_min} - ${optic.ref_max}`);
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

        // Write Article

        if (mat.desc) fix('ARTICLE', mat.desc);
        else fix('ARTICLE', 'Not much is known about this material besides synthesis');

        // Add Production Methods

        let methods = mat.synthesis;
        let tempList = [];
        for (var m = 0; m < methods.length; m++) {
            let method = methods[m];
            let data = synthesis[method];
            let temp = `
            <a class="specialtyGridItem" href="../../../synthesis/methods/${method}/">
                <img class="specialtyGridImage">
                <div class="specialtyGridContent">
                <div class="specialtyGridTitle">${data.title}</div>
                <div class="specialtyGridDesc">${data.trunc}</div>
                </div>
            </a>`;
            tempList.push(temp);
        }

        fix('SYNLIST', tempList.join(''));

        fix('REV', revision);

        console.log('Writing Template...');
        if (!fs.existsSync(`../public/materials/xls/${mat.label}/`))
            fs.mkdirSync(`../public/materials/xls/${mat.label}/`);
        fs.writeFileSync(`../public/materials/xls/${mat.label}/index.html`, template);
    }
    let tempList = [];
    for (let i = 0; i < genlist.length; i++) {
        const link = genlist[i];
        const status = link[2] > 3 ? ' statusGreen' : (link[2] == 3 ? ' statusYellow' : ' statusRed');
        let temp = `
        <div class="linkGridItem">
            <a href="xls/${link[1]}/" class="linkGridLink${status}">${link[1]}</a>
        </div>`;
        tempList.push(temp);
    }
    matHomeTemplate = matHomeTemplate.replace('REV', revision);
    matHomeTemplate = matHomeTemplate.replace('MATLIST', tempList.join(''));
    console.log('Finished');
    console.log('Writing Material Index File...');
    fs.writeFileSync('../public/materials/index.html', matHomeTemplate);
    console.log('Finished');
}

generateTemplates();