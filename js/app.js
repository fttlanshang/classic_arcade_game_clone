/**
self-evaluation: can make some improvements later
    1. bugs cannot surpass others and bugs cannot go across the rocks
    2. sometimes the game gets stuck, and the only way is to close the tag, a bad experience for players
    3. thinks the collision radius is a little odd
    4. a few memthods are not object oritented, like resetAll
    5. most properties and methods are public, make it a litter orderless
    6. no game start scene
*/

/**
* @description Represents the background, including level, score, play board(meaning all the grids except the first row),
     time and other set ups
* @constructor
*/
const GEM_NUM_BASE = 3;
const ROCK_NUM_BASE = 2 ;
const ENEMY_BASE = 3;
const HEART_NUM_BASE = 2;
const VELOCITY_BASE = 100;
const TIME_BASE = 15;
const CELL_WIDTH = 101;
const CELL_HEIGHT = 83;
const APPRO_INITIAL_Y = 60;
const BOARDS_XGRIDS = 5;
const BOARDS_YGRIDS = 5;
const GEM_BLUE_SCORE = 100;
const GEM_GREEN_SCORE = 200;
const GEM_ORANGE_SCORE = 300;
const SCORES_FOR_HEART = 4000;
const COLLISION_RADIUS = 75; // how to set appropriate collision radius ?
// project into x axis, see if there is a gap
// blank pixels on the player's left and right are approximately 18px; blank pixels on tht bug't left and right are ~2px, so gap = (bug.x - player.x) - ((101 - 18) + 2)
// if gap > 0, no collision. But when setting COLLISION_RADIUS to 81(computed value), collsion seems to happen a little early, so set it to 75
const eps = 1e-2;
const UPMOST_RENDERY = -23;
const VELOCITY_UPMOST = 300;

/**
* @description Represents the background, including score, play board(meaning all the grids except the first row),
     time and other set ups
* @constructor
*/
var Background = function() {
    this.baseLevel = { gems: GEM_NUM_BASE + Math.floor(Math.random() * GEM_NUM_BASE),
                     rocks: ROCK_NUM_BASE + Math.ceil(Math.random() * ROCK_NUM_BASE),
                     hearts: Math.floor(Math.random() * HEART_NUM_BASE),
                     enemies: ENEMY_BASE + Math.floor(Math.random() * ENEMY_BASE),
                     velocityBase: VELOCITY_BASE,
                     time: TIME_BASE};

    this.init();
    this.board = new Array();
    for(var i = 0; i < BOARDS_YGRIDS; i++){
        this.board[i] = new Array();
        for(var j = 0; j < BOARDS_XGRIDS; j++){
            this.board[i][j] = 0;
        }

    }
};
/**
* @description Initializes state, level, score and remaining time,
    will be used in other functions, not only the constructor
*/
Background.prototype.init = function() {
    this.state = 'pause'; //three states: run/ pause/ lose
    this.score = 0;
    this.scoreBuffer = 0;
    this.time = this.baseLevel.time;
};
/**
* @description Renders remaining time and score
    when the state is lose, will also display lose
*/
Background.prototype.render = function() {
    this.renderOthers();
    if(this.state === 'lose') {
        this.renderLose();
    }
};
/**
* @description Renders remaining time and score and operation rules
*/
Background.prototype.renderOthers = function() {
    ctx.fillStyle = 'white';
    ctx.font = "30px Indie Flower";
    ctx.fillText("score:  " + this.score, 10, 101);
    ctx.fillText('Time: '+ this.time.toFixed(0) + ' s', 335, 101);
    ctx.font = "20px Indie Flower";
    ctx.fillText("Press p to pause/start.", 100, 578);
    ctx.fillText("Press s to select sprite.", 303, 578);

};
/**
* @description Displays what will be like when player loses. evaluations are generated based on player's score
*/
Background.prototype.renderLose = function() {
    function computeEvaluations(score){
        const BASIC_SCORES = 1000;
        var titles = ["Take more exercieses.", "You can make it better!",
                    "You are a master!", "Excellent!", "No one can beat you!",
                    "You are a genius!"];
        var index = Math.floor(score / BASIC_SCORES);
        if(index >= titles.length - 1)  index = titles.length - 1;
        return titles[index];
    }
    var evaluation = computeEvaluations(this.score + SCORES_FOR_HEART * this.scoreBuffer);
    ctx.fillStyle = "rgb(228, 128, 42)";
    ctx.strokeStyle = "rgb(245, 193, 80)";
    ctx.strokeRect (20, 180, 460, 166);
    ctx.fillRect(20, 180, 460, 166);
    ctx.font = "25px Indie Flower";
    ctx.fillStyle = "black";
    ctx.fillText(evaluation, 40, 240);
    ctx.fillText("Press r to play again.", 40, 300);
    ctx.drawImage(Resources.get('images/Star.png'), 380,125);
};
/**
* @description Updates the remaining time
*/
Background.prototype.update = function(dt) {
    this.time -= dt;
};
/**
* @description Background will maintain a 2-D array, keeping the static objects, so no overlapping would occur
* @returns {boolean} Is (x, y) grid empty?
*/
Background.prototype.setBoard = function(x ,y, object) {
    var j =Math.floor(x / CELL_WIDTH);
    var i = Math.floor((y - APPRO_INITIAL_Y) / CELL_HEIGHT);
    console.log(object, x, y, i, j);
    if(this.board[i][j] === 0){
        this.board[i][j] = object;
        return true;
    }
    return false;
};
/**
* @description Gets the object located at (x, y)
* @returns {Object} Object at grid (x, y)
*/
Background.prototype.getBoard = function(x, y){
    var j =Math.floor(x / CELL_WIDTH);
    var i = Math.floor((y - APPRO_INITIAL_Y) / CELL_HEIGHT);
    return this.board[i][j];
};
/**
* @description Handles the input commands, including pause/start and reset
*/
Background.prototype.handle = function(input){
    if(input === 'pause') {
    // change a little to engine.js, so only when the state is run, will update the enemy etc
        if(this.state === 'run') {
            this.state = 'pause';
        }else if(this.state === 'pause'){
            this.state = 'run';
        }
    }else if(input === 'reset'){
        if(this.state === 'win' || this.state === 'lose'){
            this.baseLevel.velocityBase = VELOCITY_BASE;
            this.baseLevel.time = TIME_BASE; // change the baseLevel object to original state
            this.init(); // make score, time to 0
            background.state = 'run';
            resetAll(); // set the locations of enemies, gems etc
            player.init();
        }
    }
};
/**
* @description Changes the level set up
*/
Background.prototype.levelUp = function(){
    var time_change_factor = 1.05;
    var velocity_change_factor = 1.1;
    this.baseLevel.time = Math.ceil(this.baseLevel.time * time_change_factor);
    if(this.baseLevel.velocityBase < VELOCITY_UPMOST)
        this.baseLevel.velocityBase *= velocity_change_factor;
    resetAll();
};

var background = new Background(); // instance of class Background

/**
* @description Represents the static entities, including gems, rocks and hearts
* @constructor
*/
var StaticEntities = function() {
    do {
        this.x = Math.floor(Math.random() * BOARDS_XGRIDS) * CELL_WIDTH;
        this.y = APPRO_INITIAL_Y + Math.floor(Math.random() * (BOARDS_YGRIDS - 1)) * CELL_HEIGHT;
    } while(background.setBoard(this.x, this.y, this) === false);
};
/**
* @description Represents the gems, a gem will have its existence(being eaten or not), its score
* @constructor
*/
var Gem = function() {
    StaticEntities.call(this);
    this.existence = true;
    var GemImages = ['images/Gem Blue.png',
                    'images/Gem Green.png',
                    'images/Gem Orange.png'];
    var score = [GEM_BLUE_SCORE, GEM_GREEN_SCORE, GEM_ORANGE_SCORE];
    var index = Math.floor(Math.random() * 3);
    this.score = score[index];
    this.gem = GemImages[index];
};

Gem.prototype = Object.create(StaticEntities.prototype); // note: if this is below Gem.prototype.render -> error
Gem.prototype.constructor = Gem;
/**
* @description Renders the gems
*/
Gem.prototype.render = function(){
     if(this.existence) ctx.drawImage(Resources.get(this.gem), this.x + 12, this.y + 30, 77, 130);
};
/**
* @description Represents the process of being eaten. When the score is larger than 4000, player wil get an extra life.
*               when the player eats an orange gem, will call handleOrangeEvent(), similar for eating green gems
*/
Gem.prototype.update = function(){  // maybe a little unapproriate, because background object is operated a lot
        if(this.existence) {
            background.score += this.score;
            if(background.score >= SCORES_FOR_HEART) {
                background.score -= SCORES_FOR_HEART;
                background.scoreBuffer += 1;
                player.life++;
            }
            if(this.score === GEM_ORANGE_SCORE) {
                allEnemies.forEach(function(enemy){
                    enemy.handleOrangeEvent();
                });
            }else if(this.score === GEM_GREEN_SCORE){
                allEnemies.forEach(function(enemy){
                    enemy.handleGreenEvent();
                });
            }
        }
        this.existence = false;
};
/**
* @description Represents the rocks, a gem will have its location
* @constructor
*/
var Rock = function(){
    StaticEntities.call(this);
    this.rock = 'images/Rock.png';
};
Rock.prototype = Object.create(StaticEntities.prototype);
Rock.prototype.constructor = Rock;
/**
* @description Renders the rock
*/
Rock.prototype.render = function(){
    ctx.drawImage(Resources.get(this.rock), this.x, this.y);
};
/**
* @description Represents the hearts, a heart will have its location and its existence
* @constructor
*/
var Heart = function() {
    StaticEntities.call(this);
    this.existence = true;
    this.heart = 'images/Heart.png';
};
Heart.prototype = Object.create(StaticEntities.prototype);
Heart.prototype.constructor = Heart;
/**
* @description Renders the heart
*/
Heart.prototype.render = function(){
    if(this.existence)  ctx.drawImage(Resources.get(this.heart), this.x + 12.5, this.y + 45, 78, 130);
};
/**
* @description Updates when being eaten by the player
*/
Heart.prototype.update = function() {
    if(this.existence)  player.life++;
    this.existence = false;
};

/**
* @description Represents enemies our player must avoid
* @constructor
*/
var Enemy = function() {
    this.init();
    this.sprite = 'images/enemy-bug.png';
};
/**
* @description Represents initialization of enemy
*/
Enemy.prototype.init = function() {
    this.x = -CELL_WIDTH;
    this.y = APPRO_INITIAL_Y + Math.floor(Math.random() * 3) * CELL_HEIGHT;
    this.velocity = background.baseLevel.velocityBase * (1 + Math.random());
};

/**
* @description Update the enemy's position. If collision occurs, reset the player's location and his life
* @param {number} dt
*/
Enemy.prototype.update = function(dt) {
    this.x += this.velocity * dt;
    if(this.x > BOARDS_XGRIDS * CELL_WIDTH) {
        this.init();
    }
    if(Math.abs(this.x - player.x)< COLLISION_RADIUS  && this.y === player.y) {
        console.log("collision happened!");
        player.handleFailure();
    }
};
/**
* @description Draw the enemy on the screen
*/
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/**
* @description when the player eats an orange gem, all players' velocity will change, until next round
*/
Enemy.prototype.handleOrangeEvent = function() {
// note: the effent of orange event and green effect can accumulate
    this.velocity = VELOCITY_BASE;
};
/**
* @description when the player eats an orange gem, all players will reset their position, until next round
*/
Enemy.prototype.handleGreenEvent = function() {
    this.x = -CELL_WIDTH;
}

/**
* @description Represents our player
* @constructor
*/
var Player = function() {
    this.init();
    this.sprite = 'images/char-boy.png';
};
/**
* @description Initializes the player's location and life
*/
Player.prototype.init = function() {
    this.initXY();
    this.life = 3;
};
/**
* @description Initializes the player's location
*/
Player.prototype.initXY = function(){
    do {
        this.y = APPRO_INITIAL_Y + CELL_HEIGHT * 3 + Math.floor(Math.random() * 2) * CELL_HEIGHT;
        if(this.y === APPRO_INITIAL_Y + CELL_HEIGHT * 4) this.x = CELL_WIDTH + Math.floor(Math.random() * 3) * CELL_WIDTH;
        //the above is a brute solution for making sure the player can move when generated randomly (not surrounded by rocks)
        else    this.x = Math.floor(Math.random() * BOARDS_XGRIDS) * CELL_WIDTH;

    } while(background.getBoard(this.x, this.y) !== 0)
    //fix the bug here, call getBoard rather than setBoard, so don't need to clear the previous location of the player
};

/**
* @description Deals with the time out event
*/
Player.prototype.update = function() {
    if(Math.abs(background.time - 0) < eps) {
        this.handleFailure();
        background.time = background.baseLevel.time;
    }
    // allEnemies.forEach(function(enemy) { // another method to handle collision between enemies and player
    //     if(enemy.x - player.x < COLLISION_RADIUS && enemy.y === player.y) {
    //         console.log("collision happened");
    //         player.handleFailure();
    //     }
    // });
};
/**
* @description Reset player's location and his life
*/
Player.prototype.handleFailure = function() {
    this.initXY();
    this.life--;
    if(player.life === 0)   background.state = 'lose';
};
/**
* @description Draw the player and his remaing life on the screen
*/
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y + 10);
    this.renderLife();
};
/**
* @description Draw the player's remaing life on the screen
*/
Player.prototype.renderLife = function() { //maybe a little unappropriate here, set it in Background class?
    ctx.drawImage(Resources.get('images/Heart.png'), 0, 35, CELL_WIDTH, CELL_WIDTH, 10, 550, 30, 30);
    ctx.font = "30px Indie Flower";
    ctx.fillStyle = "black";
    ctx.fillText("× " + this.life, 50, 578);
};
/**
* @description Handles the input, including direction input and select character input
    When handling up/left/down/right commands, make sure the character will not move out of screen. When reach the river, level up
    When a rock is on the grid of next move, player could't move
    When a gem or a heart is on the grid of next move, update the score and life
*/
Player.prototype.handleInput = function(keyCode) {
    if(keyCode === 'select') {
        var sprites = ['images/char-boy.png',
                        'images/char-cat-girl.png',
                        'images/char-horn-girl.png',
                        'images/char-pink-girl.png',
                        'images/char-princess-girl.png'];
        var currentIndex = sprites.indexOf(this.sprite);
        this.sprite = sprites[(currentIndex + 1) % sprites.length];
        return;
    }
    var obj;
    if(background.state == 'run') {
        if(keyCode === 'left') {
            if(this.x !== 0) {
                obj = background.getBoard(this.x - CELL_WIDTH, this.y);
                if(obj instanceof Rock)   return;
                this.x -= CELL_WIDTH;
            }
        }
        else if(keyCode === 'up') {
            if(this.y !== UPMOST_RENDERY) {
                if(this.y !== APPRO_INITIAL_Y) { // if y == 60, since up is water, there is no rock
                    obj = background.getBoard(this.x, this.y - CELL_HEIGHT);
                    if(obj instanceof Rock)   return;
                }
                this.y -= CELL_HEIGHT;
            }
        }
        else if(keyCode ==='right') {
            if(this.x !== CELL_WIDTH * (BOARDS_XGRIDS - 1)) {
                obj = background.getBoard(this.x + CELL_WIDTH, this.y);
                if(obj instanceof Rock)   return;
                this.x += CELL_WIDTH;
            }
        }
        else if(keyCode === 'down') {
            if(this.y != APPRO_INITIAL_Y + CELL_HEIGHT * (BOARDS_YGRIDS - 1)) {
                obj = background.getBoard(this.x , this.y + CELL_HEIGHT);
                if(obj instanceof Rock)   return;
                this.y += CELL_HEIGHT;
            }
        }
        if(obj instanceof Gem){
            obj.update();
        }else if(obj instanceof Heart){
            obj.update();
        }
        // console.log(background.board);
        if(this.y == UPMOST_RENDERY)  {
            background.levelUp();
            this.initXY();
        }
    }
};


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allRocks = new Array();
var allGems = new Array();
var allEnemies = new Array();
var allHearts = new Array();

/**
* @description reset the game when a player wins or loses or level up
*/
function resetAll() { //not a object oriented function, but can't find an appropriate class

    for(var i = 0; i < BOARDS_YGRIDS; i++){
        for(var j = 0; j < BOARDS_XGRIDS; j++){
            background.board[i][j] = 0;
        }
    }
    allRocks = [];
    allGems = [];
    allEnemies = [];
    allHearts = [];
    for(var i = 0; i < background.baseLevel.rocks; i++){
        allRocks.push(new Rock());
    }
    for(var i = 0; i < background.baseLevel.gems; i++){
        allGems.push(new Gem());
    }
    for(var i = 0; i < background.baseLevel.enemies; i++){
        allEnemies.push(new Enemy());
    }
    for(var i = 0; i < background.baseLevel.hearts; i++) {
        allHearts.push(new Heart());
    }
    background.time = background.baseLevel.time;
}
resetAll();
var player = new Player();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
/**
* @description Handles the input
*/
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        80: 'pause',
        82: 'reset',
        83: 'select'
    };
    var input = allowedKeys[e.keyCode];
    if(input === 'pause' || input === 'reset'){
        background.handle(input);
    }else{
        player.handleInput(input);
    }
});
