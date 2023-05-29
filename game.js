const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");

// Calculate the width and height of the canvas based on a 16:9 ratio
const ratio = 16 / 9;
let canvasWidth = window.innerWidth;
let canvasHeight = window.innerWidth / ratio;

// Resize the canvas to fit the screen while maintaining the 16:9 ratio
if (canvasHeight > window.innerHeight) {
  canvasHeight = window.innerHeight;
  canvasWidth = window.innerHeight * ratio;
}
canvas.width = canvasWidth;
canvas.height = canvasHeight;

let player = {
  hearts: 3,
  x: 20,
  width: 90,
  height: 175,
  speed: 3,
  dy: 400, // delta y - for vertical velocity
  gravity: 0.6,
  jumpForce: 25,
  grounded: false,
  isJumping: false, // true when the player is in the air
  direction: "right", // direction of the player, can be 'left' or 'right'
  dx: 0, // delta x, used for horizontal movement during jump
  jumpForceX: 10, // horizontal force applied when the player jumps
};

let groundHeight = 120; // Declare groundHeight at the top level scope

let enemyHeight = 175;
let enemyWidth = 90;
let enemy1 = {
  x: 1000,
  y: canvas.height - groundHeight - enemyHeight + 29,
  width: enemyWidth,
  height: enemyHeight,
  color: "red",
  direction: "left", // Default direction
};
let enemy1ImageRight = new Image();
enemy1ImageRight.src = "enemy1_right.png";

let enemy1ImageLeft = new Image();
enemy1ImageLeft.src = "enemy1_left.png";

let projectiles = [];
// Define an enemy projectile array
let enemyProjectiles = [];
let lastProjectileCreationTime = Date.now();

let playerImageRight = new Image();
playerImageRight.src = "player_right.png";

let playerImageLeft = new Image();
playerImageLeft.src = "player_left.png";

let groundImage = new Image();
groundImage.src = "ground.png"; // Replace 'ground.png' with your file.

let backgroundImage = new Image();
backgroundImage.src = "background.png"; // Replace 'background.png' with your file.

let coinImage = new Image();
coinImage.src = "coin.png";

// Define a coin counter
let coinCounter = 0;

// Define a coins array
let coins = [];
// Initialize player's hearts display
context.fillStyle = "white";
context.font = "20px Arial";
context.fillText("Hearts: " + player.hearts, 10, 30);

// New enemy spawn time
let enemySpawnTime = 500; // 0.5 seconds

// Define a lastSpawnTime to keep track of when the last enemy was spawned
let lastSpawnTime = Date.now();

// New enemy spawn location
let enemySpawnLocation = 1000; // Change this as you see fit

// Repeat the background image horizontally
context.fillStyle = context.createPattern(backgroundImage, "repeat-x");
context.fillRect(0, 0, canvas.width, canvas.height);

// Main game loop
function gameLoop() {
  console.log(player.hearts);
  context.clearRect(0, 0, canvas.width, canvas.height); // Display player's hearts at the upper left corner

  context.fillStyle = context.createPattern(backgroundImage, "repeat-x");
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "red";
  context.font = "20px Arial";
  context.fillText("Hearts: " + player.hearts, 10, 30);

  context.drawImage(
    groundImage,
    0,
    canvas.height - groundHeight,
    canvas.width,
    groundHeight
  );
  if (player.direction == "right") {
    context.drawImage(
      playerImageRight,
      player.x,
      player.y,
      player.width,
      player.height
    );
  } else {
    context.drawImage(
      playerImageLeft,
      player.x,
      player.y,
      player.width,
      player.height
    );
  }

  if (enemy1 !== null) {
    if (enemy1.direction == "right") {
      context.drawImage(
        enemy1ImageRight,
        enemy1.x,
        enemy1.y,
        enemy1.width,
        enemy1.height
      );
    } else {
      context.drawImage(
        enemy1ImageLeft,
        enemy1.x,
        enemy1.y,
        enemy1.width,
        enemy1.height
      );
    }
  }

  // Apply gravity and horizontal movement
  if (keys["a"]) {
    player.dx = -player.speed;
    player.direction = "left";
  } else if (keys["d"]) {
    player.dx = player.speed;
    player.direction = "right";
  } else {
    player.dx = 0;
  }
  player.dy += player.gravity;
  player.y += player.dy;
  player.x += player.dx;

  // Handle collision with the sides of the canvas
  if (player.x < 0) player.x = 0;
  if (player.x > canvas.width - player.width)
    player.x = canvas.width - player.width;

  // If player has landed
  if (player.y >= canvas.height - groundHeight - player.height + 29) {
    player.y = canvas.height - groundHeight - player.height + 29;
    player.dy = 0;
    player.isJumping = false;
  }

  // move and draw each projectile
  for (let i = 0; i < projectiles.length; i++) {
    let projectile = projectiles[i];
    projectile.x += projectile.speed;

    context.fillStyle = "white";
    context.fillRect(
      projectile.x,
      projectile.y,
      projectile.width,
      projectile.height
    );

    // check for collision with enemy1
    if (
      enemy1 !== null &&
      projectile.x < enemy1.x + enemy1.width &&
      projectile.x + projectile.width > enemy1.x &&
      projectile.y < enemy1.y + enemy1.height &&
      projectile.y + projectile.height > enemy1.y
    ) {
      // Spawn a coin
      let coin = {
        x: enemy1.x,
        y: enemy1.y,
        width: 30,
        height: 30,
        spawnTime: Date.now(),
      };
      coins.push(coin);

      // Set a timer to remove the coin after 2 seconds
      setTimeout(function () {
        coins.shift();
      }, 2000);

      // remove the enemy1
      enemy1 = null;

      // remove the projectile that hit the enemy
      projectiles.splice(i, 1);
      i--; // Adjust i so the next iteration doesn't skip a projectile
    }
  }
  // Move the enemy towards the player
  if (enemy1 !== null) {
    if (enemy1.x < player.x) {
      enemy1.x += 1;
      enemy1.direction = "right"; // the player is on the right side of the enemy
    } else if (enemy1.x > player.x) {
      enemy1.x -= 1;
      enemy1.direction = "left"; // the player is on the left side of the enemy
    }
  }
  if (enemy1 === null) {
    // Spawn a new enemy if it's time
    let now = Date.now();
    if (now - lastSpawnTime >= enemySpawnTime) {
      let side = 0;
      do {
        side = Math.floor(Math.random() * canvas.width);
      } while (Math.abs(side - player.x) < 300);
      // The loop will generate random positions until it's more than 300px away from player
      enemy1 = {
        x: side,
        y: canvas.height - groundHeight - enemyHeight + 29,
        width: enemyWidth,
        height: enemyHeight,
        color: "red",
      };
      lastSpawnTime = now;
    }
  }

  if (enemy1 !== null) {
    // If the enemy is within 300 pixels of the player
    if (Math.abs(enemy1.x - player.x) < 300) {
      // enemy shoots a projectile towards player's position every 1 second
      if (Date.now() - lastProjectileCreationTime >= 1000) {
        let direction =
          player.x + player.width / 2 - (enemy1.x + enemy1.width / 2);
        let speed = direction < 0 ? -3 : 3;

        let newProjectile = {
          x: enemy1.x + enemy1.width / 2,
          y: enemy1.y + enemy1.height / 2,
          width: 6,
          height: 6,
          speed: speed,
        };

        enemyProjectiles.push(newProjectile);

        console.log("Created enemy projectile", newProjectile);

        lastProjectileCreationTime = Date.now();
      }
    }

    // Move the enemy towards the player
    if (enemy1.x < player.x) {
      enemy1.x += 1;
    } else if (enemy1.x > player.x) {
      enemy1.x -= 1;
    }
  }
  if (enemy1 !== null) {
    if (enemy1.direction == "right") {
      context.drawImage(
        enemy1ImageRight,
        enemy1.x,
        enemy1.y,
        enemy1.width,
        enemy1.height
      );
    } else {
      context.drawImage(
        enemy1ImageLeft,
        enemy1.x,
        enemy1.y,
        enemy1.width,
        enemy1.height
      );
    }
  }

  // Draw and handle coin collection
  for (let i = 0; i < coins.length; i++) {
    let coin = coins[i];

    // Draw the coin
    context.drawImage(coinImage, coin.x, coin.y, coin.width, coin.height);

    // Check for collision with player
    if (
      player.x < coin.x + coin.width &&
      player.x + player.width > coin.x &&
      player.y < coin.y + coin.height &&
      player.y + player.height > coin.y
    ) {
      // Increase the counter and remove the coin
      coinCounter++;
      coins.splice(i, 1);
    }
  }
  // Handle enemy projectile movement and collision with player
  for (let i = 0; i < enemyProjectiles.length; i++) {
    let projectile = enemyProjectiles[i];
    projectile.x += projectile.speed;

    context.fillStyle = "white";
    context.fillRect(
      projectile.x,
      projectile.y,
      projectile.width,
      projectile.height
    );

    // check for collision with player
    if (
      player.x < projectile.x + projectile.width &&
      player.x + player.width > projectile.x &&
      player.y < projectile.y + projectile.height &&
      player.y + player.height > projectile.y
    ) {
      // decrease player hearts
      player.hearts--;

      // remove the projectile that hit the player
      enemyProjectiles.splice(i, 1);
      i--; // Adjust i so the next iteration doesn't skip a projectile
    }
  }

  // If player has run out of hearts, end the game and show coin total
  if (player.hearts <= 0) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "white";
    context.font = "40px Arial";
    context.fillText("Game Over", canvas.width / 2, canvas.height / 2);
    context.fillText(
      "Coins: " + coinCounter,
      canvas.width / 2,
      canvas.height / 2 + 50
    );

    playAgainButton.style.display = "block"; // Show the play again button
    return;
  }
  // Draw the coin counter
  context.fillStyle = "white";
  context.font = "20px Arial";
  context.fillText("Coins: " + coinCounter, canvas.width - 100, 30);

  // ... (Rest of your code)
  requestAnimationFrame(gameLoop);
}

// Load the images
let imagesToLoad = 5;

backgroundImage.onload = function () {
  // Decrement the imagesToLoad counter.
  imagesToLoad--;

  // Set the player's y position now that we know the ground's height
  player.y = canvas.height - groundHeight - player.height + 29;

  // If all images have loaded, start the game loop.
  if (imagesToLoad === 0) {
    gameLoop();
  }
};

groundImage.onload = function () {
  // Decrement the imagesToLoad counter.
  imagesToLoad--;

  // If all images have loaded, start the game loop.
  if (imagesToLoad === 0) {
    gameLoop();
  }
};

enemy1ImageRight.onload = function () {
  imagesToLoad--;

  // If all images have loaded, start the game loop.
  if (imagesToLoad === 0) {
    gameLoop();
  }
};

enemy1ImageLeft.onload = function () {
  imagesToLoad--;

  // If all images have loaded, start the game loop.
  if (imagesToLoad === 0) {
    gameLoop();
  }
};

playerImageRight.onload = function () {
  imagesToLoad--;

  // If all images have loaded, start the game loop.
  if (imagesToLoad === 0) {
    gameLoop();
  }
};

playerImageLeft.onload = function () {
  imagesToLoad--;

  // If all images have loaded, start the game loop.
  if (imagesToLoad === 0) {
    gameLoop();
  }
};

// cONTROLS
let keys = {};

window.addEventListener("keydown", function (event) {
  keys[event.key] = true; // Set the key to true in the keys object
});

window.addEventListener("keyup", function (event) {
  keys[event.key] = false; // Set the key to false in the keys object
});

window.addEventListener("keydown", function (event) {
  switch (event.key) {
    case "w":
      if (!player.isJumping) {
        player.dy = -player.jumpForce;
        player.isJumping = true;
        if (keys["a"]) {
          // If "a" is also being pressed
          player.dx = -player.jumpForceX;
        } else if (keys["d"]) {
          // If "d" is also being pressed
          player.dx = player.jumpForceX;
        } else {
          player.dx = 0; // If neither "a" nor "d" is being pressed
        }
      }
      break;
    case " ":
      // create a new projectile
      let projectile = {
        x: player.direction == "right" ? player.x + player.width : player.x,
        y: player.y + player.height / 2 - 34, // center the projectile on the player
        width: 6,
        height: 6,
        speed: player.direction == "right" ? 5 : -5,
      };

      // add the new projectile to the array
      projectiles.push(projectile);
      break;
  }
});

// Add this outside of your game loop
setInterval(function () {
  projectiles = projectiles.filter(function (projectile) {
    return projectile.x < canvas.width;
  });
}, 1000); // Clear off screen enemy projectiles periodically
setInterval(function () {
  enemyProjectiles = enemyProjectiles.filter(function (projectile) {
    return projectile.x > 0 && projectile.x < canvas.width;
  });
}, 1000);

window.addEventListener("keyup", function (event) {
  switch (event.key) {
    case "a":
    case "d":
      player.dx = 0;
      break;
    case "w":
      player.dy = 0;
      break;
  }
});

let playAgainButton = document.getElementById("play-again");

playAgainButton.addEventListener("click", function () {
  location.reload(); // This will reload the page when the button is clicked
});
