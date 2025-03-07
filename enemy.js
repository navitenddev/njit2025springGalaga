class Enemy {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.width = 40;    // Default width as per js code
        this.height = 20;   // Default height as per js code
        this.speed = speed;
    }
}

class Options {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.speed = speed;
    }
}

function New(options) {
    return new Enemy(options.x, options.y, options.speed);
}

// Example usage:
const options = new Options(10, 20, 5);
const enemy = New(options);
console.log(enemy);
