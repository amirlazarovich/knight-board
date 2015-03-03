# Cruise Interview Challenge: Knight Board

###Run
	npm test

###Example Usage
    var KnightBoard = require('knight-board');
    var board = new KnightBoard(1024);
    var path = board.longestSimplePath([0, 0], [3, 5]);
    console.log(path);