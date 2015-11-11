var cheerio = require('cheerio');
var helpers = require('./helpers');

exports.scrapeSMC = function ( html, parseLines ) {
	var $ = cheerio.load(html);

    var $trs = $('tr');
	
    if ( parseLines ) {
    	$trs = $('tr').slice(0, parseLines);	
    }

	var $a = $trs.find('a[name]'); // this a tags are located in the tr that identifies the beginning of the new class info
	
    var $class_start_trs = $a.closest('tr'); // tr that identifies the beginning of the new class info
    var stopIndexes = getStopIndexes($, $class_start_trs); // stop indexes will tell us where inforamtion about new class starts

    var subgroups = createSubgroups($trs, stopIndexes); // subgroups will simplify data extraction

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
    id_name_units : /name="(.+)".*<b>.+,(.+)<\/b>.*<b>(\d) units/,
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
        obj.requirements = processPrerequisite(obj.prerequisite);
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

function peek (arr) {
    return arr[arr.length - 1];
}

var operations = ['or', 'OR', 'and', 'AND'];

function isOperation (word) {
    return operations.indexOf(word) >= 0;
}
// this checks if word contains a number or number and leters after the number
// field abbreviation and this id word makes a unique string
// that unique string will probably used as an id
var re_id = /^\d+[A-z]*?$/;
function isId (word) {
    return re_id.test(word);
}

// returns the abbreviated word of the field.
// can also be used to check if word represents a field ( isField ). If it doesn't return undefind that means word represents a field
function getAbbreviation (word) {
    var idx;
    if ( ( idx = helpers.fields_abbrv.indexOf(word) ) >= 0 ) {
        return helpers.fields_abbrv[idx];
    } else if ( ( idx = helpers.fields.indexOf(word) ) >= 0 ) {
        return helpers.fieldMap[ helpers.fields[idx] ];
    }
}

function processPrerequisite ( str ) {
    var re_word = /\b\w+\b/g,
        res = [],
        match, word, num,
        lastField, curField;
    while ( ( match = re_word.exec(str) ) !== null ) { // if match is not null then match[0] is a word
        word = match[0];

        curField = getAbbreviation(word);
        if ( word.toLowerCase() === 'none' ) { // if word says 'none' then we return empty array
            return [];
        } else if ( isOperation( word ) ) { // if word is opperation, just add it to res
            res.push(word);
        } else if ( isOperation( peek(res) ) && isId( word )  ) { 
            // if last element of res is operation and current word is id then we need to combine current word with lastField that we extracted before
            // that gives us an id of the class
            res.push( lastField + ' ' + word );
        } else if ( lastField && isId( word ) ) {
            res.push( lastField + ' ' + word );
        } else if ( isOperation( peek(res) ) && !isId( word ) && !curField ) {
            res.pop();
        }

        if ( curField ) {
            lastField = curField;
        }
    }
    return res;
}