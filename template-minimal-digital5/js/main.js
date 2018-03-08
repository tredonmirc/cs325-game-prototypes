EnemyTank = function (index, game, player, bullets) {

    //var x = game.world.randomX;
    var x = (Math.random() * 2000) -1000;
    //var y = game.world.randomY;
    var y = (Math.random() * 2000) -1000;

    this.game = game;
    this.health = 1;
    this.player = player;
    this.bullets = bullets;
    this.fireRate = 1000;
    this.nextFire = 0;
    this.alive = true;


    this.tank = game.add.sprite(x, y, 'enemy', 'tank1');
    this.tank.scale.setTo(0.3,0.3);
    this.turret = game.add.sprite(x, y, 'turret', 'turret');
    this.turret.scale.setTo(0.3,0.3);

    this.tank.anchor.set(0.5);
    this.turret.anchor.set(0.3, 0.3);

    this.tank.name = index.toString();
    game.physics.enable(this.tank, Phaser.Physics.ARCADE);
    this.tank.body.immovable = false;
    this.tank.body.collideWorldBounds = true;
    this.tank.body.bounce.setTo(1, 1);

    this.tank.angle = game.rnd.angle();

    game.physics.arcade.velocityFromRotation(this.tank.rotation, 100, this.tank.body.velocity);

};

SandBar = function (index, game) {

    var x = game.world.randomX;
    //var x = (Math.random() * 2000) -1000;
    var y = game.world.randomY;
    //var y = (Math.random() * 2000) -1000;

    this.game = game;

    this.sandbar = game.add.sprite(x, y, 'sandbar', 'sandbar');
    this.sandbar.scale.setTo(0.6,0.6);

    this.sandbar.anchor.set(0.5);

    this.sandbar.angle = game.rnd.angle();

    this.sandbar.name = index.toString();
    game.physics.enable(this.sandbar, Phaser.Physics.ARCADE);
    this.sandbar.body.immovable = true;
    this.sandbar.body.collideWorldBounds = true;
};

EnemyTank.prototype.damage = function() {

    this.health -= 1;

    if (this.health <= 0)
    {
        this.alive = false;
        this.tank.kill();
        this.turret.kill();

        return true;
    }

    return false;

}

EnemyTank.prototype.kill = function() {
    this.tank.kill();
    return true;
}

EnemyTank.prototype.update = function() {


    this.turret.x = this.tank.x;
    this.turret.y = this.tank.y;
    this.turret.rotation = this.game.physics.arcade.angleBetween(this.tank, this.player);

    if (this.game.physics.arcade.distanceBetween(this.tank, this.player) < 300)
    {
        if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0)
        {
            this.nextFire = this.game.time.now + this.fireRate;

            var bullet = this.bullets.getFirstDead();

            bullet.reset(this.turret.x, this.turret.y);

            bullet.rotation = this.game.physics.arcade.moveToObject(bullet, this.player, 500);
        }
    }

};

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload () {

    game.load.image('tank', 'assets/my_ship.png'); //image from: https://opengameart.org/content/black-sail-ship-bleeds-game-art (self modified)
    game.load.image('enemy', 'assets/pirate_ship.png'); //image from: https://opengameart.org/content/black-sail-ship-bleeds-game-art
    game.load.image('logo', 'assets/games/tanks/logo.png');
    game.load.image('bullet', 'assets/cannon_ball.png'); //image from: https://www.spriters-resource.com/update-351/
    game.load.image('earth', 'assets/water.jpg'); //image from: http://bit.ly/2HcVngc
    game.load.image('turret','assets/cannon.png'); //image from: http://img.freepik.com/vettori-gratuito/varieta-di-oggetti-pirata-in-disegno-piatto_23-2147623944.jpg?size=338&ext=jpg (self modified)
    game.load.spritesheet('kaboom', 'assets/explosion.png', 64, 64, 23);
    game.load.image('sandbar','assets/sandbar.png'); //image from: http://dullahansoft.com/pixel/?m=201405
    
}

var land;

var tank;
//var turret;

var enemies;
var enemyBullets;
var enemiesTotal = 0;
var enemiesAlive = 0;
var explosions;

var logo;

var sandbars;
var sandbarTotals;

var currentSpeed = 0;
var cursors;

var bullets;
var fireRate = 100;
var nextFire = 0;

var timer;

var gameWon = false;

function create () {

    this.timer = this.game.time.create(this.game);    
    this.timer.start();

    //  Resize our game world to be a 2000 x 2000 square
    game.world.setBounds(-1000, -1000, 2000, 2000);

    //  Our tiled scrolling background
    land = game.add.tileSprite(0, 0, 800, 600, 'earth');
    land.fixedToCamera = true;

    //  The base of our tank
    tank = game.add.sprite(0, 0, 'tank', 'tank1');
    tank.scale.setTo(0.3,0.3);
    tank.anchor.setTo(0.5, 0.5);
    tank.animations.add('move', ['tank1', 'tank2', 'tank3', 'tank4', 'tank5', 'tank6'], 20, true);

    //  This will force it to decelerate and limit its speed
    game.physics.enable(tank, Phaser.Physics.ARCADE);
    tank.body.drag.set(0.4);
    tank.body.maxVelocity.setTo(400, 400);
    tank.body.collideWorldBounds = true;

    //  Finally the turret that we place on-top of the tank body
    //turret = game.add.sprite(0, 0, 'tank', 'turret');
    //turret.anchor.setTo(0.3, 0.5);

    //  The enemies bullet group
    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    enemyBullets.createMultiple(100, 'bullet');
    enemyBullets.setAll('scale.x','0.3');
    enemyBullets.setAll('scale.y','0.3');

    
    enemyBullets.setAll('anchor.x', 0.5);
    enemyBullets.setAll('anchor.y', 0.5);
    enemyBullets.setAll('outOfBoundsKill', true);
    enemyBullets.setAll('checkWorldBounds', true);

    // sandbar group
    sandbars = game.add.group();
    sandbars.enableBody = true;
    sandbars.physicsBodyType = Phaser.Physics.ARCADE;
    sandbars.createMultiple(100, 'sandbar');
    sandbars.setAll('scale.x','0.3');
    sandbars.setAll('scale.y','0.3');

    
    sandbars.setAll('anchor.x', 0.5);
    sandbars.setAll('anchor.y', 0.5);
    sandbars.setAll('outOfBoundsKill', false);
    sandbars.setAll('checkWorldBounds', false);


    //  Create some baddies to waste :)
    enemies = [];

    enemiesTotal = 20;
    enemiesAlive = 20;

    for (var i = 0; i < enemiesTotal; i++)
    {
        enemies.push(new EnemyTank(i, game, tank, enemyBullets));
    }


    sandbarTotals = 30;
    sandbars = []
    // create some  sandbars
    for (var i = 0; i < sandbarTotals; i++)
    {
        //sandbars.push(new SandBar(i,game));
    }

    //  Our bullet group
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet', 0, false);
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 0.5);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    //  Explosion pool
    explosions = game.add.group();

    for (var i = 0; i < 10; i++)
    {
        var explosionAnimation = explosions.create(0, 0, 'kaboom', [0], false);
        explosionAnimation.anchor.setTo(0.5, 0.5);
        explosionAnimation.animations.add('kaboom');
    }

    //tank.bringToTop();
    //turret.bringToTop();

    //logo = game.add.sprite(0, 200, 'logo');
    //logo.fixedToCamera = true;

    //game.input.onDown.add(removeLogo, this);

    game.camera.follow(tank);
    game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
    game.camera.focusOnXY(0, 0);

    cursors = game.input.keyboard.createCursorKeys();

}

function removeLogo () {

    game.input.onDown.remove(removeLogo, this);
    logo.kill();

}

function update () {

    game.physics.arcade.overlap(enemyBullets, enemies, bulletHitEnemy, null, this);
    game.physics.arcade.collide(sandbars, tank, slowShip, null, this);

    enemiesAlive = 0;

    for (var i = 0; i < enemies.length; i++)
    {
        if (enemies[i].alive)
        {
            enemiesAlive++;
            game.physics.arcade.collide(enemyBullets, enemies[i].tank, bulletHitEnemy, null, this);
            enemies[i].update();
        }
    }

    if (enemiesAlive <= 1) {
        winGame();
    }

    if (cursors.left.isDown)
    {
        tank.angle -= 4;
    }
    else if (cursors.right.isDown)
    {
        tank.angle += 4;
    }

    if (cursors.up.isDown)
    {
        //  The speed we'll travel at
        currentSpeed = 300;
    }
    else
    {
        if (currentSpeed > 0)
        {
            currentSpeed -= 4;
        }
    }

    if (currentSpeed > 0)
    {
        game.physics.arcade.velocityFromRotation(tank.rotation, currentSpeed, tank.body.velocity);
    }

    land.tilePosition.x = -game.camera.x;
    land.tilePosition.y = -game.camera.y;


    //turret.x = tank.x;
    //turret.y = tank.y;

    //turret.rotation = game.physics.arcade.angleToPointer(turret);

    if (game.input.activePointer.isDown)
    {
        //  Boom!
        fire();
    }

    if (gameWon) {
        endGameText.x = tank.x;
        endGameText.y = tank.y;
    }

}

function winGame() {
   
    if (!gameWon) {
        gameWon = true;
        for (var i = 0; i < enemies.length; i++)
        {
            enemies[i].damage();

        }
        var time = game.time.now;
        endGameText = game.add.text(tank.x, tank.y, "The last pirate ship has fled.\n You may now rest in peace!\nTime Completed: "+time/1000+" seconds", {
            font: "40px Arial",
            fill: "a042aa",
            align: "center"
        });
        endGameText.anchor.setTo(0.5, 0.5);
    }
}

function bulletHitPlayer (tank, bullet) {

    bullet.kill();

}

function slowShip(tank) {
    /*
    if (tank.curentSpeed > 30) {
        currentSpeed = currentSpeed*.1;
    }*/
    this.tank.body.velocity = .9*this.tank.body.velocity;
}

function bulletHitEnemy (tank, bullet) {

    bullet.kill();

    var destroyed = enemies[tank.name].damage();

    if (destroyed)
    {
        var explosionAnimation = explosions.getFirstExists(false);
        explosionAnimation.reset(tank.x, tank.y);
        explosionAnimation.play('kaboom', 30, false, true);
    }
}

function fire () {

    if (game.time.now > nextFire && bullets.countDead() > 0)
    {
        nextFire = game.time.now + fireRate;

        var bullet = bullets.getFirstExists(false);

        //bullet.reset(turret.x, turret.y);

        bullet.rotation = game.physics.arcade.moveToPointer(bullet, 1000, game.input.activePointer, 500);
    }

}

function render () {

    // game.debug.text('Active Bullets: ' + bullets.countLiving() + ' / ' + bullets.length, 32, 32);
    game.debug.text('Enemies: ' + enemiesAlive + ' / ' + enemiesTotal, 32, 32);
    if (!gameWon) {
        game.debug.text('Time: '+ game.time.now/1000, 32, 64);
    }

}

