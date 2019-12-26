let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

canvas.width = 1200;
canvas.height = 600;

let movesArr = [];

const getPegChar = n => String.fromCharCode(65 + n);

const displayMovesInHtml = (arr) => {
    answer.innerHTML = "";
    arr.forEach(move => {
        let moveDiv = document.createElement("div");
        moveDiv.innerHTML = `Move disk ${move.target} from ${getPegChar(move.from)} to ${getPegChar(move.to)}`;
        answer.appendChild(moveDiv);
    });
}

const move = (target, from, to) => {
    if (target < 1) return;
    let obj = {
        target,
        from,
        to
    };
    movesArr.push(obj);
}

class Hanoi {
    ThreePegs = (number, start, middle, end) => {
        if (number < 1) return;
        this.ThreePegs(number - 1, start, end, middle);
        move(number, start, end);
        this.ThreePegs(number - 1, middle, start, end);
    }

    FourPegs = (num, start, mid1, mid2, end) => {
        if (num < 1) return;
        this.FourPegs(num - 2, start, mid1, end, mid2);
        move(num - 1, start, mid1);
        move(num, start, end);
        move(num - 1, mid1, end);
        this.FourPegs(num - 2, mid2, start, mid1, end);
    }

    FivePegs = (num, start, mid1, mid2, mid3, end) => {
        if (num < 1) return;
        this.FivePegs(num - 3, start, mid1, mid2, end, mid3)
        move(num - 2, start, mid2);
        move(num - 1, start, mid1);
        move(num, start, end);
        move(num - 1, mid1, end);
        move(num - 2, mid2, end);
        this.FivePegs(num - 3, mid3, start, mid1, mid2, end);
    }

    SixPegs = (num, start, mid1, mid2, mid3, mid4, end) => {
        if (num < 1) return;
        this.SixPegs(num - 4, start, mid1, mid2, mid3, end, mid4)
        move(num - 3, start, mid3);
        move(num - 2, start, mid2);
        move(num - 1, start, mid1);
        move(num, start, end);
        move(num - 1, mid1, end);
        move(num - 2, mid2, end);
        move(num - 3, mid3, end);
        this.SixPegs(num - 4, mid4, start, mid1, mid2, mid3, end);
    }

    SevenPegs = (num, start, mid1, mid2, mid3, mid4, mid5, end) => {
        if (num < 1) return;
        this.SevenPegs(num - 5, start, mid1, mid2, mid3, mid4, end, mid5)
        move(num - 4, start, mid4);
        move(num - 3, start, mid3);
        move(num - 2, start, mid2);
        move(num - 1, start, mid1);
        move(num, start, end);
        move(num - 1, mid1, end);
        move(num - 2, mid2, end);
        move(num - 3, mid3, end);
        move(num - 4, mid4, end);
        this.SevenPegs(num - 5, mid5, start, mid1, mid2, mid3, mid4, end);
    }

    EightPegs = (num, start, mid1, mid2, mid3, mid4, mid5, mid6, end) => {
        if (num < 1) return;
        this.EightPegs(num - 6, start, mid1, mid2, mid3, mid4, mid5, end, mid6)
        move(num - 5, start, mid5);
        move(num - 4, start, mid4);
        move(num - 3, start, mid3);
        move(num - 2, start, mid2);
        move(num - 1, start, mid1);
        move(num, start, end);
        move(num - 1, mid1, end);
        move(num - 2, mid2, end);
        move(num - 3, mid3, end);
        move(num - 4, mid4, end);
        move(num - 5, mid5, end);
        this.EightPegs(num - 6, mid6, start, mid1, mid2, mid3, mid4, mid5, end);
    }

    NinePegs = (num, start, mid1, mid2, mid3, mid4, mid5, mid6, mid7, end) => {
        if (num < 1) return;
        this.NinePegs(num - 7, start, mid1, mid2, mid3, mid4, mid5, mid6, end, mid7)
        move(num - 6, start, mid6);
        move(num - 5, start, mid5);
        move(num - 4, start, mid4);
        move(num - 3, start, mid3);
        move(num - 2, start, mid2);
        move(num - 1, start, mid1);
        move(num, start, end);
        move(num - 1, mid1, end);
        move(num - 2, mid2, end);
        move(num - 3, mid3, end);
        move(num - 4, mid4, end);
        move(num - 5, mid5, end);
        move(num - 6, mid6, end);
        this.NinePegs(num - 7, mid7, start, mid1, mid2, mid3, mid4, mid5, mid6, end);
    }

    TenPegs = (num, start, mid1, mid2, mid3, mid4, mid5, mid6, mid7, mid8, end) => {
        if (num < 1) return;
        this.TenPegs(num - 8, start, mid1, mid2, mid3, mid4, mid5, mid6, mid7, end, mid8)
        move(num - 7, start, mid7);
        move(num - 6, start, mid6);
        move(num - 5, start, mid5);
        move(num - 4, start, mid4);
        move(num - 3, start, mid3);
        move(num - 2, start, mid2);
        move(num - 1, start, mid1);
        move(num, start, end);
        move(num - 1, mid1, end);
        move(num - 2, mid2, end);
        move(num - 3, mid3, end);
        move(num - 4, mid4, end);
        move(num - 5, mid5, end);
        move(num - 6, mid6, end);
        move(num - 7, mid7, end);
        this.TenPegs(num - 8, mid8, start, mid1, mid2, mid3, mid4, mid5, mid6, mid7, end);
    }
}

class HanoiVisualization {
    constructor() {
        this.queue = [];
        this.animating = false;
        this.pegsArr = [];
        this.setPegsAndDisksArr();
    }

    setAnimating(bool) {
        this.animating = bool;
    }

    getDiskAmount = () => +diskAmount.value;

    getPegsAmount = () => +pegsAmount.value;

    getPegsId = (pegsAmount) => {
        let pegs = [];
        for (let i = 0; i < pegsAmount; i++) {
            pegs.push(i);
        }
        return pegs;
    }

    getHanoiSolution = () => {
        let disks = this.getDiskAmount();
        let pegsAmount = this.getPegsAmount();
        let pegs = this.getPegsId(pegsAmount);

        switch (pegsAmount) {
            case 3:
                hanoi.ThreePegs(disks, ...pegs);
                break;
            case 4:
                hanoi.FourPegs(disks, ...pegs);
                break;
            case 5:
                hanoi.FivePegs(disks, ...pegs);
                break;
            case 6:
                hanoi.SixPegs(disks, ...pegs);
                break;
            case 7:
                hanoi.SevenPegs(disks, ...pegs);
                break;
            case 8:
                hanoi.EightPegs(disks, ...pegs);
                break;
            case 9:
                hanoi.NinePegs(disks, ...pegs);
                break;
            case 10:
                hanoi.TenPegs(disks, ...pegs);
                break;
            default:
                alert("Error determining number of pegs");
                throw "Error determining number of pegs";
        }

        displayMovesInHtml(movesArr);

        this.fillQueue(movesArr, this.pegsArr);

        this.setAnimating(true);

        movesArr = [];
    }

    getPegsPosition = () => {
        let pegsPos = [];

        let pegsAmount = this.getPegsAmount();
        let pegsId = this.getPegsId(pegsAmount);

        let pegSpacing = canvas.width / (pegsAmount + 1);
        let lastPegPos = pegSpacing * (pegsAmount - 1);
        let margin = (canvas.width - lastPegPos) / 2;

        for (let i = 0; i < pegsAmount; i++) {
            let x = pegSpacing * i;
            let pos = {
                id: pegsId[i],
                x1: margin + x,
                y1: canvas.height,
                x2: margin + x,
                y2: canvas.height * .3
            }

            pegsPos.push(pos)
        }

        return pegsPos;
    }

    drawPegs = (pegsPos) => {
        ctx.lineWidth = 10;
        for (let i = 0; i < pegsPos.length; i++) {
            ctx.beginPath();
            ctx.moveTo(pegsPos[i].x1, pegsPos[i].y1);
            ctx.lineTo(pegsPos[i].x2, pegsPos[i].y2);
            ctx.stroke();
        }
    }

    drawAllDisks = (pegsPos, pegsArr) => {
        let diskAmount = this.getDiskAmount();

        let height = 40;
        let floor = pegsPos[0].y1 - height;

        let pegSpacing = canvas.width / (pegsPos.length + 1);
        let biggest = pegSpacing / 1.5;
        let smallest = 10;

        let range = biggest - smallest;
        let change = range / diskAmount;

        for (let i = 0; i < pegsArr.length; i++) {
            for (let j = 0; j < pegsArr[i].length; j++) {
                let target = pegsArr[i][j]
                let width = smallest + (change * (target + 1));

                let x = pegsPos[i].x1 - width / 2;
                let y = floor - height * j;

                this.drawDisk(target, x, y, width, height);
            }
        }
    }

    drawDisk = (target, x, y, width, height) => {
        ctx.lineWidth = 1;
        ctx.fillStyle = "lightgrey";

        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.fill();
        ctx.stroke();

        ctx.font = `${height}px Arial`;
        ctx.textAlign = "center";
        ctx.fillStyle = "#46A049";
        ctx.fillText(target, x + width / 2, y + height * 0.875);
    }

    drawHanoi = (pegsArr) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let pegsPos = this.getPegsPosition();
        this.drawPegs(pegsPos);
        this.drawAllDisks(pegsPos, pegsArr);
    }

    initPegs = (pegsAmount) => {
        let pegsArr = [];
        for (let i = 0; i < pegsAmount; i++) {
            pegsArr.push([]);
        }
        return pegsArr;
    }

    initDisks = (diskAmount, pegsArr) => {
        for (let i = diskAmount; i > 0; i--) {
            pegsArr[0].push(i)
        }
    }

    setPegsAndDisksArr = () => {
        let pegsAmount = this.getPegsAmount();
        let diskAmount = this.getDiskAmount();

        this.pegsArr = this.initPegs(pegsAmount);
        this.initDisks(diskAmount, this.pegsArr);
    }

    displayMoveDesc = (str, size = 30) => {
        ctx.font = `${size}px Arial`;
        ctx.textAlign = "center";
        ctx.fillStyle = "#46A049";
        ctx.fillText(str, canvas.width / 2, 10 + size);
    }

    displayMoveCounter(cur, total, size = 20) {
        ctx.font = `${size}px Arial`;
        ctx.textAlign = "center";
        ctx.fillStyle = "#46A049";
        ctx.fillText(`${cur} / ${total}`, canvas.width / 2, 45 + size);
    }

    fillQueue = (movesArr, pegsArr) => {
        for (let i = 0; i < movesArr.length; i++) {
            let target = movesArr[i].target;
            let from = movesArr[i].from;
            let to = movesArr[i].to;

            this.queue.push(
                // push a function that when called will execute the move and display it on the canvas
                () => {
                    pegsArr[to].push(
                        pegsArr[from].pop()
                    );

                    let str = `Move disk ${target} from ${getPegChar(from)} to ${getPegChar(to)}`;

                    this.drawHanoi(pegsArr);
                    this.displayMoveDesc(str);
                    this.displayMoveCounter(i + 1, movesArr.length);
                }
            )
        }
    }

    executeQueue = () => {
        if (this.queue.length > 0) {
            let move = this.queue.shift();
            move();
        } else {
            this.setAnimating(false);
        }
    }

    animateSolution(deltaTime) {
        if (this.animating) {
            timeout += deltaTime;

            if (timeout > 1000) {
                hanoiVis.executeQueue();
                timeout = 0;
            }
        }
    }

    draw(deltaTime) {
        if (this.animating) {
            this.animateSolution(deltaTime);
        } else {
            this.drawHanoi(this.pegsArr);
        }
    }
}

const hanoi = new Hanoi;
const hanoiVis = new HanoiVisualization;

const clampNumber = (e) => {
    let val = +e.target.value;
    let min = +e.target.min;
    let max = +e.target.max;

    if (val < min) e.target.value = min;
    if (val > max) e.target.value = max;
}

diskAmount.oninput = (e) => {
    clampNumber(e);
    hanoiVis.setPegsAndDisksArr();
}
pegsAmount.onChange = () => hanoiVis.setPegsAndDisksArr();
calculateHanoi.onclick = () => hanoiVis.getHanoiSolution();



let lastTime = timeout = 0, deltaTime;

function step(timestamp) {
    deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    hanoiVis.draw(deltaTime);

    window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);