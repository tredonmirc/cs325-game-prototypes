"use strict";

window.onload = function() {
    // You can copy-and-paste the code from any of the examples at http://examples.phaser.io here.
    // You will need to change the fourth parameter to "new Phaser.Game()" from
    // 'phaser-example' to 'game', which is the id of the HTML element where we
    // want the game to go.
    // The assets (and code) can be found at: https://github.com/photonstorm/phaser/tree/master/examples/assets
    // You will need to change the paths you pass to "game.load.image()" or any other
    // loading functions to reflect where you are putting the assets.
    // All loading functions will typically all be found inside "preload()".
    
    var game = new Phaser.Game( 800, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update } );
    var filter;
    var music;
    
    function preload() {
        // Load an image and call it 'logo'.
        //game.load.image( 'logo', 'assets/phaser.png' );
        game.load.image( 'logo', 'assets/cube1.png' ); //CC BY-SA 3.0, https://commons.wikimedia.org/w/index.php?curid=38689
        game.load.audio('background', 'assets/background.mp3'); //http://www.theinstamp3.com/mp3/V-ZVhAlxkgg/free-background-music-for-videos.html
        //game.load.shader('bacteria', 'assets/bacteria.frag'); //https://phaser.io/examples/v2/filters/bacteria & https://github.com/photonstorm/phaser-examples/tree/master/examples/assets/shaders
    }
    
    var bouncy;
    
    function create() {
        // Create a sprite at the center of the screen using the 'logo' image.
        bouncy = game.add.sprite( game.world.centerX, game.world.centerY, 'logo' );
        // Anchor the sprite at its center, as opposed to its top-left corner.
        // so it will be truly centered.
        bouncy.anchor.setTo( 0.5, 0.5 );

        //Setup up some ambience
        music = game.add.audio('background');
        music.play(); 

        //Filter
        //filter = new Phaser.Filter(game, null, game.cache.getShader('bacteria'));
        //filter.addToWorld(0, 0, 800, 600);
        
        // Turn on the arcade physics engine for this sprite.
        game.physics.enable( bouncy, Phaser.Physics.ARCADE );
        // Make it bounce off of the world bounds.
        bouncy.body.collideWorldBounds = true;
        
        // Add some text using a CSS style.
        // Center it in X, and position its top 15 pixels from the top of the world.
        var style = { font: "35px Verdana", fill: "#404040", align: "center" };
        var text = game.add.text( game.world.centerX, 15, "Square up.", style );
        text.anchor.setTo( 0.5, -8.5 );
    }
    
    function update() {
        // Accelerate the 'logo' sprite towards the cursor,
        // accelerating at 500 pixels/second and moving no faster than 500 pixels/second
        // in X or Y.
        // This function returns the rotation angle that makes it visually match its
        // new trajectory.
        //filter.update();
        bouncy.rotation = game.physics.arcade.accelerateToPointer( bouncy, game.input.activePointer, 500, 500, 500 );
    }
};
