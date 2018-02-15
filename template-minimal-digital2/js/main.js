var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'game', {
    preload: preload,
    create: create,
    update: update,
    render: render
});

function preload() {

    game.load.image('space', 'assets/space_background.jpg');
    game.load.image('bullet', 'assets/bullets.png');
    game.load.image('planet', 'assets/planet.png');
    game.load.image('shield', 'assets/shield.png');
    //https://opengameart.org/sites/default/files/asteroid_01_no_moblur.png
    game.load.spritesheet('asteroids', 'assets/Chicken.png', 32, 32);


}

var sprite, shield;
var cursors;
var sprites;
var shieldStrength;
var shieldText, endGameText, asteroidText;
var asteroidCount = 160;

var asteroids;


var bullet;
var bullets;
var bulletTime = 0;

function create() {

    //Setup up shield and text
    shieldStrength = 100;

    //  This will run in Canvas mode, so let's gain a little speed and display
    game.renderer.clearBeforeRender = false;
    game.renderer.roundPixels = true;

    //  We need arcade physics
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  A spacey background
    game.add.tileSprite(0, 0, game.width, game.height, 'space');


    //  Our ships bullets
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;

    //  All 40 of them
    bullets.createMultiple(60, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 0.5);

    //Sprites here are the chickens - create a group and add animation
    sprites = game.add.physicsGroup(Phaser.Physics.ARCADE);

    for (var i = 0; i < asteroidCount; i++) {
        var s = sprites.create(game.rnd.integerInRange(1, 10), game.rnd.integerInRange(32, 400), 'asteroids');
        s.animations.add('spin', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
        //s.animations.add('spin', [0, 1, 2, 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,
        //19,20,21,22,23,24,25,26,27,28,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,
        //43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64]);
        //s.scale.set (.2,.2);
        s.play('spin', 20, true);
        s.body.velocity.set(game.rnd.integerInRange(-200, 200), game.rnd.integerInRange(-200, 200));
    }

    sprites.setAll('body.collideWorldBounds', false);
    sprites.setAll('body.bounce.x', 7);
    sprites.setAll('body.bounce.y', 5);

    //  Our planet
    sprite = game.add.sprite(400, 300, 'planet');
    sprite.anchor.set(0.5);

    shield = game.add.sprite(400, 300, 'shield');
    shield.anchor.set(0.5);
    shield.enableBody = false;

    //  and its physics settings
    game.physics.enable(sprite, Phaser.Physics.ARCADE);
    game.physics.enable(shield, Phaser.Physics.ARCADE);

    sprite.body.maxVelocity.set(0);
    shield.body.maxVelocity.set(0);

    //  Game input
    cursors = game.input.keyboard.createCursorKeys();
    game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR,
        Phaser.Keyboard.ALT]);


    //Testing a future feature - togglable shields
    shieldText = game.add.text(game.world.x+60, game.world.y+60, "Shield: " + shieldStrength, {
        font: "20px Arial",
        fill: "#ffffff",
        align: "center"
    });
    shieldText.anchor.setTo(0.5, 0.5);

    asteroidText = game.add.text(game.world.x+40, game.world.y+80, "Asteroids: " + asteroidCount, {
        font: "20px Arial",
        fill: "#ffffff",
        align: "center"
    });
    shieldText.anchor.setTo(0.5, 0.5);
}

function update() {

    if (cursors.left.isDown) {
        sprite.body.angularVelocity = -300;
    }
    else if (cursors.right.isDown) {
        sprite.body.angularVelocity = 300;
    }
    else {
        sprite.body.angularVelocity = 0;
    }

    if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
        fireBullet();
    }

    if (game.input.keyboard.isDown(Phaser.Keyboard.ALT)) {
        activateShield();
    } else {
        deactivateShield();
    }

    //Add collision logic to the sprites
    game.physics.arcade.collide(sprites, shield, weakenShield, null, this);
    game.physics.arcade.collide(bullets, sprites, destroyAsteroid, null, this);

    //Wrap both the bullets and the asteroids
    bullets.forEachExists(screenWrap, this);
    sprites.forEachExists(screenWrap, this);
    updateText();


}

//Update the shield and asteroid texts
function updateText() {

    shieldText.setText("Shield: " + shieldStrength);
    asteroidText.setText("cHiCKenS: " + asteroidCount);

}

//Reduce the shield strength
function weakenShield() {
    shieldStrength = shieldStrength - 5;
    if (shieldStrength == 0) {
        endGame();
    }

}

// Set text and notify of loss - destroy all the chickens
function endGame() {

    endGameText = game.add.text(game.world.centerX, game.world.centerY, "GAME OVER", {
        font: "100px Arial",
        fill: "#630307",
        align: "center"
    });
    endGameText.anchor.setTo(0.5, 0.5);
    sprites.killAll();
}


// Set text and notify of win- destroy all the chickens
function winGame() {

    endGameText = game.add.text(game.world.centerX, game.world.centerY, "YOU WIN!!!!", {
        font: "100px Arial",
        fill: "#26c12f",
        align: "center"
    });
    endGameText.anchor.setTo(0.5, 0.5);
    sprites.killAll();
}


//Collision for chicken/bullet interaction
function destroyAsteroid(bullets, sprites) {
    asteroidCount = asteroidCount - 1;
    if (asteroidCount == 0) {
        winGame();
    }
    bullets.kill();
    sprites.kill();
}

function fireBullet() {

    if (game.time.now > bulletTime) {
        bullet = bullets.getFirstExists(false);

        if (bullet) {
            bullet.reset(sprite.body.x + 16, sprite.body.y + 16);
            bullet.lifespan = 2000;
            bullet.rotation = sprite.rotation;
            game.physics.arcade.velocityFromRotation(sprite.rotation, 400, bullet.body.velocity);
            bulletTime = game.time.now + 100;
        }
    }

}

function activateShield() {
    shield.visible = true;
}

function deactivateShield() {
    shield.visible = false;
}

function screenWrap(sprite) {

    if (sprite.x < 0) {
        sprite.x = game.width;
    }
    else if (sprite.x > game.width) {
        sprite.x = 0;
    }

    if (sprite.y < 0) {
        sprite.y = game.height;
    }
    else if (sprite.y > game.height) {
        sprite.y = 0;
    }

}

function render() {
}
