const fs = require('fs');
const synthesis = require('./json/synthesis.json');
const revision = synthesis.revision;
let synthesisTemplate = fs.readFileSync('./synthesisTemplate.html', { encoding: 'utf-8', flag: 'r' });

function generateTemplates() {
    let keys = Object.keys(synthesis);
    // Clear extra info sector from the working database
    keys.shift();
    let genlist = [];
    for (let i = 0; i < keys.length; i++) {
        console.clear();
        console.log(`Finishing Template ${i + 1} / ${keys.length}`);

        let key = keys[i];
        let method = synthesis[key];
        let template = synthesisTemplate;

        // Create Truncated List

        genlist.push([
            key,
            method.title,
            method.trunc
        ]);

        // Begin Template Construction

        const fix = (tag, value) => { template = template.replace(tag, value); }
        const delPair = (tag, repl) => {
            template = template.replace(`<div class="pageSectionItem">${tag}</div><div class="pageSectionValue">${repl}</div>`, '');
        }

        // Replacements

        fix('REV', revision);

        console.log('Writing Template...');
        if (!fs.existsSync(`../public/synthesis/methods/${key}/`))
            fs.mkdirSync(`../public/synthesis/methods/${key}/`);
        fs.writeFileSync(`../public/synthesis/methods/${key}/index.html`, template);
    }
    console.log('Finished');
    fs.writeFileSync('../public/synthesis/generatedList.json', JSON.stringify(genlist));
}

generateTemplates();