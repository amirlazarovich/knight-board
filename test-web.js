(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process){
(function() {
    // ---------------------------
    // Class: Knight Board
    // ---------------------------
    function KnightBoard(size) {
        this.size = size;
        this._cachedQuad = {};
    };

    KnightBoard.X = 0;
    KnightBoard.Y = 1;
    KnightBoard.GRAPH_PARTITION_SIZE = 4;
    KnightBoard.DEFAULT_SYMBOL = '.';
    KnightBoard.BLACK = '\x1b[0m';
    KnightBoard.RED = '\x1b[31m';
    KnightBoard.GREEN = '\x1b[32m';
    KnightBoard.YELLOW = '\x1b[33m';
    KnightBoard.BLUE = '\x1b[34m';
    KnightBoard.MAGENTA = '\x1b[35m';
    KnightBoard.CYAN = '\x1b[36m';
    KnightBoard.WHITE = '\x1b[37m';


    // ---------------------------
    // LEVEL 1
    // ---------------------------
    /**
     * Check whether given moves are valid knight-movements 
     * 
     * @param  {2d-array}   moves      an array of tuples [x, y]
     * @param  {boolean}    print      [optional] whether to print each step to stdout
     * @param  {2d-arry}    symbols    [optional] graph constraints 
     * @param  {function}   translator [optional] translate symbols into edge-weights and special conditions 
     * @return {Boolean}               whether the series of movements are valid knight-movements
     */
    KnightBoard.prototype.isValid = function(moves, print, symbols, translator) {
        var valid = true;
        if (this.isArrayEmpty(moves)) {
            return valid;
        }

        function addMove(move) {
            var column = previousMoves[move[KnightBoard.X]];
            if (column === undefined) {
                column = [];
                previousMoves[move[KnightBoard.X]] = column;
            }

            column[move[KnightBoard.Y]] = true;
        }

        // keep track of all previous moves
        var previousMoves = [];

        // get first movement
        var prev = moves.splice(0, 1)[0];
        if (print) {
            this.print(prev, symbols, true);
            addMove(prev);
        }

        // parse the rest
        var me = this;
        translator = translator || KnightBoard.DefaultTranslator;
        moves.some(function(next) {
            if (me.validNextStep(prev, next, symbols, translator)) {
                prev = next;
                if (print) {
                    me.print(next, symbols, false, previousMoves);
                }

                addMove(next);
                return false; // continue
            } else {
                valid = false;
                return true; // break
            }
        });

        return valid;
    };

    // ---------------------------
    // LEVEL 2
    // ---------------------------
    KnightBoard.prototype.getMoveSequence = function(start, end) {

        function backtrack(start, end, path) {
            if (me.equals(start, end)) {
                return true;
            }

            var candidates = createCandidates(start);
            for (var i = 0; i < candidates.length; i++) {
                var candidate = candidates[i];
                path.push(candidate);
                var finished = backtrack(candidate, end, path);
                if (finished) {
                    return true;
                }

                // bad candidate, lets remove it and continue trying
                path.pop();
            }

            return false;
        }

        function createCandidates(position) {
            var results = [];
            var x = position[KnightBoard.X];
            var y = position[KnightBoard.Y];

            // potential end positions
            var positions = [
                [x + 2, y + 1],
                [x + 2, y - 1],
                [x - 2, y - 1],
                [x - 2, y + 1],
                [x + 1, y + 2],
                [x + 1, y - 2],
                [x - 1, y - 2],
                [x - 1, y + 2]
            ];

            for (var i = 0; i < positions.length; i++) {
                var candidate = positions[i];
                if (me.withinBounds(candidate) && !visited[me.hash(candidate)]) {
                    results.push(candidate);

                    // because we're not trying to find the shortest path
                    // we can reduce the search domain and traverse each node
                    // exactly once
                    visited[me.hash(candidate)] = true;
                }
            }

            return results;
        }

        // find path using brute force backtracking
        var me = this;
        var path = [start];
        var visited = {};
        visited[this.hash(start)] = true;
        var found = backtrack(start, end, path);
        return found ? path : null;
    };

    // ---------------------------
    // LEVEL 3
    // ---------------------------
    KnightBoard.prototype.shortestPath = function(start, end) {
        if (!this.withinBounds(start) || !this.withinBounds(end)) {
            // illegal positions
            return null;
        }

        function bfs(start, end) {
            var parent = {};
            var discovered = {};
            var queue = [start];
            discovered[start.hash] = true;

            // go over all nodes in the connected component that begins with 'start'
            // traverse children first, and then go deeper
            while (queue.length > 0) {
                var node = queue.shift();
                if (node.equals(end)) {
                    // no need to continue searching, we have found our target node
                    break;
                }

                var edges = node.edges;
                if (edges) {
                    // go over all edges that haven't been discovered yet
                    // keep back-reference for each node (with its parent)
                    edges.forEach(function(key, edge) {
                        if (!discovered[edge.node.hash]) {
                            queue.push(edge.node);
                            discovered[edge.node.hash] = true;
                            parent[edge.node.hash] = node;
                        }
                    });
                }
            }

            return parent;
        }

        // create graph
        var me = this;
        var graph = this.createGraph();
        var startNode = graph[start[KnightBoard.X]][start[KnightBoard.Y]];
        var endNode = graph[end[KnightBoard.X]][end[KnightBoard.Y]];

        // find the shortest path in a non-weighted graph
        var parent = bfs(startNode, endNode);

        // invert path
        return this.invertPath(parent, startNode, endNode);
    };

    // ---------------------------
    // LEVEL 4
    // ---------------------------
    /**
     * Finds the shortest path from 'start' to 'end'
     *  
     * @param  {[type]} start      source node
     * @param  {[type]} end        target node
     * @param  {[type]} symbols    [optional] graph constraints 
     * @param  {[type]} translator [optional] translate symbols into edge-weights and special conditions 
     * @return {object}            {path: array, distance: integer} (distance from 'start' to 'end')
     */
    KnightBoard.prototype.shortestPathWithWeights = function(start, end, symbols, translator) {
        if (!this.withinBounds(start) || !this.withinBounds(end)) {
            // illegal positions
            return null;
        }

        function dijkstra(graph, start) {
            var intree = {};
            var distance = {};
            var parent = {};

            // init distance vector (for clarity)
            for (var i = 0; i < me.size; i++) {
                for (var j = 0; j < me.size; j++) {
                    var node = graph[i][j];
                    distance[node.hash] = Number.MAX_VALUE;
                }
            }

            distance[start.hash] = 0;
            var current = start;

            // go over all nodes in the connected component that begins with 'start'
            while (!intree[current.hash]) {
                intree[current.hash] = true;
                var edges = current.edges;
                if (edges) {
                    // go over all outgoing edges and update the distance table
                    // in case a shorter path was found
                    edges.forEach(function(key, edge) {
                        var next = edge.node;
                        var weight = edge.weight;
                        var candidateWeight = distance[current.hash] + weight;

                        if (distance[next.hash] > candidateWeight) {
                            distance[next.hash] = candidateWeight;
                            parent[next.hash] = current;
                        }
                    });
                }

                // find the next node, from all non-traversed nodes, that has minimum distance
                // from the root
                // TODO we can make this faster if we keep reference for min-distance
                current = start;
                var candidateDistance = Number.MAX_VALUE;
                for (var i = 0; i < me.size; i++) {
                    for (var j = 0; j < me.size; j++) {
                        var node = graph[i][j];
                        if (!intree[node.hash] && (candidateDistance > distance[node.hash])) {
                            candidateDistance = distance[node.hash];
                            current = node;
                        }
                    }
                }
            }

            return {
                parent: parent,
                distance: distance
            };
        }

        // create graph
        var me = this;
        translator = translator || KnightBoard.DefaultTranslator;
        var graph = this.createGraph(symbols, translator);
        var startNode = graph[start[KnightBoard.X]][start[KnightBoard.Y]];
        var endNode = graph[end[KnightBoard.X]][end[KnightBoard.Y]];

        // find shortest path
        var result = dijkstra(graph, startNode);

        // invert path
        return {
            path: this.invertPath(result.parent, startNode, endNode),
            distance: result.distance[endNode.hash]
        };
    };

    // ---------------------------
    // LEVEL 5
    // ---------------------------
    /**
     * High-level psuedo code
     * ======================
     *
     * [divide the graph into 4x4 quads]
     * Qcurrent := find current quad
     * Qend := find ending quad
     * Grid := create a grid-graph
     * Path := find the hamiltonian path from Qcurrent -> Qend in Grid
     * Path = Path - Qcurrent (remove the first quad from the path)
     * PathLongest := []
     * Position := start
     * for each Qnext in Path do:
     *      EndPosition := find end position inside Qcurrent based on Qnext relative location
     *      GraphQuad := create graph for Qcurrent (current quad)
     *      PathQuad := find the hamiltonian path from Position -> EndPosition in GraphQuad
     *      PathLongest += PathQuad
     *      Position = find start position inside Qnext based on Qcurrent relative location
     *      Qcurrent = Qnext
     *
     * output PathLongest
     *
     * @param  {array} start                      source node
     * @param  {array} end                        target node
     * @param  {integer} size                     [optional] graph size, if none give will use board size
     * @param  {object} overrideCandidateFactory  [optional] factory to override candidate search algorithm
     * @return {array}                            longest simple path or null if not found
     */
    KnightBoard.prototype.longestSimplePath = function(start, end, size, overrideCandidateFactory) {
        size = (size !== undefined) ? size : this.size;
        if (!this.withinBounds(start) || !this.withinBounds(end) || size % KnightBoard.GRAPH_PARTITION_SIZE !== 0) {
            // illegal positions / board size
            if (size % KnightBoard.GRAPH_PARTITION_SIZE !== 0) {
                console.log("[WARN] Board size must be a multiple of " + KnightBoard.GRAPH_PARTITION_SIZE + ", received: " + size);
            }

            return null;
        }

        function createCandidates(position, visited, size) {
            var results = [];
            var x = position[KnightBoard.X];
            var y = position[KnightBoard.Y];

            var positions = [
                [x + 1, y],
                [x - 1, y],
                [x, y + 1],
                [x, y - 1],

                // give less priority to diagonals                 
                [x + 1, y + 1],
                [x - 1, y - 1],
                [x + 1, y - 1],
                [x - 1, y + 1]
            ];

            for (var i = 0; i < positions.length; i++) {
                var candidate = positions[i];
                if (me.withinBounds(candidate, size) && !visited[me.hash(candidate)]) {
                    results.push(candidate);
                }
            }

            return results;
        }

        var overrideCreateCandidates = (overrideCandidateFactory !== undefined) ? overrideCandidateFactory.createCandidates : undefined;
        var getPosition = (overrideCandidateFactory !== undefined) ? overrideCandidateFactory.getPosition : function(current, end, beforeLast, endPosition) {
            var positions = [];
            var x0 = current[KnightBoard.X];
            var y0 = current[KnightBoard.Y];
            var x1 = end[KnightBoard.X];
            var y1 = end[KnightBoard.Y];
            var xE = endPosition[KnightBoard.X];
            var yE = endPosition[KnightBoard.Y];

            // TODO: i'm losing few vertices here
            // need to improve selections based on x0, y0
            // also this looks ugly...
            if (x1 > x0) {
                if (y1 > y0) {
                    // down-right
                    if (beforeLast && xE === 0 && yE === 0 && x0 !== 3 && y0 !== 3) {
                        positions.push([3, 3], [0, 1]);
                    } else if (x0 !== 3 || y0 !== 2) {
                        positions.push([3, 2], [0, 0]);
                    } else {
                        positions.push([2, 3], [0, 0]);
                    }
                } else if (y1 < y0) {
                    // down-left
                    if (beforeLast && xE === 0 && yE === 3 && x0 !== 3 && y0 !== 0) {
                        positions.push([3, 0], [0, 2]);
                    } else if (x0 !== 2 || y0 !== 0) {
                        positions.push([2, 0], [0, 3]);
                    } else {
                        positions.push([3, 1], [0, 3]);
                    }
                } else {
                    // down
                    if (beforeLast && xE === 0 && yE === 0) {
                        if (x0 !== 3 || y0 !== 1) {
                            positions.push([3, 1], [0, 3]);
                        } else {
                            positions.push([2, 2], [0, 3]);
                        }
                    } else if (x0 !== 3 || y0 !== 2) {
                        positions.push([3, 2], [0, 0]);
                    } else {
                        positions.push([2, 1], [0, 0]);
                    }
                }
            } else if (x1 < x0) {
                if (y1 > y0) {
                    // up-right
                    if (beforeLast && xE === 3 && yE === 0 && x0 !== 0 && y0 !== 3) {
                        positions.push([0, 3], [2, 0]);
                    } else if (x0 !== 0 || y0 !== 2) {
                        positions.push([0, 2], [3, 0]);
                    } else {
                        positions.push([1, 3], [3, 0]);
                    }
                } else if (y1 < y0) {
                    // up-left
                    if (beforeLast && xE === 3 && yE === 3 && x0 !== 0 && y0 !== 0) {
                        positions.push([0, 0], [3, 2]);
                    } else if (x0 !== 0 || y0 !== 1) {
                        positions.push([0, 1], [3, 3]);
                    } else {
                        positions.push([1, 0], [3, 3]);
                    }
                } else {
                    // up
                    if (beforeLast && xE === 3 && yE === 0) {
                        if (x0 !== 0 || y0 !== 3) {
                            positions.push([0, 3], [3, 1]);
                        } else {
                            positions.push([1, 0], [3, 1]);
                        }
                    } else if (x0 !== 0 || y0 !== 2) {
                        positions.push([0, 2], [3, 0]);
                    } else {
                        positions.push([1, 1], [3, 0]);
                    }
                }
            } else if (y1 > y0) {
                // right
                if (beforeLast && xE === 0 && yE === 0) {
                    if (x0 !== 1 || y0 !== 3) {
                        positions.push([1, 3], [3, 0]);
                    } else {
                        positions.push([2, 2], [3, 0]);
                    }
                } else if (x0 !== 1 || y0 !== 2) {
                    positions.push([1, 2], [0, 0]);
                } else {
                    positions.push([2, 3], [0, 0]);
                }
            } else {
                // left
                if (beforeLast && xE === 0 && yE === 3) {
                    if (x0 !== 3 || y0 !== 0) {
                        positions.push([3, 0], [1, 3]);
                    } else {
                        positions.push([0, 1], [1, 3]);
                    }
                } else if (x0 !== 2 || y0 !== 0) {
                    positions.push([2, 0], [0, 3]);
                } else {
                    positions.push([1, 1], [0, 3]);
                }
            }

            return positions;
        }

        // try to find the longest simple path
        var me = this;
        var qCurrent = this.findPartition(start);
        var qEnd = this.findPartition(end);
        var isCycle = this.equals(qCurrent, qEnd);
        var gridPath;
        if (size / KnightBoard.GRAPH_PARTITION_SIZE > KnightBoard.GRAPH_PARTITION_SIZE) {
            // * recursize call *
            // solving the longest simple path for big grids is hard,
            // an easier approach would be to divide and conquer and solve 
            // first on smaller grids and later merge the results 
            gridPath = this.longestSimplePath(qCurrent, qEnd, size / KnightBoard.GRAPH_PARTITION_SIZE, {
                createCandidates: createCandidates,
                getPosition: function(current, end, beforeLast, endPosition) {
                    var positions = [];
                    var x0 = current[KnightBoard.X];
                    var y0 = current[KnightBoard.Y];
                    var x1 = end[KnightBoard.X];
                    var y1 = end[KnightBoard.Y];

                    // TODO this looks ugly as well...
                    if (x1 > x0) {
                        if (y1 > y0) {
                            // down-right
                            positions.push([3, 3], [0, 0]);
                        } else if (y1 < y0) {
                            // down-left
                            positions.push([3, 0], [0, 3]);
                        } else {
                            // down
                            if (x0 !== 3 || y0 !== 1) {
                                positions.push([3, 1], [0, 1]);
                            } else {
                                positions.push([3, 2], [0, 2]);
                            }
                        }
                    } else if (x1 < x0) {
                        if (y1 > y0) {
                            // up-right
                            positions.push([0, 3], [3, 0]);
                        } else if (y1 < y0) {
                            // up-left
                            positions.push([0, 0], [3, 3]);
                        } else {
                            // up
                            if (x0 !== 0 || y0 !== 1) {
                                positions.push([0, 1], [3, 1]);
                            } else {
                                positions.push([0, 2], [3, 2]);
                            }
                        }
                    } else if (y1 > y0) {
                        // right
                        if (x0 !== 1 || y0 !== 3) {
                            positions.push([1, 3], [1, 0]);
                        } else {
                            positions.push([2, 3], [2, 0]);
                        }
                    } else {
                        // left
                        if (x0 !== 1 || y0 !== 0) {
                            positions.push([1, 0], [1, 3]);
                        } else {
                            positions.push([2, 0], [2, 3]);
                        }
                    }

                    return positions;
                }
            });

            // reformat grid
            if (gridPath !== null) {
                gridPath = {
                    path: gridPath,
                    hamiltonian: true
                };
            }
        } else {
            gridPath = this.longestSimplePathBruteForce(qCurrent, qEnd, size / KnightBoard.GRAPH_PARTITION_SIZE, createCandidates);
        }

        // check that we have found a hamiltonian path
        if (gridPath === null || !gridPath.hamiltonian) {
            console.log("[WARN] couldn't find hamiltonian path in grid - about to fail...");
            return null;
        }

        gridPath = gridPath.path;
        var longestPath = [];
        var longestPathLength = 0;
        var cycleNodeOut;
        var cycleNodeIn;

        // normalize start/end positions
        var currentPosition = [start[KnightBoard.X] % KnightBoard.GRAPH_PARTITION_SIZE, start[KnightBoard.Y] % KnightBoard.GRAPH_PARTITION_SIZE];
        var endPosition = [end[KnightBoard.X] % KnightBoard.GRAPH_PARTITION_SIZE, end[KnightBoard.Y] % KnightBoard.GRAPH_PARTITION_SIZE];
        for (var i = 0; i < gridPath.length; i++) {
            qCurrent = gridPath[i];
            var qNext = gridPath[i + 1];

            var nextPosition;
            if (qNext === undefined) {
                // last move
                // normalize end position
                nextPosition = [endPosition];
            } else {
                var beforeLast = (gridPath[i + 2] === undefined);
                nextPosition = getPosition(qCurrent, qNext, beforeLast, endPosition);
            }

            var quadPath = this._cachedQuad[this.hash(currentPosition) + this.hash(nextPosition[0]) + ((overrideCreateCandidates !== undefined) ? "O" : "")];
            if (quadPath === undefined) {
                quadPath = this.longestSimplePathBruteForce(currentPosition, nextPosition[0], KnightBoard.GRAPH_PARTITION_SIZE, overrideCreateCandidates);

                // cache quad for later use
                this._cachedQuad[this.hash(currentPosition) + this.hash(nextPosition[0]) + ((overrideCreateCandidates !== undefined) ? "O" : "")] = quadPath;
            }

            // validate path
            if (quadPath === null) {
                console.log("[ERROR] couldn't calculate quad");
                return null;
            }

            // record cycle node in/out
            // later we will use these nodes to fix duplicate values caused by the cycle
            if (isCycle) {
                if (i === 1) {
                    cycleNodeOut = longestPathLength;
                } else if (qNext === undefined) {
                    cycleNodeIn = longestPathLength - 1;
                }
            }

            // append path
            longestPathLength += quadPath.path.length;
            longestPath.push({
                path: quadPath.path,
                xFactor: (qCurrent[KnightBoard.X] * KnightBoard.GRAPH_PARTITION_SIZE),
                yFactor: (qCurrent[KnightBoard.Y] * KnightBoard.GRAPH_PARTITION_SIZE)
            });

            // update current position
            currentPosition = nextPosition[1];
        }

        // denormalize positions
        var result = [];
        longestPath.forEach(function(partition) {
            partition.path.forEach(function(node) {
                result.push([node[KnightBoard.X] + partition.xFactor, node[KnightBoard.Y] + partition.yFactor]);
            });
        });

        if (isCycle) {
            var isKnightMovement = (overrideCreateCandidates === undefined);
            return this.fixCycle(result, start, end, cycleNodeOut, cycleNodeIn, isKnightMovement);
        } else {
            return result;
        }
    };


    // ---------------------------
    // UTILS
    // ---------------------------
    KnightBoard.DefaultTranslator = function(symbol) {
        symbol = (symbol !== undefined) ? symbol : KnightBoard.DEFAULT_SYMBOL;
        if (isNaN(symbol)) {
            switch (symbol.toLowerCase()) {
                case 't':
                    return {
                        weight: 0,
                        teleport: true
                    };

                case 'r':
                    return {
                        weight: Number.MAX_VALUE,
                        noStop: true
                    };

                case "b":
                    return {
                        weight: Number.MAX_VALUE,
                        noCross: true,
                        noStop: true
                    };

                case 'w':
                    return {
                        weight: 2
                    };

                case 'l':
                    return {
                        weight: 5
                    };

                case '.':
                    return {
                        weight: 1
                    };

                default:
                    console.log("[WARN] unsupported weight symbol: " + weight);
                    return {
                        weight: 1
                    };
            }
        } else {
            return {
                weight: symbol
            };
        }
    };

    /**
     * Create a graph
     * 
     * @param  {2d-array} symbols          [optional] graph constraints 
     * @param  {function} translator       [optional] translate symbols into edge-weights and special conditions 
     * @param  {function} createCandidates [optional] override candidate search algorithm
     * @param  {Integer} size              [optional] graph size, if none give will use board size
     * @return {2d-array}                  graph represented by a 2d array
     */
    KnightBoard.prototype.createGraph = function(symbols, translator, createCandidates, size) {

        function getColumn(x) {
            var column = graph[x];
            if (column === undefined) {
                column = [];
                graph[x] = column;
            }

            return column;
        }

        function createNode(graph, x, y, symbols, translator) {
            var symbol = me.symbolAt(x, y, symbols);
            var node = new Node(x, y, symbol, translator);
            var column = getColumn(x);
            column[y] = node;
            return node;
        }

        function teleport(x, y) {
            if (teleportMapper === undefined) {
                teleportMapper = [];
                for (var i = 0; i < symbols.length; i++) {
                    for (var j = 0; j < symbols.length; j++) {
                        var symbol = symbols[i][j];
                        if (isNaN(symbol) && symbol.toLowerCase() === "t") {
                            teleportMapper.push([i, j]);
                        }
                    }
                }
            }

            // filter array
            return teleportMapper.filter(function(node) {
                return !(node[0] === x && node[1] === y);
            });
        }

        createCandidates = createCandidates || function(x, y, config) {
            var results = [];
            if (config.noStop) {
                return results;
            }

            var positions = [
                [x + 2, y + 1],
                [x + 2, y - 1],
                [x - 2, y - 1],
                [x - 2, y + 1],
                [x + 1, y + 2],
                [x + 1, y - 2],
                [x - 1, y - 2],
                [x - 1, y + 2]
            ];

            if (config.teleport) {
                positions = positions.concat(teleport(x, y));
            }

            for (var i = 0; i < positions.length; i++) {
                var candidate = positions[i];
                if (me.validNextStep([x, y], candidate, symbols, translator)) {
                    results.push(candidate);
                }
            }

            return results;
        };

        var me = this;
        size = (size !== undefined) ? size : this.size;
        var graph = [];
        var teleportMapper = undefined;
        translator = translator || KnightBoard.DefaultTranslator;


        // for each node find its edges and add weighted reference in both ends 
        for (var i = 0; i < size; i++) {
            var column = getColumn(i);

            for (var j = 0; j < size; j++) {
                var node = column[j];
                if (node === undefined) {
                    node = this.createNode(graph, i, j, symbols, translator);
                }

                var candidates = createCandidates(i, j, node.config);
                for (var k = 0; k < candidates.length; k++) {
                    var candidate = candidates[k];
                    var x = candidate[KnightBoard.X];
                    var y = candidate[KnightBoard.Y];

                    var candidateColumn = getColumn(x);
                    var candidateNode = candidateColumn[y];
                    if (candidateNode === undefined) {
                        candidateNode = this.createNode(graph, x, y, symbols, translator);
                    }

                    // add bi-directional unique edge 
                    node.addEdge(new Edge(candidateNode, candidateNode.config.weight));
                    candidateNode.addEdge(new Edge(node, node.config.weight));
                }
            }
        }

        return graph;
    };

    /**
     * High-level psuedo code
     * =======================
     *
     * backtrack: O(n!)
     * S := [source node]
     * T := [target node]
     * L := 0 (path length)
     * P := null (path)
     * 
     * for each n! option
     *     Li := length at option i
     *     Pi := path from S to T at option i
     *     if Li > L
     *         L = Li
     *         P = Pi
     *  output L, P
     * 
     * @param  {[type]} start               source node
     * @param  {[type]} end                 target node
     * @param  {[type]} size                [optional] graph size, if none give will use board size
     * @param  {function} createCandidates  [optional] override candidate search algorithm
     * @return {object}                     {hamiltonian: boolean, path: array}
     */
    KnightBoard.prototype.longestSimplePathBruteForce = function(start, end, size, createCandidates) {
        size = (size !== undefined) ? size : this.size;
        if (!this.withinBounds(start, size) || !this.withinBounds(end, size)) {
            // illegal positions / size
            return null;
        }

        function backtrack(start, end, path, visited, height) {
            if (me.equals(start, end)) {
                if (path.length > finalPath.length) {
                    finalPath = me.copyPath(path);
                }

                return (path.length === (size * size));
            }

            visited[me.hash(start)] = true;
            var candidates = createCandidates(start, visited, size);
            for (var i = 0; i < candidates.length; i++) {
                var candidate = candidates[i];
                path.push(candidate);
                var finished = backtrack(candidate, end, path, me.copyObj(visited), height + 1);
                if (finished) {
                    return true;
                }

                // bad candidate, lets remove it and continue trying
                path.pop();
            }

            return false;
        }

        createCandidates = createCandidates || function(position, visited, size) {
            var results = [];
            var x = position[KnightBoard.X];
            var y = position[KnightBoard.Y];

            var positions = [
                [x + 2, y + 1],
                [x + 2, y - 1],
                [x - 2, y - 1],
                [x - 2, y + 1],
                [x + 1, y + 2],
                [x + 1, y - 2],
                [x - 1, y - 2],
                [x - 1, y + 2]
            ];

            for (var i = 0; i < positions.length; i++) {
                var candidate = positions[i];
                if (me.withinBounds(candidate, size) && !visited[me.hash(candidate)]) {
                    results.push(candidate);
                }
            }

            return results;
        };

        var me = this;
        var finalPath = [];
        var hamiltonian;
        if (this.equals(start, end) && size > 1) {
            // find longest cycle
            var neighbors = createCandidates(start, {});
            for (var i = 0; i < neighbors.length; i++) {
                var neighbor = neighbors[i];
                hamiltonian = backtrack(start, neighbor, [start], {}, 0);

                if (finalPath.length !== 0) {
                    // found path. Append starting node to make this a cycle
                    finalPath.push(start);
                    break;
                }
            }
        } else {
            // find longest path
            hamiltonian = backtrack(start, end, [start], {}, 0);
        }

        if (finalPath.length === 0) {
            // no such path/cycle exists
            return null;
        }

        return {
            hamiltonian: hamiltonian,
            path: finalPath
        };
    };

    KnightBoard.prototype.isArrayEmpty = function(array) {
        return (array === undefined || array === null || array.length === 0);
    };

    KnightBoard.prototype.symbolAt = function(x, y, symbols) {
        var value = KnightBoard.DEFAULT_SYMBOL;
        if (symbols) {
            var column = symbols[x];
            if (column) {
                value = column[y];
            }
        }

        return value;
    };

    KnightBoard.prototype.checkCrossingPath = function(x0, y0, x1, y1, symbols, translator) {
        var xStep = ((x1 - x0) > 0) ? 1 : -1;
        var yStep = ((y1 - y0) > 0) ? 1 : -1;

        for (var x = x0; x != x1 + xStep; x += xStep) {
            for (var y = y0; y != y1 + yStep; y += yStep) {
                if ((x === x0 && y === y0) || (x === x1 && y === y1)) {
                    continue;
                }

                var symbol = this.symbolAt(x, y, symbols);
                var config = translator(symbol);
                if (config.noCross) {
                    return false;
                }
            }
        }

        return true;
    };

    KnightBoard.prototype.validNextStep = function(start, end, symbols, translator) {
        var x0 = start[KnightBoard.X];
        var y0 = start[KnightBoard.Y];
        var x1 = end[KnightBoard.X];
        var y1 = end[KnightBoard.Y];

        var valid = this.withinBounds(end);
        var isTeleport = false;
        if (valid && symbols) {
            // check for: 
            // 1. no stopping
            // 2. no crossing
            // 3. teleporting
            var symbol1 = this.symbolAt(x1, y1, symbols);
            var config1 = translator(symbol1);
            valid = !config1.noStop;

            if (valid) {
                var symbol0 = this.symbolAt(x0, y0, symbols);
                var config0 = translator(symbol0);
                isTeleport = config0.teleport && config1.teleport;
                valid = isTeleport || this.checkCrossingPath(x0, y0, x1, y1, symbols, translator);
            }
        }

        var deltaX = Math.abs(x0 - x1);
        var deltaY = Math.abs(y0 - y1);
        return valid && (isTeleport || (deltaX === 2 && deltaY === 1) || (deltaX === 1 && deltaY === 2));
    };

    KnightBoard.prototype.withinBounds = function(position, size) {
        size = (size !== undefined) ? size : this.size;
        return (position[KnightBoard.X] < size) && (position[KnightBoard.X] >= 0) && (position[KnightBoard.Y] < size) && (position[KnightBoard.Y] >= 0);
    };

    KnightBoard.prototype.print = function(position, symbols, firstMove, previousMoves) {
        console.log("Knight " + (firstMove ? "begins at: (" : "to: (") + position[KnightBoard.X] + ", " + position[KnightBoard.Y] + ")");
        var output = "";
        for (var y = 0; y < this.size; y++) {
            for (var x = 0; x < this.size; x++) {
                if (x === position[KnightBoard.X] && y === position[KnightBoard.Y]) {
                    output += "K ";
                    // process.stdout.write(KnightBoard.RED + "K " + KnightBoard.BLACK);
                } else {
                    if (previousMoves && previousMoves[x] && previousMoves[x][y]) {
                        output += "ø ";
                        // process.stdout.write(KnightBoard.RED + "ø " + KnightBoard.BLACK);
                    } else if (symbols) {
                        if (symbols[x][y] === ".") {
                            output += symbols[x][y] + " ";
                            // process.stdout.write(symbols[x][y] + " ");
                        } else {
                            output += symbols[x][y] + " ";
                            // process.stdout.write(KnightBoard.CYAN + symbols[x][y] + " " + KnightBoard.BLACK);
                        }
                    } else {
                        output += ". ";
                        // process.stdout.write(". ");
                    }
                }
            }
            output += "\n";
            // process.stdout.write("\n");
        }

        console.log(output);
        // process.stdout.write("\n");
    };

    KnightBoard.prototype.printGraph = function(graph, size) {
        size = (size !== undefined) ? size : this.size;
        var output = "";
        for (var y = 0; y < size; y++) {
            for (var x = 0; x < size; x++) {
                var node = (graph[x] !== undefined) ? graph[x][y] : undefined;
                if (node === undefined) {
                    output += "X ";
                    // process.stdout.write("X ");
                } else {
                    output += node.symbol + " ";
                    // process.stdout.write(node.symbol + " ");
                }
            }

            output += "\n";
            // process.stdout.write("\n");
        }

        console.log(output);
        // process.stdout.write("\n");
    };

    KnightBoard.prototype.equals = function(pos1, pos2) {
        return (pos1[KnightBoard.X] === pos2[KnightBoard.X]) && (pos1[KnightBoard.Y] === pos2[KnightBoard.Y]);
    };

    KnightBoard.prototype.hash = function(position) {
        return position[KnightBoard.X] + ":" + position[KnightBoard.Y];
    };

    KnightBoard.prototype.invertPath = function(parent, start, end) {
        var path = [];
        var next = end;
        while (next !== undefined) {
            path.unshift([next.x, next.y]);
            next = parent[next.hash];
        }

        if (path[0][KnightBoard.X] !== start.x || path[0][KnightBoard.Y] !== start.y) {
            // didn't find a path
            path = null
        }

        return path;
    };

    KnightBoard.prototype.copyObj = function(obj) {
        if (null == obj || "object" != typeof obj) {
            return obj;
        }

        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }

        return copy;
    };

    KnightBoard.prototype.copyPath = function(path) {
        var copy = [];
        if (path.length === 0) {
            return copy;
        }

        path.forEach(function(item) {
            if (item instanceof Array) {
                copy.push(item.slice());
            } else {
                copy.push(item.clone());
            }
        });

        return copy;
    };

    KnightBoard.prototype.findPartition = function(position) {
        if (position === undefined) {
            return null;
        }

        var x = Math.floor(position[KnightBoard.X] / KnightBoard.GRAPH_PARTITION_SIZE);
        var y = Math.floor(position[KnightBoard.Y] / KnightBoard.GRAPH_PARTITION_SIZE);
        return [x, y];
    };


    KnightBoard.prototype.getColumn = function(graph, x) {
        var column = graph[x];
        if (column === undefined) {
            column = [];
            graph[x] = column;
        }

        return column;
    };

    KnightBoard.prototype.createNode = function(graph, x, y, symbols, translator) {
        var symbol = this.symbolAt(x, y, symbols);
        var node = new Node(x, y, symbol, translator);
        var column = this.getColumn(graph, x);
        column[y] = node;
        return node;
    };

    /**
     * Fix cycle in path by creating a graph from the first partition and the
     * two nodes that connect the partition with the rest of the graph
     * 
     * @param  {array} path              the path with the cycle
     * @param  {array} start             source node
     * @param  {array} end               target node
     * @param  {integer} cycleNodeOut    outgoing connecting partition node index
     * @param  {integer} cycleNodeIn     incoming connecting partition node index 
     * @param  {boolean} knightMovements whether using knight-movements or grid-movements
     * @return {array}                   fixed path (may contain a cycle for intermediate steps)
     */
    KnightBoard.prototype.fixCycle = function(path, start, end, cycleNodeOut, cycleNodeIn, knightMovements) {
        function createCandidates(position, graph) {
            var results = [];
            var x = position[KnightBoard.X];
            var y = position[KnightBoard.Y];

            var positions;
            if (knightMovements) {
                positions = [
                    [x + 2, y + 1],
                    [x + 2, y - 1],
                    [x - 2, y - 1],
                    [x - 2, y + 1],
                    [x + 1, y + 2],
                    [x + 1, y - 2],
                    [x - 1, y - 2],
                    [x - 1, y + 2]
                ];
            } else {
                positions = [
                    [x + 1, y],
                    [x - 1, y],
                    [x, y + 1],
                    [x, y - 1],

                    // give less priority to diagonals                 
                    [x + 1, y + 1],
                    [x - 1, y - 1],
                    [x + 1, y - 1],
                    [x - 1, y + 1]
                ];
            }

            for (var i = 0; i < positions.length; i++) {
                var candidate = positions[i];
                var column = graph[candidate[0]];
                if (column !== undefined) {
                    candidate = column[candidate[1]];
                    if (candidate !== undefined) {
                        results.push(candidate);
                    }
                }
            }

            return results;
        }

        function backtrack(start, end, path, visited, height) {
            if (start.equals(end)) {
                if (path.length > finalPath.length) {
                    finalPath = me.copyPath(path);
                }

                return (path.length === graphSize);
            }

            visited[start.hash] = true;
            var finished = false;
            start.edges.some(function(key, edge) {
                var candidate = edge.node;
                if (visited[candidate.hash]) {
                    // continue
                    return false;
                }

                path.push([candidate.x, candidate.y]);
                finished = backtrack(candidate, end, path, me.copyObj(visited), height + 1);
                if (finished) {
                    // stop
                    return true;
                }

                // bad candidate, lets remove it and continue trying
                path.pop();
            });

            return finished;
        }

        var me = this;
        var nodeOut = path[cycleNodeOut];
        var nodeIn = path[cycleNodeIn];
        var quad = path.slice(0, cycleNodeOut);

        // construct a graph from quad, nodeOut, nodeIn
        var graphSize = quad.length + 2;
        var graph = [];
        var nodeOutObj = this.createNode(graph, nodeOut[KnightBoard.X], nodeOut[KnightBoard.Y]);
        var nodeInObj = this.createNode(graph, nodeIn[KnightBoard.X], nodeIn[KnightBoard.Y]);

        // add all nodes inside quad
        var endNodeFound = false;
        quad.forEach(function(node) {
            var nodeObj = me.createNode(graph, node[KnightBoard.X], node[KnightBoard.Y]);
            endNodeFound |= (nodeObj.x === end[KnightBoard.X] && nodeObj.y === end[KnightBoard.Y]);
        });

        if (!endNodeFound) {
            graphSize++;
            this.createNode(graph, end[KnightBoard.X], end[KnightBoard.Y]);
        }

        // add edges
        nodeOutObj.addEdge(new Edge(nodeInObj, nodeInObj.config.weight));
        quad.forEach(function(node) {
            var nodeObj = graph[node[KnightBoard.X]][node[KnightBoard.Y]];
            var candidates = createCandidates(node, graph);
            for (var i = 0; i < candidates.length; i++) {
                var candidate = candidates[i];

                if (candidate.equals(nodeOutObj)) {
                    // only outgoing edges
                    nodeObj.addEdge(new Edge(candidate, candidate.config.weight));
                } else if (candidate.equals(nodeInObj)) {
                    // only incoming edges
                    candidate.addEdge(new Edge(nodeObj, nodeObj.config.weight));
                } else {
                    nodeObj.addEdge(new Edge(candidate, candidate.config.weight));
                    candidate.addEdge(new Edge(nodeObj, nodeObj.config.weight));
                }
            }
        });

        var finalPath = [];
        var startNode = graph[start[KnightBoard.X]][start[KnightBoard.Y]];
        var endNode = graph[end[KnightBoard.X]][end[KnightBoard.Y]];

        if (startNode.equals(endNode)) {
            // find longest cycle
            // up in the recursion we will fix the cycle
            startNode.edges.some(function(key, edge) {
                backtrack(startNode, edge.node, [start], {}, 0);

                if (finalPath.length !== 0) {
                    // found path. Append starting node to make this a cycle
                    finalPath.push(start);
                    return true; // break
                }

                return false; // continue
            });
        } else {
            // find longest path
            backtrack(startNode, endNode, [start], {}, 0);
        }

        // find the index of the node in the next quad
        var finalNodeOut;
        for (var i = 0; i < finalPath.length; i++) {
            var node = finalPath[i];
            if (me.equals(node, nodeOut)) {
                finalNodeOut = i;
                break;
            }
        }

        // assemble all the pieces and return the fixed path 
        var middle = path.slice(cycleNodeOut + 1, cycleNodeIn);
        var prefix = finalPath.slice(0, finalNodeOut + 1);
        var suffix = finalPath.slice(finalNodeOut + 1, finalPath.length);
        return prefix.concat(middle).concat(suffix);
    };

    // ---------------------------
    // Class: Map
    // ---------------------------
    function Map() {
        this.length = 0;
        this.map = {};
        this.keys = [];
    }

    Map.prototype.put = function(index, data) {
        var existingData = this.map[index];
        if (data !== undefined && data !== null && (existingData === undefined || existingData === null)) {
            this.map[index] = data;
            this.length++;
            this.keys.push(index);
        }
    };

    Map.prototype.forEach = function(func) {
        var me = this;
        this.keys.forEach(function(key) {
            func(key, me.map[key]);
        });
    };

    Map.prototype.some = function(func) {
        var me = this;
        this.keys.some(function(key) {
            return func(key, me.map[key]);
        });
    };

    Map.prototype.exists = function(index) {
        return (this.map[index] !== undefined && this.map[index] !== null);
    };

    // ---------------------------
    // Class: Node
    // ---------------------------
    function Node(x, y, symbol, translator) {
        this.x = x;
        this.y = y;
        this.symbol = symbol || KnightBoard.DEFAULT_SYMBOL;
        this.edges = null;
        this.hash = x + ":" + y;

        // set configuration
        translator = translator || KnightBoard.DefaultTranslator;
        this.config = translator(symbol);
    }

    Node.prototype.addEdge = function(edge) {
        if (this.edges === null) {
            this.edges = new Map();
        }

        this.edges.put(edge.hash(), edge);
    };

    Node.prototype.hasEdge = function(edge) {
        return (this.edges !== null) && this.edges.exists(edge.hash());
    };

    Node.prototype.equals = function(node) {
        return this.x === node.x && this.y === node.y;
    };

    Node.prototype.clone = function() {
        return new Node(this.x, this.y, this.symbol /*, this.translator*/ );
    };

    // ---------------------------
    // Class: Edge
    // ---------------------------
    function Edge(node, weight) {
        this.node = node;
        this.weight = weight;
    }

    Edge.prototype.hash = function() {
        return this.node.x + ":" + this.node.y;
    };

    // export module
    module.exports = KnightBoard;
})();

}).call(this,require('_process'))
},{"_process":3}],2:[function(require,module,exports){
var KnightBoard = require('./index');

// ---------------------------
// Test
// ---------------------------
var test = {
	all: function() {
		console.log("Testing Knight Board Challenge...");

		this.level1A();
		this.level2();
		this.level3();
		this.level1B();
		this.level4();
		this.level5A();
		this.level5B();	
		this.level5C();

		console.log("All tests completed successfully :)");
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
            console.log("TEST FAILED!");
            throw "TEST: [" + level + "] " + msg + ": FAIL";
        } else {
            console.log("\nTEST: [" + level + "] " + msg + ": PASS");
            console.log("--------------------------------------------------------\n");
        }

        return pass;
    },

    level1A: function() {
    	console.log("** LEVEL 1A ** ");
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
            var start = Date.now();
            var pass = test.expected === board.isValid(test.moves, test.print);
            var time = Date.now() - start;
            me.print("level1a", test.label + " (took: " + time + "ms)", pass);
        });

        console.log("+ LEVEL1A passed!\n");
        return true;
    },

    level1B: function() {
    	console.log("** LEVEL 1B ** ");
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
            var start = Date.now();
            var pass = test.expected === board.isValid(test.moves, test.print, test.symbols);
            var time = Date.now() - start;
            me.print("level1b", test.label + " (took: " + time + "ms)", pass);
        });

        console.log("+ LEVEL1B passed!\n");
        return true;
    },

    level2: function() {
    	console.log("** LEVEL 2 ** ");
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
            var start = Date.now();
            var path = board.getMoveSequence(test.start, test.end);
            var time = Date.now() - start;

            var pass;
            if (test.expected) {
            	console.log("Moves summary: ");
	            console.log(path);
	            console.log("");
                pass = (path !== null) && board.isValid(path, test.print);
            } else {
                pass = (path === null);
            }
            me.print("level2", test.label + " (took: " + time + "ms)", pass);
        });

        console.log("+ LEVEL2 passed!\n");
        return true;
    },

    level3: function() {
    	console.log("** LEVEL 3 ** ");
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
            var start = Date.now();
            var path = board.shortestPath(test.start, test.end);
            var time = Date.now() - start;
            
            var pass = false;
            if (test.expected && path !== null) {
        		console.log("Moves summary: " + (path.length - 1) + " moves");
	            console.log(path);
	            console.log("");	
	            pass = board.isValid(path, test.print);
            } else if (!test.expected) {
                pass = (path === null);
            }
            me.print("level3", test.label + " (took: " + time + "ms)", pass);
        });

        console.log("+ LEVEL3 passed!\n");
        return true;
    },

    level4: function() {
    	console.log("** LEVEL 4 ** ");
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
            var start = Date.now();
            var result = board.shortestPathWithWeights(test.start, test.end, test.symbols);
            var time = Date.now() - start;

            var pass;
            if (test.expected && result !== null) {
            	console.log("Moves summary: " + result.distance + " total weights");
	            console.log(result.path);
	            console.log("");
                pass = board.isValid(result.path, test.print, test.symbols);
            } else if (!test.expected) {
                pass = (result === null);
            }
            me.print("level4", test.label + " (took: " + time + "ms)", pass);
        });

        console.log("+ LEVEL4 passed!\n");
        return true;
    },

    level5A: function() {
    	console.log("** LEVEL 5A ** ");
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
            var start = Date.now();
            var result = board.longestSimplePathBruteForce(test.start, test.end);
            var time = Date.now() - start;

            var pass = false;
            if (test.expected && result !== null) {
        		console.log("Moves summary: " + (result.path.length - 1) + " moves");
	            console.log(result.path);
	            console.log("");	
	            pass = board.isValid(result.path, test.print);
            } else if (!test.expected) {
                pass = (result === null);
            }
            me.print("level5a", test.label + " (took: " + time + "ms)", pass);
        });

        console.log("+ LEVEL5A passed!\n");
        return true;
    },

    level5B: function() {
    	console.log("** LEVEL 5B ** ");
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
            var start = Date.now();
            var path = board.longestSimplePath(test.start, test.end);
            var time = Date.now() - start;

            var pass = false;
            if (test.expected && path !== null) {
        		console.log("Moves summary: " + (path.length - 1) + " moves");
	            pass = board.isValid(path, test.print);
            } else if (!test.expected) {
                pass = (path === null);
            }
            me.print("level5b", test.label + " (took: " + time + "ms)", pass);
        });

        console.log("+ LEVEL5B passed!\n");
        return true;
    },

    level5C: function() {
    	console.log("** LEVEL 5C ** ");
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
            var start = Date.now();
            var path = board.longestSimplePath(test.start, test.end);
            var time = Date.now() - start;

            var pass = false;
            if (test.expected && path !== null) {
        		console.log("Moves summary: " + (path.length - 1) + " moves");
	            pass = board.isValid(path, test.print);
            } else if (!test.expected) {
                pass = (path === null);
            }
            me.print("level5c", test.label + " (took: " + time + "ms)", pass);
        });

        console.log("+ LEVEL5C passed!\n");
        return true;
    }
}

module.exports = test;

// run all tests
test.all();
},{"./index":1}],3:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[2]);
