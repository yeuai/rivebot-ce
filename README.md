vntk-chatbot-framework
======================

An AI chatbot framework using VNTK and written in Nodejs.

This is a part of project [yeu.ai](https://github.com/yeuai). An open platform for experiment and training Vietnamese robot!

Installation
============

1. Import demo database, using mongodb:

> mongorestore --drop --db=yeu-ai --dir=dump/yeu-ai/

If you need to backup an old version before restore, then:

> mongodump --db yeu-ai

2. Clone repository & Install dependencies

> git clone https://github.com/vunb/vntk-chatbot-framework.git
> cd vntk-chatbot-framework
> npm install

3. Run chatbot and open on your browser

> npm start

Then navigate to [http://localhost:3000/](http://localhost:3000/)