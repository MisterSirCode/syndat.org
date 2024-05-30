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
        let props;
        el.innerHTML = '';
        fetch("../../data/materials.json").then(res => res.json()).then(materials => {
            console.info('Material Database Loaded');
            fetch("../../data/synthesis.json").then(res2 => res2.json()).then(synthesis => {
                console.info('Synthesis Database Loaded');
                fetch("tempmat.html").then(res2 => res2.text()).then(template => {
                    console.info('Template Loaded');
                    document.querySelector("a.target").setAttribute('href', '../materials/');
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
                        props = mat.properties;
                        template = template.replace('TITLE', mat.label);
                        if (mat.aliases.length > 0) 
                            template = template.replace('ALIAS', mat.aliases);
                        template = template.replace('FORMULA', mat.formula);
                        template = template.replace('CHEM', mat.chemical);
                        if (props.grav_min == props.grav_max)
                            template = template.replace('GRAV', props.grav_min);
                        else
                            template = template.replace('GRAV', `${props.grav_min} - ${props.grav_max}`);
                        if (props.mohs_min == props.mohs_max)
                            template = template.replace('MOHS', props.mohs_min);
                        else
                            template = template.replace('MOHS', `${props.mohs_min} - ${props.mohs_max}`);
                        if (Array.isArray(props.ref_min)) {
                            if (props.ref_min.length == 2 && props.ref_min[0] == props.ref_max[0])
                                template = template.replace('REF', `n<sub>ω</sub> = ${props.ref_min[0]}, n<sub>ε</sub> = ${props.ref_min[1]}`);
                            else if (props.ref_min.length == 2)
                                template = template.replace('REF', `n<sub>ω</sub> = ${props.ref_min[0]} - ${props.ref_max[0]}, n<sub>ε</sub> = ${props.ref_min[1]} - ${props.ref_max[1]}`);
                        } else {
                            if (props.ref_min == props.ref_max)
                                template = template.replace('REF', props.ref_min);
                            else
                                template = template.replace('REF', `${props.ref_min} - ${props.ref_max}`);
                        }
                        el.innerHTML = template;

                        if (mat.aliases.length == 0) {
                            let tmp = document.querySelector('.aliases');
                            tmp.nextElementSibling.remove();
                            tmp.remove();
                        }
                    }
                }).catch(err => fireErr(err));
            }).catch(err => fireErr(err));
        }).catch(err => fireErr(err));
    } else {
        // TODO: Finish default page content
    }
});