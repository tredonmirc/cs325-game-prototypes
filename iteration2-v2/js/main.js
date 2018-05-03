
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
    game.load.image('lgndBack', 'assets/legend.png');
    game.load.image('instrBox', 'assets/instructions.png');
    game.load.image('finishBox', 'assets/game_over.png');
    game.load.image('closeButton', 'assets/closeButton.png');
    // Sound Pack https://freesound.org/people/Robinhood76/packs/11394/
    // Bamboo https://freesound.org/people/InspectorJ/sounds/394453/
    //game.load.audio('movesound', 'assets/move.wav');
    game.load.audio('move','assets/move.wav');
    game.load.audio('points','assets/points.wav');
    game.load.audio('swap','assets/swap.wav');
    game.load.audio('bad_risk','assets/bad_risk.wav');
    game.load.audio('good_risk','assets/good_risk.wav');
    game.load.audio('game_over','assets/game_over.wav');
    game.load.audio('music','assets/music.mp3');

    //game.load.audio('background_music', 'assets/bensound-funnysong.mp3'); //Music: https://www.bensound.com
}

//Locks
var working = false; //A rudimentary lock

//var startImg;
var spaceKey
var lgndBox;
var newTurn = true;
var totalPlayers = 2;
var movesRemaining = 0;
var currentPlayer;
var turnInfo;
var helpInfo;
var debug = false;
var roll;
var alert;
var timeCheck;
var counter = 0;
var lastMoved = 0;
var map;
var playerArray, playerVisited, playerScores;
var layer;
var cursors,l;
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

    move_sound = game.add.audio('move');
    points_sound = game.add.audio('points');
    swap_sound = game.add.audio('swap');
    bad_risk_sound = game.add.audio('bad_risk');
    good_risk_sound = game.add.audio('good_risk');
    game_over_sound = game.add.audio('game_over');
    music = game.add.audio('music');
    music.volume = .05;

    game.physics.startSystem(Phaser.Physics.ARCADE);

    //Initialize game
    curr_tile = 0;
    map = game.add.tilemap('map','map',16);
    var game_width = map.widthInPixels;
    var game_height = map.heightInPixels;
    playerScores = [[0,0,0],[0,0,0]];
    playerVisited = [{},{}]
    currentPlayer = 0;

    if (debug) {
        console.log(game_width);
        console.log(game_height);
    }

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

    /*
        The most challenging component of this game is right here.  To ensure smooth and precise movements of the players, 
        I've opted for instantly updating the player coordinates instead of giving them velocity to move around.  This 
        is also to eliminate the movement "snagging" that occurred in the my first iteration of a board game in phaser.
        Because the coordinates are being updated immediately, collisions in tiles don't work.  I'm creating a hash of 
        viable movement tiles to check against before the player moves.  
    */
    //first group, win, second group, lose
    danger_tiles = [
        [[0,2,1,1],[0,-1,-2,2]], // Danger tile 1 
        [[1,0,2,1],[-2,0,-1,2]], // Danger tile 2
        [[2,0,1,1],[0,-1,-2,2]], // Danger tile 3
        [[2,1,0,1],[0,-2,-1,2]], // Danger tile 4
        [[1,2,0,1],[-1,-2,0,2]], // Danger tile 5
        [[1,2,0,1],[-2,-1,0,2]] // Danger tile 6
    ]


    valid_tiles = [
        0,1,2,3,4,5,6,7,11,
        22,23,24,29,30,31,32,33,34,35,36,37,
        44,46,47,48,51,53,56,59,
        66,67,70,71,74,75,76,80,81,
        89,90,92,94,96,103,107,
        111,114,115,116,118,125,126,127,128,129,130,
        133,138,140,142,148,150,152,
        155,156,160,161,162,163,164,170,174,
        177,182,184,186,189,192,196,
        199,200,203,204,208,209,210,211,212,213,214,215,216,217,218,219,
        221,225,232,234,236,238,241,
        243,244,245,246,247,254,260,262,263,
        265,274,275,276,282,285,
        287,296,303,304,306,307,
        309,310,318,326,329,
        331,333,335,338,340,343,345,348,351,
        353,354,355,356,357,358,359,360,361,362,363,364,365,366,367,368,369,370,371,372,373
    ]
     

    //  Resize the world
    layer.resizeWorld();

    // DangerTile types 1: School, 2: Work, 3: Party
    tileActions = {
        76: ['swapPlayer',((currentPlayer+1) % totalPlayers)],
        80: ['swapPlayer',((currentPlayer+1) % totalPlayers)],
        94: ['swapPlayer',((currentPlayer+1) % totalPlayers)],
        156: ['swapPlayer',((currentPlayer+1) % totalPlayers)],
        333: ['swapPlayer',((currentPlayer+1) % totalPlayers)],
        343: ['swapPlayer',((currentPlayer+1) % totalPlayers)],
        189: ['swapPlayer',((currentPlayer+1) % totalPlayers)],
        11: ['scoreTile',0],
        51: ['scoreTile',0],
        107: ['scoreTile',0],
        306: ['scoreTile',0],
        71: ['scoreTile',1],
        142: ['scoreTile',1],
        234: ['scoreTile',1],
        303: ['scoreTile',1],
        345: ['scoreTile',2],
        335: ['scoreTile',2],
        310: ['scoreTile',2],
        90: ['scoreTile',2],
        200: ['dangerTile',[0]],
        338: ['dangerTile',[2]],
        184: ['dangerTile',[1]],
        236: ['dangerTile',[5]],
        56: ['dangerTile',[3]],
        150: ['dangerTile',[4]],
        373: ['finishTile',''],
        372: ['finishTile',''],
        371: ['finishTile',''],
        370: ['finishTile','']
    }


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

    //Music
    /*
    music = game.add.audio('background_music');
    music.volume = .2;
    */

    //player.debug = true;

    //game.camera.follow(player);

    cursors = game.input.keyboard.createCursorKeys();
    spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR); 
    game.input.keyboard.addKeyCapture([ Phaser.Keyboard.ALT, Phaser.Keyboard.RIGHT, Phaser.Keyboard.SPACEBAR ]);
    //game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACE]);
    start = game.add.text(18, 34, 'START', { font: '19px Arial', fill: '#000000' });
    finish = game.add.text(950, 785, 'FINISH', { font: '19px Arial', fill: '#000000' });
    turnInfo = game.add.text(800, 50, '', { font: '14px Arial', fill: '#ffffff' });
    helpInfo = game.add.text(650, 10, 'SPACE for INSTRUCTIONS & ALT for Tile Legend',{ font: '16px Arial', fill: '#ffffff' });
    //help.fixedToCamera = true;
    /*
    showMessageBox("Welcome Dog Walker!\n\nUse these areas to walk your dog\n\t\tSwim (blue) to reduce energy\n\t\tDog Park (green) to satisfy friendly dogs" + 
        "\n\t\tChase (red) to satsify aggresive dogs\n\t\tLounge (pink) to reinvigorate lazy dogs\n\t\tPoop square (brown) to relieve your dog" +
        "\n\tReturn to the starting point to end the game" +
        "\n\n"+dog[1]+"\n\nPlease choose a starting position", game.width * .7, game.height * .6,2);
    */

    lgndBox = game.add.sprite(0,0, "lgndBack");
    lgndBox.x = game.width / 2 - lgndBox.width / 2;
    lgndBox.y = game.height / 2 - lgndBox.height / 2;

    instrBox = game.add.sprite(0,0, "instrBox");
    instrBox.x = game.width / 2 - instrBox.width / 2;
    instrBox.y = game.height / 2 - instrBox.height / 2;
    instrBox.visible = true;

    music.play();

}

function showLegend() {
    lgndBox.visible = true;
}

function hideLegend() {
    lgndBox.visible = false;
}

function showInstructions() {
    instrBox.visible = true;
}

function hideInstructions() {
    instrBox.visible = false;
}

function finishTile() {
    //just in case the message box already exists
    //destroy it
    //make a group to hold all the elements
    game_over_sound.play();
    music.fadeOut(2000);
    total_0 = playerScores[0][0] + playerScores[0][1] + playerScores[0][2];
    total_1 = playerScores[1][0] + playerScores[1][1] + playerScores[1][2];

    if (total_0 > total_1) {
        winner = 0;
    } else {
        winner = 1;
    }

    text = "Player 0 Final Score: "+total_0+"\n"+
            "Player 1 Final Score: "+total_1+"\n"+
            "\n\n\nThe WINNER is Player "+winner+"!!!";

    var msgBox = game.add.group();
    //make the back of the message box
    var back = game.add.sprite(0, 0, "finishBox");
    //make the close button
    var closeButton = game.add.sprite(0, 0, "closeButton");

    //make a text field
    var text1 = game.add.text(0, 0, text);
    text1.fontSize = 12;
    //set the textfield to wrap if the text is too long
    text1.wordWrap = true;
    //make the width of the wrap 90% of the width 
    //of the message box
    w = back.width;
    h = back.height;;
    text1.wordWrapWidth = w * .9;

    //add the elements to the group
    msgBox.add(back);
    msgBox.add(closeButton);
    msgBox.add(text1);
    //
    //set the close button
    //and near the bottom of the box vertically
    closeButton.x = back.width / 2 - closeButton.width / 2;
    closeButton.y = back.height - closeButton.height -10;
    //starsImg.y = back.height - starsImg.height;
    //enable the button for input
    closeButton.inputEnabled = true;
    //add a listener to destroy the box when the button is pressed
    closeButton.events.onInputDown.add(this.restart, this);
    closeButton.events.onInputDown.add(this.hideBox, this);

    //set the message box in the center of the screen
    msgBox.x = game.width / 2 - msgBox.width / 2;
    msgBox.y = game.height / 2 - msgBox.height / 2;

    //set the text in the middle of the message box
    text1.x = back.width / 2 - text1.width / 2;
    text1.y = back.height / 2 - text1.height / 2;
    //make a state reference to the messsage box
    this.msgBox = msgBox;
}


function checkForAction() {
    if (debug)
        console.log ("In checkForAction on tile:"+curr_tile);
    if (tileActions.hasOwnProperty(curr_tile) && !(playerVisited[currentPlayer].hasOwnProperty(curr_tile))) {
        action = tileActions[curr_tile][0];
        params = tileActions[curr_tile][1];

        eval(action)(params);    
        registerTile();
    }
}


/* Tile Functions 
*/
function swapPlayer(playerToSwap) {
    if (debug)
        console.log ("In swapPlayer");
    if (!working)
        working = true;
    var tempX = player.x;
    var tempY = player.y;
    player.position = new Phaser.Point (playerArray[playerToSwap].x, playerArray[playerToSwap].y);
    playerArray[playerToSwap].position = new Phaser.Point(tempX,tempY);
    swap_sound.play();
    if (debug)
        console.log("Moving "+currentPlayer+" at location x:"+tempX+" y:"+tempY+" to new position:"+player.position);
    working = false;
    registerTile(playerToSwap);
}


function scoreTile(type) {
    points_sound.play();
    if (!working)
        working = true;
    if (debug)
        console.log("in ScoreTile: player - "+ currentPlayer);
    current =  playerScores[currentPlayer][type];
    playerScores[currentPlayer][type] = (current == 0) ? 1 : current*2;
    updateDisplay();
    working = false;
}

function dangerTile(number) {
    var add_pnts;
    if (!working)
        working = true;
    if (debug) {
        console.log("in dangerTile: provided number = "+number);
        console.log("points before: "+ playerScores[currentPlayer]);
    }
    var roll = rollDice();
    if (roll <= 2) {
        add_pnts = danger_tiles[number][0];
        good_risk_sound.play();
    } else {
        add_pnts = danger_tiles[number][1];
        bad_risk_sound.play();
    }
    playerScores[currentPlayer] = playerScores[currentPlayer].map((a,i) => ((a+add_pnts[i]) >= 0) ? (a+add_pnts[i]) : 0);
    updateDisplay();
    if (debug)
        console.log("ponts after: "+ playerScores[currentPlayer]);
    working = false;
}


function setGameStart() {
    game_started = true;
}

function restart() {
    //music.stop();
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
            if (debug) {
                console.log("In moved");
                console.log(player);
            }
            movesRemaining-=1;
            updateDisplay();
            getCurrentTile();
            if (debug) console.log(curr_tile);
}

function registerTile(player = this.currentPlayer, tile= this.curr_tile) {
    playerVisited[player][tile] = "";
}

function checkIfDone() {
    //if (debug)
    //   return;
    if (working) 
        setTimeout(checkIfDone,500);
    if (movesRemaining == 0) {
        switchPlayer();
        newTurn = true;
    }
}

function updateDisplay() {
    turnInfo.setText("Current player: "+currentPlayer+
        "\n| Rolled: "+roll+"\n| Remaining moves: "+ movesRemaining+
        "\n| Score:\n"+
        "       | Party: "+playerScores[currentPlayer][0]+"\n"+
        "       | Party: "+playerScores[currentPlayer][1]+"\n"+
        "       | Party: "+playerScores[currentPlayer][2]);
}
// Returns a value from 1-6 
function rollDice() {
    var a_roll = game.rnd.integerInRange(1,6);
    if (debug) {
        console.log("roll: "+a_roll);
    }
    return a_roll
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
   if ( (timeCheck.now - lastMoved) > 200) {
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

function getNextTile(diffx,diffy) {
    x = Math.floor( (player.body.x+diffx)/48);
    y = Math.floor( (player.body.y+diffy)/48);
    var next_tile = Math.floor(x) + (Math.floor(y))*22;
    if (debug) {
        console.log ("Next Tile player X: "+x+" Y: "+y)
        console.log ("Next Tile:" + next_tile );
    }
    return next_tile;
}

function update(){ 
    game.physics.arcade.collide(player, layer);
/*
    player_tile();
    update_totals();
    */
    checkForAction();
    checkIfDone();

    if (newTurn) {
        roll = rollDice();
        setRemainingTurns();
        updateDisplay();
        newTurn = false;
    }

    getTime();

    if (game.input.keyboard.isDown(Phaser.Keyboard.ALT)) {
        showLegend();
    } else {
        hideLegend();
    }

    if (spaceKey.isDown) {
        if (debug)
            console.log("SPACE detected");
        showInstructions();
    } else {
        hideInstructions();
    }

    if (!onMoveCD() ) {
        if (cursors.left.isDown)
        {
            new_x = -48;
            if (valid_tiles.includes(getNextTile(new_x,0))) {
                player.body.x += new_x;
                //player.body.velocity.x = -100;
                move_sound.play();
                moved();
            }
        }
        else if (cursors.right.isDown)
        {
            new_x = 48;
            if (valid_tiles.includes(getNextTile(new_x,0))) {
                //player.body.velocity.x = 100;
                player.body.x += new_x;
                move_sound.play();
                moved();
            }
        }
        else if (cursors.up.isDown)
        {
            new_y = -48;
            if (valid_tiles.includes(getNextTile(0,new_y))) {
                //player.body.velocity.y = -100;
                player.body.y += new_y;
                move_sound.play();
                moved();
            }
        }
        else if (cursors.down.isDown)
        {
            new_y = 48;
            if (valid_tiles.includes(getNextTile(0,new_y))) {
                //player.body.velocity.y = 100;
                player.body.y += new_y;
                move_sound.play();
                moved();
            }
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
