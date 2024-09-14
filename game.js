class Ball {
    constructor(color, x, y, r, vx, vy, gravity, bounce, air_resistance, kinetic_friction){
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
        this.is_rolling = false;
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
    draw(context){
        context.beginPath();
        context.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        context.fillStyle = this.color;
        context.fill();   
    }
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }

var Game = {};

Game.fps = 60;
Game.maxFrameSkip = 10;
Game.skipTicks = 1000 / Game.fps;

Game.initialize = function() {
    this.entities = [];
    this.entityCount = 3;
    this.viewport = document.body;

    for (let i = 0; i < this.entityCount; i++){
        color = "white";
        // r = getRandomArbitrary(4, 5);
        r = 50;
        x = getRandomArbitrary(r, window.innerWidth);
        y = getRandomArbitrary(r, window.innerHeight);
        vx = getRandomArbitrary(-100,100);
        vy = getRandomArbitrary(-100,100);
        gravity = 1;
        bounce = 0.6;
        air_resistance = 0.99;
        kinetic_friction = 0.99;

        this.entities[i] = new Ball(color, x, y, r, vx, vy, gravity, bounce, air_resistance, kinetic_friction);
    }
};

Game.update = function() {
    for (let i = 0; i < this.entityCount; i++){
        this.entities[i].applyPhysics();
        this.entities[i].handleCollisions();
    }
    for (let i = 0; i < this.entityCount; i++) {
        for (let j = i + 1; j < this.entityCount; j++) {
            let ball1 = this.entities[i];
            let ball2 = this.entities[j];
            
            let dx = ball2.x - ball1.x;
            let dy = ball2.y - ball1.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            let minDistance = ball1.r + ball2.r;

            // Check for colliding balls
            if (distance+1 <= minDistance) {
                // normalize direction vector
                let nx = dx / distance;
                let ny = dy / distance;

                // relative velocity
                let dvx = ball2.vx - ball1.vx;
                let dvy = ball2.vy - ball1.vy;

                // relative velocity and normalized direction dot product
                let dotProduct = dvx * nx + dvy * ny;

                // prevent overlap
                let overlap = (minDistance - distance) / 2;
                ball1.x -= nx * overlap;
                ball1.y -= ny * overlap;
                ball2.x += nx * overlap;
                ball2.y += ny * overlap;

                // elastic collision formula
                let collisionScale = dotProduct * 2 / (ball1.r + ball2.r);
                ball1.vx += collisionScale * nx * ball2.r;
                ball1.vy += collisionScale * ny * ball2.r;
                ball2.vx -= collisionScale * nx * ball1.r;
                ball2.vy -= collisionScale * ny * ball1.r;
            }
        }
    }

};

Game.draw = function() {
    let context = document.querySelector("canvas").getContext("2d");
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
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

// Initialize and run the game
document.addEventListener('DOMContentLoaded', function() {
    var canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    Game.initialize();
    window.onEachFrame(Game.run);
});