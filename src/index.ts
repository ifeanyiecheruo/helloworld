import express, { Application } from "express";
import redis from 'redis';

const port = 80;
const server = configureExpress(express(), process.env);
server.listen({ port: port }, function () {
    console.info(`Listening on port: ${port}`);
});

function configureExpress(instance: Application, processEnv: Record<string, string | undefined>): Application {
    const envDefaults =  {
        REDIS_ADDRESS: "localhost",
        REDIS_PORT: "6379"
    };

    const env = {
        ...envDefaults,
        ...processEnv 
    };

    const redisAddress = env.REDIS_ADDRESS;
    const redisPort = Number.parseInt(env.REDIS_PORT, 10);

    console.info(`Configured for redis instance at ${redisAddress}:${redisPort}`);

    instance.get('/', async function (request, response, next) {
        console.info(`${request.method}: ${request.path}`);

        try {
            const redisClient = redis.createClient({
                host: redisAddress,
                port: redisPort
            });

            try {
                // get the current count
                const count = await getCountFromRedis(redisClient);

                try {
                    // Set the current count
                    // Note here is a race condition here
                    // Another client may have incremented the count causing us to clobber their increment
                    // This is a demo, we are not going to mitigate the race
                    await setCountToRedis(redisClient, count + 1);            
                } catch (error) {
                    response.send(`Could not increment the current count. ${error.message}`);
                }

                response.send(`Hello World, called ${count} times.`);
            } catch (error) {
                response.send(`Could not get the current count. ${error.message}`);
            }

            next();
        } catch (error) {
            console.error(`${request.method}: ${request.path}: ${error}`);
            next(error);
        }
    });

    return instance;
}

async function getCountFromRedis(redisClient: redis.RedisClient) {
    const reply = await new Promise<string | null>(function (resolve, reject) {
        redisClient.get("count", function (err, reply) {
            if (err) {
                reject(err);
            }

            resolve(reply);
        });
    });

    // Incremente the current count (with race conditions and all)
    const count = (typeof reply === 'string') ? Number.parseInt(reply, 10) : 0;
    return count;
}

async function setCountToRedis(redisClient: redis.RedisClient, newCount: number) {
    await new Promise(function (resolve, reject) {
        redisClient.set("count", `${newCount}`, function (err, reply) {
            if (err) {
                reject(err);
            }

            resolve(reply);
        });
    });
}

