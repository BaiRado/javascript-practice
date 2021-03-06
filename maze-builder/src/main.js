import MazeBuilder from './maze-builder.js';
import { MazeBuilderVisualization } from './maze-builder-viz.js';
import { MAZE_ALGORITHMS, MAZE_ALGORITHM_NODES, MAZE_GRIDS, canvas, ctx, createMazeBtn, algorithmSelect, timerSpan, gridSelect, gridSizeSpan, gridSizeInput } from './constants.js';

export default class Main {
    constructor(gridWidth = 51) {
        this.gridClass;
        this.mazeBuilder;
        this.mazeBuilderViz;
        this.init(gridWidth);

        this.initEventListeners();
    }

    init = (gridWidth) => {
        let selectedGrid = MAZE_GRIDS[gridSelect.value];
        let selectedAlgorithm = MAZE_ALGORITHMS[algorithmSelect.value];
        let algorithmNode = MAZE_ALGORITHM_NODES[algorithmSelect.value];

        this.gridClass = new selectedGrid(ctx, gridWidth);
        // remove old maze and display black grid
        this.gridClass.reset(algorithmNode);
        this.mazeBuilder = new MazeBuilder(this.gridClass, selectedAlgorithm);
        this.mazeBuilderViz = new MazeBuilderVisualization(this.gridClass, this.mazeBuilder);
    }

    initEventListeners = () => {
        createMazeBtn.onclick = () => {
            this.mazeBuilderViz.stopAnimFrame();
            // remove old maze and display black grid
            let algorithmNode = MAZE_ALGORITHM_NODES[algorithmSelect.value];
            this.gridClass.reset(algorithmNode);

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
            let selectedAlgorithm = MAZE_ALGORITHMS[algorithmSelect.value];
            let algorithmNode = MAZE_ALGORITHM_NODES[algorithmSelect.value];

            this.mazeBuilderViz.stopAnimFrame();
            this.gridClass.reset(algorithmNode);
            this.mazeBuilder.setAlgorithm(selectedAlgorithm);
        }

        gridSelect.onchange = () => {
            gridSelect.blur();
            this.mazeBuilderViz.stopAnimFrame();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            this.init(gridSizeInput.value);
        }

        gridSizeInput.oninput = (e) => {
            gridSizeInput.blur();
            this.mazeBuilderViz.stopAnimFrame();
            let gridWidth = e.target.value;
            this.gridClass.clearCanvas();
            this.init(gridWidth);
            gridSizeSpan.innerText = gridWidth;
        }
    }

    displayTime = (timeTaken) => {
        let time = Math.round((timeTaken + Number.EPSILON) * 100) / 100;
        let displayStr = `${algorithmSelect.value}: ${time}ms`;
        timerSpan.innerText = displayStr;
        console.log(displayStr, `(${timeTaken})`);
    }
}