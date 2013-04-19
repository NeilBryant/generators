var sys = require('sys');
var i8n = require('inflection');

describe('grammar', function() {
    var app, compound, output, puts;

    before(function() {
        app = getApp();
        compound = app.compound;
        stubFS();
    });

    after(unstubFS);

    beforeEach(function() {
        output = [];
        puts = sys.puts;
        sys.puts = function(str) {
            output.push(str.replace(/\u001b\[\d+m/g, ''));
        };
    });

    afterEach(function() {
        flushFS();
        sys.puts = puts;
    });

    var sppairs = [
        ['Person',  'People'],
        ['Bus',     'Buses'],
        ['Fax',     'Faxes'],
        ['Octopus', 'Octopi'],
        ['Alias',   'Aliases'],
        ['Status',  'Statuses']
    ];

    it('should properly singularize nouns', function() {
        sppairs.forEach(function(pair){
            var single = i8n.singularize(pair[1]);
            single.should.eql(pair[0]);
        })
    });

    it('should properly pluralize nouns', function() {
        sppairs.forEach(function(pair){
            var plural = i8n.pluralize(pair[0]);
            plural.should.eql(pair[1]);
        })
    });


});
