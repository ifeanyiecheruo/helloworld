const {name, version} = require('./package.json'); 
const { argv } = process;
const [ node, script, ...args ] = argv;
const [ registry, commitHash ] = args;

console.log(`::set-output name=image::${registry}/${name}:${version}-${commitHash}`);
