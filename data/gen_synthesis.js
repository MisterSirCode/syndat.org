const fs = require('fs');
const synthesis = require('./json/synthesis.json');
const revision = synthesis[0].revision;
let materialTemplate = fs.readFileSync('./synthesisTemplate.html', { encoding: 'utf-8', flag: 'r' });

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

        const fix = (tag, value) => { template = template.replace(tag, value); }
        const delPair = (tag, repl) => {
            template = template.replace(`<div class="pageSectionItem">${tag}</div><div class="pageSectionValue">${repl}</div>`, '');
        }

        // Smaller Replacements

        fix('TITLE', mat.label);

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
            <div class="specialtyGridItem">
                <img class="specialtyGridImage">
                <div class="specialtyGridContent">
                <div class="specialtyGridTitle">PRODTITLE</div>
                <div class="specialtyGridDesc">PRODDESC</div>
                </div>
            </div>`;
            temp = temp.replace('PRODTITLE', data.title);
            temp = temp.replace('PRODDESC', data.trunc);
            tempList.push(temp);
        }

        fix('SYNLIST', tempList.join(""));

        fix('REV', revision);

        console.log('Writing Template...');
        if (!fs.existsSync(`../public/synthesis/methods/${mat.label}/`))
            fs.mkdirSync(`../public/synthesis/methods/${mat.label}/`);
        fs.writeFileSync(`../public/synthesis/methods/${mat.label}/index.html`, template);
    }
    console.log('Finished');
    //fs.writeFileSync('../public/materials/generatedList.json', JSON.stringify(genlist));
}

generateTemplates();