var scrape_smc = require("../js/scrape-smc.js");
var fs = require('fs');
var path = require('path');

var file = fs.readFileSync(path.join(__dirname, './html/fall_2015.html'));

describe('scrape-smc', function() {
    describe('when we parse the page partialy', function() {
        it('should return non empty array', function() {
            var array = scrape_smc.scrape(file, 200);
        });
    });

    describe('when we only want to extract information about a single class', function() {
        var array = scrape_smc.scrape(file, 'CS 83');

        it('should return non empty array', function() {
            expect(array.length).toBeGreaterThan(0);
        });

        it('should return info about CS 83, if requested', function() {
            expect(array[0]).toEqual({
                "id": "CS83R",
                "name": "Server-Side Ruby Web Programming",
                "units": "3",
                "transfer": [
                    "CSU"
                ],
                "prerequisite": "Computer Science 60 and 80 and one of the following: CS 15 or 52 or 53A or 55.",
                "requirements": {
                    "type": "exactly",
                    "aggregateBy": null,
                    "select": 3,
                    "elements": [
                        "CS 60",
                        "CS 80", {
                            "type": "exactly",
                            "aggregateBy": null,
                            "select": 1,
                            "elements": [
                                "CS 15",
                                "CS 52",
                                "CS 53A",
                                "CS 55"
                            ]
                        }
                    ]
                },
                "description": "This course teaches how to design and write applications utilizing Ruby on Rails, an open-source web application framework based on the Ruby programming language. In this course, students will create applications that gather information from a web server, query databases and render results.",
                "sections": [{
                    "id": "1724",
                    "time": "Arrange-4.5Hours",
                    "room": "N/A ONLINE",
                    "instructor": "Stahl H A"
                }]
            });
        });
    });

    describe('when we parse the entire page', function() {
        var array = scrape_smc.scrape(file);
        it('should return non empty array', function() {
            expect(Array.isArray(array) && array.length > 0).toBeTruthy();
        });
    });

});