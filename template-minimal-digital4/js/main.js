var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'Ice Defense', {
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
    game.load.spritesheet('asteroids', 'assets/asteroids.png', 128, 128);
    game.load.audio('sfx','assets/fx_mixdown.ogg');
    game.load.audio('background','assets/background.mp3');


}

var time;
var sprite, shield, our_planet;
var cursors;
var sprites;
var shieldStrength, enableShield;
var shieldText, endGameText, asteroidText;
var asteroidCount = 140;
var asteroids;
var bullet;
var bullets;
var bulletTime = 0;

function create() {
    //Setup Audio

    time = this.game.time.totalElapsedSeconds();
    music = game.add.audio('background');
    music.play(); 

    fx = game.add.audio('sfx');
    fx.allowMultiple = true;

    fx.addMarker('alien death', 1, 1.0);
    fx.addMarker('boss hit', 3, 0.5);
    fx.addMarker('escape', 4, 3.2);
    fx.addMarker('meow', 8, 0.5);
    fx.addMarker('numkey', 9, 0.1);
    fx.addMarker('ping', 10, 1.0);
    fx.addMarker('death', 12, 4.2);
    fx.addMarker('shot', 17, 1.0);
    fx.addMarker('squit', 19, 0.3);

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

    //  All 60 of them
    bullets.createMultiple(60, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 0.5);

    //Sprites here are the chickens - create a group and add animation
    sprites = game.add.physicsGroup(Phaser.Physics.ARCADE);

    for (var i = 0; i < asteroidCount; i++) {
        var s = sprites.create(game.rnd.integerInRange(1, 10), game.rnd.integerInRange(32, 400), 'asteroids');
        //s.animations.add('spin', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
        s.animations.add('spin', [0, 1, 2, 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,
        19,20,21,22,23,24,25,26,27,28,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,
        43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64]);
        s.scale.set (.2,.2);
        s.play('spin', 20, true);
        s.body.velocity.set(game.rnd.integerInRange(-200, 200), game.rnd.integerInRange(-200, 200));
    }

    sprites.setAll('body.collideWorldBounds', false);
    sprites.setAll('body.bounce.x', 5);
    sprites.setAll('body.bounce.y', 5);

    //  Our planet
    sprite = game.add.sprite(400, 300, 'planet');
    sprite.scale.set(.95,.95);
    sprite.anchor.set(0.5);

    shield = game.add.sprite(400, 300, 'shield');
    shield.anchor.set(0.5);
    shield.enable = false;

    //  and its physics settings
    game.physics.enable(sprite, Phaser.Physics.ARCADE);
    sprite.body.immovable = true;
    game.physics.enable(shield, Phaser.Physics.ARCADE);
    shield.body.immovable = true;
    //game.physics.enable(our_planet, Phaser.Physics.ARCADE);


    sprite.body.maxVelocity.set(0);
    shield.body.maxVelocity.set(0);

    //  Game input
    cursors = game.input.keyboard.createCursorKeys();
    game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR,
        Phaser.Keyboard.X]);


    //Testing a future feature - togglable shields
    shieldText = game.add.text(game.world.x+60, game.world.y+60, "Shield: " + shieldStrength, {
        font: "20px Arial",
        fill: "#ffffff",
        align: "left"
    });
    shieldText.anchor.setTo(0.5, 0.5);

    asteroidText = game.add.text(game.world.x+10, game.world.y+60, "Asteroids: " + asteroidCount, {
        font: "20px Arial",
        fill: "#ffffff",
        align: "left"
    });
    shieldText.anchor.setTo(0.5, 0.5);

    var gameTime = game.add.text(game.world.x+40, game.world.y+60, "Time: " + timer.seconds, {
        font: "20px Arial",
        fill: "#ffffff",
        align: "left"
    });
    gameTime.anchor.setTo(0.5, 0.5);

    var helpful = game.add.text(game.world.centerX, game.world.centerY+250, "X = Shields | SPACE = Guns", {
        font: "20px Arial",
        fill: "#ffffff",
        align: "center"
    });
    helpful.anchor.setTo(.5,.5);
}

function update() {

    /*
    if ( == 0) {
        for (var i = 0; i < 20; i++) {
            asteroidCount -= 20;
            var s = sprites.create(game.rnd.integerInRange(1, 10), game.rnd.integerInRange(32, 400), 'asteroids');
            //s.animations.add('spin', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
            s.animations.add('spin', [0, 1, 2, 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,
            19,20,21,22,23,24,25,26,27,28,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,
            43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64]);
            s.scale.set (.2,.2);
            s.play('spin', 20, true);
            s.body.velocity.set(game.rnd.integerInRange(-200, 200), game.rnd.integerInRange(-200, 200));
        }

    }*/
    if (enableShield == false) {
        if (shieldStrength < 100)
            shieldStrength += .01;
    }

    if (cursors.left.isDown) {
        sprite.body.angularVelocity = -350;
    }
    else if (cursors.right.isDown) {
        sprite.body.angularVelocity = 350;
    }
    else {
        sprite.body.angularVelocity = 0;
    }

    if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
        fireBullet();
    }

    if (game.input.keyboard.isDown(Phaser.Keyboard.X)) {
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
    asteroidText.setText("Iceteroids: " + asteroidCount);
    //gameTime.setText("Time: " + timer);

}

function destroyPlanet() {
    fx.play('death');
    endGame();
}

//Reduce the shield strength
function weakenShield() {
    if (enableShield) {
        if (shieldStrength == 0) {
            endGame();
        }
        shieldStrength = shieldStrength - 5;
    }
    else {
        endGame();
    }
}

// Set text and notify of loss - destroy all the chickens
function endGame() {

    fx.play('death');
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

    timer.stop();
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
    fx.play('alien death');
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
            bulletTime = game.time.now + 50;
            fx.play('shot');
        }
    }

}

function activateShield() {
    enableShield = true;
    shield.visible = true;
}

function deactivateShield() {
    enableShield = false;
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
   //game.debug.text('Elapsed seconds: ' + this.game.time.totalElapsedSeconds(), 32, 32); 
}

