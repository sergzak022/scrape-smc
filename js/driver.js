var prereqs_to_reqs = require("./prereqs-to-reqs");

var res = prereqs_to_reqs.parse("CS 60 and CS 80 and ( CS 15 or CS 52 or CS 53A or CS 55 )");

console.log(res);