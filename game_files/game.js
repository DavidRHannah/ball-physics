import { Ball } from './Ball.js'
import { Grid } from './Grid.js'
import { UsefulMath } from './UsefulMath.js'
import { Level } from './Level.js'

var Game = {};

Game.fps = 60;
Game.maxFrameSkip = 10;
Game.skipTicks = 1000 / Game.fps;

Game.initialize = function() {
    let tileSize = 100;
    this.level = new Level([], tileSize, window.innerWidth, window.innerHeight, true );

    this.math = new UsefulMath();
    let cellSize = 40;
    this.entityCount = 3;
    this.entities = [];
    this.grid = new Grid(cellSize);
    this.viewport = document.body;
    let r = 30;

    this.player = new Ball("white", this.math.getRandomArbitrary(r, window.innerWidth), 
    this.math.getRandomArbitrary(r, window.innerHeight), 30, 10, 0, 0, 0, 0, 0.9, 1, 0,);
    for (let i = 0; i < this.entityCount; i++){
        let color = "red";
        r = 20;
        let x = this.math.getRandomArbitrary(r, window.innerWidth);
        let y = this.math.getRandomArbitrary(r, window.innerHeight);
        let maxSpeed = 5;
        let vx = this.math.getRandomArbitrary(-100,100);
        let vy = this.math.getRandomArbitrary(-100,100);
        let gravity = 0;
        let bounce = 0.9;
        let air_resistance = 1;
        let kinetic_friction = 1;
        let epsilon = 0;

        this.entities[i] = new Ball(color, x, y, r, maxSpeed, vx, vy, gravity, bounce, air_resistance, kinetic_friction, epsilon);
    }    
    this.entities.push(this.player);
    this.entityCount+=1;
};

Game.update = function() {
    // Update player and other entities
    for (let i = 0; i < this.entityCount; i++){
        this.entities[i].update(this.level);
        this.grid.addBall(this.entities[i]);
    }
    
    // Handle ball-on-ball collisions
    for (let ball of this.entities) {
        let ballsToCheck = this.grid.getBallsInCell(ball.x, ball.y);
        if (ballsToCheck.length > 1) {
            for (let otherBall of ballsToCheck) {
                if (ball !== otherBall) {
                    
                    let dx = otherBall.x - ball.x;
                    let dy = otherBall.y - ball.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    let minDistance = ball.r + otherBall.r;

                    if (distance <= minDistance) {
                        // normalize direction vector
                        let nx = dx / distance;
                        let ny = dy / distance;

                        // relative velocity
                        let dvx = otherBall.vx - ball.vx;
                        let dvy = otherBall.vy - ball.vy;

                        // relative velocity and normalized direction dot product
                        let dotProduct = dvx * nx + dvy * ny;

                        // prevent overlap
                        let overlap = (minDistance - distance) / 2;
                        ball.x -= nx * overlap;
                        ball.y -= ny * overlap;
                        otherBall.x += nx * overlap;
                        otherBall.y += ny * overlap;

                        // elastic collision formula
                        let collisionScale = dotProduct * 2 / (ball.r + otherBall.r);
                        ball.vx += collisionScale * nx * otherBall.r;
                        ball.vy += collisionScale * ny * otherBall.r;
                        otherBall.vx -= collisionScale * nx * ball.r;
                        otherBall.vy -= collisionScale * ny * ball.r;
                    }
                }
            }
            ball.handleCollisions(this.level);
        }
    }
};


Game.draw = function() {
    let context = document.querySelector("canvas").getContext("2d");
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    this.level.draw(context);
    for (let i = 0; i < this.entityCount; i++){
        this.entities[i].draw(context);
    }
};

Game.pause = function() {
    this.paused = (this.paused) ? false : true;
};

/*
 * Runs the actual loop inside browser
 */
Game.run = (function() {
    var loops = 0;
    var nextGameTick = (new Date).getTime();
    return function() {
        loops = 0;
        while (!Game.paused && (new Date).getTime() > nextGameTick && loops < Game.maxFrameSkip) {
            Game.update();
            nextGameTick += Game.skipTicks;
            loops++;
        }
        Game.draw();
    };
})();

(function() {
    var onEachFrame;
    if (window.requestAnimationFrame) {
       onEachFrame = function(cb) {
          var _cb = function() {
                cb();
             requestAnimationFrame(_cb);
          };
          _cb();
       };
    } else if (window.webkitRequestAnimationFrame) {
       onEachFrame = function(cb) {
          var _cb = function() {
             cb();
             webkitRequestAnimationFrame(_cb);
          };
          _cb();
       };
    } else if (window.mozRequestAnimationFrame) {
        onEachFrame = function(cb) {
            var _cb = function() {
                cb();
                mozRequestAnimationFrame(_cb);
            };
            _cb();
        };
    } else {
        onEachFrame = function(cb) {
            setInterval(cb, Game.skipTicks);
        };
    }

    window.onEachFrame = onEachFrame;
})();

document.addEventListener('keydown', function(event){
    if (event.key === "Escape"){
        Game.pause();
        return;
    }
    Game.player.keysPressed[event.key] = true;
});
document.addEventListener('keyup', function(event){
    Game.player.keysPressed[event.key] = false;
});
document.addEventListener('DOMContentLoaded', function() {
    var canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    Game.initialize();
    window.onEachFrame(Game.run);
});