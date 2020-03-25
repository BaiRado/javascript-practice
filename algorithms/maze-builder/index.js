let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let createMazeBtn = document.getElementById("createMazeBtn");

canvas.width = 1600;
canvas.height = 800;

const MAZE_VIZ_TYPE = {
    PATH: "#FFFFFF",
    TRACEBACK: "#FF0000"
}

class Node {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.isMazePath = false;
    }

    setIsMazePath = (bool) => this.isMazePath = bool;
}

class MazeNode extends Node {
    constructor(x, y) {
        super(x, y);
        this.cellVisited = false;
        this.numOfNeighborCells = undefined;
    }

    setCellVisited = (bool) => this.cellVisited = bool;

    setNumOfNeighborCells = (num) => this.numOfNeighborCells = num;
}

class GridViz {
    constructor(gridSizeX, gridSizeY) {
        this.gridSizeX = gridSizeX;
        this.gridSizeY = gridSizeY;
        this.nodeSize = canvas.width / this.gridSizeX;
        this.grid = [];
    }

    drawAllNodes = () => {
        for (let x = 0; x < this.gridSizeX; x++) {
            for (let y = 0; y < this.gridSizeY; y++) {
                let node = this.getNode(x, y);
                let color = (node.isMazePath) ? "white" : "black";
                this.drawNode(node, color);
            }
        }
    }

    drawNode = (node, color = "#FFFFFF") => {
        let size = this.nodeSize;
        let posX = node.x * size;
        let posY = node.y * size;

        ctx.beginPath();

        ctx.lineWidth = 1;
        ctx.strokeStyle = "darkgray";
        ctx.rect(posX, posY, size, size);
        ctx.fillStyle = color;

        ctx.fill();
        ctx.stroke();
    }

    getNode = (x, y) => this.grid[x][y];

    init = () => {
        for (let x = 0; x < this.gridSizeX; x++) {
            this.grid[x] = [];
            for (let y = 0; y < this.gridSizeY; y++) {
                this.grid[x][y] = new Node(x, y);
            }
        }
    }

    replaceGrid = (newGrid) => this.grid = newGrid;
}

// Recursive Backtracking
class RecursiveBacktracking {
    constructor(gridSizeX, gridSizeY) {
        this.gridSizeX = gridSizeX;
        this.gridSizeY = gridSizeY;
        this.grid = [];
        this.stepsTaken = [];

        this.cellSize = 2;
        this.numOfCells = Math.ceil(this.gridSizeX / this.cellSize) * Math.ceil(this.gridSizeY / this.cellSize);
    }

    addToStepsTaken = (node, type) => {
        let step = {
            node: node,
            type: type
        };
        this.stepsTaken.push(step);
    }

    getNeighborCells = (node) => {
        let neighbors = [];
        let cellSize = this.cellSize;
        let width = this.gridSizeX;
        let height = this.gridSizeY;

        let neighborPositions = [
            [cellSize, 0], // East
            [-cellSize, 0], // West
            [0, cellSize], // South
            [0, -cellSize] // North
        ]

        for (let i = 0; i < neighborPositions.length; i++) {
            let offsetX = neighborPositions[i][0];
            let offsetY = neighborPositions[i][1];

            let adjX = node.x + offsetX;
            let adjY = node.y + offsetY;

            if (
                adjX >= 0 && adjX < width &&
                adjY >= 0 && adjY < height
            ) {
                let neighbor = this.getNode(adjX, adjY);
                if (!neighbor.cellVisited) neighbors.push(neighbor);
            }

        }

        return neighbors;
    }

    getNode = (x, y) => this.grid[x][y];

    getStepsTaken = () => this.stepsTaken;

    generateNewMaze = () => {
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

            let neighbors = this.getNeighborCells(cur);
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

    initGrid = () => {
        for (let x = 0; x < this.gridSizeX; x++) {
            this.grid[x] = [];
            for (let y = 0; y < this.gridSizeY; y++) {
                this.grid[x][y] = new MazeNode(x, y);
            }
        }
    }

    resetStepsTaken = () => this.stepsTaken = [];

    run = () => {
        this.resetStepsTaken();
        this.initGrid();
        return this.generateNewMaze();
    }

    setMazePathNode = (cur, next) => {
        let dirX = (next.x - cur.x) / this.cellSize;
        let dirY = (next.y - cur.y) / this.cellSize;

        let midNode = this.getNode(cur.x + dirX, cur.y + dirY);

        cur.setIsMazePath(true);
        midNode.setIsMazePath(true);

        this.addToStepsTaken(cur, MAZE_VIZ_TYPE.PATH);
        this.addToStepsTaken(midNode, MAZE_VIZ_TYPE.PATH);
    }
}

class KruskalNode extends Node {
    constructor(x, y) {
        super(x, y);
        this.parent = null;
    }

    getRoot = () => this.parent ? this.parent.getRoot() : this;

    connect = (node) => {
        let root = node.getRoot();
        root.parent = this;
    }
}

// Kruskal's Algorithm
class Kruskal {
    constructor(gridSizeX, gridSizeY) {
        this.gridSizeX = gridSizeX;
        this.gridSizeY = gridSizeY;
        this.grid = [];
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

    getEdges = (cellsArr) => {
        let edges = [];
        let len = cellsArr.length;
        for (let i = 0; i < len; i++) {
            let cur = cellsArr[i];
            if (cur.x - 1 > 0) edges.push([cur.x - 1, cur.y, 'W']);
            if (cur.y - 1 > 0) edges.push([cur.x, cur.y - 1, 'N']);
        }
        return edges;
    }

    getNode = (x, y) => this.grid[x][y];

    getStepsTaken = () => this.stepsTaken;

    generateNewMaze = (edges) => {
        let len = edges.length;
        let DX = { "N": 0, "W": -1 };
        let DY = { "N": -1, "W": 0 };

        for (let i = 0; i < len; i++) {
            let [x, y, d] = edges[i];

            let edgeNode = this.getNode(x, y);

            let nodeA = this.getNode(x + DX[d], y + DY[d]);
            let nodeB = this.getNode(x + DX[d] * -1, y + DY[d] * -1);

            if (nodeA.getRoot() !== nodeB.getRoot()) {
                nodeA.connect(nodeB);

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

    init = () => {
        let cellsArr = [];

        for (let x = 0; x < this.gridSizeX; x++) {
            this.grid[x] = [];
            for (let y = 0; y < this.gridSizeY; y++) {
                let node = new KruskalNode(x, y);
                this.grid[x][y] = node;
                if (x % 2 === 0 && y % 2 === 0) cellsArr.push(node);
            }
        }

        return cellsArr;
    }

    resetStepsTaken = () => this.stepsTaken = [];

    run = () => {
        this.resetStepsTaken();
        let cellsArr = this.init();
        let edges = this.getEdges(cellsArr);
        let shuffledEdges = this.shuffleArray(edges);
        return this.generateNewMaze(shuffledEdges);
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

class MazeBuilderVisualization {
    constructor(gridSizeX, gridSizeY) {
        this.gridSizeX = gridSizeX;
        this.gridSizeY = gridSizeY;
        this.nodeSize = canvas.width / this.gridSizeX;

        this.animFrameId = null;
    }

    animateSteps = (stepsTaken) => {
        let start = 0;
        let deltaTime = 0;
        let i = 0;
        let len = stepsTaken.length;

        const step = (timestamp) => {
            deltaTime = timestamp - start;
            start = timestamp;

            if (i >= len - 1) return;

            this.visualizeStep(stepsTaken[i]);

            i++;

            this.setAnimFrameId(
                window.requestAnimationFrame(step)
            );
        }

        this.setAnimFrameId(
            window.requestAnimationFrame(step)
        );
    }

    stopAnimFrame = () => window.cancelAnimationFrame(this.animFrameId);

    setAnimFrameId = (id) => this.animFrameId = id;

    visualizeStep = (step) => this.drawNode(step.node, step.type);

    drawNode = (node, color = "#FFFFFF") => {
        let size = this.nodeSize;
        let posX = node.x * size;
        let posY = node.y * size;

        ctx.beginPath();

        ctx.lineWidth = 1;
        ctx.strokeStyle = "darkgray";
        ctx.rect(posX, posY, size, size);
        ctx.fillStyle = color;

        ctx.fill();
        ctx.stroke();
    }
}

export default class MazeBuilder {
    constructor(sizeX = 50, sizeY) {
        this.gridSizeX = sizeX;
        this.gridSizeY = sizeY || Math.floor(this.gridSizeX / 2);

        this.gridViz;
        this.mazeBuilder;
        this.mazeBuilderViz;

        this.init();
    }

    run = () => this.mazeBuilder.run();

    buildMaze = () => {
        console.time('Generate Maze');
        this.gridViz.init();
        this.gridViz.drawAllNodes();
        this.run();
        console.timeEnd('Generate Maze');
    }

    changeAlgorithm = (algorithm) => {
        this.mazeBuilderViz.stopAnimFrame();
        this.mazeBuilder = new algorithm(this.gridSizeX, this.gridSizeY);
        this.gridViz.drawAllNodes();
    }

    init = () => {
        this.gridViz = new GridViz(this.gridSizeX, this.gridSizeY);
        this.mazeBuilder = new RecursiveBacktracking(this.gridSizeX, this.gridSizeY);
        this.initEventListeners();
    }

    initViz = () => {
        this.mazeBuilderViz = new MazeBuilderVisualization(this.gridSizeX, this.gridSizeY);
        this.gridViz.init();
        this.gridViz.drawAllNodes();
    }

    initEventListeners = () => {
        createMazeBtn.onclick = () => {
            this.mazeBuilderViz.stopAnimFrame();
            this.buildMaze();
            let stepsTaken = this.mazeBuilder.getStepsTaken();
            this.mazeBuilderViz.animateSteps(stepsTaken);
        }

        algorithmSelect.onchange = () => {
            algorithmSelect.blur();

            switch (algorithmSelect.value) {
                case 'RecursiveBacktracking':
                    this.changeAlgorithm(RecursiveBacktracking);
                    break;
                case 'Kruskal':
                    this.changeAlgorithm(Kruskal);
                    break;
                default:
                    console.error('Error determining algorithm');
            }
        }
    }
}

let gridSizeX = 50;
let mazeBuilder = new MazeBuilder(gridSizeX);
mazeBuilder.initViz();