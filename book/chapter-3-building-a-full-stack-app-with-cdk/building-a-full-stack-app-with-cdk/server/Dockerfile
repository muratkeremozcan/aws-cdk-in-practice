FROM amd64/node:lts

WORKDIR /server

COPY . .

RUN npm install --registry https://registry.npmjs.org  && npm run build

EXPOSE 80

ENTRYPOINT ["npm", "run", "start"]
