var should = require('chai').should(),
    expect = require('chai').expect,
    mongoose = require('mongoose'),
    mockgoose = require('./mockgoose');

/**
 * Define a model
 */
const Cat = mongoose.model('Cat', {
    name: String
});

describe('User functions', function () {
    before(async () => {
        console.log('Start')
        await mockgoose.setup();
    });

    after(async () => {
        console.log('Done')
        await mockgoose.teardown();
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

    // it("reset", function (done) {
    //     mockgoose.helper.reset().then(function () {
    //         done();
    //     });
    // });

});
