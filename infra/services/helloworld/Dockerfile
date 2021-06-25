FROM node:14 as base
WORKDIR /usr/src/app

FROM base as dependencies
COPY . .
RUN npm clean-install

FROM dependencies as application
RUN npm run compile --production

FROM application as final
EXPOSE 80
CMD [ "npm", "run", "start"]

