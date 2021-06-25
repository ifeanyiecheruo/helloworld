// Command line tool to prepare a set of cloudformation templates with relative references for upload to s3
// Relative references are converted to absolute urls to their content hash

// usage 
//  node tools/resolve-tempate-urls.js input.yaml transformed.yaml folder-for-upload s3://dst-bucket
//  folder-for-upload should be uploaded to s3://dst-bucket
//  then you can instantiate the transformed.yaml CloudFormation template
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const templateUrlKey = 'TemplateURL: ';

const [node, script, input, output, staging, bucketUrl ] = process.argv;

processTemplate(path.resolve(input), output);

function processTemplate(templatePath, dstOverride) {
    const hash = crypto.createHash('sha1');
    const content = fs.readFileSync(templatePath, { encoding: 'utf-8' });

    hash.setEncoding('hex');

    const dstContent = content.split('\n').map(function(line) {
        hash.write(line);
        const trimmedLine = line.trim();

        if (trimmedLine.startsWith(templateUrlKey)) {
            const relTemplate = trimmedLine.substr(templateUrlKey.length).trim();
            const fullTemplate = path.resolve(path.dirname(templatePath), relTemplate);

            const digest = processTemplate(fullTemplate, undefined);

            return line.replace(relTemplate, `${bucketUrl}/${digest}.yaml`);
        } else {
            return line;
        }
    }).join('\n');

    hash.end();
    const digest = hash.read();
    const dstPath = (typeof dstOverride === 'string') ? path.resolve(dstOverride) : path.resolve(staging, `${digest}.yaml`);

    fs.mkdirSync(path.dirname(dstPath), { recursive: true });
    fs.writeFileSync(dstPath, dstContent, { encoding: 'utf-8' });

    return digest;
}
