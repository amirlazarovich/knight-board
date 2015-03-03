var KnightBoard = require('./index');

// ---------------------------
// Test
// ---------------------------
var test = {
	all: function() {
		console.log(KnightBoard.CYAN, "Testing Knight Board Challenge...", KnightBoard.BLACK);

		this.level1A();
		this.level2();
		this.level3();
		this.level1B();
		this.level4();
		this.level5A();
		this.level5B();	
		this.level5C();

		console.log(KnightBoard.GREEN, "All tests completed successfully :)", KnightBoard.BLACK);
	},

	defaultSymbols: function() {
 		var raw = ". . . . . . . . B . . . L L L . . . . . . . . . . . . . . . . .$. . . . . . . . B . . . L L L . . . . . . . . . . . . . . . . .$. . . . . . . . B . . . L L L . . . L L L . . . . . . . . . . .$. . . . . . . . B . . . L L L . . L L L . . . R R . . . . . . .$. . . . . . . . B . . . L L L L L L L L . . . R R . . . . . . .$. . . . . . . . B . . . L L L L L L . . . . . . . . . . . . . .$. . . . . . . . B . . . . . . . . . . . . R R . . . . . . . . .$. . . . . . . . B B . . . . . . . . . . . R R . . . . . . . . .$. . . . . . . . W B B . . . . . . . . . . . . . . . . . . . . .$. . . R R . . . W W B B B B B B B B B B . . . . . . . . . . . .$. . . R R . . . W W . . . . . . . . . B . . . . . . . . . . . .$. . . . . . . . W W . . . . . . . . . B . . . . . . T . . . . .$. . . W W W W W W W . . . . . . . . . B . . . . . . . . . . . .$. . . W W W W W W W . . . . . . . . . B . . R R . . . . . . . .$. . . W W . . . . . . . . . . B B B B B . . R R . W W W W W W W$. . . W W . . . . . . . . . . B . . . . . . . . . W . . . . . .$W W W W . . . . . . . . . . . B . . . W W W W W W W . . . . . .$. . . W W W W W W W . . . . . B . . . . . . . . . . . . B B B B$. . . W W W W W W W . . . . . B B B . . . . . . . . . . B . . .$. . . W W W W W W W . . . . . . . B W W W W W W B B B B B . . .$. . . W W W W W W W . . . . . . . B W W W W W W B . . . . . . .$. . . . . . . . . . . B B B . . . . . . . . . . B B . . . . . .$. . . . . R R . . . . B . . . . . . . . . . . . . B . . . . . .$. . . . . R R . . . . B . . . . . . . . . . . . . B . T . . . .$. . . . . . . . . . . B . . . . . R R . . . . . . B . . . . . .$. . . . . . . . . . . B . . . . . R R . . . . . . . . . . . . .$. . . . . . . . . . . B . . . . . . . . . . R R . . . . . . . .$. . . . . . . . . . . B . . . . . . . . . . R R . . . . . . . .$. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .$. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .$. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .$. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .";
		var rows = raw.split("$");
		var res = [];
		for (var i = 0; i < rows.length; i++) {
			var nodes = rows[i].split(" ");
			for (var j = 0; j < nodes.length; j++) {
				if (res[j] === undefined) {
					res[j] = [];
				}

				res[j][i] = nodes[j];
			}
		}

		return res;
	},

    print: function(level, msg, pass) {
        if (!pass) {
            console.log("");
            console.log(KnightBoard.RED, "TEST FAILED!", KnightBoard.BLACK);
            throw "TEST: [" + level + "] " + msg + ": FAIL";
        } else {
            console.log("\nTEST: [" + level + "] " + msg + ": PASS");
            console.log("--------------------------------------------------------\n");
        }

        return pass;
    },

    level1A: function() {
    	console.log(KnightBoard.BLUE, "** LEVEL 1A ** ", KnightBoard.BLACK);
        var board = new KnightBoard(8);
        var tests = [{
            label: "no moves",
            expected: true,
            moves: undefined,
            print: false
        }, {
            label: "single legal move",
            expected: true,
            moves: [
                [0, 0]
            ],
            print: true
        }, {
            label: "illegal move: [2, 4] -> [3, 3]",
            expected: false,
            moves: [
                [2, 4],
                [3, 3]
            ],
            print: true
        }, {
            label: "illegal move: negative value",
            expected: false,
            moves: [
                [3, 3],
                [-1, 1]
            ],
            print: true
        }, {
            label: "illegal move: outside bounds",
            expected: false,
            moves: [
                [7, 3],
                [9, 4]
            ],
            print: true
        }, {
            label: "legal forward move sequence",
            expected: true,
            moves: [
                [0, 0],
                [2, 1],
                [3, 3],
                [4, 5]
            ],
            print: true
        }, {
            label: "legal backward move sequence",
            expected: true,
            moves: [
                [4, 5],
                [3, 3],
                [2, 1],
                [0, 0]
            ],
            print: true
        }, {
            label: "legal backward/forward move sequence",
            expected: true,
            moves: [
                [4, 5],
                [3, 3],
                [5, 4],
                [6, 6]
            ],
            print: true
        }];

        // run all tests
        var me = this;
        tests.forEach(function(test) {
            var pass = test.expected === board.isValid(test.moves, test.print);
            me.print("level1a", test.label, pass);
        });

        console.log(KnightBoard.GREEN, "+ LEVEL1A passed!\n", KnightBoard.BLACK);
        return true;
    },

    level1B: function() {
    	console.log(KnightBoard.BLUE, "** LEVEL 1B ** ", KnightBoard.BLACK);
        var board = new KnightBoard(32);
        var symbols = this.defaultSymbols();
        var tests = [{
            label: "no moves",
            expected: true,
            moves: undefined,
            symbols: symbols,
            print: false
        }, {
            label: "single legal move",
            expected: true,
            moves: [
                [0, 0]
            ],
            symbols: symbols,
            print: true
        }, {
            label: "illegal move: stopping on a Barrier",
            expected: false,
            moves: [
                [9, 2],
                [8, 0]
            ],
            symbols: symbols,
            print: true
        }, {
            label: "illegal move: passing a Barrier",
            expected: false,
            moves: [
                [9, 2],
                [7, 1]
            ],
            symbols: symbols,
            print: true
        }, {
            label: "illegal move: stopping on a Rock",
            expected: false,
            moves: [
                [5, 11],
                [4, 9]
            ],
            symbols: symbols,
            print: true
        }, {
            label: "legal move: crossing a teleport",
            expected: true,
            moves: [
                [26, 11],
                [27, 23]
            ],
            symbols: symbols,
            print: true
        }];

        // run all tests
        var me = this;
        tests.forEach(function(test) {
            var pass = test.expected === board.isValid(test.moves, test.print, test.symbols);
            me.print("level1b", test.label, pass);
        });

        console.log(KnightBoard.GREEN, "+ LEVEL1B passed!\n", KnightBoard.BLACK);
        return true;
    },

    level2: function() {
    	console.log(KnightBoard.BLUE, "** LEVEL 2 ** ", KnightBoard.BLACK);
        var board = new KnightBoard(8);
        var tests = [{
            label: "no move",
            expected: true,
            start: [0, 0],
            end: [0, 0],
            print: true
        }, {
            label: "single legal move",
            expected: true,
            start: [0, 0],
            end: [2, 1],
            print: true
        }, {
            label: "legal moves (simple)",
            expected: true,
            start: [0, 0],
            end: [4, 2],
            print: true
        }, {
            label: "legal moves (not optimal)",
            expected: true,
            start: [0, 0],
            end: [6, 6],
            print: true
        }, {
            label: "legal moves (from the center)",
            expected: true,
            start: [4, 4],
            end: [2, 7],
            print: true
        }, {
            label: "illegal moves: outside bounds",
            expected: false,
            start: [4, 4],
            end: [-2, 5],
            print: true
        }];

        // run all tests
        var me = this;
        tests.forEach(function(test) {
            var path = board.getMoveSequence(test.start, test.end);
            var pass;
            if (test.expected) {
            	console.log("Moves summary: ");
	            console.log(path);
	            console.log("");
                pass = (path !== null) && board.isValid(path, test.print);
            } else {
                pass = (path === null);
            }
            me.print("level2", test.label, pass);
        });

        console.log(KnightBoard.GREEN, "+ LEVEL2 passed!\n", KnightBoard.BLACK);
        return true;
    },

    level3: function() {
    	console.log(KnightBoard.BLUE, "** LEVEL 3 ** ", KnightBoard.BLACK);
    	var board = new KnightBoard(8);
        var tests = [{
            label: "no move",
            expected: true,
            start: [0, 0],
            end: [0, 0],
            print: true
        }, {
            label: "single legal move",
            expected: true,
            start: [0, 0],
            end: [2, 1],
            print: true
        }, {
            label: "legal moves (simple)",
            expected: true,
            start: [0, 0],
            end: [4, 2],
            print: true
        }, {
            label: "legal moves (shortest path)",
            expected: true,
            start: [0, 0],
            end: [6, 6],
            print: true
        }, {
            label: "legal moves (from the center)",
            expected: true,
            start: [4, 4],
            end: [2, 7],
            print: true
        }, {
            label: "illegal moves: outside bounds",
            expected: false,
            start: [4, 4],
            end: [-2, 5],
            print: true
        }];

        // run all tests
        var me = this;
        tests.forEach(function(test) {
            var path = board.shortestPath(test.start, test.end);

            var pass = false;
            if (test.expected && path !== null) {
        		console.log("Moves summary: " + (path.length - 1) + " moves");
	            console.log(path);
	            console.log("");	
	            pass = board.isValid(path, test.print);
            } else if (!test.expected) {
                pass = (path === null);
            }
            me.print("level3", test.label, pass);
        });

        console.log(KnightBoard.GREEN, "+ LEVEL3 passed!\n", KnightBoard.BLACK);
        return true;
    },

    level4: function() {
    	console.log(KnightBoard.BLUE, "** LEVEL 4 ** ", KnightBoard.BLACK);
    	var board = new KnightBoard(32);
    	var symbols = this.defaultSymbols();
        var tests = [{
            label: "no move",
            expected: true,
            start: [0, 0],
            end: [0, 0],
            symbols: symbols,
            print: true
        }, {
            label: "single legal move",
            expected: true,
            start: [0, 0],
            end: [2, 1],
            symbols: symbols,
            print: true
        }, {
            label: "legal moves: long distance",
            expected: true,
            start: [0, 0],
            end: [9, 0],
            symbols: symbols,
            print: true
        }, {
            label: "legal move: crossing a teleport",
            expected: true,
            start: [24, 10],
            end: [27, 23],
            symbols: symbols,
            print: true
        }, {
            label: "legal move: behind the lava",
            expected: true,
            start: [0, 0],
            end: [15, 3],
            symbols: symbols,
            print: true
        }, {
            label: "illegal moves: outside bounds",
            expected: false,
            start: [4, 4],
            end: [-2, 5],
            print: true
        }];

        // run all tests
        var me = this;
        tests.forEach(function(test) {
            var result = board.shortestPathWithWeights(test.start, test.end, test.symbols);

            var pass;
            if (test.expected && result !== null) {
            	console.log("Moves summary: " + result.distance + " total weights");
	            console.log(result.path);
	            console.log("");
                pass = board.isValid(result.path, test.print, test.symbols);
            } else if (!test.expected) {
                pass = (result === null);
            }
            me.print("level4", test.label, pass);
        });

        console.log(KnightBoard.GREEN, "+ LEVEL4 passed!\n", KnightBoard.BLACK);
        return true;
    },

    level5A: function() {
    	console.log(KnightBoard.BLUE, "** LEVEL 5A ** ", KnightBoard.BLACK);
    	var board = new KnightBoard(4);
        var tests = [{
            label: "legal moves: simple",
            expected: true,
            start: [2, 0],
            end: [1, 3],
            print: true
        }, {
            label: "legal moves: cycle",
            expected: true,
            start: [2, 0],
            end: [2, 0],
            print: true
        }, {
            label: "illegal moves: outside bounds",
            expected: false,
            start: [4, 4],
            end: [-2, 5],
            print: true
        }];

        // run all tests
        var me = this;
        tests.forEach(function(test) {
            var result = board.longestSimplePathBruteForce(test.start, test.end);

            var pass = false;
            if (test.expected && result !== null) {
        		console.log("Moves summary: " + (result.path.length - 1) + " moves");
	            console.log(result.path);
	            console.log("");	
	            pass = board.isValid(result.path, test.print);
            } else if (!test.expected) {
                pass = (result === null);
            }
            me.print("level5a", test.label, pass);
        });

        console.log(KnightBoard.GREEN, "+ LEVEL5A passed!\n", KnightBoard.BLACK);
        return true;
    },

    level5B: function() {
    	console.log(KnightBoard.BLUE, "** LEVEL 5B ** ", KnightBoard.BLACK);
    	var board = new KnightBoard(32);
        var tests = [{
            label: "no move",
            expected: true,
            start: [0, 0],
            end: [0, 0],
            print: false
        }, {
            label: "legal moves: simple",
            expected: true,
            start: [0, 0],
            end: [3, 5],
            print: false
        }, {
            label: "legal moves: end position is first node inside next quad",
            expected: true,
            start: [0, 0],
            end: [3, 4],
            print: false
        }, {
            label: "legal moves: start & end position in the same quad",
            expected: true,
            start: [0, 0],
            end: [3, 3],
            print: false
        }, {
            label: "legal moves: random location",
            expected: true,
            start: [Math.round(Math.random() * (board.size - 1)), Math.round(Math.random() * (board.size - 1))],
            end: [Math.round(Math.random() * (board.size - 1)), Math.round(Math.random() * (board.size - 1))],
            print: false
        }, {
            label: "illegal moves: outside bounds",
            expected: false,
            start: [4, 4],
            end: [-2, 5],
            print: false
        }];

        // run all tests
        var me = this;
        tests.forEach(function(test) {
            var path = board.longestSimplePath(test.start, test.end);

            var pass = false;
            if (test.expected && path !== null) {
        		console.log("Moves summary: " + (path.length - 1) + " moves");
	            pass = board.isValid(path, test.print);
            } else if (!test.expected) {
                pass = (path === null);
            }
            me.print("level5b", test.label, pass);
        });

        console.log(KnightBoard.GREEN, "+ LEVEL5B passed!\n", KnightBoard.BLACK);
        return true;
    },

    level5C: function() {
    	console.log(KnightBoard.BLUE, "** LEVEL 5C ** ", KnightBoard.BLACK);
    	var board = new KnightBoard(1024);
        var tests = [
        {
            label: "legal moves: simple",
            expected: true,
            start: [0, 0],
            end: [3, 5],
            print: false
        }, {
            label: "legal moves: end position is first node inside next quad",
            expected: true,
            start: [0, 0],
            end: [3, 4],
            print: false
        }, {
            label: "legal moves: start & end position in the same quad",
            expected: true,
            start: [0, 0],
            end: [3, 3],
            print: false
        }];

        // run all tests
        var me = this;
        tests.forEach(function(test) {
            var path = board.longestSimplePath(test.start, test.end);

            var pass = false;
            if (test.expected && path !== null) {
        		console.log("Moves summary: " + (path.length - 1) + " moves");
	            pass = board.isValid(path, test.print);
            } else if (!test.expected) {
                pass = (path === null);
            }
            me.print("level5c", test.label, pass);
        });

        console.log(KnightBoard.GREEN, "+ LEVEL5C passed!\n", KnightBoard.BLACK);
        return true;
    }
}

module.exports = test;

// run all tests
test.all();