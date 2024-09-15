export class UsefulMath {
    constructor(){};
    getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }
}