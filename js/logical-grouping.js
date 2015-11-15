var string_hash = require('string-hash');
/*
    function takes an array of class id and operators, and presidence hash ( presidence of operators ) and returns an array with brackets inserted to specify grouping
 */
exports.getGroupedArray = getGroupedArray;
/*
    function takes a string of class id and operators separated by spaces, and presidence hash ( presidence of operators ) and returns an array with brackets inserted to specify grouping
 */
exports.getGroupedString = getGroupedString;
/*
    function function takes an array of class id and operators, and presidence hash ( presidence of operators ) and returns indexes at which brackets should be inserted
    you can pass array or string as a first parameter but that array or string is assumed to have only class ids and operations (ex. "and", 'or') separated by spaces, nothing else.
 */
exports.getGroupIndexes = getGroupIndexes;

var defPres = {
    'OR' : 1,
    'or' : 1,
    'AND' : 0,
    'and' : 0
};

function fixArray (el) {
    if ( typeof el === 'string' ) {
        return el.split(' ');
    } else {
        return el;
    }
}

function isOperator ( word, pres ) {
    return pres[word] != null;
}

function getGroupIndexes ( array , presidence ) {
    var pres = presidence || defPres;
    array = fixArray(array);

    var groupsByPresidence = [], p;
    array.forEach(function ( el, idx, arr ) {
        if ( isOperator( el, pres ) ) {
            p = pres[el];
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

        return valid_bracket_groups;
    }, []);

    res = res.filter(function ( group ) { // we don't want to use brackets to groups the entire string (it's redundant)
        return array.indexOf(group[0]) !== 0 || array.indexOf(group[1]) !== array.length - 1;
    });

    res = res.filter(function ( group ) { // we don't want to use brackets to groups the entire string (it's redundant)
        return group[0] !== group[1];
    });

    return res;
}

function getGroupedArray (array, presidence) {
   // var arr = array.slice(), brackets;
    /*if ( arr.indexOf( '(' ) >= 0 ) {
        arr = smartBracketInsert(arr, presidence);
    } else {
        brackets = getGroupIndexes( arr, presidence );
        insertBrackets(arr, brackets);
    }*/

    var arr = smartBracketInsert(array, presidence);

    return arr;
}
// array argument can only have outer brackets (at positions 0 and last)
function groupElements (array, presidence) {
    var arr = array.slice(),
        brackets,
        hasOuterBrackets = arr[0] === '(' && arr[arr.length - 1] === ')';

    if (hasOuterBrackets) { //if passed array had outer brackets we remove them to prevent insertBrackets from geting confused
        arr = arr.splice(1, arr.length - 2);
    }

    brackets = getGroupIndexes( arr, presidence );
    insertBrackets(arr, brackets);

    if ( hasOuterBrackets ) { // we place outer brackets back
        arr.unshift('(');
        arr.push(')');
    }
    return arr;
}

function insertArrayAtIndex (arr, idx, replaceCount, insert) {
    Array.prototype.splice.apply(arr, [idx, replaceCount].concat(insert));
}

var hashToGroupMap = {};

function smartBracketInsert ( array, presidence ) {
    var arr = array.slice(),
        startEnd, subset;

    while ( startEnd = getFirstInnerGroupIndexes(arr) ) {
        subset = arr.splice(startEnd[0], startEnd[1] - startEnd[0] + 1);
        
        var grouped_subset = groupElements(subset, presidence);

        hash = hashString(grouped_subset.join(' '));

        hashToGroupMap[hash] = grouped_subset;

        arr.splice(startEnd[0], 0, hash);
    }

    arr = groupElements(arr, presidence);

    // assembe our array back with all the elements grouped
    (function recurse (arr) {

        var indexToArrayMap = {};

        arr.forEach(function (el, idx, arr) {
            var group = getGroupArrayFromHash(el);
            if (group) {
                indexToArrayMap[idx] = group;
                recurse(group);
            }
        });

        var offset = 0;

        for (var idx in indexToArrayMap) {
            if ( indexToArrayMap.hasOwnProperty(idx) ) {

                insertArrayAtIndex(arr, ( +idx + offset ), 1, indexToArrayMap[idx]);

                offset += indexToArrayMap[idx].length - 1;
            }
        }


    })(arr);
    return arr;
}

function getGroupArrayFromHash(hash) {
    return hashToGroupMap[hash];
}

// making hash space larger because I'm so damn paranoid
function hashString(str) {
    return string_hash(str.substr(0, str.length / 2)) + '' + string_hash(str.substr(str.length / 2, str.length));
}

function getFirstInnerGroupIndexes( arr ) {
    var indexes = [], group = -1;

    var isStartedGroup = [];
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] === '(') {
            group++;
            if (!isStartedGroup[group]) {
                isStartedGroup[group] = true;
                if ( !Array.isArray(indexes[group]) ) {
                    indexes[group] = [];
                }
                indexes[group].push([i]);// = [i];
            }
        }

        if (arr[i] === ')' && isStartedGroup[group]) {
            isStartedGroup[group] = false;
            indexes[group][indexes[group].length - 1].push(i);
            group--;
        }
    }

    var res = indexes.pop();

    if ( Array.isArray(res) && res[0] ) {
        res = res[0];
    } 

    return res;
}

function splitByWords (str, presidence) {
    var operators = [];

    if ( str.indexOf('(') >= 0 ) {
        Object.keys(presidence).forEach(function ( operator ) {
            operators.push(operator);
        });

        operators = operators.concat(['(', ')']);
    }

    var operations_inorder = str.split(' ').filter(function (el) {
        return operators.indexOf(el) >= 0;
    });

    function trim (el) {
        return el.trim();
    }

    for ( var key in presidence ) {
        if ( presidence.hasOwnProperty(key) ) {
            str = str.split( key ).map( trim ).join(' op ');
        }
    }

    var arr = str.split(' op ');

    operations_inorder.forEach(function (operator, idx) {
        arr.splice( (2 * idx) + 1, 0, operator);
    });

    return arr;
}

var hashToElementMap = {};

function splitByWords (expression, presidence) {
    var operators = Object.keys(presidence),
        str = expression.slice();

    var regStr = operators.reduce(function (str, cur, idx) {
        if (idx) {
            str += '|';
        }
        return str + cur;
    }, '');

    regStr += '|\\(|\\)';

    var regEx = new RegExp(regStr);

    var elements = str.split(regEx).map(function(a){
        return a.trim();
    }).filter(function(a){
        return a.length;
    });

    var hashes = [];

    // we hash elements and replace them in the initial string in case some elements consist from more than one word
    elements.forEach(function (element) {
        var hash = hashString(element);
        hashes.push(hash);
        hashToElementMap[hash] = element;

        var idx = str.indexOf(element); // TODO: if element name is containt within an operator then we'll get wrong index

        str = str.slice(0, idx) + hash + str.slice(idx + element.length);
    });

    regStr = regStr += '|' + hashes.join('|');

    regEx = new RegExp(regStr, 'g');

    var word, res = [];

    while ( word = regEx.exec(str) ) {
        res.push(word[0]);
    }

    res = res.map(function (el) {
        if ( hashToElementMap[el] ) {
            return hashToElementMap[el];
        } else {
            return el;
        }
    });

    return res;
}

function getGroupedString (str, presidence) {

    if ( !presidence ) {
        throw new error('presidence hash must be provided to getGroupedString');
    }

    var arr = splitByWords(str, presidence);
    return getGroupedArray(arr, presidence).join(' ');
}

function insertBrackets (arr, brackets) {
    var idx;
    brackets.forEach(function ( group ) {
        idx = arr.indexOf(group[0]);
        arr.splice(idx, 0, '(');
        idx = arr.indexOf(group[1]);
        arr.splice(idx + 1, 0, ')');
    });
}