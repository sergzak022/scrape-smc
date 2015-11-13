var helpers = require('./helpers');

exports.parse = function ( str ) {
    var prereqArray = exractTokens(str);
    prereqArray = replaceCommas(prereqArray);
    prereqArray = fixOperators(prereqArray);
    prereqArray = guessSubgroups(prereqArray); // only pertrains to smc
    return buildReqs(prereqArray);
};

exports.replaceCommas = replaceCommas;
exports.fixOperators = fixOperators;
exports.guessSubgroups = guessSubgroups;

function buildReqs (arr) {
    return arr;
}

var presidence = {
    'AND' : 3,
    'OR' : 2,
    'and' : 1,
    'or' : 0
};
// this logic should be moved to the separate module it because groups classes according to the way SMC words their prerequisites
function getBracketGroups ( array ) {
    var groupsByPresidence = [], p;
    array.forEach(function ( el, idx, arr ) {
        if ( isOperator( el ) ) {
            p = presidence[el];
            if ( !Array.isArray( groupsByPresidence[p] ) ) {
                groupsByPresidence[p] = [];
            }
            groupsByPresidence[p].push([ arr[idx - 1], arr[idx + 1] ]);
        }
    });

    // join groups logic
    groupsByPresidence.forEach(function ( group ) {
        var cur, next;
        for ( var i = 0 ; i < group.length - 1; i++ ) {
            cur = group[i];
            next = group[i + 1];
            if ( cur[1] === next[0] ) { // transitive
                group.splice(i, 2, [cur[0], next[1]]);
                i--;
            } else {
                return res.push( next );
            }
        }
    });
    /*
    This logic will reduce our three dimensional array to two dimensions
    We start with groups that have higher presidence and add them to the valid_bracket_groups if they pass test
    then we add groups that have lower presidence and also add them to the valid_bracket_groups if they pass test
    in order to pass a test, tested group must not have the same first element with any other group's second element in the valid_bracket_groups,
    and also not have the same second element with any other group's first element in the valid_bracket_groups
    This way way the result of this logic can be used to group prerequisites 
     */
    var res = groupsByPresidence.reduce(function ( valid_bracket_groups, bracket_groups ) {
        bracket_groups.filter(function ( bracket_group ) {
            return valid_bracket_groups.every(function ( valid_bracket_group ) {
                // only bracket_groups that pass this test get added to the valid_bracket_groups array
                return valid_bracket_group[0] !== bracket_group[1] && valid_bracket_group[1] !== bracket_group[0];
            });
        }).forEach(function ( valid_bracket_group ) {
            valid_bracket_groups.push( valid_bracket_group );
        });

        return valid_bracket_groups
    }, []);

    return res;
}

// this logic should be moved to the separate module because it groups classes according to the way SMC words their prerequisites
function guessSubgroups ( array ) {
    var arr = array.slice(),
    idx,
    brackets = getBracketGroups( arr );
    
    brackets.forEach(function ( group ) {
        idx = arr.indexOf(group[0]);
        arr.splice(idx, 0, '(');
        idx = arr.indexOf(group[1]);
        arr.splice(idx + 1, 0, ')');
    });

    // make sure that all operators are in lowercase
    arr = arr.map(function (el) {
        if ( isOperator(el) ) {
            return el.toLowerCase();
        }
    });

    return arr;
}
/*
    operators is the subset of operations in the contex of the module
 */
var operators = ['or', 'OR', 'and', 'AND'];

function isOperator ( word ) {
    return operators.indexOf( word ) >= 0;
}

// remove operators if they are the first or the last element of the array
function fixOperators (array) {
    var last = array.length - 1;
    return array.filter(function (el, idx) {
        return !isOperator(el) || ( idx !== 0 && idx !== last);
    });
}

function getFirstOperator (arr, direction) {
    if (direction === 'left') {
        arr.reverse();
    }

    for (var i = 0; i < arr.length; i++) {
        if ( isOperator( arr[i] ) ) {
            return arr[i];
        }
    }
}

var defaultOperator = 'and';

function replaceCommas ( array ) {
    var arr = array.slice();
    var i, last = arr.length - 1;
    for ( i = 0; i <= last; i++ ) {
        if ( arr[i] === ',' ) {
            switch ( true ) {
                // if comma is the first or last element of the array then just remove it
                case ( i === 0 || i === last) : {
                    arr.splice(i, 1);
                    break;
                }
                // if it there is an operator before or after the comma then remove it
                case ( isOperation(arr[i - 1]) || isOperation(arr[i + 1]) ) : {
                    arr.splice(i, 1);
                    break;
                }
                case ( getFirstOperator( arr.slice(0, i), 'left' ) != null ) : {
                    arr.splice( i, 1, getFirstOperator( arr.slice(0, i), 'left' ) );
                    break;
                }
                case ( getFirstOperator( arr.slice(i, last), 'right' ) != null ) : {
                    arr.splice( i, 1, getFirstOperator( arr.slice(i, last), 'right' ) );
                    break;
                }
                default : {
                    arr.splice(i, 1, defaultOperator);
                }
            }
        }
    }
    return arr; 
}

function exractTokens ( str ) {

    //str = cleanUpString(str);

    var re_word = /(\b\w+\b)|(,)|(\()|(\))/g,
        res = [],
        match, word, num,
        lastField, curField, part = ''; // some words that we are looking for consist of mulitple words, so part is used to help that
    while ( ( match = re_word.exec(str) ) !== null ) { // if match is not null then match[0] is a word
        word = match[0];

        curField = getAbbreviation(word);

        if ( !curField && !isOperation( word ) && !isId( word ) ) {
            part += ' ' + word;
            part = part.trim();
            curField = getAbbreviation(part);
            if ( curField ) {
                part = '';
            }
        }

        switch (true) {
            // if word says 'none' then we return empty array
            case ( word.toLowerCase() === 'none' ) : {
                return [];
            }
            // if word is opperation, just add it to res
            case ( isOperation( word ) ) : {
                res.push(word);
                part = '';
                break;
            }
            case ( isOperation( peek(res) ) && isId( word ) && exclude_strs.indexOf(part.toLowerCase()) < 0 ) : {
                // if last element of res is operation and current word is id then we need to combine current word with lastField that we extracted before
                // that gives us an id of the class
                res.push( lastField + ' ' + word );
                break;
            }
            case ( lastField && isId( word ) && exclude_strs.indexOf(part.toLowerCase()) < 0 ) : {
                // if word is id and we have lastField from the last iteration than push the concatination of them
                res.push( lastField + ' ' + word );
                break;
            }
            case ( isOperation( peek(res) ) && isId( word ) && exclude_strs.indexOf(part.toLowerCase()) >= 0 ) : {
                // if the last element of res is an operation and word is id, but part is one of the exclude strings
                // that means we are not going to add the class id and therefore need to remove its operation
                res.pop();
                part = '';
                break;
            }
            case ( word.toLowerCase() === 'placement' ) : {
                res.push('placement');
                break;
            }
        }

        if ( curField ) {
            lastField = curField;
        }
    }
    return res;
}

function peek (arr) {
    return arr[arr.length - 1];
}

var operations = ['or', 'OR', 'and', 'AND', ',', '(', ')'];

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

// we watch for this string. If we see them right before the class, we don't add the class as a requirement
var exclude_strs = ['placement in', 'eligibility for'];

// for now we don't care about information in the 
function cleanUpString (str) {
    return str.replace(/\(.+\)/, '').trim();
}