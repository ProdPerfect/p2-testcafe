const { Transform } = require('stream');
const Mocha         = require('mocha');

module.exports = opts => {
    const mocha = new Mocha(opts);

    return new Transform({
        objectMode: true,

        transform (file, enc, cb) {
            mocha.addFile(file.path);
            cb(null, file);
        },

        flush (cb) {
            mocha.run(cb);
        }
    });
};