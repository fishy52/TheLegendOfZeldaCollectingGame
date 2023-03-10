/***********************************
 * INIT
 * **********************************/
let player = document.getElementById('player');
let door = document.getElementById('door');
let spriteImg = document.getElementById('spriteImg');
let surface = document.getElementById('surface');

let dashboard = document.getElementById("dashboard");
let startButton = document.getElementById('startButton');

let currentItem;
let currentPotion = null;
let potion_spawn_chance = 1000;
let current_potion_spawn_chance = potion_spawn_chance;
let potion_despawn_time = 5000;
let score = 0;
let scoreElement = document.getElementById("score");
let musicVolume = 0.2;
let soundVolume = 1;

var pickupAudio = new Audio('./audio/pickup.mp3');
var musicTracks = [new Audio('./audio/Kass.mp3'), new Audio('./audio/Hateno.mp3'), new Audio('./audio/Revali.mp3')]
var doorEnterAudio = new Audio('./audio/EnterDoor.wav');
var gameStartAudio = new Audio('./audio/GameStart.mp3');
let potionSpawnAudio = new Audio('./audio/spawn.mp3');
let potionDespawnAudio = new Audio('./audio/despawn.mp3');
var gangnam = new Audio('./audio/secretSound.mp3');
let currentTrack;

let timer_start_value = 30;
let current_timer_value;
let timer_element = document.getElementById("timer");
let is_game_over = false;
let door_is_entered = false;

let leaderboard = [];
let leaderboard_sorted = [];
let user_name = "";
let try_id;

let playerOffsets = [5, (surface.clientWidth - 50), 0, (surface.clientHeight - 53)];


// Scale the surface to 80% of the screen width
let surface_scale = 0.80 * (window.innerWidth / surface.clientWidth)
surface.style.transform = `scale(${surface_scale})`;
let black_panel = document.getElementById("blackPanel");



/***********************************
 * GAME CONFIG
 * **********************************/
let spriteImgNumber = 0; // current animation part of sprite image
let gameSpeed = 24; // game loop refresh rate (pictures per second)
let characterStartSpeed = 7;
let characterSpeed = characterStartSpeed; // move offset in PX



/***********************************
 * EVENT LISTENER
 * **********************************/
document.onkeydown = keydown_detected;
document.onkeyup = keyup_detected;

let leftArrow = false;
let rightArrow = false;
let upArrow = false;
let downArrow = false;
let fKey = false;

function keydown_detected(e) {
    //console.log(e);
    //console.log(e.keyCode);
    if (!e) {
        e = window.event; //Internet Explorer
    }
    if (e.keyCode == 37) { // leftArrow
        leftArrow = true;
    }
    if (e.keyCode == 38) { //upArrow
        upArrow = true;
    }
    if (e.keyCode == 39) { // rightArrow
        rightArrow = true;
    }
    if (e.keyCode == 40) { // downArrow
        downArrow = true;
    }
}
function keyup_detected(e) {
    //console.log(e);
    //console.log(e.keyCode);
    if (!e) {
        e = window.event; //Internet Explorer
    }
    if (e.keyCode == 37) { // leftArrow
        leftArrow = false;
    }
    if (e.keyCode == 38) { //upArrow
        upArrow = false;
    }
    if (e.keyCode == 39) { // rightArrow
        rightArrow = false;
    }
    if (e.keyCode == 40) { // downArrow
        downArrow = false;
    }
}



/***********************************
 * GAME LOOP
 * **********************************/
function startGame() {
    if (document.getElementById("name").value != "") {

        scoreElement.innerHTML = score;
        player.style.left = '290px'; // starting position
        player.style.top = '180px'; // starting position
        player.style.opacity = '1'; // show player
        spriteImg.style.right = '0px'; // starting animation

        user_name = document.getElementById("name").value;

        dashboard.remove();
        document.getElementById("title").remove();
        gameStartAudio.play();
        timer_element.innerHTML = timer_start_value;


        gameLoop();
        startMusic();

    } else {
        alert("Please Enter a Name!");
    }
}

function gameLoop() {

    if (!is_game_over) {
        if (player.offsetLeft >= playerOffsets[0]) {
            if (leftArrow) {
                movePlayer((-1) * characterSpeed, 0, -1);
                animatePlayer();
            }
        }

        if (player.offsetLeft <= playerOffsets[1]) {
            if (rightArrow) {
                movePlayer(characterSpeed, 0, 1)
                animatePlayer();
            }
        }

        if (player.offsetTop >= playerOffsets[2]) {
            if (upArrow) {
                movePlayer(0, (-1) * characterSpeed, 0);
                animatePlayer();
            }
        }

        if (player.offsetTop <= playerOffsets[3]) {
            if (downArrow) {
                movePlayer(0, characterSpeed, 0);
                animatePlayer();
            }
        }

        if (currentItem != null) {
            if (isColliding(player, currentItem)) {
                collectItem();
            }
        }

        if (isColliding(player, door)) {
            enterDoor();
        }

        if (currentPotion != null) {
            if (isColliding(player, currentPotion)) {
                collectPotion();
            }
        }

        //Spawn Potion at random
        if (door_is_entered) {
            if (currentPotion == null) {
                if (getRandomNumber(current_potion_spawn_chance + 2, 0) == current_potion_spawn_chance) {
                    spawnPotion(getRandomNumber(playerOffsets[1], playerOffsets[0]), getRandomNumber(playerOffsets[2], playerOffsets[3]));
                    current_potion_spawn_chance = potion_spawn_chance;
                } else if (current_potion_spawn_chance > 5) {
                    current_potion_spawn_chance -= 5;
                }
            }
        }


        setTimeout(gameLoop, 1000 / gameSpeed); // async recursion   
    }
}

async function enterDoor() {
    if (!door_is_entered) {

        //REAJUST WALLS
        playerOffsets = [100, (surface.clientWidth - 145), 75, (surface.clientHeight - 53)];

        door_is_entered = true;
        characterSpeed = 0;
        door.remove();
        doorEnterAudio.play();
        black_panel.classList.add("blackPanelAnimation");
        setTimeout(function () {
            console.log("timeout 1");

            surface.style.backgroundImage = 'url(img/background2.png)';

            player.style.left = '200px';
            player.style.top = '50px';

            setTimeout(function () {
                console.log("timeout 2");
                document.getElementById("blackPanel").remove();

                spawnItem(getRandomNumber(playerOffsets[1], playerOffsets[0]), getRandomNumber(playerOffsets[2], playerOffsets[3]));
                current_timer_value = timer_start_value;
                characterSpeed = characterStartSpeed;
                countTimerDown();
            }, 1000)


        }, 1000);
    }

}

async function countTimerDown() {

    if (current_timer_value <= 0) {
        gameOver();
    } else {
        current_timer_value--;
        timer_element.innerHTML = current_timer_value;
        setTimeout(countTimerDown, 1000);
    }
}

function gameOver() {
    //STUFF
    potionDespawnAudio.play();
    is_game_over = true;
    surface.innerHTML += `
    <div id="gameOverScreen">
        <h1 onclick="secretGangnamstyle()" style="color: red;">GAME OVER</h1>
        <h2 style="text-align: center;">Score: ${score}</h2>
        <div class="flex-center">
            <h1 id="restartButton" onclick="location.reload()">Restart</h1>
        </div>
    </div>
    `;
    player.opacity = 0;
    currentItem.opacity = 0;


    //LOCAL STORAGE
    if ((localStorage['leaderboard'])) {
        leaderboard = JSON.parse(localStorage['leaderboard']);
    }

    if ((localStorage['try_id'])) {
        try_id = JSON.parse(localStorage['try_id']);
        try_id++;
        localStorage['try_id'] = JSON.stringify(try_id);
    } else {
        localStorage['try_id'] = JSON.stringify(0);
    }

    let currentTry = {
        name: user_name,
        score: score,
        try_id: localStorage['try_id']
    }

    leaderboard.push(currentTry);

    localStorage['leaderboard'] = JSON.stringify(leaderboard);

    for (let i = 0; i < leaderboard.length; i++) {
        let leaderboard_placing = 0;

        for (let j = 0; j < leaderboard.length; j++) {

            if (leaderboard[i].score < leaderboard[j].score) {
                leaderboard_placing += 1;
            } else if (leaderboard[i].score == leaderboard[j].score) {
                if (i < j) {
                    leaderboard_placing++;
                }
            }

        }

        leaderboard_sorted[leaderboard_placing] = leaderboard[i];
    }

    localStorage['leaderboard_sorted'] = JSON.stringify(leaderboard_sorted);
    setTimeout(function () {
        window.open("leaderboard.html", "_blank");
    }, 1000);
}

function collectItem() {
    if (!is_game_over) {
        pickupAudio.pause;
        pickupAudio.currentTime = 0;
        pickupAudio.play();
        currentItem.remove();
        score++;
        scoreElement.innerHTML = score;
        spawnItem(getRandomNumber(playerOffsets[0], playerOffsets[1]), getRandomNumber(playerOffsets[2], playerOffsets[3]));
    }

}

function collectPotion() {
    if (!is_game_over) {
        currentPotion.remove();
        currentPotion = null;
        pickupAudio.pause;
        pickupAudio.currentTime = 0;
        pickupAudio.play();
        speedBuff(15, 5000)
    }

}

async function speedBuff(newSpeed, duration) {

    characterSpeed = newSpeed;
    setTimeout(function () {

        characterSpeed = characterStartSpeed;

    }, duration);

}

//Collectable Items
function spawnItem(posX, posY) {
    console.log(posX + posY);
    document.getElementById("itemHolder").innerHTML = `
    <div class="item" id="currentItem">
        <img src="img/item02.png">
    </div>
    `
    currentItem = document.getElementById("currentItem");
    console.log(currentItem);

    currentItem.style.right = posX + "px";
    currentItem.style.top = posY + "px";
}

//Potion Items
function spawnPotion(posX, posY) {

    console.log(posX + posY);
    potionSpawnAudio.play();
    document.getElementById("potionHolder").innerHTML = `
    <div class="item" id="currentPotion">
        <img src="img/speedPotion.png">
    </div>
    `
    currentPotion = document.getElementById("currentPotion");
    console.log(currentPotion);

    currentPotion.style.right = posX + "px";
    currentPotion.style.top = posY + "px";

    setTimeout(function () {

        if (currentPotion != null) {
            currentPotion.remove();
            potionDespawnAudio.play();
            currentPotion = null;
        }

    }, potion_despawn_time)
}

function getRandomNumber(max, min) {
    let randomNum = Math.floor((Math.random() * (max - min)) + min);
    console.log(randomNum);
    return randomNum;
}



/***********************************
 * MOVE
 * **********************************/
/**
 * @param {number} dx - player x move offset in pixel
 * @param {number} dy - player y move offset in pixel
 * @param {number} dr - player heading direction (-1: move left || 1: move right || 0: no change)
 */
function movePlayer(dx, dy, dr) {

    if (!is_game_over) {
        // current position
        let x = parseFloat(player.style.left);
        let y = parseFloat(player.style.top);

        // calc new position
        x += dx;
        y += dy;

        // assign new position
        player.style.left = x + 'px';
        player.style.top = y + 'px';

        // handle direction
        if (dr != 0) {
            player.style.transform = `scaleX(${-dr})`;
        }
    }


}

function startMusic() {
    currentTrack = musicTracks[getRandomNumber(musicTracks.length)];
    currentTrack.play();
    currentTrack.loop = true;
    currentTrack.volume = musicVolume;
}



/***********************************
 * ANIMATE PLAYER
 * **********************************/
function animatePlayer() {

    if (spriteImgNumber < 9) { // switch to next sprite position
        spriteImgNumber++;
        let x = parseFloat(spriteImg.style.right);
        x += 45; // ANPASSEN!
        spriteImg.style.right = x + "px";
    }
    else { // animation loop finished: back to start animation
        spriteImg.style.right = "0px";
        spriteImgNumber = 0;
    }

}

function secretGangnamstyle() {
    document.getElementById("body").outerHTML = '<body class="secretClass"></body>';
    gangnam.play();
}