import Paddle from "./paddle.js";
import InputHandler from "./input.js";
import Ball from "./ball.js";
import levelLoader from "./level-loader.js";
import { levels, ezLevels } from "./levels.js";

export default class Game {
    constructor(gameWidth, gameHeight) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;

        this.paddle = new Paddle(this);
        this.ball = new Ball(this);
        new InputHandler(this.paddle, this);




        this.init();
    }

    init() {
        this.currentLevel = +document.querySelectorAll('input[type="radio"]:checked')[0].value;
        this.lives = 3;
        this.score = 0;
        this.multiplier = 1;
        this.bricks = [];
        this.levels = (document.getElementById('easy-mode').checked) ? ezLevels : levels;

        this.paused = false;
        this.won = false;
        this.lost = false;

        this.startLevel();
    }

    startLevel() {
        levelLoader(this, this.levels[this.currentLevel]);
        this.ball.resetBall();
        this.paddle.resetPaddle();
    }

    togglePause() {
        if (this.won || this.lost) return;
        this.paused = !this.paused;
    }

    update(deltaTime) {
        if (this.paused || this.won || this.lost) return;
        this.paddle.update(deltaTime);
        this.ball.update(deltaTime);

        // check brick collision
        this.bricks.forEach(brick => brick.update());
    }

    draw(ctx) {
        this.paddle.draw(ctx);
        this.ball.draw(ctx);

        // draw bricks
        this.bricks.forEach(brick => brick.draw(ctx));

        this.startScreen(ctx);

        this.displayLives(ctx);

        this.displayLevel(ctx);

        this.displayScore(ctx);

        this.displayMultiplier(ctx);

        // game pause overlay
        if (this.paused) {
            this.pauseScreen(ctx);
        }

        // next level check and game win overlay
        if (this.bricks.length === 0) {
            // if there is a next level
            if (this.currentLevel + 1 < this.levels.length) {
                // startLevel next level
                this.currentLevel++;
                this.multiplier++;
                this.startLevel();
                return;
            }
            this.won = true;
            this.winScreen(ctx);
        }

        // game lose overlay
        if (this.lives === 0) {
            this.lost = true;
            this.gameOverScreen(ctx);
        }
    }

    startScreen(ctx) {
        if (this.ball.waitingToStart && this.lives !== 0 && !this.paused) {
            ctx.textAlign = "center";
            ctx.font = '25px sans-serif';
            ctx.fillStyle = "blue";
            ctx.fillText(`Press Up Arrow or W to launch the ball`, this.gameWidth / 2, this.gameHeight / 1.3);
        }
    }

    displayLives(ctx) {
        ctx.textAlign = "center";
        ctx.font = '30px sans-serif';
        ctx.fillStyle = "red";
        ctx.fillText(`Lives: ${this.lives}`, ctx.measureText(`Lives: ${this.score}`).width - 30, 40);
    }

    displayLevel(ctx) {
        ctx.textAlign = "center";
        ctx.font = '30px sans-serif';
        ctx.fillStyle = "red";
        ctx.fillText(`Level ${this.currentLevel + 1}`, this.gameWidth / 2, 40);
    }

    displayScore(ctx) {
        ctx.textAlign = "center";
        ctx.font = '30px sans-serif';
        ctx.fillStyle = "red";
        ctx.fillText(`Score: ${this.score}`, this.gameWidth - ctx.measureText(`Score: ${this.score}`).width / 2 - 20, 30);
    }

    displayMultiplier(ctx) {
        ctx.textAlign = "center";
        ctx.font = '20px sans-serif';
        ctx.fillStyle = "red";
        ctx.fillText(`Multiplier: x${this.multiplier}`, this.gameWidth - ctx.measureText(`Multiplier: x${this.multiplier}`).width / 2 - 20, 50);
    }

    pauseScreen(ctx) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
        ctx.textAlign = "center";
        ctx.font = '50px sans-serif';
        ctx.fillText("PAUSED", this.gameWidth / 2, this.gameHeight / 2);
    }

    winScreen(ctx) {
        ctx.fillStyle = "rgba(0, 55, 0, 0.8)";
        ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);

        ctx.textAlign = "center";
        ctx.font = '50px sans-serif';
        ctx.fillStyle = "white";
        ctx.fillText("YOU WON", this.gameWidth / 2, this.gameHeight / 2);

        ctx.font = '30px sans-serif';
        ctx.fillStyle = "lightgrey";
        ctx.fillText(`Final score: ${this.score}`, this.gameWidth / 2, this.gameHeight / 2 - 65);

        ctx.fillText("Press Enter to play again", this.gameWidth / 2, this.gameHeight / 2 + 50);
    }

    gameOverScreen(ctx) {
        ctx.fillStyle = "rgba(55, 0, 0, 0.9)";
        ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);

        ctx.textAlign = "center";
        ctx.font = '50px sans-serif';
        ctx.fillStyle = "white";
        ctx.fillText("YOU LOST", this.gameWidth / 2, this.gameHeight / 2);

        ctx.font = '30px sans-serif';
        ctx.fillStyle = "lightgrey";
        ctx.fillText(`Final score: ${this.score}`, this.gameWidth / 2, this.gameHeight / 2 - 65);

        ctx.fillText("Press Enter to play again", this.gameWidth / 2, this.gameHeight / 2 + 50);
    }
}