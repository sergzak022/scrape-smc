var argv = require('minimist')(process.argv);
var request = require('request');
var scrape_smc = require('./js/scrape-smc');
var Readable = require('stream').Readable;

var periodMap = {
	winter : 0,
	spring : 1,
	summer : 2,
	fall : 3
};

function buildUrl (url, year, period) {
	var map = {};
	if ( periodMap[period] ) {
		period = periodMap[period];
	} else if ( typeof period !== 'number' ) {
		throw new Error('The passed period is invalid: have to be either a period name (ex. winter, spring, summer, fall) or a number between 0 and 3');
	}
    var str = year + '' + period;
    return url.replace('*', str);
}

var url = "http://isismc02.smc.edu/isisdoc/web_cat_sched_*.html";

var year = argv.y || argv.year;

var period = argv.p || argv.period;

var id = argv.i || argv.id;

var lines = argv.l || argv.lines;

if (!year || !period) {
    throw new Error('make sure you pass year (ex. -y 2015) and period (ex. -p summer)');
}

/*
 - first: we extract data from the website
 - second: we build valid data object for the Road-Map app
 */

request(buildUrl(url, year, period), processResponse);

function processResponse (err, res, html) {
    if (err) {
        throw err;
    }

    var data = scrape_smc.scrape(html, lines || id);

    pipeToStandardOutput(data);
}

function pipeToStandardOutput (data) {
    var str = JSON.stringify(data);
    var buffer = new Buffer(str);
    var s = new Readable();

    var offset = 0;

    s._read = function (size) {
        if (offset < buffer.length) {
            this.push(buffer.slice(offset, offset + size));
            offset += size;
        } else {
            this.push(null);
        }
    };

    s.on('error', function (err) {
        process.exit();
    });

    s.pipe(process.stdout);
}

