var cheerio = require('cheerio');
var prereq_parser = require('./prereq-parser-smc');

exports.scrape = function ( html, parseLines ) {
	var $ = cheerio.load(html);

    var $trs = $('tr');
    
    var subgroups;

    if ( typeof parseLines === 'string' ) {
        var id = parseLines;
        $trs = $('tr b:contains(' + id + ')').closest('tr');
        if (!$trs.length) {
            throw new Error('Can not find the class you are requesting');
        }

        subgroups = [getSubgroup($, $trs)];
    } else {

        if (typeof parseLines === 'number') {
            $trs = $('tr').slice(0, parseLines);
        } else {
            $trs = $('tr');
        }

        var $a = $trs.find('a[name]'); // this a tags are located in the tr that identifies the beginning of the new class info
    
        var $class_start_trs = $a.closest('tr'); // tr that identifies the beginning of the new class info
        var stopIndexes = getStopIndexes($, $class_start_trs); // stop indexes will tell us where inforamtion about new class starts

        subgroups = createSubgroups($trs, stopIndexes); // subgroups will simplify data extraction
    }

	/*var $a = $trs.find('a[name]'); // this a tags are located in the tr that identifies the beginning of the new class info
	
    var $class_start_trs = $a.closest('tr'); // tr that identifies the beginning of the new class info
    var stopIndexes = getStopIndexes($, $class_start_trs); // stop indexes will tell us where inforamtion about new class starts

    var subgroups = createSubgroups($trs, stopIndexes); // subgroups will simplify data extraction*/

    var data = [];

    subgroups.forEach(function (group, gIdx) {
        var $trs_group = $(group);
        data[gIdx] = {};
        for (var i = 0; i < $trs_group.length; i++) {
            populateDataObjectFromRowInfo(data[gIdx], $trs_group.eq(i).html());
        }
    });

    return data;
};


/*
 when we start scanning the class info we need to know were to stop
 so stop indexes will tell us were to stop (where class starts/ends)
 */
function getStopIndexes ($, $class_start_trs) {
    var res = [];

    $class_start_trs.each(function (idx, el) {
        res.push($(el).index());
    });

    return res;
}

function getSubgroup ($, $start_tr, stopIn) {
    if (stopIn == null) {
        stopIn = 300;
    }
    var c = 0, $cur = $start_tr, res = [$start_tr];
    while ( !( $cur = $cur.next() ).has('a[name]').length && c <= stopIn ) {
        res.push($cur);
        c++;
    }

    return res;
}

/*
to simplify data extraction the portoins of the html
are devided into groups. Every group contains information that
pertrains to only one class
 */
function createSubgroups ($trs, stopIndexes) {
    var groups = [],
        started = false, // flag that tels us if we need to add new group
        idx; // is a group index

    //stopIndexes[0] is the where the first class starts
    for ( var i = stopIndexes[0]; i < $trs.length; i++ ) {
        if ( stopIndexes.indexOf(i) >= 0 && !started) {
            started = true;
        } else {
            started = false;
        }

        if ( started ) {
            idx = groups.length;
            groups[idx] = [];
        }
        if ( idx != null ) {
            groups[idx].push($trs[i]);
        }
    }
	return groups;
}

var regMap = {
    id_name_units : /name="(.+)".*<b>.+,(.+)<\/b>.*<b>(\d+\.?\d*) units/,
    transfer : /Transfer: (UC|CSU),? ?(UC|CSU)?/,
    prerequisite : /Prerequisite: (.*)<\/td>/, // at first we want only extract a string. Later, when we have all the classes, we will process it
    advisory : /Advisory: (.*)<\/td>/,
    description : /<p><address>(.*)<\/address><\/p>/,
    sections : /<td.*>(\d+)<\/td><td>(.*)<\/td><td>(.*)<\/td><td>(.*)<\/td>/ // g1 - section #, g2 - time, g3 - room, g4 - Instructor's name
};

/*
This function tries to extract data from the str parameter ( str represents a single row (tr element) ) and populate obj parameter with extracted data
 */
function populateDataObjectFromRowInfo (obj, str) {
    var match;

    match = str.match(regMap.id_name_units);
    if ( match ) { // matched id, name, units row
        obj.id = match[1].replace(/\s/g, '');
        obj.name = match[2].trim();
        obj.units = match[3].trim();
        return;
    }

    match = str.match(regMap.transfer);

    if ( match ) { // matched transfer row
        obj.transfer = [];
        match.forEach(function (match, idx) {
            if ( idx > 0 && match) {
                obj.transfer.push(match.replace(' ', ''));
            }
        });
        return;
    }

    match = str.match(regMap.prerequisite);

    if ( match ) { // matched prerequisite row
        // for now we only store the match at prerequsisite
        // but later will need to add a parser that generate requirements object the same way we currently have them
        obj.prerequisite = match[1].trim();
        try {
            obj.requirements = prereq_parser.parse(obj.prerequisite);
        } catch (e) {
            console.warn('Error was thrown when tried to parse prerequisite string for ' + obj.id + ' prerequisite string: ' + obj.prerequisite);
        }
        return;
    }

    match = str.match(regMap.advisory);

    if ( match ) { // matched advisory row
        obj.advisory = match[1].trim();
        return;
    }

    match = str.match(regMap.description);

    if ( match ) { // matched description row
        if ( typeof obj.description !== 'string' ) {
            obj.description = '';
        }
        obj.description += match[1].trim();
        return;
    }

    match = str.match(regMap.sections);

    if ( match ) { // matched sections row
        if ( !Array.isArray(obj.sections) ) {
            obj.sections = [];
        }
        obj.sections.push({
            id : match[1].trim(),
            time : match[2].trim(),
            room : match[3].trim(),
            instructor : match[4].trim()
        });
        return;
    }
}