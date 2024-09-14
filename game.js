// class Triangle {
//     constructor(color, x, y, side_length, speed, vx, vy){
//         this.color = color;
//         this.x = x;
//         this.y = y;
//         this.side_length = side_length;
//         this.vx = vx;
//         this.vy = vy;
//         this.speed = speed;
//         this.rotation_angle = 0;
//     }
//     update(){
//         this.x += this.vx;
//         this.y += this.vy;

//         if (this.x - this.side_length <= 0) 
//             this.x = this.side_length;
//         if (this.x + this.side_length >= window.innerWidth) 
//             this.x = window.innerWidth - this.side_length;
//         if (this.y - this.side_length <= 0) 
//             this.y = this.side_length;
//         if (this.y + this.side_length >= window.innerHeight) 
//             this.y = window.innerHeight - this.side_length;
//     }

//     /*
//         min is min value
//         max is max value
//         t is interpolant
//     */
//     linear_interpolation(min, max, t) {
//         return min + t * (max - min);
//     }

//     rotateTowardsMouse(mouseX, mouseY){
//         let dx = mouseX - this.x;
//         let dy = mouseY - this.y;
//         let target_angle = Math.atan2(dy, dx);

//         // Linear interpolation (lerp) between current angle and target angle
//         let interpolant = 0.1; // Adjust this value for faster or slower smoothing
//         this.rotation_angle = this.linear_interpolation(this.rotation_angle, target_angle, interpolant);
//     }
    
//     handleInput(key){
//         let targetVy = this.vy;
//         let targetVx = this.vx;

//         if (key === 'Escape'){
//             Game.pause();
//             return;
//         }
//         if (key === 'w') {
//             targetVy = -this.speed;
//         }
//         if (key === 's') {
//             targetVy = this.speed;
//         }
//         if (key === 'a') {
//             targetVx = -this.speed;
//         }
//         if (key === 'd') {
//             targetVx = this.speed;
//         }
        
//         // Interpolate current velocity towards target velocity for smoother transitions
//         let lerpFactor = 1;
//         this.vx = this.linear_interpolation(this.vx, targetVx, lerpFactor);
//         this.vy = this.linear_interpolation(this.vy, targetVy, lerpFactor);
//     }
//     draw(context){
//         context.save();
//         context.translate(this.x, this.y);
//         context.rotate(this.rotation_angle);
        
//         context.beginPath();
//         context.moveTo(0, -this.side_length);
//         context.lineTo(-this.side_length, this.side_length);
//         context.lineTo(this.side_length, this.side_length);
//         context.closePath();
//         context.fillStyle = this.color;
//         context.fill();

//         context.restore();
//     }
// }

class Ball {
    constructor(color, x, y, r, vx, vy, gravity, bounce, air_resistance, kinetic_friction, epsilon){
        this.color = color;
        this.x = x;
        this.y = y;
        this.r = r;
        this.vx = vx;
        this.vy = vy;
        this.gravity = gravity;
        this.bounce = bounce;
        this.air_resistance = air_resistance;
        this.kinetic_friction = kinetic_friction;
        this.epsilon = epsilon;
        this.is_rolling = false;
        this.maxSpeed = 15;
        this.acceleration = 0.5;
        this.keysPressed = {};
    }
    applyPhysics(){
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;

        this.vx *= this.air_resistance;
        this.vy *= this.air_resistance;

        if (this.is_rolling) {
            this.vx *= this.kinetic_friction;
            this.vy *= this.kinetic_friction;
        }
        if (Math.abs(this.vx) < epsilon){
            vx = 0;   
        }
    }
    handleCollisions(){
        // Ceiling bound
        if (this.y - this.r <= 0){
            this.y = this.r;
            this.vy *= -this.bounce;
        }
        // Floor bound
        if (this.y + this.r >= window.innerHeight){
            this.y = window.innerHeight - this.r;
            this.vy *= -this.bounce;
            this.is_rolling = true;
        } else{
            this.is_rolling = false;
        }
        // Right wall bound
        if (this.x + this.r >= window.innerWidth){
            this.x = window.innerWidth - this.r;
            this.vx *= -this.bounce;
        }
        //Left wall bound
        if (this.x - this.r <= 0){
            this.x = this.r;
            this.vx *= -this.bounce;
        }
    }
    /*
        min is min value
        max is max value
        t is interpolant
    */
    linear_interpolation(min, max, t){
        return min + t * (max - min);
    }
    handleInput(){
        if (this.keysPressed['w']) this.vy = Math.max(this.vy - this.acceleration, -this.maxSpeed);
        if (this.keysPressed['s']) this.vy = Math.min(this.vy + this.acceleration, this.maxSpeed);
        if (this.keysPressed['a']) this.vx = Math.max(this.vx - this.acceleration, -this.maxSpeed);
        if (this.keysPressed['d']) this.vx = Math.min(this.vx + this.acceleration, this.maxSpeed);
    }
    update(){
        this.handleInput();
        this.applyPhysics();
        this.handleCollisions();
    }
    draw(context){
        context.beginPath();
        context.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        context.fillStyle = this.color;
        context.fill();
    }
};

class Grid {
    constructor(cell_size){
        this.cell_size = cell_size;
        this._grid = new Map();
    }
    getCellKey(x,y){
        return `${Math.floor(x / this.cell_size)}, ${Math.floor(y / this.cell_size)}`;
    }
    addBall(ball){
        let key = this.getCellKey(ball.x, ball.y);
        if(!this._grid.has(key)) {
            this._grid.set(key, []);
        }
        this._grid.get(key).push(ball);
    }
    getBallsInCell(x,y){
        let key = this.getCellKey(x,y);
        let balls = this._grid.get(key) || [];
        for (let dx = -1; dx <= 1; dx++){
            for (let dy = -1; dy <= 1; dy++){
                if (dx === 0 && dy === 0){
                    continue;
                }
                let adjacentKey = this.getCellKey(x+dx*this.cell_size, y+dy*this.cell_size);
                balls = balls.concat(this._grid.get(adjacentKey) || []);
            }
        }
        return balls;
    }
};

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

var Game = {};

Game.fps = 60;
Game.maxFrameSkip = 10;
Game.skipTicks = 1000 / Game.fps;

Game.initialize = function() {
    let cellSize = 40;
    this.entityCount = 10;
    this.entities = [];
    this.grid = new Grid(cellSize);
    this.viewport = document.body;
    let r = 30;
    this.player = new Ball("white", getRandomArbitrary(r, window.innerWidth), 
                            getRandomArbitrary(r, window.innerHeight), 30, 
                            0, 0, 0, 0, 0.9, 1, 0,);
    for (let i = 0; i < this.entityCount; i++){
        color = "red";
        r = 20;
        x = getRandomArbitrary(r, window.innerWidth);
        y = getRandomArbitrary(r, window.innerHeight);
        vx = getRandomArbitrary(-100,100);
        vy = getRandomArbitrary(-100,100);
        gravity = 0;
        bounce = 0.9;
        air_resistance = 1;
        kinetic_friction = 1;
        epsilon = 0;

        this.entities[i] = new Ball(color, x, y, r, vx, vy, gravity, bounce, air_resistance, kinetic_friction);
    }    
    this.entities.push(this.player);
    this.entityCount+=1;
    //this.triangle = new Triangle("red", window.innerWidth/2, window.innerHeight/2, 20, 5, 0, 0);
};

Game.update = function() {
    //this.player.update();
    for (let i = 0; i < this.entityCount; i++){
        this.entities[i].update();
        this.grid.addBall(this.entities[i]);
    }
    
    for (let ball of this.entities){
        let ballsToCheck = this.grid.getBallsInCell(ball.x, ball.y);
        if (ballsToCheck.length > 1){
            for (let otherBall of ballsToCheck){
                if (ball !== otherBall){
                    let dx = otherBall.x - ball.x;
                    let dy = otherBall.y - ball.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    let minDistance = ball.r + otherBall.r;

                    if (distance <= minDistance){
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
        }
    }
};

Game.draw = function() {
    let context = document.querySelector("canvas").getContext("2d");
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    //this.player.draw(context);
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
    var startTime = (new Date).getTime();
    return function() {
        loops = 0;
        while (!Game.paused && (new Date).getTime() > nextGameTick && loops < Game.maxFrameSkip) {
            Game.update(nextGameTick - startTime);
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
    Game.player.keysPressed[event.key] = true;
});
document.addEventListener('keyup', function(event){
    Game.player.keysPressed[event.key] = false;
});
// document.addEventListener('mousemove', function(event) {
//     Game.triangle.rotateTowardsMouse(event.clientX, event.clientY);
// });
document.addEventListener('DOMContentLoaded', function() {
    var canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    Game.initialize();
    window.onEachFrame(Game.run);
});