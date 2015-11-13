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

        return valid_bracket_groups;
    }, []);

    res = res.filter(function ( group ) { // we don't want to use brackets to groups the entire string (it's redundant)
        return array.indexOf(group[0]) !== 0 || array.indexOf(group[1]) !== array.length - 1;
    });

    return res;
}

function getGroupedArray (array, presidence) {
    var arr = array.slice(),
    brackets = getGroupIndexes( arr, presidence );

    insertBrackets(arr, brackets);

    return arr;
}

function getGroupedString (str, presidence) {
    var arr = fixArray(str);
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