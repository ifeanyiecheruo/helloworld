// Helper script to set the output of a step in a Github Action to the full name of a docker image in a registry
// Usage node tools/set-docker-image-output <registry-url> <git-commit-hash>
// It will set the 'image' output of the step to <registry-url>/<npm-module-name>:<npm-module-version>-<git-commit-hash>

const {name, version} = require('../package.json'); 
const { argv } = process;
const [ node, script, ...args ] = argv;
const [ registry, commitHash ] = args;

// The npm module names can contain some invalid characters for image names (eg upper case or @)
// https://ktomk.github.io/pipelines/doc/DOCKER-NAME-TAG.html#image-name
const safePackageName = name.toLocaleUpperCase('en-US').replace(/[^a-z0-9/\\._-]*/gm, '_');

console.log(`::set-output name=image::${registry}/${safePackageName}:${version}-${commitHash}`);
