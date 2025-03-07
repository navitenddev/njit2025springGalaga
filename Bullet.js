class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Options {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

function New(options) {
    return new Bullet(options.x, options.y);
}

// Example usage:
const options = new Options(10, 20);
const bullet = New(options);
console.log(bullet);
