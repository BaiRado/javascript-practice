import { Node } from './nodes.js';
import MazeBuilder from './maze-builder.js';
import { MazeBuilderVisualization } from './maze-builder-viz.js';
import { MAZE_ALGORITHMS, MAZE_GRIDS, canvas, ctx, createMazeBtn, algorithmSelect, timerNumberSpan } from './constants.js';

export default class Main {
    constructor(gridWidth = 51) {
        this.gridWidth = gridWidth;

        this.gridClass;
        this.mazeBuilder;
        this.mazeBuilderViz;
        this.init();

        this.initEventListeners();
    }

    init = () => {
        let selectedGrid = MAZE_GRIDS[gridSelect.value];
        let selectedAlgorithm = MAZE_ALGORITHMS[algorithmSelect.value];

        this.gridClass = new selectedGrid(ctx, this.gridWidth);
        // remove old maze and display black grid
        this.gridClass.reset(Node);
        this.mazeBuilder = new MazeBuilder(this.gridClass, selectedAlgorithm);
        this.mazeBuilderViz = new MazeBuilderVisualization(this.gridClass, this.mazeBuilder);
    }

    initEventListeners = () => {
        createMazeBtn.onclick = () => {
            this.mazeBuilderViz.stopAnimFrame();
            // remove old maze and display black grid
            this.gridClass.reset(Node);

            let timeStart = window.performance.now();
            this.mazeBuilder.run();
            let timeEnd = window.performance.now();

            let timeTaken = timeEnd - timeStart;
            this.displayTime(timeTaken);

            let stepsTaken = this.mazeBuilder.getStepsTaken();
            this.mazeBuilderViz.animateSteps(stepsTaken);
        }

        algorithmSelect.onchange = () => {
            algorithmSelect.blur();
            this.mazeBuilderViz.stopAnimFrame();
            this.mazeBuilder.setAlgorithm(MAZE_ALGORITHMS[algorithmSelect.value]);
            this.gridClass.drawAllNodes();
        }

        gridSelect.onchange = () => {
            gridSelect.blur();
            this.mazeBuilderViz.stopAnimFrame();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            this.init();
            this.gridClass.drawAllNodes();
        }
    }

    displayTime = (timeTaken) => {
        let time = Math.round((timeTaken + Number.EPSILON) * 100) / 100;
        let displayStr = `${algorithmSelect.value}: ${time}ms`;
        timerNumberSpan.innerText = displayStr;
        console.log(displayStr, `(${timeTaken})`);
    }
}