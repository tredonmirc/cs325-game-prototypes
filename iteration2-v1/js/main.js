
var game = new Phaser.Game(1056,816, Phaser.CANVAS, 'Friday Night', { preload: preload, create: create, update: update, render: render });

function preload() {
    game.load.tilemap('map', 'assets/friday_night.json', null, Phaser.Tilemap.TILED_JSON);
    //game.load.image('tiles', 'assets/custom_tile.png');
    game.load.image('paths2', 'assets/paths.png');
    game.load.image('danger_tile', 'assets/danger_tile.png');
    game.load.image('money_tile', 'assets/money_tile.png');
    game.load.image('school_tile', 'assets/hw_tile.png');
    game.load.image('party_tile', 'assets/party_tile.png');
    game.load.image('swap_tile', 'assets/swap_tile.png');
    game.load.image('player1','assets/player1.png');
    game.load.image('player2','assets/player2.png');
    game.load.image('player3','assets/player3.png');
    game.load.image('player4','assets/player4.png');
}

//var startImg;
var newTurn = true;
var totalPlayers = 2;
var movesRemaining = 0;
var currentPlayer;
var turnInfo;
var debug = true;
var roll;
var alert;
var timeCheck;
var counter = 0;
var lastMoved = 0;
var map;
var playerArray, playerVisited, playerScore;
var layer;
var cursors;
var player;
var game_started = false;
var dogs, points, dog, curr_lvls;
var moved;
var help;
var tiles_moved;
var start_pnt, tiles_moved = 0, last_tile = 0, curr_tile, starting_tile;
var start_tile;
var tileActions;

function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);


     //Dog array - Values are: [Energy, Aggression, Tank size]
     dogs = [
         [[8,-8,4], "Your dog appears to be energetic, friendly, and is not whining( doesn't need to go too badly"],
         [[8,-8,8], "Your dog appears to be energetic, friendly, and is whining( needs to go too badly"],
         [[8,8,4], "Your dog appears to be energetic, aggressive, and is not whining( doesn't needs to go too badly"],
         [[8,8,8], "Your dog appears to be energetic, aggressive, and is whining( needs to go badly"],
         [[-8,-8,4], "Your dog appears to be lazy, friendly, and is not whining( doesn't need to go too badly"],
         [[-8,-8,8], "Your dog appears to be lazy, friendly, and is whining( doesn't need to go too badly"],
         [[-8,8,4], "Your dog appears to be lazy, aggressive, and is not whining( doesn't need to go too badly"],
         [[-8,8,8], "Your dog appears to be lazy, aggressive, and is whining( needs to go badly"],
     ]

     curr_tile = 0;

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
    map = game.add.tilemap('map','map',16);

    var game_width = map.widthInPixels;
    var game_height = map.heightInPixels;

    playerScore = [0,0];
    playerVisited = [{},{}]
    currentPlayer = 0;

    console.log(game_width);
    console.log(game_height);

    //var vertical_center = game_width /2;
    //var vertical_center = game_height /2;

    //Change the game to fit the map
    //game.world.setBounds(0,0, game_width, game_height);

    map.addTilesetImage('paths2', 'paths2');
    map.addTilesetImage('danger_tile', 'danger_tile');
    map.addTilesetImage('money_tile', 'money_tile');
    map.addTilesetImage('school_tile', 'school_tile');
    map.addTilesetImage('party_tile', 'party_tile');
    map.addTilesetImage('swap_tile', 'swap_tile');

    //  This isn't totally accurate, but it'll do for now
    
    //  Create our layer
    layer = map.createLayer(0);
    map.setCollisionBetween(1250,1250);
    map.setCollision(1250);
    map.setCollision(3710);
    map.setCollision(3711);

    map.setCollision(1900);

    //layer.debug = true;

    //  Resize the world
    layer.resizeWorld();

    tileActions = {
        76: ['swapPlayer',((currentPlayer+1) % totalPlayers)],
        80: ['swapPlayer',((currentPlayer+1) % totalPlayers)],
        94: ['swapPlayer',((currentPlayer+1) % totalPlayers)],
        156: ['swapPlayer',((currentPlayer+1) % totalPlayers)],
        189: ['swapPlayer',((currentPlayer+1) % totalPlayers)],
        197: ['swapPlayer',((currentPlayer+1) % totalPlayers)],
        358: ['swapPlayer',((currentPlayer+1) % totalPlayers)],
        273: ['swapPlayer',((currentPlayer+1) % totalPlayers)]
    }

    /*
    map.setCollisionBetween(2,2);
    map.setCollisionBetween(3,3);
    map.setCollisionBetween(4,4);
    map.setCollisionBetween(12,12);
    */


    //  Players
    player1 = game.add.sprite(24,24, 'player1', 1);
    player2 = game.add.sprite(24,24, 'player2', 1);
    /*
    player3 = game.add.sprite(1,1, 'player3', 1);
    player4 = game.add.sprite(24,24, 'player4', 1);
    */

    //playerArray = [player1,player2,player3,player4]
    playerArray = [player1,player2];

    for (var i = 0; i<playerArray.length; i++) {
        player = playerArray[i]; 
        game.physics.enable(player, Phaser.Physics.ARCADE);
        player.enableBody = true;
        player.body.collideWorldBounds = true;
        player.anchor.setTo(.5);
        game.physics.arcade.collide(player,layer);
        player.debug = true;

    }
    //player.anchor.setTo(.5);

    //Start tile
    //startTile = game.add.sprite(0,0,'start_tile',2);
    //startTile.anchor.setTo(.5);

    //Music
    /*
    music = game.add.audio('background_music');
    music.volume = .2;
    */

    //player.debug = true;

    //game.camera.follow(player);

    cursors = game.input.keyboard.createCursorKeys();

    start = game.add.text(18, 34, 'START', { font: '19px Arial', fill: '#000000' });
    finish = game.add.text(950, 785, 'FINISH', { font: '19px Arial', fill: '#000000' });
    turnInfo = game.add.text(800, 34, '', { font: '14px Arial', fill: '#ffffff' });
    //help.fixedToCamera = true;
    /*
    showMessageBox("Welcome Dog Walker!\n\nUse these areas to walk your dog\n\t\tSwim (blue) to reduce energy\n\t\tDog Park (green) to satisfy friendly dogs" + 
        "\n\t\tChase (red) to satsify aggresive dogs\n\t\tLounge (pink) to reinvigorate lazy dogs\n\t\tPoop square (brown) to relieve your dog" +
        "\n\tReturn to the starting point to end the game" +
        "\n\n"+dog[1]+"\n\nPlease choose a starting position", game.width * .7, game.height * .6,2);
    */
}


function showMessageBox(text, w = game_width, h = game_height, type=1,stars=false,star_type=0) {
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
        if (stars == true) {
            switch(star_type) {
                case 0:
                    var starsImg = game.add.sprite(0,0,"star0");
                    break;
                case 1:
                    var starsImg = game.add.sprite(0,0,"star1");
                    break;
                case 2:
                    var starsImg = game.add.sprite(0,0,"star2");
                    break;
                case 3:
                    var starsImg = game.add.sprite(0,0,"star3");
                    break;
                default: 
                    var starsImg = game.add.sprite(0,0,"star0");
            }
        } 
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
        msgBox.add(starsImg);
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
        //text1.x = back.width - .9*back.width;
        //text1.y = -100;
        closeButton.x = back.width / 2 - closeButton.width / 2;
        closeButton.y = back.height - closeButton.height -10;
        starsImg.x = back.width / 2 - starsImg.width / 2;
        //starsImg.y = back.height - starsImg.height;
        //enable the button for input
        closeButton.inputEnabled = true;
        //add a listener to destroy the box when the button is pressed
        closeButton.events.onInputDown.add(this.restart, this);
        closeButton.events.onInputDown.add(this.hideBox, this);
    }

    if (type == 2) {

        //northButton.x = back.width / 4 - northButton.width / 1;
        northButton.x = 20;
        northButton.y = back.height - northButton.height-10;
        //enable the button for input
        northButton.inputEnabled = true;
        //add a listener to destroy the box when the button is pressed
        northButton.events.onInputDown.add(this.setNorth, this);
        northButton.events.onInputDown.add(this.setGameStart, this);
        northButton.events.onInputDown.add(this.hideBox, this);

        //southButton.x = back.width / 4 - southButton.width / 2;
        southButton.x = 120;
        southButton.y = back.height - southButton.height -10;
        //enable the button for input
        southButton.inputEnabled = true;
        //add a listener to destroy the box when the button is pressed
        southButton.events.onInputDown.add(this.setSouth, this);
        southButton.events.onInputDown.add(this.setGameStart, this);
        southButton.events.onInputDown.add(this.hideBox, this);

        //eastButton.x = back.width / 4 - eastButton.width / 3;
        eastButton.x = 220;
        eastButton.y = back.height - eastButton.height -10;
        //enable the button for input
        eastButton.inputEnabled = true;
        //add a listener to destroy the box when the button is pressed
        eastButton.events.onInputDown.add(this.setEast, this);
        eastButton.events.onInputDown.add(this.setGameStart, this);
        eastButton.events.onInputDown.add(this.hideBox, this);

        //westButton.x = back.width / 4 - westButton.width / 4;
        westButton.x = 320;
        westButton.y = back.height - westButton.height - 10;
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



        //* Debug
        //console.log("X:" + x + " Y: "+y+" Current_tile: "+curr_tile);
        //*/
/*
        //Every ten seconds, increment the poop value a bit
        if (counter%600==0) {
            curr_lvls[2] = curr_lvls[2]+.5;
            //help.setText("Hurry! Your dog's \"tank\" needs are growing again!!!");
            alert = game.add.text(game.world.centerX, game.world.centerY, "Hurry! Your dog's \"tank\" needs are growing!");

               //   Center align
               alert.anchor.set(0.5);
               alert.align = 'center';

               //   Font style
               alert.font = 'Arial Black';
               alert.fontSize = 30;
               alert.fontWeight = 'bold';

               //   Stroke color and thickness
               alert.stroke = '#000000';
               alert.strokeThickness = 6;
               alert.fill = '#b20e3c';

        }

        if (counter%690==0) {
            alert.destroy();
        }


        moved = !(curr_tile == last_tile);
        console.log("Tile:" + curr_tile + "Last tile: "+last_tile +"Moved: "+moved+"Tiles Moved: "+tiles_moved+"counter: "+counter);
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
        endMusic();
        //game_started = false;
        total = Math.abs(curr_lvls[0])+Math.abs(curr_lvls[1])+Math.abs(curr_lvls[2]);
        if (total == 0) 
            msg = "Holy Toledo Man!  Stop playing this game and start a business!!! You got a PERFECT score!!!";
            star_total=3;
        if (total > 0 && total < 5) {
            msg = "Not bad!  The dog is happy and you looking like a rock star!";
            star_total=2;
        }
        if (total >= 5 && total < 10) {
            msg = "Not great.  I mean, the dog is SORTA happy you came, but there's a chance you don't get the business again";
            star_total=1;
        }
        if (total >= 11) {
            msg = "Good grief man - the dog is simultaneously eating the couch while making friends with the mouse and deficating on the floor.  Feels bad man!!!";
            star_total=0;
        }
        showMessageBox("You're back!  Let's see how you did...\n\n\n"+msg,game.width * .7, game.height *.6,1,true,star_total);
       } 
   }

}*/

function checkForAction() {
    if (tileActions.hasOwnProperty(curr_tile) && !(playerVisited[currentPlayer].hasOwnProperty(curr_tile))) {
        action = tileActions[curr_tile][0];
        params = tileActions[curr_tile][1];

        eval(action)(params);    
    }
}

function swapPlayer(playerToSwap) {

    var tempX = player.x;
    var tempY = player.y;
    player.position = new Phaser.Point (playerArray[playerToSwap].x, playerArray[playerToSwap].y);
    playerArray[playerToSwap].position = new Phaser.Point(tempX,tempY);
}


function setGameStart() {
    game_started = true;
}

function restart() {
    music.stop();
    this.game.state.restart();
}

function setRemainingTurns() {
    movesRemaining = roll;
}
function hideBox() {
    //destroy the box when the button is pressed
    this.msgBox.destroy();
}

function playMusic() {
    music.play();
}

function endMusic() {
    music.fadeOut(2000);
}

function moved() {
            lastMoved = timeCheck.now;
            console.log(player);
            movesRemaining-=1;
            updateDisplay();
            getCurrentTile();
            console.log(curr_tile);
}

function registerTile() {
    playerVisited[currentPlayer][curr_tile] = "";
}

function checkIfDone() {
    if (debug)
        return;
    if (movesRemaining == 0) {
        switchPlayer();
        newTurn = true;
    }
}

function updateDisplay() {
    turnInfo.setText("Player: "+currentPlayer+
        "\n| Roll: "+roll+"\n| Remaining moves: "+ movesRemaining+
        "\n| Score: "+playerScore[currentPlayer]);
}

function rollDice() {
    this.roll = game.rnd.integerInRange(1,6);
    if (debug) {
        console.log("roll: "+roll);
    }
}

function switchPlayer() {
    index = (currentPlayer+1) % totalPlayers;
    player = playerArray[index];
    currentPlayer = index;
}

function getTime() {
    timeCheck = game.time;
}

function onMoveCD() {
    getTime();
   if ( (timeCheck.now - lastMoved) > 400) {
    return false;
   } else {
    return true;
   }
}

function getCurrentTile() {
    x = Math.floor(player.body.x/48);
    y = Math.floor(player.body.y/48);
    curr_tile = Math.floor(x) + (Math.floor(y))*22;
    if (debug) {
        console.log ("X: "+x+" Y: "+y)
        console.log ( curr_tile );
    }
}

function update() {
    game.physics.arcade.collide(player, layer);
/*
    player_tile();
    update_totals();
    */
    checkForAction();
    registerTile();
    checkIfDone();

    if (newTurn) {
        rollDice();
        setRemainingTurns();
        updateDisplay();
        newTurn = false;
    }

    getTime();

    if (!onMoveCD() ) {
        if (cursors.left.isDown)
        {
            player.body.x = player.body.x-48;
            //player.body.velocity.x = -100;
            moved();
        }
        else if (cursors.right.isDown)
        {
            //player.body.velocity.x = 100;
            player.body.x = player.body.x+48;
            moved();
        }
        else if (cursors.up.isDown)
        {
            //player.body.velocity.y = -100;
            player.body.y = player.body.y-48;
            moved();
        }
        else if (cursors.down.isDown)
        {
            //player.body.velocity.y = 100;
            player.body.y = player.body.y+48;
            moved();
        }
        else
        {
            player.animations.stop();
        }
    }

}

function destory_alert() {
    alert.destroy;
}


function alert() {
    alert = game.add.text(game.world.centerX, game.world.centerY, "Hurry! Your dog's \"tank\" needs are growing!");

       //   Center align
       alert.anchor.set(0.5);
       alert.align = 'center';

       //   Font style
       alert.font = 'Arial Black';
       alert.fontSize = 30;
       alert.fontWeight = 'bold';

       //   Stroke color and thickness
       alert.stroke = '#000000';
       alert.strokeThickness = 6;
       alert.fill = '#43d637';
}

function render() {

    //game.debug.body(player);
    //game.debug.soundInfo(music, 20, 32);
}
