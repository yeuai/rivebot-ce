FROM node:8
RUN mkdir -p /opt/vntk/chatbot
WORKDIR /opt/vntk/chatbot
COPY package.json /opt/vntk/chatbot
RUN npm install
COPY . /opt/vntk/chatbot
EXPOSE 3000
CMD [ "npm", "start" ]
