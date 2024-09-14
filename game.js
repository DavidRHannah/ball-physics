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
        // Gravity and velocity updates
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;

        // Apply air resistance
        this.vx *= this.air_resistance;
        this.vy *= this.air_resistance;

        // Apply rolling friction if the ball is rolling
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

Game.fps = 30;
Game.maxFrameSkip = 10;
Game.skipTicks = 1000 / Game.fps;

Game.initialize = function() {
    this.entities = [];
    this.entityCount = 10000;
    this.viewport = document.body;

    for (let i = 0; i < this.entityCount; i++){
        color = "white";
        // r = getRandomArbitrary(4, 5);
        r = 4;
        x = getRandomArbitrary(r, window.innerWidth);
        y = getRandomArbitrary(r, window.innerHeight);
        vx = getRandomArbitrary(-100,100);
        vy = getRandomArbitrary(-100,100);
        gravity = 0.6;
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