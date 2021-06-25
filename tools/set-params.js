// Command line tool to override the parameter in a CloudFormation template params file
// Usage node tools/set-params.js input.json output.json key1 value1 key2 value2 ...

const fs = require('fs');

const { argv } = process;
const [ node, script, ...args ] = argv;
const [ input, output, ...replacements ] = args;

const dict = {};
for(let i = 0; i < replacements.length; i += 2) {
    dict[replacements[i]] = replacements[i+1];
}

const params = JSON.parse(fs.readFileSync(input, { encoding: 'utf-8' }));

for (const param of params) {
    const newValue = dict[param.ParameterKey];

    if (typeof newValue === 'string') {
        param.ParameterValue = newValue;
        delete dict[param.ParameterKey];
    }
}

const remainingParams = Object.keys(dict);

if (remainingParams.length > 0) {
    console.error(`'${input}' does not have the following keys. Add them to the file or remove them from arguments '${remainingParams.join()}'`);

    return 1;
} else {
    fs.writeFileSync(output, JSON.stringify(params, undefined, 2), { encoding: 'utf-8' });

    return 0;
}

