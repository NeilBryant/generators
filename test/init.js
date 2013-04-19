require('should');

if (!process.env.TRAVIS) {
    if (typeof __cov === 'undefined') {
        process.on('exit', function () {
            require('semicov').report();
        });
    }

    require('semicov').init('lib');
}

global.getApp = function() {
    var app = require('./app')();
    app.compound.generators.init(app.compound);
    return app;
};

global.stubFS = stubFS;
global.unstubFS = unstubFS;
global.flushFS = flushFS;
global.getFile = function(path) {
    return memfs[path];
};
global.getFunctionBlock = getFunctionBlock;

var memfs = {}, writeFileSync, readFileSync, writeSync, closeSync, existsSync,
    mkdirSync, chmodSync, readFileSync, exit;
var fs = require('fs');

function stubFS() {
    exit = process.exit;
    writeFileSync = fs.writeFileSync;
    readFileSync = fs.readFileSync;
    closeSync = fs.closeSync;
    writeSync = fs.writeSync;
    existsSync = fs.existsSync;
    mkdirSync = fs.mkdirSync;
    chmodSync = fs.chmodSync;
    fs.mkdirSync = function (name) {
        memfs[name] = true;
    };
    fs.chmodSync = function() {};
    fs.writeFileSync = function(name, content) {
        memfs[name] = content;
        return name;
    };
    fs.existsSync = function(path) {
        return path in memfs;
    };
}

function unstubFS() {
    fs.writeFileSync = writeFileSync;
    fs.mkdirSync = mkdirSync;
    fs.chmodSync = chmodSync;
    fs.existsSync = existsSync;
    process.exit = exit;
}

function flushFS() {
    memfs = {};
}

// Retrieve the block of a function given it's name.
// eg, getFunctionBlock('flushFS', 'thistext')
// Matching indentations should work, and should work in both js
// and coffee if we drop the last line (eg, ignore the first line
// with the same indentation)
function getFunctionBlock(fnName, script) {
    var re = new RegExp("^(\\s*)(?:.*?" + RegExp.quote(fnName) + ".*(?:\\n*\\1\\s+.*|\\n\\s*$)*(?:\\n*\\1[\\s\\)\\}\\;])*)", "m");
    var ret = re.exec(script);
    return ret[0];
}

RegExp.quote = function(str) {
    return (str+'').replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
};