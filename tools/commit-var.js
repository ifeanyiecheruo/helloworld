// Command line tool to inject the commit hash for the current branch as an environment variable before invoking its arguments
// This tool is used to ensure that commands have the git commit available as an environment variable

const process = require('process');
const child_process = require('child_process');

const [node, argv0, envName, command, ...commandArgs] = process.argv;

if (typeof envName === 'string' && typeof command === 'string') {
    return spawnWithCommit(envName, command, commandArgs);
} else {
    return 0;
}

function spawnWithCommit(envName, command, commandArgs) {
    const env = { 
        ...process.env
    };
    env[envName] = getGitCommit(envName);

    const childProcess = child_process.spawnSync(
        command,
        commandArgs,
        {
            encoding: 'utf-8',
            stdio: 'inherit',
            env: env
        }
    );

    return childProcess.status;
}

function getGitCommit(envName) {
    const commitEnv = process.env[envName];

    if (typeof commitEnv === 'string') {
        return commitEnv;
    } else {
        const gitProcess = child_process.spawnSync(
            'git',
            ['rev-parse', '--short', 'HEAD'],
            {
                encoding: 'utf-8',
                stdio: ['inherit', 'pipe', 'inherit']
            }
        );

        return gitProcess.stdout.trim();
    }
}

