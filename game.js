var Game = {};

Game.fps = 140;
Game.maxFrameSkip = 10;
Game.skipTicks = 1000 / Game.fps;

Game.initialize = function() {
    this.entities = [];
    this.viewport = document.body;

    this.ball = {
        pos_x: window.innerWidth/2,
        pos_y: window.innerHeight/2,
        radius: 30,
        vel_x: 8,
        vel_y: -30,
        gravity: 0.6,
        bounce: 0.6,
    };    
};

Game.update = function(tick) {
    // update position based on gravity and velocity
    this.ball.vel_y += this.ball.gravity;
    this.ball.pos_x += this.ball.vel_x;
    this.ball.pos_y += this.ball.vel_y;

    /*--------------Edge Collisions--------------*/
    // Ceiling bound
    if (this.ball.pos_y - this.ball.radius <= 0){
        this.ball.pos_y = this.ball.radius;
        this.ball.vel_y *= -this.ball.bounce;
    }
    // Floor bound
    if (this.ball.pos_y + this.ball.radius >= window.innerHeight){
        this.ball.pos_y = window.innerHeight - this.ball.radius;
        this.ball.vel_y *= -this.ball.bounce;
    }
    // Right wall bound
    if (this.ball.pos_x + this.ball.radius >= window.innerWidth){
        this.ball.pos_x = window.innerWidth-this.ball.radius;
        this.ball.vel_x *= -this.ball.bounce;
    }
    //Left wall bound
    if (this.ball.pos_x - this.ball.radius <= 0){
        this.ball.pos_x = this.ball.radius;
        this.ball.vel_x *= -this.ball.bounce;
    }
};

Game.draw = function() {
    let context = document.querySelector("canvas").getContext("2d");
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    context.beginPath();
    context.arc(this.ball.pos_x, this.ball.pos_y, this.ball.radius, 0, Math.PI * 2);
    context.fillStyle = "lightgray";
    context.fill();
    // context.strokeStyle = "black";
    // context.stroke();    
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