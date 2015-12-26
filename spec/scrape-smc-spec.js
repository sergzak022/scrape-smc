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
            var array = scrape_smc.scrape(file, 'CS 83');

            expect(array[0]).toEqual({
                "id": "CS 83R",
                "name": "Server-Side Ruby Web Programming",
                "units": 3,
                "transfer": [
                    "CSU"
                ],
                "prerequisite": "Computer Science 60 and 80 and one of the following: CS 15 or 52 or 53A or 55.",
                "prerequisite_fixed": "CS 60 and CS 80 and ( CS 15 or CS 52 or CS 53A or CS 55 )",
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


        it('should return info about MCRBIO 1, if requested', function() {
            var array = scrape_smc.scrape(file, 'MCRBIO 1');

            expect(array[0]).toEqual({
                "id": "MCRBIO 1",
                "name": "Fundamentals of Microbiology",
                "units": 5,
                "transfer": [
                    "UC",
                    "CSU"
                ],
                "prerequisite": "Chemistry 10 or eligibility for Chemistry 11, and Physiology 3 or Biology 3 or 21.",
                "prerequisite_fixed": "CHEM 10 and ( PHYS 3 or BIOL 3 or BIOL 21 )",
                "requirements": {
                    "type": "exactly",
                    "aggregateBy": null,
                    "select": 2,
                    "elements": [
                        "CHEM 10", {
                            "type": "exactly",
                            "aggregateBy": null,
                            "select": 1,
                            "elements": [
                                "PHYS 3",
                                "BIOL 3",
                                "BIOL 21"
                            ]
                        }
                    ]
                },
                "advisory": "Eligibility for English 1.",
                "description": "This course involves study of several types of microorganisms with emphasis on bacteria. Principles of microbiology, metabolism, genetics, immunology, and medical and nonmedical applications are considered. The laboratory includes aseptic transfer techniques, cultural characteristics, methods of microscopy, and analytical techniques for identifying microbial organisms. The course content is related to both general and clinical applications including recent molecular biological and serological techniques.",
                "sections": [{
                    "id": "2871",
                    "time": "8:00a-11:05a MWF",
                    "room": "SCI 209",
                    "instructor": "Narey V"
                }, {
                    "id": "2872",
                    "time": "12:45p-2:05p MW",
                    "room": "SCI 159",
                    "instructor": "Buchanan A G"
                }, {
                    "id": "2873",
                    "time": "12:45p-2:05p MW",
                    "room": "SCI 159",
                    "instructor": "Buchanan A G"
                }, {
                    "id": "2874",
                    "time": "2:00p-5:05p MW",
                    "room": "SCI 209",
                    "instructor": "Kluckhohn Jones L W"
                }, {
                    "id": "4357",
                    "time": "6:45p-9:50p MWTh",
                    "room": "SCI 209",
                    "instructor": "Pepper E D"
                }]
            });
        });



        it('should return info about ENGL 1, if requested', function() {
            var array = scrape_smc.scrape(file, 'ENGL 1');

            expect(array[0]).toEqual({
                "id": "ENGL 1",
                "name": "Reading and Composition 1",
                "units": 3,
                "transfer": [
                    "UC",
                    "CSU"
                ],
                "prerequisite": "English 21B or 22, ESL 21B or Group A on the Placement Test.",
                "prerequisite_fixed": "ENGL 21B or ENGL 22 or ESL 21B or placement",
                "requirements": {
                    "type": "exactly",
                    "aggregateBy": null,
                    "select": 1,
                    "elements": [
                        "ENGL 21B",
                        "ENGL 22",
                        "ESL 21B",
                        "placement"
                    ]
                },
                "description": "This introductory course in rhetoric emphasizes clear, effective written communication and preparation of the research paper.",
                "sections": [{
                    "id": "1861",
                    "time": "6:30a-7:50a TTh",
                    "room": "DRSCHR 204",
                    "instructor": "Brigstocke J W"
                }]
            });
        });



        it('should return info about NURSNG 10L, if requested', function() {
            var array = scrape_smc.scrape(file, 'NURSNG 10L');

            expect(array[0]).toEqual({
                "id": "NURSNG 10L",
                "name": "Nursing Skills Laboratory",
                "units": 2,
                "prerequisite": "Admission to Nursing Program:  Anatomy 1, English 1, Microbiology 1, Physiology 3.",
                "prerequisite_fixed": "ANATMY 1 and ENGL 1 and MCRBIO 1 and PHYS 3",
                "requirements": {
                    "type": "exactly",
                    "aggregateBy": null,
                    "select": 4,
                    "elements": [
                        "ANATMY 1",
                        "ENGL 1",
                        "MCRBIO 1",
                        "PHYS 3"
                    ]
                },
                "description": "The focus of this clinical course is to provide the opportunity for skill performance and transfer of theory to the clinical setting. The clinical setting will include the Health Sciences Learning Center laboratory and non-acute clinical environments with focus on the older adult.",
                "sections": [{
                    "id": "3031",
                    "time": "7:00a-1:10p WTh",
                    "room": "BUNDY 340",
                    "instructor": "Angel V M"
                }, {
                    "id": "3032",
                    "time": "7:00a-1:10p WTh",
                    "room": "BUNDY 329",
                    "instructor": "Mayorga A"
                }, {
                    "id": "3033",
                    "time": "7:00a-1:10p WTh",
                    "room": "BUNDY 321",
                    "instructor": "Penaflorida D D"
                }, {
                    "id": "3034",
                    "time": "7:00a-1:10p WTh",
                    "room": "N/A HOSP",
                    "instructor": "Staff"
                }]
            });
        });



        it('should return info about NURSNG 25, if requested', function() {
            var array = scrape_smc.scrape(file, 'NURSNG 25');

            expect(array[0]).toEqual({
                "id": "NURSNG 25",
                "name": "Psychiatric - Mental Health Nursing",
                "units": 1.5,
                "prerequisite": "Nursing 20 and 20L (or Nursing 19 and Advanced Placement).",
                "prerequisite_fixed": "( NURSNG 20 and NURSNG 20L ) or ( NURSNG 19 and placement )",
                "requirements": {
                    "type": "exactly",
                    "aggregateBy": null,
                    "select": 1,
                    "elements": [{
                        "type": "exactly",
                        "aggregateBy": null,
                        "select": 2,
                        "elements": [
                            "NURSNG 20",
                            "NURSNG 20L"
                        ]
                    }, {
                        "type": "exactly",
                        "aggregateBy": null,
                        "select": 2,
                        "elements": [
                            "NURSNG 19",
                            "placement"
                        ]
                    }]
                },
                "description": "The focus of this specialty course is to introduce the nursing student to the principles of psychiatric-mental health nursing as applied to patients across the life span.  Emphasis will be placed on meeting self-care deficits of patients exhibiting symptoms of common psychiatric disorders and patients experiencing emotional responses to stress and illness.  This course will cover concepts of mental health, mental illness, stress, and coping, assessment of common psychiatric disorders, biological and psychosocial modes of intervention, and therapeutic nursing responses.",
                "sections": [{
                    "id": "3048",
                    "time": "11:00a-2:05p M",
                    "room": "BUNDY 335",
                    "instructor": "Farber G C"
                }]
            });
        });



        it('should return info about AHIS 1, if requested', function() {
            var array = scrape_smc.scrape(file, 'AHIS 1');

            expect(array[0]).toEqual({
                "id": "AHIS 1",
                "name": "Western Art History I",
                "units": 3,
                "transfer": [
                    "UC",
                    "CSU"
                ],
                "prerequisite": "None.",
                "prerequisite_fixed": "",
                "requirements": {
                    "type": "exactly",
                    "aggregateBy": null,
                    "select": 0,
                    "elements": []
                },
                "description": "A survey of the chronological development of Western art from the Stone Age to the Gothic Period with emphasis on the cultural, political, and social factors that influenced this evolution. This includes: Near-Eastern, Egyptian, Greek, Roman, Byzantine, Romanesque and Gothic art and architecture.",
                "sections": [{
                    "id": "1060",
                    "time": "8:00a-9:20a MW",
                    "room": "A 214",
                    "instructor": "Staff"
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