const path = require('path');
const should = require('chai').should();
const expect = require('chai').expect;
const mongoose = require('mongoose');
const mockgoose = require('./mockgoose');

const kites = require('kites');
const request = require('supertest');

/**
 * Define a model
 */
const Cat = mongoose.model('Cat', {
    name: String
});

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
            .use((kites) => {
                // barrier which prevents kites auto create connection
                kites.on('datasource:connect', () => {
                    kites.logger.info('Use mockgoose connection for development! Do nothing.');
                });
            })
            .init()
            .then(function (kites) {
                app = kites.express.app

                kites.logger.info('Rivebot Server is Ready!!!');
                return kites;
            })
    });

    after(async () => {
        console.log('Done')
        await mockgoose.teardown();
        // exit kites
        process.exit(0);
    });

    it("should create a cat foo", function (done) {
        Cat.create({
            name: "foo"
        }, function (err, cat) {
            should.not.exist(err);
            should.exist(cat);
            cat.should.be.an('object');
            done(err);
        });
    });

    it("should find cat foo", function (done) {
        Cat.findOne({
            name: "foo"
        }, function (err, cat) {
            should.not.exist(err);
            should.exist(cat);
            cat.should.be.an('object');
            done(err);
        });
    });

    it("should remove cat foo", function (done) {
        Cat.remove({
            name: "foo"
        }, function (err, cat) {
            should.not.exist(err);
            should.exist(cat);
            cat.should.be.an('object');
            done(err);
        });
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
                to: 'coco@yeu.ai',
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
