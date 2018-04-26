vntk-chatbot-framework
======================

An AI chatbot framework using VNTK and written in Nodejs.

> This is a part of project [yeu.ai](https://github.com/yeuai). An open platform for experiment and training Vietnamese chatbot!

Installation
============

**Notice**: Before start chatbot as a service, you need restore initial database, using mogodb in the corresponding way.

### Opt1 - Git Clone

1. Import demo database, using mongodb (you have installed before):

> mongorestore --drop --db=yeu-ai --dir=dump/yeu-ai/

If you need to backup an old version before restore, then:

> mongodump --db yeu-ai

2. Clone repository & Install dependencies

> git clone https://github.com/vntk/vntk-chatbot-framework.git  
> cd vntk-chatbot-framework  
> npm install  

3. Run chatbot and open on your browser

> npm start

Finally navigate to [http://localhost:3000/](http://localhost:3000/) to see project in action.

### Opt2 - Docker Compose

* Docker: [Install Docker](https://docs.docker.com/install/)
* Compose: [Install Docker Compose](https://docs.docker.com/compose/install/)

```bash
> git clone https://github.com/vntk/vntk-chatbot-framework.git  
> cd vntk-chatbot-framework  

# build & start chatbot as a service
> docker-compose build  
> docker-compose up -d  

# import database
> docker exec -it mongodb bash
> mongorestore --drop --db=yeu-ai --dir=dump/yeu-ai/

# check logs
> docker logs chatbot -f
```

### Opt3 - Using @kites/cli from NPM

We have ability to create a chatbot easily with Nodejs by using kites cli from NPM (look like a chatbot factory):

1. Install kites cli: `npm install -g @kites/cli`
2. Create a chatbot: `kites init my-chatbot --template chatbot`

The rest you need to do is configure database and start application! [Read more kites document](https://kites.nodejs.vn/documentation/)

# Dependencies

* [vntk - Vietnamese NLP Toolkit for Node](https://github.com/vunb/vntk)
* [crfsuite - Nodejs binding for crfsuite](https://github.com/vunb/node-crfsuite)
* [fasttext - Nodejs binding for fasttext](https://github.com/vunb/node-fasttext)
* [CRFSuite documentation](http://www.chokkan.org/software/crfsuite/)
* [Facebook fastText](https://github.com/facebookresearch/fastText)

Contributing
============

Pull requests and stars are highly welcome.

For bugs and feature requests, please [create an issue](https://github.com/vntk/vntk-chatbot-framework/issues/new).

