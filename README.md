# Interview Challenge: Knight Board

###Run
	npm test

###Install
	npm install knight-board

###Example Usage
    var KnightBoard = require('knight-board');
    var board = new KnightBoard(1024);
    var path = board.longestSimplePath([0, 0], [3, 5]);
    console.log("Number of nodes: " + path.length);
