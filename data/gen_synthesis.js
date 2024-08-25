const fs = require('fs');
const materials = require('./json/materials.json');
const synthesis = require('./json/synthesis.json');
const revision = synthesis.revision;
let synthesisTemplate = fs.readFileSync('./synthesisTemplate.html', { encoding: 'utf-8', flag: 'r' });
let synHomeTemplate = fs.readFileSync('./synHomepageTemplate.html', { encoding: 'utf-8', flag: 'r' });

function generateTemplates() {
    materials.shift();
    let keys = Object.keys(synthesis);
    // Clear extra info sector from the working database
    keys.shift();
    let genlist = [];
    let synListForSummary = [];
    let matListForSummary = [];
    for (let i = 0; i < materials.length; i++) {
        const mat = materials[i];

        const trueIds = [];
        mat.synthesis.forEach((id, i) => {
            trueIds[i] = synthesis[id].title
        });

        matListForSummary[i] = [
            mat.label,
            mat.aliases,
            mat.chem_prop.chemical,
            mat.chem_prop.formula,
            trueIds
        ];
    }
    console.log(`Generating ${keys.length} Synthesis Templates`);
    for (let i = 0; i < keys.length; i++) {

        let key = keys[i];
        let method = synthesis[key];
        let template = synthesisTemplate;

        synListForSummary[i] = [
            key,
            method.title,
            method.aliases,
            method.disc
        ];

        // Begin Template Construction

        const fix = (tag, value) => { template = template.replace(tag, value); }

        // Grab Article

        let articleData = '';
        let mainArticle = 'Data Missing';
        let histArticle = 'Data Missing';
        try {
            articleData = fs.readFileSync(`../public/content/synthesis/${key}/article.txt`, { encoding: 'utf-8', flag: 'r' });
        } catch(e) {}
        if (articleData) {
            const split = articleData.split('\r\n----\r\n');
            if (split.length == 2) {
                mainArticle = split[0].replace(/\r\n/g, '</span><br><br><span class="ind">');
                histArticle = split[1].replace(/\r\n/g, '</span><br><br><span class="ind">');
            }
        }

        // Make References

        let newRefs = '';
        let raws = [];
        if (method.references) raws = method.references;
        for (var j = 0; j < raws.length; j++) {
            let ref = raws[j];
            newRefs += `
                <span>
                    ${ref[0]}, <i>${ref[1]}</i>, <a href="${ref[2]}">Link / Source</a>
                </span><br><br>
            `;
        }

        // Replacements

        fix('SYNREF', 'Information about ' + method.prefix + method.title);
        fix('TITLE', method.title);
        fix('SUBTITLE', 'Developed by ' + method.disc);
        if (method.aliases.length > 0) fix('ALIASES', `<span>Otherwise known by ${method.aliases}</span><br><br>`);
        else fix('ALIASES', '');
        fix('ARTICLE', mainArticle);
        fix('HISTORY', histArticle);
        fix('REFERENCES', newRefs);
        fix('REV', revision);
        const img = 'https://syndat.org/content/materials/missing/missing.png'; // TODO: Add images for synthesis methods
        fix('OGIMG', img);

        // Construct List for Index Page

        let temp = `
        <a class="specialtyGridItem" href="${key}/">
            <img class="specialtyGridImage" src="../content/materials/missing/missing.png">
            <div class="specialtyGridContent">
                <div class="specialtyGridTitle mainGridTitle">${method.title}</div>
                <div class="specialtyGridTitle shortGridTitle">${method.shorthand || method.title}</div>
                <div class="specialtyGridDesc overflow">${method.trunc}</div>
            </div>
        </a>`;
        genlist.push(temp);
        if (!fs.existsSync(`../public/synthesis/${key}/`))
            fs.mkdirSync(`../public/synthesis/${key}/`);
        fs.writeFileSync(`../public/synthesis/${key}/index.html`, template);
        fs.writeFileSync(`../public/search/summary.json`, JSON.stringify([synListForSummary, matListForSummary]));
    }
    synHomeTemplate = synHomeTemplate.replace('REV', revision);
    synHomeTemplate = synHomeTemplate.replace('SYNLIST', genlist.join(''));
    console.log('Writing Synthesis Index File...');
    fs.writeFileSync('../public/synthesis/index.html', synHomeTemplate);
    console.log('Finished');
}

generateTemplates();