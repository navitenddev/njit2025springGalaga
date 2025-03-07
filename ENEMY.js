class Enemy {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    // Method to check collision with bullets
    collidesWithBullet(bullets) {
        for (const b of bullets) {

            if (
                b.x > this.x &&
                b.x < this.x + this.width &&
                b.y > this.y &&
                b.y < this.y + this.height
            ) {
                return true;
            }
        }
        return false;
    }

    // Method to check if the enemy wins
    wins(windowHeight) {
        return this.y >= windowHeight - this.height - 24;
    }
}

// Example usage:
const bullets = [
    { x: 15, y: 25 },
    { x: 30, y: 45 },
];

const enemy = new Enemy(10, 20, 50, 50);
console.log(enemy.collidesWithBullet(bullets));  // Check for collision
console.log(enemy.wins(600));                    // Check if enemy wins
