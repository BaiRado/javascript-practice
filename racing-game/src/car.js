export default class Car {
    constructor(game) {
        this.size = {
            width: 40,
            height: 20
        };

        this.game = game;

        this.pos = {
            x: 357,
            y: 130,
        }

        this.axis = {
            x: this.pos.x + this.size.width / 2,
            y: this.pos.y + this.size.height / 2
        }

        this.positionVertices();

        this.positionSides()

        this.positionSensors();

        this.maxSpeed = 100
        this.speed = 0;
        this.acc = 0;

        this.mod = 0;
        this.angle = 0;
        this.rotate = 0
        this.moving = 0

        this.maxDrift = 14
        this.drift = 0
        this.driftAngle = 0

        document.addEventListener('keydown', (e) => keyDown_handler(e, this));
        document.addEventListener('keyup', (e) => keyUp_handler(e, this));
    }

    moveAxis(deltaTime) {
        this.angle += this.rotate

        this.axis.x += (this.applyAcc() * this.mod) * Math.cos(Math.PI / 180 * (this.angle * this.moving)) * deltaTime;
        this.axis.y += (this.applyAcc() * this.mod) * Math.sin(Math.PI / 180 * (this.angle * this.moving)) * deltaTime;
    }

    drawAxis(ctx) {
        ctx.beginPath();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 6;
        ctx.rect(this.axis.x, this.axis.y, 1, 1);
        ctx.stroke();
    }

    positionSides() {
        let vert = this.vertices
        this.sides = [
            {
                x1: vert[1].x, // top left
                y1: vert[1].y,
                x2: vert[2].x, // top right
                y2: vert[2].y
            },
            {
                x1: vert[2].x, // top right
                y2: vert[2].y,
                x2: vert[3].x, // bottom right
                y2: vert[3].y
            },
            {
                x1: vert[3].x, // bottom right
                y1: vert[3].y,
                x2: vert[4].x, // bottom left
                y2: vert[4].y
            },
            {
                x1: vert[4].x, // bottom left
                y1: vert[4].y,
                x2: vert[1].x, // top left
                y2: vert[1].y
            },

        ]
    }

    drawSides(ctx) {
        let sides = this.sides
        for (let i = 0; i < sides.length; i++) {
            ctx.moveTo(sides[i].x1, sides[i].y1)
            ctx.lineTo(sides[i].x2, sides[i].y2)
        }
        ctx.stroke()
    }

    positionVertices() {
        this.vertices = [
            // center
            {
                x: this.axis.x - this.size.width / 2,
                y: this.axis.y
            },
            // top left
            {
                x: this.axis.x - this.size.width,
                y: this.axis.y - this.size.height / 2
            },
            // top right
            {
                x: this.axis.x,
                y: this.axis.y - this.size.height / 2
            },
            // bottom right
            {
                x: this.axis.x,
                y: this.axis.y + this.size.height / 2
            },
            // bottom left
            {
                x: this.axis.x - this.size.width,
                y: this.axis.y + this.size.height / 2
            }
        ];
    }

    rotateVertices() {
        let theta = Math.PI / 180 * this.angle;
        let cx = this.axis.x;
        let cy = this.axis.y;

        for (let i = 0; i < this.vertices.length; i++) {
            let x = this.vertices[i].x;
            let y = this.vertices[i].y;
            // cx, cy - center of square coordinates
            // x, y - coordinates of a corner point of the square
            // theta is the angle of rotation

            // translate point to origin
            let tempX = x - cx;
            let tempY = y - cy;

            // now apply rotation
            let rotatedX = tempX * Math.cos(theta) - tempY * Math.sin(theta);
            let rotatedY = tempX * Math.sin(theta) + tempY * Math.cos(theta);

            // translate back
            this.vertices[i].x = rotatedX + cx;
            this.vertices[i].y = rotatedY + cy;
        }
    }

    drawVertices(ctx) {
        const vert = this.vertices;
        ctx.beginPath();

        for (let i = 0; i < vert.length; i++) {
            ctx.rect(vert[i].x, vert[i].y, 1, 1);
        }
        ctx.stroke();
    }

    positionSensors() {
        const sensRadius = 1000;
        const sensRadian = 0.7;
        const center = this.vertices[0]

        this.sensors = [
            // top
            {
                x1: center.x,
                y1: center.y,
                x2: this.axis.x,
                y2: this.axis.y - sensRadius
            },
            // right
            {
                x1: center.x,
                y1: center.y,
                x2: this.axis.x + sensRadius,
                y2: this.axis.y + this.size.height / 2
            },
            // bottom
            {
                x1: center.x,
                y1: center.y,
                x2: this.axis.x,
                y2: this.axis.y + sensRadius
            },
            // left
            {
                x1: center.x,
                y1: center.y,
                x2: this.axis.x - sensRadius,
                y2: this.axis.y + this.size.height / 2
            },
            // top right
            {
                x1: center.x,
                y1: center.y,
                x2: this.axis.x + sensRadius * Math.cos(sensRadian),
                y2: this.axis.y + sensRadius * Math.sin(-sensRadian)
            },

            // top left
            {
                x1: center.x,
                y1: center.y,
                x2: this.axis.x - sensRadius * Math.cos(sensRadian),
                y2: this.axis.y - sensRadius * Math.sin(sensRadian)
            },
            // bottom right           
            {
                x1: center.x,
                y1: center.y,
                x2: this.axis.x + sensRadius * Math.cos(sensRadian),
                y2: this.axis.y + sensRadius * Math.sin(sensRadian)
            },
            // bottom left
            {
                x1: center.x,
                y1: center.y,
                x2: this.axis.x - sensRadius * Math.cos(sensRadian),
                y2: this.axis.y - sensRadius * Math.sin(-sensRadian)
            },
        ];
    }

    rotateSensors() {
        let theta = Math.PI / 180 * this.angle;
        let cx = this.axis.x;
        let cy = this.axis.y;

        for (let i = 0; i < this.sensors.length; i++) {
            let x = this.sensors[i].x2;
            let y = this.sensors[i].y2;
            // cx, cy - center of square coordinates
            // x, y - coordinates of a corner point of the square
            // theta is the angle of rotation

            // translate point to origin
            let tempX = x - cx;
            let tempY = y - cy;

            // now apply rotation
            let rotatedX = tempX * Math.cos(theta) - tempY * Math.sin(theta);
            let rotatedY = tempX * Math.sin(theta) + tempY * Math.cos(theta);

            // translate back
            this.sensors[i].x2 = rotatedX + cx;
            this.sensors[i].y2 = rotatedY + cy;
        }
    }


    drawSensors(ctx) {
        const sens = this.sensors;
        ctx.beginPath();

        for (let i = 0; i < this.sensors.length; i++) {
            ctx.moveTo(sens[i].x1, sens[i].y1);
            ctx.lineTo(sens[i].x2, sens[i].y2);
        }
        ctx.stroke();
    }

    draw(ctx) {
        this.resetDrift();
        // ctx.save();
        // ctx.beginPath();
        // ctx.translate(this.pos.x + this.size.width / 2, this.pos.y + this.size.height / 2);
        // ctx.rotate(this.applyDrift() + this.angle * Math.PI / 180);
        // ctx.rect(-this.size.width, -this.size.height / 2, this.size.width, this.size.height);
        // ctx.fillStyle = 'red';
        // ctx.fill();
        // ctx.restore();

        this.drawAxis(ctx)
        ctx.beginPath();
        ctx.strokeStyle = "yellow";
        ctx.lineWidth = 2;
        this.drawVertices(ctx);
        this.drawSides(ctx);
        this.drawSensors(ctx);
    }

    update(deltaTime) {
        (this.speed === 0) ? this.moving = 0 : this.moving = 1;
        this.moveAxis(deltaTime);
        this.positionVertices();
        this.rotateVertices();
        this.positionSides();
        this.positionSensors();
        this.rotateSensors();
    }

    applyAcc() {
        this.speed += this.acc;
        this.speed = this.clamp(this.speed, 0, this.maxSpeed);
        return this.speed / 100;
    }

    applyDrift() {
        this.drift += this.driftAngle * this.moving;
        this.drift = this.clamp(this.drift, -this.maxDrift, this.maxDrift);
        // return 0;
        return this.drift / 10;
    }

    resetDrift() {
        if (this.rotate === 0) {
            if (this.drift > 0) {
                this.driftAngle = -1;
            } else if (this.drift < 0) {
                this.driftAngle = 1;
            } else if (this.drift === 0) {
                this.driftAngle = 0;
            }
        }
    }

    clamp(number, min, max) {
        // caps min and max speed
        return Math.max(min, Math.min(number, max));
    }

    moveForward() {
        if (this.mod !== -1) {
            this.mod = 1;
            this.acc = 1;
        }
    }

    moveBack() {
        if (this.mod !== 1) {
            this.mod = -1;
            this.acc = 1;
        }
    }

    stopMoving() {
        (this.acc > 0) ? this.acc = -1 : this.mod = 0;
    }

    turnLeft() {
        this.rotate = -6;
        this.driftAngle = -1;
    }

    turnRight() {
        this.rotate = 6;
        this.driftAngle = 1;
    }

    stopTurning() {
        this.rotate = 0;
        this.driftAngle = 0;
    }
}


function keyUp_handler(e, car) {
    switch (e.keyCode) {
        case 38: //UP
        case 40: //DOWN
            car.stopMoving();
            break;
        case 37: //LEFT
            if (car.rotate < 0) {
                car.stopTurning();
            }
            break;
        case 39: //RIGHT
            if (car.rotate > 0) {
                car.stopTurning();
            }
            break;
    }
}

function keyDown_handler(e, car) {
    switch (e.keyCode) {
        case 38: //UP
            car.moveForward();
            break;

        case 40: //DOWN
            car.moveBack();
            break;

        case 37: //LEFT
            car.turnLeft();
            break;

        case 39: //RIGHT
            car.turnRight();
            break;
    }
}