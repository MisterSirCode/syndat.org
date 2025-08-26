let genMats = require("./gen_materials");
let genSyns = require("./gen_synthesis");

function main() {
    genMats.runGenerator();
    genSyns.runGenerator();
}

main();