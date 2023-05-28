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
  x: 20,
  width: 90,
  height: 175,
  speed: 3,
  dy: 1000, // delta y - for vertical velocity
  gravity: 0.8,
  jumpForce: 25,
  grounded: false,
  isJumping: false, // true when the player is in the air
  direction: "right", // direction of the player, can be 'left' or 'right'
  dx: 0, // delta x, used for horizontal movement during jump
  jumpForceX: 10, // horizontal force applied when the player jumps
};

let groundHeight = 120; // Declare groundHeight at the top level scope

let enemy1 = {
  x: 1000,
  y: 410,
  width: 90,
  height: 175,
  color: "red",
};
let enemy1Image = new Image();
enemy1Image.src = "enemy1.png"; // Replace 'enemy1.png' with the path to your image.

let projectiles = [];

let playerImageRight = new Image();
playerImageRight.src = "player_right.png";

let playerImageLeft = new Image();
playerImageLeft.src = "player_left.png";

let groundImage = new Image();
groundImage.src = "ground.png"; // Replace 'ground.png' with your file.

let backgroundImage = new Image();
backgroundImage.src = "background.png"; // Replace 'background.png' with your file.

// Repeat the background image horizontally
context.fillStyle = context.createPattern(backgroundImage, "repeat-x");
context.fillRect(0, 0, canvas.width, canvas.height);

function gameLoop() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = context.createPattern(backgroundImage, "repeat-x");
  context.fillRect(0, 0, canvas.width, canvas.height);
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
    context.drawImage(
      enemy1Image,
      enemy1.x,
      enemy1.y,
      enemy1.width,
      enemy1.height
    );
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
      // remove the enemy1
      enemy1 = null;
    }
  }

  requestAnimationFrame(gameLoop);
}

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

enemy1Image.onload = function () {
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
