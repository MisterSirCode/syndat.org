function fireErr(err) {
    console.error('Failed to Download with Error: ');
    console.error(err);
}

function isNumeric(str) {
    if (typeof str != "string") return false; 
    return !isNaN(str) && !isNaN(parseFloat(str));
}

document.addEventListener('DOMContentLoaded', () => {
    const params = new URL(document.location.toString()).searchParams;
    if (params.size >= 1) {
        const id = Array.from(params.keys())[0];
        const el = document.querySelector(".pageContent");
        let mat;
        el.innerHTML = '';
        fetch("../data/materials.json").then(res => res.json()).then(materials => {
            console.info('Material Database Loaded');
            fetch("../data/synthesis.json").then(res2 => res2.json()).then(synthesis => {
                console.info('Synthesis Database Loaded');
                fetch("tempmat.html").then(res2 => res2.text()).then(template => {
                    console.info('Template Loaded');
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

                        if (mat.minID) fix('MINID', mat.minID);

                        if (mat.aliases.length > 0) fix('ALIAS', mat.aliases);

                        fix('FORMULA', chem.formula);
                        fix('CHEM', chem.chemical);

                        if (chem.grav_min == chem.grav_max) fix('GRAV', chem.grav_min);
                        else fix('GRAV', `${chem.grav_min} - ${chem.grav_max}`);

                        if (chem.mohs_min == chem.mohs_max) fix('MOHS', chem.mohs_min);
                        else fix('MOHS', `${chem.mohs_min} - ${chem.mohs_max}`);

                        if (cry.parent) fix('ITEM PARENT', `${cry.parent[1]} ${cry.parent[0]}`);
                        if (cry.system) fix('CRYSTM', cry.system);

                        if (optic.type) fix('OPTYPE', optic.type);

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
                        if (!optic.disp_min) delPair('.dispersion');
                        if (!optic.bir_min) delPair('.birefringence');
                        if (!mat.minID) document.querySelector('.minSubTitle').remove();
                    }
                }).catch(err => fireErr(err));
            }).catch(err => fireErr(err));
        }).catch(err => fireErr(err));
    } else {
        // TODO: Finish default page content
    }
});