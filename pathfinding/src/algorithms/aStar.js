import MinHeap from '../min-heap.js';
import { AStarNode } from '../nodes.js';
import { GRID_NODE_TYPES, PF_NODE_TYPES } from '../enums.js';

export default class AStar {
    constructor(gridClass) {
        this.gridClass = gridClass;
        this.algorithmNode = AStarNode;
        this.gridClass.transferGridState(this.algorithmNode);
        this.grid = gridClass.grid;
        this.startNode = null;
        this.endNode = null;
        this.openList = new MinHeap(this.scoreFunction);
        this.complete = false;

        this.stepsTaken = [];
    }

    addToClosedList = (node) => {
        node.setClosed(true);
        this.addToStepsTaken(node, PF_NODE_TYPES.CLOSED_LIST);
    }

    addToOpenList = (node) => {
        this.openList.add(node);
        this.addToStepsTaken(node, PF_NODE_TYPES.OPEN_LIST);
    }

    addToStepsTaken = (node, type) => {
        let step = {
            node: node,
            type: type
        };
        this.stepsTaken.push(step);
    }

    calcCost = (nodeA, nodeB) => {
        let distX = Math.abs(nodeA.x - nodeB.x);
        let distY = Math.abs(nodeA.y - nodeB.y);

        if (distX > distY) {
            return 14 * distY + 10 * (distX - distY);
        }
        return 14 * distX + 10 * (distY - distX);
    }

    findPath = () => {
        this.addToOpenList(this.startNode);

        while (this.openList.size() > 0) {
            let curNode = this.openList.popMin();

            this.addToClosedList(curNode);

            let neighbors = this.gridClass.getNeighbors(curNode);

            for (let i = 0; i < neighbors.length; i++) {
                let adjNode = neighbors[i];

                if (adjNode.unwalkable || adjNode.closed) {
                    continue;
                }

                // if not a hex node
                if (!curNode.isHex) {
                    // check if diagonal is blocked
                    if (curNode.x - adjNode.x !== 0 && curNode.y - adjNode.y !== 0) {
                        let blocked = this.isDiagonalBlocked(curNode, adjNode);
                        if (blocked) continue;
                    }
                }

                if (adjNode.isEnd) {
                    adjNode.setParent(curNode);
                    this.getPath(adjNode);
                    return true;
                }

                let newAdjNodeGCost = curNode.gCost + this.calcCost(curNode, adjNode) + adjNode.moveCost;
                let adjNotInOpenList = !!(adjNode.gCost === null);

                if (newAdjNodeGCost < adjNode.gCost || adjNotInOpenList) {
                    let hCost = this.calcCost(adjNode, this.endNode);
                    adjNode.setGCost(newAdjNodeGCost);
                    adjNode.setHCost(hCost);
                    adjNode.setParent(curNode);

                    if (adjNotInOpenList) {
                        this.addToOpenList(adjNode);
                    } else {
                        this.openList.update(adjNode.heapIdx);
                    }
                }
            }
        }

        return false;
    }

    getPath = (endNode) => {
        let path = [];
        let curNode = endNode;

        while (true) {
            path.unshift(curNode);

            this.addToStepsTaken(curNode, PF_NODE_TYPES.PATH);

            if (curNode.type === GRID_NODE_TYPES.START) {
                return path;
            }

            curNode = curNode.parent;
        }
    }

    getStepsTaken = () => this.stepsTaken;

    isDiagonalBlocked = (curNode, adjNode) => {
        let sideNodeX = this.gridClass.getNode(adjNode.x, curNode.y);
        let sideNodeY = this.gridClass.getNode(curNode.x, adjNode.y);

        return !!(sideNodeX.unwalkable && sideNodeY.unwalkable);
    }

    placeStartAndEndInMaze = () => {
        let [startX, startY] = [this.startNode.x, this.startNode.y];
        let [endX, endY] = [this.endNode.x, this.endNode.y];

        let newStartNode = this.gridClass.getNode(startX, startY);
        if (newStartNode.type === GRID_NODE_TYPES.EMPTY) {
            this.setStartNode(newStartNode);
        } else {
            let neighbors = this.gridClass.getNeighbors(newStartNode);
            for (let adj of neighbors) {
                if (adj.type === GRID_NODE_TYPES.EMPTY) {
                    this.setStartNode(adj);
                    break;
                }
            }
        }

        let newEndNode = this.gridClass.getNode(endX, endY);
        if (newEndNode.type === GRID_NODE_TYPES.EMPTY) {
            this.setEndNode(newEndNode);
        } else {
            let neighbors = this.gridClass.getNeighbors(newEndNode);
            for (let adj of neighbors) {
                if (adj.type === GRID_NODE_TYPES.EMPTY) {
                    this.setEndNode(adj);
                    break;
                }
            }
        }
    }

    reset = () => {
        let gridWidth = this.grid.length;

        for (let x = 0; x < gridWidth; x++) {
            let gridHeight = this.grid[x].length;
            for (let y = 0; y < gridHeight; y++) {
                let node = this.gridClass.getNode(x, y);
                if (node.gCost === null) continue;
                this.gridClass.drawNode(node);
                node.resetPathfindingValues();
            }
        }
        this.gridClass.drawNode(this.startNode);
        this.gridClass.drawNode(this.endNode);

        this.openList.reset();

        this.stepsTaken = [];
    }

    run = () => {
        this.reset();
        return this.findPath();
    }

    scoreFunction = (node) => node.getFCost();

    setComplete = (bool) => this.complete = bool;

    setEndNode = (node) => {
        node.setType(GRID_NODE_TYPES.END);
        this.endNode = node;
    }

    setStartNode = (node) => {
        node.setType(GRID_NODE_TYPES.START);
        this.startNode = node;
    }
}
