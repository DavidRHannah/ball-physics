import {Level} from './Level.js'
export class Ball {
    constructor(color, x, y, r, maxSpeed, vx, vy, gravity, bounce, air_resistance, kinetic_friction, epsilon){
        this.color = color;
        this.x = x;
        this.y = y;
        this.r = r;
        this.maxSpeed = maxSpeed;
        this.vx = vx;
        this.vy = vy;
        this.gravity = gravity;
        this.bounce = bounce;
        this.air_resistance = air_resistance;
        this.kinetic_friction = kinetic_friction;
        this.epsilon = epsilon;
        this.is_rolling = false;
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
        if (Math.abs(this.vx) < this.epsilon){
            vx = 0;   
        }
    }
    handleCollisions(level){
        if (level.isSolid(this.x - this.r, this.y)) {
            console.log("a");
            this.vx *= -this.bounce;
            this.x = this.r + level.tileSize;
        }
        if (level.isSolid(this.x + this.r, this.y)){
            this.vx *= -this.bounce;
            this.x = this.x-1;
        }
        if (level.isSolid(this.x, this.y - this.r)) {
            console.log("c");
            this.vy *= -this.bounce;
            this.y = this.r + level.tileSize;
        }
        if (level.isSolid(this.x, this.y + this.r)){
            this.vy *= -this.bounce;
            this.y = this.y-1;
        }
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
    handleInput(){
        if (this.keysPressed['w']) this.vy = Math.max(this.vy - this.acceleration, -this.maxSpeed);
        if (this.keysPressed['s']) this.vy = Math.min(this.vy + this.acceleration, this.maxSpeed);
        if (this.keysPressed['a']) this.vx = Math.max(this.vx - this.acceleration, -this.maxSpeed);
        if (this.keysPressed['d']) this.vx = Math.min(this.vx + this.acceleration, this.maxSpeed);
    }
    update(){
        this.handleInput();
        this.applyPhysics();
    }
    draw(context){
        context.beginPath();
        context.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        context.fillStyle = this.color;
        context.fill();
    }
};
