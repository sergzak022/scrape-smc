var prereqs_to_reqs = require("../js/prereqs-to-reqs.js");

describe('prereqs-to-reqs', function() {
    it('should parse "CS 60 and CS 80 and ( CS 15 or CS 52 or CS 53A or CS 55 )" properly', function() {
        expect(prereqs_to_reqs.parse("CS 60 and CS 80 and ( CS 15 or CS 52 or CS 53A or CS 55 )")).toEqual({
            "type": "exactly",
            "aggregateBy": null,
            "elements": [
                "CS 60",
                "CS 80", {
                    "type": "exactly",
                    "aggregateBy": null,
                    "elements": [
                        "CS 15",
                        "CS 52",
                        "CS 53A",
                        "CS 55"
                    ],
                    "select": 1
                }
            ],
            "select": 3
        });
    });

    it('should parse "(CS 60 or CS 80) and ( CS 15 or CS 52 or CS 53A or CS 55 )" properly', function() {
        expect(prereqs_to_reqs.parse("(CS 60 or CS 80) and ( CS 15 or CS 52 or CS 53A or CS 55 )")).toEqual({
            "type": "exactly",
            "aggregateBy": null,
            "elements": [{
                "type": "exactly",
                "aggregateBy": null,
                "elements": [
                    "CS 60",
                    "CS 80"
                ],
                "select": 1
            }, {
                "type": "exactly",
                "aggregateBy": null,
                "elements": [
                    "CS 15",
                    "CS 52",
                    "CS 53A",
                    "CS 55"
                ],
                "select": 1
            }],
            "select": 2
        });
    });

    it('should parse "(A and B) or C" properly', function() {
        expect(prereqs_to_reqs.parse("(A and B) or C")).toEqual({
            "type": "exactly",
            "aggregateBy": null,
            "elements": [{
                    "type": "exactly",
                    "aggregateBy": null,
                    "elements": [
                        "A",
                        "B"
                    ],
                    "select": 2
                },
                "C"
            ],
            "select": 1
        });
    });

    it('should parse "A and B or C" properly', function() {
        expect(prereqs_to_reqs.parse("A and B or C")).toEqual({
            "type": "exactly",
            "aggregateBy": null,
            "elements": [{
                    "type": "exactly",
                    "aggregateBy": null,
                    "elements": [
                        "A",
                        "B"
                    ],
                    "select": 2
                },
                "C"
            ],
            "select": 1
        });
    });

    it('should parse "( A or B ) or ( C or (D and E) )" properly', function() {
        expect(prereqs_to_reqs.parse("( A or B ) or ( C or (D and E) )")).toEqual({
            "type": "exactly",
            "aggregateBy": null,
            "elements": [{
                "type": "exactly",
                "aggregateBy": null,
                "elements": [
                    "A",
                    "B"
                ],
                "select": 1
            }, {
                "type": "exactly",
                "aggregateBy": null,
                "elements": [
                    "C", {
                        "type": "exactly",
                        "aggregateBy": null,
                        "elements": [
                            "D",
                            "E"
                        ],
                        "select": 2
                    }
                ],
                "select": 1
            }],
            "select": 1
        });
    });

    it('should parse "( A or ( B and C or D ) ) or ( A or ( B and C or D ) )" properly', function() {
        expect(prereqs_to_reqs.parse("( A or ( B and C or D ) ) or ( A or ( B and C or D ) )")).toEqual({
            "type": "exactly",
            "aggregateBy": null,
            "select": 1,
            "elements": [{
                "type": "exactly",
                "aggregateBy": null,
                "select": 1,
                "elements": ["A", {
                    "type": "exactly",
                    "aggregateBy": null,
                    "select": 1,
                    "elements": [{
                        "type": "exactly",
                        "aggregateBy": null,
                        "select": 2,
                        "elements": ["B", "C"]
                    }, "D"]
                }]
            }, {
                "type": "exactly",
                "aggregateBy": null,
                "select": 1,
                "elements": ["A", {
                    "type": "exactly",
                    "aggregateBy": null,
                    "select": 1,
                    "elements": [{
                        "type": "exactly",
                        "aggregateBy": null,
                        "select": 2,
                        "elements": ["B", "C"]
                    }, "D"]
                }]
            }]
        });
    });

    it('should parse "( aa 0 or ( bb 0 and cc 0 or dd 0 ) ) or ( aa 1 or ( bb 1 and cc 1 or dd 1 ) )" properly', function() {
        expect(prereqs_to_reqs.parse("( aa 0 or ( bb 0 and cc 0 or dd 0 ) ) or ( aa 1 or ( bb 1 and cc 1 or dd 1 ) )")).toEqual({
            "type": "exactly",
            "aggregateBy": null,
            "select": 1,
            "elements": [{
                "type": "exactly",
                "aggregateBy": null,
                "select": 1,
                "elements": ["aa 0", {
                    "type": "exactly",
                    "aggregateBy": null,
                    "select": 1,
                    "elements": [{
                        "type": "exactly",
                        "aggregateBy": null,
                        "select": 2,
                        "elements": ["bb 0", "cc 0"]
                    }, "dd 0"]
                }]
            }, {
                "type": "exactly",
                "aggregateBy": null,
                "select": 1,
                "elements": ["aa 1", {
                    "type": "exactly",
                    "aggregateBy": null,
                    "select": 1,
                    "elements": [{
                        "type": "exactly",
                        "aggregateBy": null,
                        "select": 2,
                        "elements": ["bb 1", "cc 1"]
                    }, "dd 1"]
                }]
            }]
        });
    });

    // --------------------------------- not yet implemented ---------------------------------

    // -------------------------------- repetitions ------------------------------------------

    /*it('should parse "A and A or B" properly', function() {
        expect(prereqs_to_reqs.parse("A and A or B")).toEqual({
            "type": "exactly",
            "aggregateBy": null,
            "elements": [
                "A",
                "B"
            ],
            "select": 1
        });
    });

    it('should parse "A and A or A" properly', function() {
        expect(prereqs_to_reqs.parse("A and A or A")).toEqual({
            "type": "exactly",
            "aggregateBy": null,
            "elements": [
                "A"
            ],
            "select": 1
        });
    });

    it('should parse "(A and B) or (A and C)" properly', function() {
        expect(prereqs_to_reqs.parse("A and A or A")).toEqual({
            "type": "exactly",
            "aggregateBy": null,
            "elements": [{
                "type": "exactly",
                "aggregateBy": null,
                "elements": [
                    "A",
                    "B"
                ],
                "select": 2
            }, {
                "type": "exactly",
                "aggregateBy": null,
                "elements": [
                    "A",
                    "C"
                ],
                "select": 2
            }],
            "select": 1
        });
    });*/

    // --------------------------------- combinations ---------------------------------

    /*it('should parse "( (A and B) or (A and C) or (B and C) )" properly', function() {
        expect(prereqs_to_reqs.parse("( A or B ) or ( C or (D and E) )")).toEqual({
            "type": "exactly",
            "aggregateBy": null,
            "elements": [
				"A", "B", "C"
            ],
            "select": 2
        });
    });*/

});