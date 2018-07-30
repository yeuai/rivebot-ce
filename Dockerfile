FROM node:8
RUN mkdir -p /opt/yeuai/chatbot
WORKDIR /opt/yeuai/chatbot
COPY package.json /opt/yeuai/chatbot
RUN npm install
COPY . /opt/yeuai/chatbot
EXPOSE 3000
CMD [ "npm", "start" ]
