var argv = require('minimist')(process.argv);
var scrape_smc = require('./js/scrape-smc');
var fs = require('fs');
var path = require('path');

var id = argv.i || argv.id;
var lines = argv.l || argv.lines;
var filename = argv.f || argv.filename;

if ( !filename ) {
	throw new Error('must provide filename');
}

var filepath = path.join(__dirname, './spec/html/', filename);

var html = fs.readFileSync(filepath);

 var data = scrape_smc.scrape(html, lines || id);

 console.log(data);

var fd = fs.openSync(path.join(__dirname, 'dump.txt'), 'w');

fs.writeSync(fd, JSON.stringify(data, null, ' '));
fs.closeSync(fd);
