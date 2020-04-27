import { RecBacktrNode, KruskalNode, EllerNode } from './nodes.js';

const MAZE_VIZ_TYPE = {
    PATH: "#FFFFFF",
    TRACEBACK: "#FF0000"
}

// Recursive Backtracking
export class RecursiveBacktracking {
    constructor(gridClass) {
        this.gridClass = gridClass;
        this.grid = this.gridClass.grid;
        this.stepsTaken = [];

        // this.numOfCells = this.getNumOfSquareCells(this.gridClass.gridSizeX, this.gridClass.gridSizeY);
        this.numOfCells = this.getNumOfHexCells(this.gridClass.gridSizeX, this.grid[0].length);

    }

    addToStepsTaken = (node, type) => {
        let step = {
            node: node,
            type: type
        };
        this.stepsTaken.push(step);
    }

    getNode = (x, y) => this.grid[x][y];

    getNumOfHexCells = (sizeX, sizeY) => Math.round(sizeX / 4) * Math.ceil(sizeY / 2) + Math.round((sizeX - 2) / 4) * Math.floor(sizeY / 2);

    getNumOfSquareCells = (sizeX, sizeY) => Math.ceil(sizeX / 2) * Math.ceil(sizeY / 2);

    getStepsTaken = () => this.stepsTaken;

    generateMaze = () => {
        let cellsChecked = 0;
        let numOfCells = this.numOfCells;

        const getRandomCell = (arr) => {
            let min = 0;
            let max = arr.length - 1;
            let num = Math.floor(Math.random() * (max - min + 1)) + min;

            return arr[num];
        }

        let stack = [];
        let cur = this.getNode(0, 0);

        while (cellsChecked <= numOfCells) {
            let next;
            if (!cur.cellVisited) {
                cur.setCellVisited(true);
                stack.push(cur);
                cellsChecked++;
            }

            let neighbors = this.gridClass.getNeighborCells(cur, (neighbor) => neighbor.cellVisited);
            cur.setNumOfNeighborCells(neighbors.length);

            if (!neighbors.length) {
                for (let i = stack.length - 1; i >= 0; i--) {
                    if (stack[i].numOfNeighborCells > 0) {
                        this.addToStepsTaken(stack[i], MAZE_VIZ_TYPE.TRACEBACK);
                        next = stack[i];
                        break;
                    }
                }
            } else {
                next = getRandomCell(neighbors);
            }

            if (next === undefined) break;

            this.setMazePathNode(cur, next);

            cur = next;
        }

        return this.grid;
    }

    init = () => this.gridClass.initGrid(RecBacktrNode);

    resetStepsTaken = () => this.stepsTaken = [];

    run = () => {
        this.resetStepsTaken();
        this.init();
        return this.generateMaze();
    }

    setMazePathNode = (cur, next) => {
        let midNode = this.gridClass.getMidNode(cur, next);

        cur.setIsMazePath(true);
        midNode.setIsMazePath(true);

        this.addToStepsTaken(cur, MAZE_VIZ_TYPE.PATH);
        this.addToStepsTaken(midNode, MAZE_VIZ_TYPE.PATH);
    }
}

// Kruskal's Algorithm
export class Kruskal {
    constructor(gridClass) {
        this.gridClass = gridClass;
        this.grid = this.gridClass.grid;
        this.stepsTaken = [];

        this.cellSize = 2;
    }

    addToStepsTaken = (node, type) => {
        let step = {
            node: node,
            type: type
        };
        this.stepsTaken.push(step);
    }

    // for hex grid
    getEdges = (cellsArr) => {
        let edges = [];
        let len = cellsArr.length;
        for (let i = 0; i < len; i++) {
            let cur = cellsArr[i];
            edges.push([cur.x, cur.y - 1, 'N']);
            edges.push([cur.x - 1, cur.y, 'NW']);
            edges.push([cur.x - 1, cur.y + 1, 'SW']);
            // if (cur.y - 1 > 0) { edges.push([cur.x, cur.y - 1, 'N']); this.gridClass.drawNode(this.getNode(cur.x, cur.y - 1), "green") }
            // if (cur.x - 1 > 0) { edges.push([cur.x - 1, cur.y, 'NW']); this.gridClass.drawNode(this.getNode(cur.x - 1, cur.y), "green") }
            // if (cur.x - 1 > 0 && cur.y + 1 < this.grid[cur.x - 1].length) { edges.push([cur.x - 1, cur.y + 1, 'SW']); this.gridClass.drawNode(this.getNode(cur.x - 1, cur.y + 1), "green") }

            // if (cur.y - 1 > 0) edges.push([cur.x, cur.y - 1, 'N']);
            // if (cur.x - 1 > 0) edges.push([cur.x - 1, cur.y, 'NW']);
            // if (cur.x - 1 > 0 && cur.y + 1 > this.grid[cur.x - 1].length) edges.push([cur.x - 1, cur.y + 1, 'SW']);
        }
        return edges;
    }

    // // for square grid
    // getEdges = (cellsArr) => {
    //     let edges = [];
    //     let len = cellsArr.length;
    //     for (let i = 0; i < len; i++) {
    //         let cur = cellsArr[i];
    //         if (cur.y - 1 > 0) edges.push([cur.x, cur.y - 1, 'N']);
    //         if (cur.x - 1 > 0) edges.push([cur.x - 1, cur.y, 'W']);
    //     }
    //     return edges;
    // }

    getNode = (x, y) => this.grid[x][y];

    getStepsTaken = () => this.stepsTaken;

    // for hex grid
    generateMaze = (edges) => {
        let len = edges.length;


        for (let i = 0; i < len; i++) {
            let [x, y, d] = edges[i];

            if (x <= 0 || y <= 0 || y + 1 >= this.grid[x].length) { console.log('asd'); continue; }
            let edgeNode = this.getNode(x, y);
            let neighbors = this.gridClass.getNeighbors(edgeNode);
            console.log(neighbors)

            let nodeA = neighbors[0];
            if (!nodeA) continue;
            let nodeB = neighbors[1];
            if (!nodeB) continue;

            // let nodeA = this.getNode(x + dir[d][0], y + dir[d][1]);
            // if (!nodeA) continue;
            // let nodeB = this.getNode(x + dir[mirroredDir[d]][0], y + dir[mirroredDir[d]][1]);
            // if (!nodeB) continue;

            if (nodeA.getRoot() !== nodeB.getRoot()) {
                nodeA.connect(nodeB);
                this.gridClass.drawNode(nodeA, "lightpink")
                this.gridClass.drawNode(edgeNode, "lightpink")
                this.gridClass.drawNode(nodeB, "lightpink")

                nodeA.setIsMazePath(true);
                edgeNode.setIsMazePath(true);
                nodeB.setIsMazePath(true);

                this.addToStepsTaken(nodeA, MAZE_VIZ_TYPE.PATH);
                this.addToStepsTaken(edgeNode, MAZE_VIZ_TYPE.PATH);
                this.addToStepsTaken(nodeB, MAZE_VIZ_TYPE.PATH);
            }
        }

        return this.grid;
    }

    // // for square grid
    // generateMaze = (edges) => {
    //     let len = edges.length;
    //     let DX = { "N": 0, "W": -1 };
    //     let DY = { "N": -1, "W": 0 };

    //     for (let i = 0; i < len; i++) {
    //         let [x, y, d] = edges[i];

    //         let edgeNode = this.getNode(x, y);

    //         let nodeA = this.getNode(x + DX[d], y + DY[d]);
    //         let nodeB = this.getNode(x + DX[d] * -1, y + DY[d] * -1);

    //         if (nodeA.getRoot() !== nodeB.getRoot()) {
    //             nodeA.connect(nodeB);

    //             nodeA.setIsMazePath(true);
    //             edgeNode.setIsMazePath(true);
    //             nodeB.setIsMazePath(true);

    //             this.addToStepsTaken(nodeA, MAZE_VIZ_TYPE.PATH);
    //             this.addToStepsTaken(edgeNode, MAZE_VIZ_TYPE.PATH);
    //             this.addToStepsTaken(nodeB, MAZE_VIZ_TYPE.PATH);
    //         }
    //     }

    //     return this.grid;
    // }

    init = () => this.gridClass.initGrid(KruskalNode);

    // for hex grid
    getCellsArr = () => {
        let cellsArr = [];

        let width = this.grid.length;

        for (let x = 0; x < width; x += 2) {
            let height = this.grid[x].length;
            for (let y = 0; y < height; y++) {
                let node = this.getNode(x, y);
                if (x % 4 === 0 && y % 2 === 0 || (x - 2) % 4 === 0 && y % 2 === 1) {
                    // if (x % 4 === 0 && y % 2 === 0) {
                    node.isCell = true;
                    cellsArr.push(node);
                    this.gridClass.drawNode(node, "red");
                    // this.gridClass.drawNode(node, "green");
                }
                // if ((x - 2) % 4 === 0 && y % 2 === 1) this.gridClass.drawNode(node, "blue");
            }
        }

        return cellsArr;
    }

    // // for square grid
    // init = () => {
    //     let cellsArr = [];

    //     let width = this.gridClass.gridSizeX;
    //     let height = this.gridClass.gridSizeY;

    //     for (let x = 0; x < width; x++) {
    //         this.grid[x] = [];
    //         for (let y = 0; y < height; y++) {
    //             let node = new KruskalNode(x, y);
    //             this.grid[x][y] = node;
    //             if (x % 2 === 0 && y % 2 === 0) cellsArr.push(node);
    //         }
    //     }

    //     return cellsArr;
    // }

    resetStepsTaken = () => this.stepsTaken = [];

    run = () => {
        this.resetStepsTaken();
        this.init();
        let cellsArr = this.getCellsArr();
        let edges = this.getEdges(cellsArr);
        let shuffledEdges = this.shuffleArray(edges);
        return this.generateMaze(shuffledEdges);
    }

    shuffleArray(arr) {
        let m = arr.length, temp, i;

        while (m) {
            i = Math.floor(Math.random() * m--);

            temp = arr[m];
            arr[m] = arr[i];
            arr[i] = temp;
        }

        return arr;
    }
}

export class Eller {
    constructor(gridClass) {
        this.gridClass = gridClass;
        this.grid = this.gridClass.grid;
        this.stepsTaken = [];

        this.cellSize = 2;
    }

    addStep = (node1, node2) => {
        let dx = (node2.x - node1.x) / this.cellSize;
        let dy = (node2.y - node1.y) / this.cellSize;
        let edgeNode = this.getNode(node1.x + dx, node1.y + dy);

        node1.setIsMazePath(true);
        edgeNode.setIsMazePath(true);
        node2.setIsMazePath(true);

        this.addToStepsTaken(node1, MAZE_VIZ_TYPE.PATH);
        this.addToStepsTaken(edgeNode, MAZE_VIZ_TYPE.PATH);
        this.addToStepsTaken(node2, MAZE_VIZ_TYPE.PATH);
    }

    addToStepsTaken = (node, type) => {
        let step = {
            node: node,
            type: type
        };
        this.stepsTaken.push(step);
    }

    getNode = (x, y) => this.grid[x][y];

    getStepsTaken = () => this.stepsTaken;

    generateMaze = () => {
        let sizeX = this.gridClass.gridSizeX;
        let sizeY = this.gridClass.gridSizeY;
        let cellSize = this.cellSize;

        let lastRow = false;

        for (let y = 0; y < sizeY; y += cellSize) {
            let nextRowTest = this.getNode(0, y + cellSize);
            if (nextRowTest === undefined) lastRow = true;

            for (let x = 0; x < sizeX; x += cellSize) {
                let nodeA = this.getNode(x, y);
                let nodeB = (x + cellSize >= sizeX) ? undefined : this.getNode(x + cellSize, y);

                if (lastRow) {
                    if (nodeB && nodeA.getRoot() !== nodeB.getRoot()) {
                        nodeB.connect(nodeA);
                        this.addStep(nodeA, nodeB);
                    }
                    continue;
                }

                let nodeC = this.getNode(x, y + cellSize);

                if (nodeB && nodeA.getRoot() !== nodeB.getRoot()) {
                    if (this.randBool()) {
                        nodeB.connect(nodeA);
                        this.addStep(nodeA, nodeB);
                    }
                }

                if (nodeA.getRoot() === nodeA) {
                    nodeC.connect(nodeA);
                    this.addStep(nodeA, nodeC);
                } else {
                    if (this.randBool()) {
                        nodeC.connect(nodeA);
                        this.addStep(nodeA, nodeC);
                    }
                }
            }
        }

        return this.grid;
    }

    init = () => {
        let width = this.gridClass.gridSizeX;
        let height = this.gridClass.gridSizeY;

        for (let x = 0; x < width; x++) {
            this.grid[x] = [];
            for (let y = 0; y < height; y++) {
                this.grid[x][y] = new EllerNode(x, y);
            }
        }
    }

    randBool = () => !!(Math.random() > 0.5);

    resetStepsTaken = () => this.stepsTaken = [];

    run = () => {
        this.resetStepsTaken();
        this.init();
        return this.generateMaze();
    }
}