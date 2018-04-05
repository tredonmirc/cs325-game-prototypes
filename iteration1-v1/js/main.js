
var game = new Phaser.Game(608,608, Phaser.CANVAS, 'Dog Walker', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.tilemap('map', 'assets/iteration-1-w-custome-tile.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles', 'assets/custom_tile.png');
    game.load.image('player', 'assets/dog.png')
    game.load.image('boxBack','assets/boxBack.png');
    game.load.image('closeButton', 'assets/closeButton.png');
    game.load.image('northButton','assets/north_button.png');
    game.load.image('southButton','assets/south_button.png');
    game.load.image('eastButton','assets/east_button.png');
    game.load.image('westButton','assets/west_button.png');
}

var map;
var layer;
var cursors;
var player;
var game_started = false;
var dogs, points, dog, curr_lvls;
var moved;
var help;
var tiles_moved;
var start_pnt, tiles_moved = 0, last_tile = 0, curr_tile, starting_tile;

function create() {

     //Dog array - Values are: [Energy, Aggression, Tank size]
     dogs = [
         [[-8,-8,4], "Your dog appears to be friendly, lazy, and is not whining( doesn't need to go too badly"],
         [[-8,-8,8], "Your dog appears to be friendly, lazy, and is whining( needs to go too badly"],
         [[-8,8,4], "Your dog appears to be aggressive, lazy, and is not whining( doesn't needs to go too badly"],
         [[-8,8,8], "Your dog appears to be friendly, energetic, and is not whining( needs to go badly"],
         [[8,-8,4], "Your dog appears to be aggresive, lazy, and is not whining( doesn't need to go too badly"],
         [[8,-8,8], "Your dog appears to be friendly, lazy, and is not whining( doesn't need to go too badly"],
         [[8,8,4], "Your dog appears to be aggresive, energetic, and is not whining( doesn't need to go too badly"],
         [[8,8,8], "Your dog appears to be aggresive, energetic, and is whining( needs to go badly"],
     ]

     //Board point sytem.  Array values [Energy, Aggression, Tank remaining]
     points = [ 
             [ [],[-.5,0,0],[-.5,0,0],[-.5,0,0],[-.5,0,0],[-.5,0,0],[-.5,0,0],[-.5,0,0],[-.5,0,0],[],[0,.5,0],[0,.5,0],[0,.5,0],[0,.5,0],[0,.5,0],[0,.5,0],[0,.5,0],[0,.5,0],[] ],
             [ [-.5,0,0],[],[],[],[],[],[],[],[],[-.5,.5,0],[],[],[],[],[],[],[],[],[0,.5,0] ],
             [ [-.5,0,0],[],[],[],[],[],[],[],[],[-.5,.5,0],[],[],[],[],[],[],[],[],[0,.5,0] ],
             [ [-.5,0,0],[],[],[],[],[],[],[],[],[-.5,.5,0],[],[],[],[],[],[],[],[],[0,.5,0] ],
             [ [-.5,0,0],[],[],[],[],[],[],[],[],[-.5,.5,0],[],[],[],[],[],[],[],[],[0,.5,0] ],
             [ [-.5,0,0],[],[],[],[],[-1,0,0],[-.5,0,-.5],[-.5,0,-.5],[0,0,-.5],[0,0,-.5],[0,.5,-.5],[0,.5,-.5],[0,.5,-.5],[0,1,0],[],[],[],[],[0,.5,0] ],
             [ [-.5,0,0],[],[],[],[],[-.5,0,-.5],[],[],[],[],[],[],[],[0,.5,-.5],[],[],[],[],[0,.5,0] ],
             [ [-.5,0,0],[],[],[],[],[-.5,0,-.5],[],[],[],[],[],[],[],[0,.5,-.5],[],[],[],[],[0,.5,0] ],
             [ [-.5,0,0],[],[],[],[],[-.5,0,-.5],[],[],[],[],[],[],[],[0,.5,-.5],[],[],[],[],[0,.5,0] ],
             [ [],[-.5,-.5,0],[-.5,-.5,0],[-.5,-.5,0],[-.5,-.5,0],[0,0,-.5],[],[],[],[],[],[],[],[0,0,-.5],[.5,.5,0],[.5,.5,0],[.5,.5,0],[.5,.5,0],[] ],
             [ [0,-.5,0],[],[],[],[],[0,-.5,-.5],[],[],[],[],[],[],[],[.5,0,-.5],[],[],[],[],[.5,0,0] ],
             [ [0,-.5,0],[],[],[],[],[0,-.5,-.5],[],[],[],[],[],[],[],[.5,0,-.5],[],[],[],[],[.5,0,0] ],
             [ [0,-.5,0],[],[],[],[],[0,-.5,-.5],[],[],[],[],[],[],[],[.5,0,-.5],[],[],[],[],[.5,0,0] ],
             [ [0,-.5,0],[],[],[],[],[0,-1,0],[0,-.5,-.5],[0,-.5,-.5],[0,-.5,-.5],[0,0,-.5],[.5,0,-.5],[.5,0,-.5],[.5,0,-.5],[1,0,0],[],[],[],[],[.5,0,0] ],
             [ [0,-.5,0],[],[],[],[],[],[],[],[],[.5,-.5,0],[],[],[],[],[],[],[],[],[.5,0,0] ],
             [ [0,-.5,0],[],[],[],[],[],[],[],[],[.5,-.5,0],[],[],[],[],[],[],[],[],[.5,0,0] ],
             [ [0,-.5,0],[],[],[],[],[],[],[],[],[.5,-.5,0],[],[],[],[],[],[],[],[],[.5,0,0] ],
             [ [0,-.5,0],[],[],[],[],[],[],[],[],[.5,-.5,0],[],[],[],[],[],[],[],[],[.5,0,0] ],
             [ [],[0,-.5,0],[0,-.5,0],[0,-.5,0],[0,-.5,0],[0,-.5,0],[0,-.5,0],[0,-.5,0],[0,-.5,0],[],[.5,0,0],[.5,0,0],[.5,0,0],[.5,0,0],[.5,0,0],[.5,0,0],[.5,0,0],[.5,0,0],[] ]
         ]   

    dog = dogs[Math.floor(Math.random() * dogs.length)];
    curr_lvls = dog[0];
    //console.log(points[3][4]);

    console.log("Dog: "+ dog);
    map = game.add.tilemap('map',32,32);

    var game_width = map.widthInPixels;
    var game_height = map.heightInPixels;

    //var vertical_center = game_width /2;
    //var vertical_center = game_height /2;

    //Change the game to fit the map
    game.world.setBounds(0,0, game_width, game_height);

    map.addTilesetImage('custom', 'tiles');

    //  Create our layer
    layer = map.createLayer(0);
    //layer = map.createLayer(1);

    //  Resize the world
    layer.resizeWorld();

    //  This isn't totally accurate, but it'll do for now
    map.setCollisionBetween(1,1);
    map.setCollisionBetween(2,2);
    map.setCollisionBetween(3,3);
    map.setCollisionBetween(4,4);
    map.setCollisionBetween(12,12);

    //player.setCollisionBetween(this,4);

    //  Un-comment this on to see the collision tiles
    //player.debug = true;

    //  Player
    player = game.add.sprite(1,1, 'player', 1);
    game.physics.enable(player, Phaser.Physics.ARCADE);
    player.body.collideWorldBounds = true;
    player.body.setSize(28,28);
    //player.anchor.setTo(.5);

    //player.debug = true;
    /*
    player.animations.add('left', [8,9], 10, true);
    player.animations.add('right', [1,2], 10, true);
    player.animations.add('up', [11,12,13], 10, true);
    player.animations.add('down', [4,5,6], 10, true);
    */


    //player.body.setSize(16,16, 1, 1);
    game.camera.follow(player);

    cursors = game.input.keyboard.createCursorKeys();

    help = game.add.text(16, 16, 'Energy: '+curr_lvls[0]+" Aggression: "+curr_lvls[1]+" Potty: "+curr_lvls[2], { font: '14px Arial', fill: '#ffffff' });
    help.fixedToCamera = true;
    showMessageBox("Use these areas to walk your dog\n\t\tSwim(blue) to reduce energy\n\t\tDog Park(green) to satisfy friendly dogs" + 
        "\n\t\tChase(red) to satsify aggresive dogs\n\t\tLoung(pink) to reinvigorate lazy dogs\n\t\tPoop square(brown) to relieve your dog" +
        "\n\tReturn to the starting point to end the game" +
        "\n\n"+dog[1]+"\n\nPleae choose a starting position", game.width * .7, game.height * .6,2);
}
function showMessageBox(text, w = game_width, h = game_height, type=1) {
        //just in case the message box already exists
        //destroy it
        if (this.msgBox) {
           this.msgBox.destroy();
        }
        //make a group to hold all the elements
        var msgBox = game.add.group();
        //make the back of the message box
        var back = game.add.sprite(0, 0, "boxBack");
        //make the close button
        if (type==1) {
            var closeButton = game.add.sprite(0, 0, "closeButton");
        }

        if (type==2) {
            var northButton = game.add.sprite(0, 0, "northButton");
            var southButton = game.add.sprite(0, 0, "southButton");
            var eastButton = game.add.sprite(0, 0, "eastButton");
            var westButton = game.add.sprite(0, 0, "westButton");
        }
        //make a text field
        var text1 = game.add.text(0, 0, text);
        text1.fontSize = 12;
        //set the textfeild to wrap if the text is too long
        text1.wordWrap = true;
        //make the width of the wrap 90% of the width 
        //of the message box
        text1.wordWrapWidth = w * .9;
        //
        //
        //set the width and height passed
        //in the parameters
        back.width = w;
        back.height = h;
        //
        //
        //
        //add the elements to the group
        msgBox.add(back);
        if (type == 1) {
            msgBox.add(closeButton);
        }

        if (type == 2) {
            msgBox.add(northButton);
            msgBox.add(southButton);
            msgBox.add(eastButton);
            msgBox.add(westButton);
        }

        msgBox.add(text1);
        //
        //set the close button
        //in the center horizontally
        //and near the bottom of the box vertically
        if (type == 1) {
            closeButton.x = back.width / 2 - closeButton.width / 2;
            closeButton.y = back.height - closeButton.height;
            //enable the button for input
            closeButton.inputEnabled = true;
            //add a listener to destroy the box when the button is pressed
            closeButton.events.onInputDown.add(this.hideBox, this);
        }

        if (type == 2) {

            //northButton.x = back.width / 4 - northButton.width / 1;
            northButton.x = 20;
            northButton.y = back.height - northButton.height;
            //enable the button for input
            northButton.inputEnabled = true;
            //add a listener to destroy the box when the button is pressed
            northButton.events.onInputDown.add(this.setNorth, this);
            northButton.events.onInputDown.add(this.setGameStart, this);
            northButton.events.onInputDown.add(this.hideBox, this);

            //southButton.x = back.width / 4 - southButton.width / 2;
            southButton.x = 120;
            southButton.y = back.height - southButton.height;
            //enable the button for input
            southButton.inputEnabled = true;
            //add a listener to destroy the box when the button is pressed
            southButton.events.onInputDown.add(this.setSouth, this);
            southButton.events.onInputDown.add(this.setGameStart, this);
            southButton.events.onInputDown.add(this.hideBox, this);

            //eastButton.x = back.width / 4 - eastButton.width / 3;
            eastButton.x = 220;
            eastButton.y = back.height - eastButton.height;
            //enable the button for input
            eastButton.inputEnabled = true;
            //add a listener to destroy the box when the button is pressed
            eastButton.events.onInputDown.add(this.setEast, this);
            eastButton.events.onInputDown.add(this.setGameStart, this);
            eastButton.events.onInputDown.add(this.hideBox, this);

            //westButton.x = back.width / 4 - westButton.width / 4;
            westButton.x = 320;
            westButton.y = back.height - westButton.height;
            //enable the button for input
            westButton.inputEnabled = true;
            //add a listener to destroy the box when the button is pressed
            westButton.events.onInputDown.add(this.setWest, this);
            westButton.events.onInputDown.add(this.setGameStart, this);
            westButton.events.onInputDown.add(this.hideBox, this);
        }
        //
        //
        //set the message box in the center of the screen
        msgBox.x = game.width / 2 - msgBox.width / 2;
        msgBox.y = game.height / 2 - msgBox.height / 2;
        //
        //set the text in the middle of the message box
        text1.x = back.width / 2 - text1.width / 2;
        text1.y = back.height / 2 - text1.height / 2;
        //make a state reference to the messsage box
        this.msgBox = msgBox;
    }

    function setSouth() {
        player.x = 288;
        player.y = 576;
        moved = false;
        x = Math.floor(player.position.x/31);
        y = Math.floor(player.position.y/31);
        starting_tile = Math.floor(x) + (Math.floor(y))*19;
        last_tile = starting_tile;
    }
    function setNorth() {
        player.x = 288;
        player.y = 1;
        moved = false;
        x = Math.floor(player.position.x/31);
        y = Math.floor(player.position.y/31);
        starting_tile = Math.floor(x) + (Math.floor(y))*19;
        last_tile = starting_tile;
    }
    function setEast() {
        player.x = 576;
        player.y = 288;
        moved = false;
        x = Math.floor(player.position.x/31);
        y = Math.floor(player.position.y/31);
        starting_tile = Math.floor(x) + (Math.floor(y))*19;
        last_tile = starting_tile;
    }
    function setWest() {
        player.x = 1;
        player.y = 288;
        moved = false;
        x = Math.floor(player.position.x/31);
        y = Math.floor(player.position.y/31);
        starting_tile = Math.floor(x) + (Math.floor(y))*19;
        last_tile = starting_tile;
    }

    function setGameStart() {
        game_started = true;
    }

function hideBox() {
    //destroy the box when the button is pressed
    this.msgBox.destroy();
}

function player_tile() {

    if (game_started) {
        x = Math.floor(player.position.x/31);
        y = Math.floor(player.position.y/31);
        curr_tile = Math.floor(x) + (Math.floor(y))*19;
        //* Debug
        //console.log("X:" + x + " Y: "+y+" Current_tile: "+curr_tile);
        //*/

        moved = !(curr_tile == last_tile);
        console.log("Tile:" + curr_tile + "Last tile: "+last_tile +"Moved: "+moved+"Tiles Moved: "+tiles_moved);
        if (moved) {
            console.log("X:" + x + " Y: "+y+" Current_tile: "+curr_tile);
            mod = points[y][x].length == 0 ? [0,0,0] : points[y][x];
            console.log("Current tile points: "+mod);
            curr_lvls = [curr_lvls[0]+mod[0],curr_lvls[1]+mod[1],curr_lvls[2]+mod[2]]
            console.log("Current dog lvls: "+curr_lvls);
            last_tile = curr_tile;
            tiles_moved += 1;
            help.setText('Energy: '+curr_lvls[0]+" Aggression: "+curr_lvls[1]+" Potty: "+curr_lvls[2]);
        }
    }
}

function update_totals() {
    if (tiles_moved != 0) {
       if (moved && curr_tile == starting_tile) {
        total = Math.abs(curr_lvls[0])+Math.abs(curr_lvls[1])+Math.abs(curr_lvls[2]);
        if (total == 0) 
            msg = "Holy Toledo Man!  Stop playing this game and start a business!!! You got a PERFECT score!!!";
        if (total > 0 && total < 5) {
            msg = "Not bad man, not bad.  The dog is happy and you looking like a rock start";
        }
        if (total >= 5 && total < 10) {
            msg = "Not great.  I mean, the dog is SORTA happy you came, but there's a chance you don't get the business again";
        }
        if (total >= 11) {
            msg = "Good grief man - the dog is simultaneously eating the couch while making friends with the mouse and deficating on the floor.  Feels bad man!!!";
        }
        showMessageBox("You're back!  Let's see how you did...\n\n\n"+msg,game.width * .7, game.height *.6);
       } 
   }

}

function update() {

    game.physics.arcade.collide(player, layer);
    player_tile();
    update_totals();

    player.body.velocity.set(0);

    if (cursors.left.isDown)
    {
        player.body.velocity.x = -100;
        player.play('left');
    }
    else if (cursors.right.isDown)
    {
        player.body.velocity.x = 100;
        player.play('right');
    }
    else if (cursors.up.isDown)
    {
        player.body.velocity.y = -100;
        player.play('up');
    }
    else if (cursors.down.isDown)
    {
        player.body.velocity.y = 100;
        player.play('down');
    }
    else
    {
        player.animations.stop();
    }

}

function render() {

    // game.debug.body(player);

}
