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
  speed: 8,
  color: "blue",
};

let groundHeight = 120;  // Declare groundHeight at the top level scope

let enemy1 = {
  x: 1000,
  y: 410,
  width: 90,
  height: 175,
  color: 'red'
};
let enemy1Image = new Image();
enemy1Image.src = 'enemy1.png';  // Replace 'enemy1.png' with the path to your image.

let projectiles = [];

let playerImage = new Image();
playerImage.src = 'player.png';  // Replace 'player.png' with the path to your image.

let groundImage = new Image();
groundImage.src = 'ground.png';  // Replace 'ground.png' with your file.

let backgroundImage = new Image();
backgroundImage.src = 'background.png';  // Replace 'background.png' with your file.

// Repeat the background image horizontally
context.fillStyle = context.createPattern(backgroundImage, 'repeat-x');
context.fillRect(0, 0, canvas.width, canvas.height);

function gameLoop() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = context.createPattern(backgroundImage, 'repeat-x');
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(groundImage, 0, canvas.height - groundHeight, canvas.width, groundHeight);
  context.drawImage(playerImage, player.x, player.y, player.width, player.height);

  if (enemy1 !== null) {
    context.drawImage(enemy1Image, enemy1.x, enemy1.y, enemy1.width, enemy1.height);
  }

  // move and draw each projectile
  for (let i = 0; i < projectiles.length; i++) {
    let projectile = projectiles[i];
    projectile.x += projectile.speed;

    context.fillStyle = 'white';
    context.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);

    // check for collision with enemy1
    if (enemy1 !== null && projectile.x < enemy1.x + enemy1.width &&
        projectile.x + projectile.width > enemy1.x &&
        projectile.y < enemy1.y + enemy1.height &&
        projectile.y + projectile.height > enemy1.y) {

      // remove the enemy1
      enemy1 = null;
    }
  }

  requestAnimationFrame(gameLoop);
}

let imagesToLoad = 4;

backgroundImage.onload = function() {
  // Decrement the imagesToLoad counter.
  imagesToLoad--;

  // Set the player's y position now that we know the ground's height
  player.y = canvas.height - groundHeight - player.height + 29;

  // If all images have loaded, start the game loop.
  if (imagesToLoad === 0) {
    gameLoop();
  }
};

groundImage.onload = function() {
  // Decrement the imagesToLoad counter.
  imagesToLoad--;

  // If all images have loaded, start the game loop.
  if (imagesToLoad === 0) {
    gameLoop();
  }
};

enemy1Image.onload = function() {
  imagesToLoad--;

  // If all images have loaded, start the game loop.
  if (imagesToLoad === 0) {
    gameLoop();
  }
};

playerImage.onload = function() {
  imagesToLoad--;

  // If all images have loaded, start the game loop.
  if (imagesToLoad === 0) {
    gameLoop();
  }
};

window.addEventListener('keydown', function(event) {
  switch(event.key) {
    case 'a':
      player.x = Math.max(player.x - player.speed, 0);
      break;
    case 'd':
      player.x = Math.min(player.x + player.speed, canvas.width - player.width);
      break;
    case ' ':
      // create a new projectile
      let projectile = {
        x: player.x + player.width, // it now starts at the right edge of the player
        y: player.y + player.height / 2 - 34, // center the projectile on the player
        width: 6,
        height: 6,
        speed: 5  // feel free to adjust the speed as needed
      };

      // add the new projectile to the array
      projectiles.push(projectile);
      break;
  }
});

// Add this outside of your game loop
setInterval(function() {
  projectiles = projectiles.filter(function(projectile) {
    return projectile.x < canvas.width;
  });
}, 1000);

window.addEventListener("keyup", function (event) {
  switch (event.key) {
    case "a":
    case "d":
      // Here you might want to stop the player when the keys are released
      // For now, we don't need to do anything
      break;
  }
});
