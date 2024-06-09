import fs from 'fs';
import materials from './json/materials.json' assert { type: 'json' };
import synthesis from './json/synthesis.json' assert { type: 'json '};
const template = fs.readFileSync('./materialTemplate.html', { encoding: 'utf-8', flag: 'r' });