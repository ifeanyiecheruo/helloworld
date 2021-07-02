import express, { Application } from "express";
import redis from 'redis';

const port = 80;
configureExpress(express(), process.env).listen({ port: port }, function () {
    console.info(`Listening on port: ${port}`);
});

function configureExpress(instance: Application, processEnv: Record<string, string | undefined>): Application {
    const env  = {
        REDIS_ADDRESS: "localhost",
        REDIS_PORT: "6379",
        ...processEnv 
    };

    instance.get('/', async function (request, response, next) {
        console.info(`${request.method}: ${request.path} from ${request.ip}`);

        try {
            const redisClient = redis.createClient({
                host: env.REDIS_ADDRESS,
                port: Number.parseInt(env.REDIS_PORT, 10)
            });

            try {
                // get the current count
                const count = await getCountFromRedis(redisClient);

                // Set the current count
                // Note here is a race condition here
                // Another client may have incremented the count causing us to clobber their increment
                // This is a demo, we are not going to mitigate the race
                await setCountToRedis(redisClient, count + 1);            

                response.send(`Hello World, called ${count} times`);
            } catch (error) {    
                response.send(`Hello World, called <unknown> times`);
            }

            response.send(`Hello World, called unknown times`);
        } catch (error) {
            console.error(error);
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

