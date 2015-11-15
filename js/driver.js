var prereqs_to_reqs = require("./prereqs-to-reqs");
var logical_grouping = require("./logical-grouping");

// test how grouping works

var res = logical_grouping.getGroupedArray("( a or ( b and c or d ) ) or ( a or ( b and c or d ) )".split(' '), { "and" : 0, "or" : 1});
var res = prereqs_to_reqs.parse(res.join(' '), { "and" : 0, "or" : 1});

var res = prereqs_to_reqs.parse("( A or ( B and C or D ) ) or ( A or ( B and C or D ) )", { "and" : 0, "or" : 1});

var res = logical_grouping.getGroupedArray("A and B or C".split(' '), { "and" : 0, "or" : 1});

// here we test if we can parse ungrouped strings

var res = prereqs_to_reqs.parse("A and B or C", { "and" : 0, "or" : 1});


var res = prereqs_to_reqs.parse("( aa 0 or ( bb 0 and cc 0 or dd 0 ) ) or ( aa 1 or ( bb 1 and cc 1 or dd 1 ) )", { "and" : 0, "or" : 1});

console.log(res);