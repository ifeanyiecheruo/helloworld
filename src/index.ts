import express from "express";

const app = express();

app.get('/', function (_request, response) {
    response.send('Hello Cluster World!')
});

const port = 80;

app.listen({
    port: port
}, function () {
    console.info(`Listening on port: ${port}`);
});
