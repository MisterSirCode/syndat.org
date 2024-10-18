const fs = require('fs');
const materials = require('./json/materials.json');
const revision = materials[0].revision;
let debug = false;
const synthesis = require('./json/synthesis.json');
let materialTemplate = fs.readFileSync('./materialTemplate.html', { encoding: 'utf-8', flag: 'r' });
let matHomeTemplate = fs.readFileSync('./matHomepageTemplate.html', { encoding: 'utf-8', flag: 'r' });

// Used for formatting formulas.
function getFormulaHTML(formula) {
    let count = Math.floor((formula.match(/\_/g) || []).length / 2);
    let curFormula = formula;
    for (var i = 0; i < count; i++)
        curFormula = curFormula.replace("_", "<sub>")
            .replace("_", "</sub>");
    return curFormula;
}

// Used for grading links
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
            if (mat.optic_prop.ref_min == "?") points--;
            if (mat.optic_prop.bir_min || mat.optic_prop.type == "Isotropic") points++;
            if (mat.optic_prop.bir_min == "?" && mat.optic_prop.type != "Isotropic") points--;
            if (mat.optic_prop.disp_min) points++;
            if (mat.optic_prop.disp_min == "?") points--;
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
        let linker = mat.label.toLowerCase().replaceAll(' ', '-');
        let template = materialTemplate;

        // Create Truncated List

        let timg, tsrc;
        let needsfurthercheck = true;
        if (mat.neutral) {
            if (mat.neutral.imgsrc) {
                timg = 'neut';
                tsrc = mat.neutral.imgsrc;
                needsfurthercheck = false;
            }
        }
        if (mat.variants && needsfurthercheck) {
            if (mat.variants[0].imgsrc) {
                timg = 'var0';
                tsrc = mat.variants[0].imgsrc;
                needsfurthercheck = false;
            }
        }
        if (needsfurthercheck) {
            timg = '';
            tsrc = '';
        }

        let status = completionStatus(mat);
        genlist.push([
            mat.id,
            mat.label,
            status,
            mat.chem_prop.element ? 
                `Element ${mat.chem_prop.element[0]}<br>${mat.chem_prop.element[1]}` : 
                getFormulaHTML(mat.chem_prop.formula),
            timg,
            tsrc
        ]);

        // Begin Template Construction

        let chem = mat.chem_prop;
        let optic = mat.optic_prop;
        let cry = mat.cry_prop;
        const fix = (tag, value) => { template = template.replace(tag, value); }
        const delPair = (tag, repl) => {
            template = template.replace(`<div class="pageSectionItem">${tag}</div><div class="pageSectionValue">${repl}</div>`, '');
        }

        // Cannot use local URLs in meta tags. Only use Syndat's URL here.

        const link = genlist[i];
        const img = link[4] ? `https://syndat.org/content/materials/${link[1]}/${link[4]}.jpg` : 'https://syndat.org/content/materials/missing/missing.png';
        fix('OGIMG', img);

        // Adjust Template As Needed

        fix('MATREF', 'Information about ' + mat.label);
        if (mat.aliases.length > 0) fix('ALIASES', `<span>Otherwise known by ${mat.aliases}</span><br><br>`);
        else fix('ALIASES', '');
        fix('TITLE', mat.label);
        if (mat.desc) fix('ARTICLE', mat.desc);
        else fix('ARTICLE', 'This material is awaiting an article to be written...');
        fix('REV', revision);

        // Physical and Chemical Data

        if (chem.element) {
            fix('CHEM', `Element ${chem.element[0]}<br><br>${chem.element[1]} - ${chem.element[2]}${chem.alt ? '<br>alt. ' + chem.alt : ''}`);
            fix('ATMW', `${chem.element[3]} u`);
        } else {
            delPair('Atomic Weight', 'ATMW');
            fix('CHEM', `${getFormulaHTML(chem.formula)}<br><br>${chem.alt ? chem.chemical + '<br>alt. ' + chem.alt : chem.chemical}`);
        }
        if (!chem.grav_min) delPair('Density', 'GRAV');
        else if (chem.grav_min == "?") fix('GRAV', '?');
        else if (chem.grav_min == chem.grav_max) fix('GRAV', chem.grav_min + ' g/cm<sup>3</sup>');
        else fix('GRAV', `${chem.grav_min} - ${chem.grav_max} g/cm<sup>3</sup>`);
        if (!chem.mohs_min) delPair('Mohs Hardness', 'MOHS');
        else if (chem.mohs_min == chem.mohs_max) fix('MOHS', chem.mohs_min);
        else fix('MOHS', `${chem.mohs_min} - ${chem.mohs_max}`);

        // Melting Point / Decomposition Point

        if (!chem.melt_pnt && !chem.decp_pnt) delPair('Melting Point', 'MLTPNT');
        else if (chem.melt_pnt || chem.decp_pnt) // Do Fahrenheit math on the fly, only store C in the database
            fix('MLTPNT', `${chem.melt_pnt || chem.decp_pnt} °C (${Math.round((chem.melt_pnt || chem.decp_pnt) * (9 / 5) + 32)} °F)`);
        if (chem.decp_pnt) fix('Melting Point', 'Decomposition Point');

        // Optical and Crystal Data

        if (!optic.type) delPair('Type', 'OPTYPE');
        else fix('OPTYPE', optic.type);
        if (!optic.ref_min) delPair('Refractive Index', 'REF');
        else {
            if (optic.ref_min == "?") fix('REF', '?');
            else {
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
        }
        if (!optic.disp_min) delPair('Dispersion Factor', 'DISP');
        else {
            if (optic.disp_min == optic.disp_max) fix('DISP', optic.disp_min);
            else fix('DISP', `${optic.disp_min} - ${optic.disp_max}`);
        }
        if (!optic.bir_min) delPair('Birefringence', 'BIREF');
        else {
            if (optic.bir_min == "?") fix('BIREF', '?');
            if (optic.bir_min == optic.bir_max) fix('BIREF', 'δ = ' + optic.bir_min);
            else fix('BIREF', `δ = ${optic.bir_min} - ${optic.bir_max}`);
        }
        if (!optic.opt) fix('MISC', '');
        else {
            if (optic.opt == 'opaque') fix('MISC', '<div class="pageSectionItem">Opaque in Visible Spectrum</div><div class="pageSectionValue"></div>');
        }
        if (Object.keys(optic).length == 0) fix('<div class="pageRegionRight opticProps"><div class="pageSectionTitle">Optical Properties</div></div>', '');
        if (!cry.system) delPair('Crystal System', 'CRYSTM');
        if (cry.system) fix('CRYSTM', cry.system);

        // Run only for items with a mineral counterpart

        if (!cry.parent) delPair('Member of', 'PARENT');
        if (cry.parent) fix('PARENT', cry.parent);
        if (mat.minID) { 
            fix('MINID', mat.minID);
            fix(`${mat.label}</h1>`, `${mat.label} <a href="https://mindat.org/min-MINID.html" class="mindatMicroLink"><img src="../../content/social/mindat_16x16.png" target="_blank" rel="noopener noreferrer" class="mindatMicroIcon"></a></h1>`);
            fix('SUBTITLE', `IMA-Approved Mineral Species${chem.element ? "<br><br>Chemical Element" : ""}`);
        } else {
            fix('SUBTITLE', chem.element ? "Chemical Element" : "");
        }

        // "Custom" Properties

        if (mat.add_prop) {
            fix('ADDPROPSTITLE', '<br><div class="pageSectionTitle">Additional Properties</div>');
            let htmlList = '';
            for (let j = 0; j < mat.add_prop.length; j++) {
                let currentProp = mat.add_prop[j];
                if (typeof currentProp == "string") htmlList += `<div class="pageSectionItem itemStatement">${currentProp}</div><br>\n`;
                else htmlList += `<div class="pageSectionItem">${currentProp[0]}</div><div class="pageSectionValue">${Array.isArray(currentProp[1]) ? currentProp[1].join('<br>') : currentProp[1]}</div>\n`;
            }
            fix('ADDPROPS', htmlList);
        } else {
            fix('ADDPROPSTITLE', '');
            fix('ADDPROPS', '');
        }
        
        // Generate Variants Tiles

        if (mat.variants || mat.neutral) {
            let final = '';
            if (mat.neutral) {
                let src = mat.neutral.imgsrc ? mat.neutral.imgsrc : false;
                final += `
                <span class="specialtyGridItem variantItem">
                    <img class="specialtyGridImage"${src ? ` src="../../content/materials/${linker}/neut.jpg"` : ' src="../../content/materials/missing/missing.png"'}${src ? ` title="Photo Source: ${src}"` : ''}>
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
                    let src = variant.imgsrc ? variant.imgsrc : false;
                    let img = variant.imgovr ? variant.imgovr : variant.imgsrc ? `var${variant.id || j}` : '';
                    let temp = `
                    <span class="specialtyGridItem variantItem">
                        <img class="specialtyGridImage"${src ?  ` src="../../content/materials/${linker}/${img}.jpg"` : ' src="../../content/materials/missing/missing.png"'}${src ? ` title="Photo Source: ${variant.imgsrc}"` : ''}>
                        <div class="specialtyGridContent">
                        ${variant.label ? `
                            <div class="specialtyGridTitle mainGridTitle">${variant.label}</div>
                            <div class="specialtyGridTitle shortGridTitle">${variant.shorthand || variant.label}</div>
                        ` : ''}
                        ${variant.color ? `<div class="specialtyGridDesc variantDesc">Color: ${variant.color}</div>` : ''}
                        ${variant.fluor ? `<div class="specialtyGridDesc variantDesc">Fluorescence: ${variant.fluor}</div>` : ''}
                        ${variant.cause ? `<div class="specialtyGridDesc variantDesc">Cause: ${getFormulaHTML(variant.cause)}</div>` : ''}
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

        // Add Synthesis Method Tiles

        let methods = mat.synthesis;
        let tempList = [];
        for (var m = 0; m < methods.length; m++) {
            let additional = '';
            if (m == 0) additional = ' firstChild';
            let method = methods[m];
            let data = synthesis[method];
            let temp = `
            <a class="specialtyGridItem${additional}" href="../../synthesis/${method.toLowerCase().replaceAll(' ', '-')}/">
                <img class="specialtyGridImage" src="../../content/materials/missing/missing.png">
                <div class="specialtyGridContent">
                <div class="specialtyGridTitle mainGridTitle">${data.title}</div>
                <div class="specialtyGridTitle shortGridTitle">${data.shorthand || data.title}</div>
                <div class="specialtyGridDesc overflow">${data.trunc}</div>
                </div>
            </a>`;
            tempList.push(temp);
        }
        fix('SYNLIST', tempList.join(''));

        // End Templater for Materials and Write them to Files

        if (!fs.existsSync(`../public/materials/${linker}/`))
            fs.mkdirSync(`../public/materials/${linker}/`);
        fs.writeFileSync(`../public/materials/${linker}/index.html`, template);
    }

    // Use genlist from earlier, template the homepage for browsing materials

    let tempList = [];
    for (let i = 0; i < genlist.length; i++) {
        const link = genlist[i];
        const status = link[2] >= 7 ? '' : (link[2] >= 6 ? ' statusYellow' : ' statusRed');
        let temp = `
        <a class="specialtyGridItem${status} gridExpander" href="${link[1].toLowerCase().replaceAll(' ', '-')}/">
            <img class="specialtyGridImage"${link[4] ? ` src="../content/materials/${link[1].toLowerCase().replaceAll(' ', '-')}/${link[4]}.jpg"` : ' src="../content/materials/missing/missing.png"'}${link[5] ? ` title="Photo Source: ${link[5]}"` : ''}>
            <div class="specialtyGridContent">
            <div class="specialtyGridTitle mainGridTitle">${link[1]}</div>
            <div class="specialtyGridTitle shortGridTitle">${link[1]}</div>
            <div class="specialtyGridDesc floatDown">${link[3]}</div>
            </div>
        </a>`;
        tempList.push(temp);
    }
    matHomeTemplate = matHomeTemplate.replace('REV', revision)
        .replace('REV', revision)
        .replace('MATLIST', tempList.join(''))
        .replace('NUM', materials.length);
    console.log('Writing Material Index File...');
    fs.writeFileSync('../public/materials/index.html', matHomeTemplate);
}

generateTemplates();