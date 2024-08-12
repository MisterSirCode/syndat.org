const fs = require('fs');
const materials = require('./json/materials.json');
const revision = materials[0].revision;
let debug = false;
const synthesis = require('./json/synthesis.json');
let materialTemplate = fs.readFileSync('./materialTemplate.html', { encoding: 'utf-8', flag: 'r' });
let matHomeTemplate = fs.readFileSync('./matHomepageTemplate.html', { encoding: 'utf-8', flag: 'r' });

function completionStatus(mat) {
    let points = 0;
    if (mat.desc) points++;
    if (Object.keys(mat.chem_prop).length > 0) {
        if (mat.chem_prop.mohs_min > 0) points++;
        if (mat.chem_prop.grav_min > 0) points++;
    }
    if (mat.bypass_optic || Object.keys(mat.optic_prop).length > 0) {
        if (mat.optic_prop.opt) points += 4;
        else {
            if (mat.optic_prop.type) points++;
            if (mat.optic_prop.ref_min) points++;
            if (mat.optic_prop.bir_min || mat.optic_prop.type == "Isotropic") points++;
            if (mat.optic_prop.disp_min) points++;
        }
    }
    if (Object.keys(mat.cry_prop).length > 0) {
        if (mat.cry_prop.system) points++;
    }
    return points;
}

function generateTemplates() {
    materials.shift(); // Clear extra info sector from the working database
    let genlist = [];
    console.clear();
    console.log(`Generating ${materials.length} Material Templates`);
    for (let i = 0; i < materials.length; i++) {
        let mat = materials[i];
        let template = materialTemplate;

        // Create Truncated List

        let status = completionStatus(mat);
        genlist.push([
            mat.id,
            mat.label,
            status,
            mat.chem_prop.formula,
            mat.neutral ? mat.neutral.imgsrc ? mat.neutral.imgsrc : 0 : 0,
            mat.variants ? mat.variants[0] ? mat.variants[0].imgsrc ? mat.variants[0].imgsrc : 0 : 0 : 0
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
        fix('MATREF', 'Information about ' + mat.label);
        if (!chem.grav_min) delPair('Density', 'GRAV');
        if (!chem.mohs_min) delPair('Mohs Hardness', 'MOHS');
        if (!optic.type) delPair('Type', 'OPTYPE');
        if (!optic.ref_min) delPair('Refractive Index', 'REF');
        if (!optic.disp_min) delPair('Dispersion Factor', 'DISP');
        if (!optic.bir_min) delPair('Birefringence', 'BIREF');
        if (!optic.opt) fix('MISC', '');
        else {
            switch (optic.opt) {
                case 'opaque':
                    fix('MISC', 'Opaque in Visible Spectrum');
                    break;
                default: 
                    break;
            }
        }
        if (Object.keys(optic).length == 0)
            fix('<div class="pageRegionRight opticProps"><div class="pageSectionTitle">Optical Properties</div></div>', '');
        // if (!mat.bypass_optic) {
        //     fix('OPSIM', `
        //         <div class="pageRegionSeparator">
        //             <div class="pageSectionTitle">Optical Simulation</div>
        //         </div>
        //         <span class="pageArticle">
        //             These may not be fully accurate. Use them only for quick reference, not for scientific use.
        //             <br><br>
        //             <img src="../../content/materials/MATIMG.png" class="pageImage" width="256" height="256">
        //         </span>
        //     `);
        // } else fix('OPSIM', '');
        if (!cry.parent) delPair('Member of', 'PARENT');
        if (!cry.system) delPair('Crystal System', 'CRYSTM');
        if (mat.minID) { fix('TITLE</h1>', `TITLE <a href="https://mindat.org/min-MINID.html" class="mindatMicroLink"><img src="../../content/social/mindat_16x16.png" target="_blank" rel="noopener noreferrer" class="mindatMicroIcon"></a></h1>
        <h4 class="minSubTitle">IMA-Approved Mineral Species</h4>`) };
        if (mat.variants || mat.neutral) {
            let final = '';
            let src = mat.neutral.imgsrc;
            if (mat.neutral) {
                final += `
                <span class="specialtyGridItem variantItem">
                    <img class="specialtyGridImage"${src ? ` src="../../content/materials/${mat.label}/neut.jpg"` : ''}${src ? ` title="Photo Source: ${src}"` : ''}>
                    <div class="specialtyGridContent">
                    <div class="specialtyGridTitle mainGridTitle">(Undoped / Generic)</div>
                    <div class="specialtyGridTitle shortGridTitle">(Undoped)</div>
                    ${mat.neutral.color ? `<div class="specialtyGridDesc variantDesc">Color: ${mat.neutral.color}</div>` : ''}
                    ${mat.neutral.fluor ? `<div class="specialtyGridDesc variantDesc">Fluorescence: ${mat.neutral.fluor}</div>` : ''}
                    ${mat.neutral.usage ? `<div class="specialtyGridDesc variantDesc">Used for ${mat.neutral.usage}</div>` : ''}
                    </div>
                </span>`;
            }
            if (mat.variants) {
                if (mat.variants.length > 0)
                for (let j = 0; j < mat.variants.length; j++) {
                    let variant = mat.variants[j];
                    let src = variant.imgsrc;
                    let img = variant.imgovr ? variant.imgovr : variant.imgsrc ? `var${j}` : '';
                    let temp = `
                    <span class="specialtyGridItem variantItem">
                        <img class="specialtyGridImage"${src ?  ` src="../../content/materials/${mat.label}/${img}.jpg"` : ''}${src ? ` title="Photo Source: ${variant.imgsrc}"` : ''}>
                        <div class="specialtyGridContent">
                        ${variant.label ? `
                            <div class="specialtyGridTitle mainGridTitle">${variant.label}</div>
                            <div class="specialtyGridTitle shortGridTitle">${variant.shorthand || variant.label}</div>
                        ` : ''}
                        ${variant.color ? `<div class="specialtyGridDesc variantDesc">Color: ${variant.color}</div>` : ''}
                        ${variant.fluor ? `<div class="specialtyGridDesc variantDesc">Fluorescence: ${variant.fluor}</div>` : ''}
                        ${variant.cause ? `<div class="specialtyGridDesc variantDesc">Cause: ${variant.cause}</div>` : ''}
                        ${variant.effect ? `<div class="specialtyGridDesc variantDesc">Effect: ${variant.effect}</div>` : ''}
                        ${variant.usage ? `<div class="specialtyGridDesc variantDesc">Used for ${variant.usage}</div>` : ''}
                        </div>
                    </span>`;
                    final += temp;
                }
            }
            fix('VARTYPES', `
                <div class="pageRegionSeparator">
                    <div class="pageSectionTitle">Variants and Types</div>
                </div>
                <div class="pageSpecialtyGrid">
                    ${final}
                </div>
            `);
        } else fix('VARTYPES', '');

        // Smaller Replacements

        fix('TITLE', mat.label);
        if (mat.minID) fix('MINID', mat.minID);
        if (mat.aliases.length > 0) fix('ALIASES', `<span>Otherwise known by ${mat.aliases}</span><br><br>`);
        else fix('ALIASES', '');
        fix('FORMULA', chem.formula);
        fix('CHEM', chem.alt ? chem.chemical + '<br>alt. ' + chem.alt : chem.chemical);
        if (chem.grav_min == chem.grav_max) fix('GRAV', chem.grav_min + ' g/cm<sup>3</sup>');
        else fix('GRAV', `${chem.grav_min} - ${chem.grav_max} g/cm<sup>3</sup>`);
        if (chem.mohs_min == chem.mohs_max) fix('MOHS', chem.mohs_min);
        else fix('MOHS', `${chem.mohs_min} - ${chem.mohs_max}`);
        if (chem.neut_col) fix('NEUCOL', chem.neut_col);
        else fix('NEUCOL', 'Colorless')
        if (cry.parent) fix('PARENT', cry.parent);
        if (cry.system) fix('CRYSTM', cry.system);
        if (optic.type) fix('OPTYPE', optic.type);
        if (optic.ref_min) {
            if (Array.isArray(optic.ref_min)) {
                if (optic.ref_min.length == 3 && optic.ref_min[0] == optic.ref_max[0])
                    fix('REF', `n<sub>α</sub> = ${optic.ref_min[0]}<br>
                                n<sub>β</sub> = ${optic.ref_min[1]}<br>
                                n<sub>γ</sub> = ${optic.ref_min[2]}`);
                else if (optic.ref_min.length == 3)
                    fix('REF', `n<sub>α</sub> = ${optic.ref_min[0]} - ${optic.ref_max[0]}<br>
                                n<sub>β</sub> = ${optic.ref_min[1]} - ${optic.ref_max[1]}<br>
                                n<sub>γ</sub> = ${optic.ref_min[2]} - ${optic.ref_max[2]}`);
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
            let additional = '';
            if (m == 0) additional = ' firstChild';
            let method = methods[m];
            let data = synthesis[method];
            let temp = `
            <a class="specialtyGridItem${additional}" href="../../synthesis/${method}/">
                <img class="specialtyGridImage">
                <div class="specialtyGridContent">
                <div class="specialtyGridTitle mainGridTitle">${data.title}</div>
                <div class="specialtyGridTitle shortGridTitle">${data.shorthand || data.title}</div>
                <div class="specialtyGridDesc">${data.trunc}</div>
                </div>
            </a>`;
            tempList.push(temp);
        }
        fix('SYNLIST', tempList.join(''));

        // Image

        fix('MATIMG', mat.label.toLowerCase().replace(' ', ''));

        fix('REV', revision);
        if (!fs.existsSync(`../public/materials/${mat.label}/`))
            fs.mkdirSync(`../public/materials/${mat.label}/`);
        fs.writeFileSync(`../public/materials/${mat.label}/index.html`, template);
    }
    let tempList = [];
    for (let i = 0; i < genlist.length; i++) {
        const link = genlist[i];
        const status = link[2] >= 8 ? '' : (link[2] >= 6 ? ' statusYellow' : ' statusRed');
        // let temp = `
        // <div class="linkGridItem">
        //     <a href="${link[1]}/" class="linkGridLink${status}">${link[1]}${debug ? `<br>${Math.round(link[2] * 12.5)}%` : ''}</a>
        // </div>`;
        console.log(link[4]);
        let temp = `
        <a class="specialtyGridItem${status} gridExpander" href="${link[1]}/">
            <img class="specialtyGridImage"${link[4].length > 0 ? ` src="../content/materials/${link[1]}/neut.jpg"` : link[5].length > 0 ? ` src="../content/materials/${link[1]}/var0.jpg"` : ''}${variant.imgsrc ? ` title="Photo Source: ${variant.imgsrc}"` : ''}>
            <div class="specialtyGridContent">
            <div class="specialtyGridTitle mainGridTitle">${link[1]}</div>
            <div class="specialtyGridTitle shortGridTitle">${link[1]}</div>
            <div class="specialtyGridDesc floatDown">${link[3]}</div>
            </div>
        </a>`;
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