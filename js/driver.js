var prereqs_to_reqs = require("./prereqs-to-reqs");

var res = prereqs_to_reqs.parse("A and B or C", { "and" : 0, "or" : 1});

console.log(res);