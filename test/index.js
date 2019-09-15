const path = require('path');
const expect = require('chai').expect;
const mockgoose = require('./mockgoose');

const kites = require('kites');
const request = require('supertest');

var app;

describe('Rivebot CE API', function () {
  before(async () => {
    await mockgoose.setup();
    await kites({
        rootDirectory: path.resolve(__dirname, '../'),
        configFile: path.resolve(__dirname, '../kites.config.json'),
        loadConfig: true,
        discover: true
      })
      .use(require('../content/extensions/app-routes'))
      .use((kites) => {
        // barrier which prevents kites auto create connection
        kites.on('datasource:connect', () => {
          kites.logger.info('Use mockgoose connection for development! Do nothing.');
        });
      })
      .init()
      .then(function (kites) {
        app = kites.express.app;
        kites.logger.info('Rivebot Server is Ready!!!');
        return kites;
      });
    await new Promise((resolve) => {
      var datafile = path.resolve(__dirname, '../dump/exports/story.default.json');
      console.log('Datafile: ' + datafile);
      // init database
      request(app)
        .post('/api/story/imports')
        .attach('datafile', datafile)
        .end(function (err, res) {
          console.log(err, res.statusCode, res.text);
          expect(res.statusCode).to.equal(200);
          expect(res.text).to.equal('ok');
          resolve();
        });
    }).then(() => {
      console.log('Init db ok!')
    });
  });

  after(async () => {
    console.log('Done')
    await mockgoose.teardown();
    // exit kites
    process.exit(0);
  });

  it('ping api server', (done) => {
    request(app)
      .get('/api/ping')
      .end(function (err, res) {
        expect(res.statusCode).to.equal(200);
        expect(res.body.msg).to.be.eq('pong');
        done(err);
      });
  });

  it('init conversation', (done) => {
    request(app)
      .get('/api/nlu/chat/init_conversation')
      .query({
        context: {},
        currentNode: '',
        extractedParameters: {},
        fromBot: false,
        input: 'init_conversation',
        intent: {},
        speechResponse: '',
        to: 'rivebot@yeu.ai',
      })
      .end(function (err, res) {
        console.log(err, res.body);
        expect(res.statusCode).to.equal(200);
        expect(res.body.input).to.be.eq('init_conversation');
        expect(res.body.complete).to.be.eq(true);
        done(err);
      });
  })

});
