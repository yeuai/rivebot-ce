const mongoose = require('mongoose'),
    Mockgoose = require('mockgoose').Mockgoose,
    mockgoose = new Mockgoose(mongoose);

function initDb() {

}

module.exports = {
    setup: async function setup() {
        await mockgoose.prepareStorage();
        await mongoose.connect('mongodb://rivebot', {
            useNewUrlParser: true
        });
    },

    teardown: async function teardown() {
        await mockgoose.helper.reset();
        await mongoose.disconnect();
        let retval = new Promise(resolve => {
            mockgoose.mongodHelper.mongoBin.childProcess.on('exit', resolve);
        });
        mockgoose.mongodHelper.mongoBin.childProcess.kill('SIGTERM');
        return retval;
    }
};
