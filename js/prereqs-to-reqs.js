var string_hash = require('string-hash');
var logical_grouping = require('./logical-grouping');
/*
	this module doesn't assume presidence of "and" over "or" or other way around. You strings must have brackets to make logical statements within them clear.
 */

exports.parse = function(str) {
    return buildReqObjectRecursively(str);
};

var presidence = {
    'and' : 0,
    'or' : 1
};

// we assume that str must represent a group (not a single element, but at least two elements connected by operator)
function buildReqObjectRecursively ( str ) {
    str = str || '';

    // we replace all outer groups in a string with hashes that we can then use to get groups back
    // we also do that to remove all the brackets because they confuse us
    var str_no_groups = replaceGroupsWithHashes(str),
        hasAnds = hasAndRels(str_no_groups),
        hasOrs = hasOrRels(str_no_groups);

    if (hasAnds && hasOrs) {
        str = logical_grouping.getGroupedString(str_no_groups, presidence); // try to group elements in a string by inserting brackets
        str_no_groups = replaceGroupsWithHashes(str);
        hasAnds = hasAndRels(str_no_groups);
        hasOrs = hasOrRels(str_no_groups);
    }

    var req = getReqObj(str_no_groups, hasAnds, hasOrs);
    var group_str;

    req.elements.forEach(function ( element, idx, elements ) {
        group_str = getGroupFromHash( element );
        if ( group_str ) {
            elements[idx] = buildReqObjectRecursively( group_str );
        }
    });

    return req;
}

// making hash space larger because I'm so damn paranoid
function hashString(str) {
    return string_hash(str.substr(0, str.length / 2)) + '' + string_hash(str.substr(str.length / 2, str.length));
}

function getReqObjTmplt () {
    return {
        "type" : "exactly",
        "aggregateBy" : null,
        "select" : 0,
        "elements" : [],
    };
}

function getReqObj (str, hasAnds, hasOrs) {
    var elements, req;

    switch (true) {
        case (hasOrs && !hasAnds) :
            req = getReqObjTmplt();
            req.elements = str.split('or').map(function(word){ return word.trim(); });
            req.select = 1;
            break;
        case (!hasOrs && hasAnds) :
            req = getReqObjTmplt();
            req.elements = str.split('and').map(function(word){ return word.trim(); });
            req.select = req.elements.length;
            break;
        case (str === '') : // we assume there are no prerequisites
            req = getReqObjTmplt();
            break;
        case (!hasOrs && !hasAnds) : // if there are no operators we assume that we are only given a single element as a prerequisite
            req = getReqObjTmplt();
            req.elements = [str.trim()];
            req.select = 1;
            break;
        default : // we only get here if string has both 'or' and 'and' relationship. In this case the sting is ambigious
            throw new Error('Ambigious string: ' + str + '. User brackets!');
    }

    return req;
}

function hasOrRels (str) {
    return str.indexOf(' or ') >= 0;
}

function hasAndRels (str) {
    return str.indexOf(' and ') >= 0;
}

var operators = ['or', 'and'];

function isOperator(word) {
    return operators.indexOf(word) >= 0;
}

var hashToGroupMap = {};

function replaceGroupsWithHashes(str) {
    var startEnd, hash, substr,
        re = /\(|\)/g;

    while (startEnd = getFirstGroupIndexes(str)) {
        substr = str.substr(startEnd[0] + 1, startEnd[1] - startEnd[0] - 1).trim();
        hash = hashString(substr);
        hashToGroupMap[hash] = substr;
        str = str.slice(0, startEnd[0]) + hash + str.slice(startEnd[1] + 1);
    }

    return str;
}

function getGroupFromHash(hash) {
    return hashToGroupMap[hash];
}

function getFirstGroupIndexes(str) {
    var counter = 0,
        indexes = [];
    for (var i = 0; i < str.length; i++) {
        if (str[i] === '(') {
            if (!counter) {
                indexes.push(i);
            }
            counter++;
        }

        if (str[i] === ')' && counter > 0) {
            counter--;
            if (!counter) {
                indexes.push(i);
                return indexes;
            }
        }
    }
}