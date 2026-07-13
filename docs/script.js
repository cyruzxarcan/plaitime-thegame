////////////////////////////////////////////////////
// PIXEL TROPHY RUSH
// Script.js
// Part 3 - Section 1
////////////////////////////////////////////////////


const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");


// Screens
const homeScreen = document.getElementById("homeScreen");
const gameOverScreen = document.getElementById("gameOverScreen");


// Buttons
const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");


// HUD
const scoreText = document.getElementById("score");
const livesText = document.getElementById("lives");
const finalScoreText = document.getElementById("finalScore");



////////////////////////////////////////////////////
// CANVAS RESPONSIVE SETUP
////////////////////////////////////////////////////


let width;
let height;
let scaleFactor = 1;


function resizeCanvas(){

    const ratio = window.devicePixelRatio || 1;


    width = window.innerWidth;
    height = window.innerHeight;


    canvas.width = width * ratio;
    canvas.height = height * ratio;


    canvas.style.width = width + "px";
    canvas.style.height = height + "px";


    ctx.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0
    );


    scaleFactor = width / 400;

}


window.addEventListener(
    "resize",
    resizeCanvas
);


resizeCanvas();



////////////////////////////////////////////////////
// GAME STATE
////////////////////////////////////////////////////


let gameRunning = false;

let score = 0;

let lives = 3;

let gameTime = 0;

let difficulty = 1;

let lastMilestone = 0;

function checkMilestones(){

    let milestone = Math.floor(score / 1000);


    if(milestone > lastMilestone){

        lastMilestone = milestone;


        // increase falling speed

        difficulty = Math.min(
    difficulty + 0.25,
    8
);


        // make objects appear faster

        if(spawnRate > 35){

            spawnRate -= 8;

        }

    }

}


////////////////////////////////////////////////////
// PLAYER / CATCHER
////////////////////////////////////////////////////


const player = {

    x: width / 2,

    y: height - 100,

    width:110,

    height:55,


    speed: 7,


    velocity: 0

};



////////////////////////////////////////////////////
// CONTROL VARIABLES
////////////////////////////////////////////////////


let tiltValue = 0;

let touchX = null;

let leftPressed = false;

let rightPressed = false;



////////////////////////////////////////////////////
// KEYBOARD CONTROL
////////////////////////////////////////////////////


window.addEventListener(
    "keydown",
    e => {

        if(e.key === "ArrowLeft"){
            leftPressed = true;
        }


        if(e.key === "ArrowRight"){
            rightPressed = true;
        }

    }
);



window.addEventListener(
    "keyup",
    e => {


        if(e.key === "ArrowLeft"){
            leftPressed = false;
        }


        if(e.key === "ArrowRight"){
            rightPressed = false;
        }


    }
);



////////////////////////////////////////////////////
// TOUCH FALLBACK CONTROL
////////////////////////////////////////////////////


canvas.addEventListener(
    "touchmove",
    e => {

        const touch = e.touches[0];

        touchX = touch.clientX;

    },
    {
        passive:false
    }
);



canvas.addEventListener(
    "touchend",
    ()=>{

        touchX = null;

    }
);



////////////////////////////////////////////////////
// TILT CONTROL
////////////////////////////////////////////////////


function enableTilt(){


    if(
        typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function"
    ){

        DeviceOrientationEvent
        .requestPermission()
        .then(
            response=>{

                if(response==="granted"){
                    window.addEventListener(
                        "deviceorientation",
                        handleTilt
                    );
                }

            }
        );

    }

    else {

        window.addEventListener(
            "deviceorientation",
            handleTilt
        );

    }

}



function handleTilt(event){


    let tilt = event.gamma;


    if(tilt === null)
        return;


    // dead zone
    if(
        Math.abs(tilt)<3
    ){

        tiltValue = 0;

    }
    else{

        tiltValue = tilt / 15;

    }


}



////////////////////////////////////////////////////
// GAME LOOP
////////////////////////////////////////////////////


function gameLoop(){


    if(gameRunning){

        update();

        draw();

    }


    requestAnimationFrame(gameLoop);

}


gameLoop();

////////////////////////////////////////////////////
// PART 3 - SECTION 2
// OBJECT SYSTEM
////////////////////////////////////////////////////



////////////////////////////////////////////////////
// OBJECT POOL
////////////////////////////////////////////////////


const objects = [];

const maxObjects = 20;



function createObject(){


    return {

        active:false,

        type:"",

        x:0,

        y:0,

        size:35,

        speed:2

    };

}



for(let i = 0; i < maxObjects; i++){

    objects.push(
        createObject()
    );

}




////////////////////////////////////////////////////
// SPAWN SETTINGS
////////////////////////////////////////////////////


let spawnTimer = 0;

let spawnRate = 90;



function spawnObject(){


    let obj =
    objects.find(
        item=>!item.active
    );


    if(!obj)
        return;



    const chance = Math.random();



    if(chance < 0.45){

        obj.type="medal";

    }

    else if(chance < 0.75){

        obj.type="trophy";

    }

    else if(chance < 0.88){

        obj.type="boost";

    }

    else{

        obj.type="bomb";

    }



    obj.x =
    Math.random() *
    (width-50)+25;


    obj.y=-50;



    obj.size=35;



    obj.speed =
    2.5 +
    difficulty * 0.9;



    obj.active=true;


}




////////////////////////////////////////////////////
// UPDATE OBJECTS
////////////////////////////////////////////////////


function updateObjects(){



    spawnTimer++;



    if(spawnTimer >= spawnRate){

        spawnObject();

        spawnTimer=0;

    }




    objects.forEach(obj=>{


        if(!obj.active)
            return;



        obj.y += obj.speed;



        // object missed
        if(
            obj.y >
            height + 60
        ){


            obj.active=false;


            if(
                obj.type==="trophy" ||
                obj.type==="medal"
            ){

                loseLife();

            }


        }



    });


}




////////////////////////////////////////////////////
// DRAW OBJECTS
////////////////////////////////////////////////////


function drawObjects(){



    ctx.textAlign="center";

    ctx.textBaseline="middle";



    objects.forEach(obj=>{


        if(!obj.active)
            return;



        let emoji="";



        switch(obj.type){


            case "trophy":

                emoji="🏆";

                break;



            case "medal":

                emoji="🥇";

                break;



            case "boost":

                emoji="🎖️";

                break;



            case "bomb":

                emoji="💣";

                break;

        }



        ctx.font =
        obj.size+"px Arial";



        ctx.fillText(
            emoji,
            obj.x,
            obj.y
        );


    });



}




////////////////////////////////////////////////////
// COLLISION DETECTION
////////////////////////////////////////////////////


function checkCollision(){


    objects.forEach(obj=>{


        if(!obj.active)
            return;



        const distance =
        Math.abs(
            obj.x-player.x
        );



        const vertical =
        Math.abs(
            obj.y-player.y
        );



        if(
            distance < 75 &&
            vertical < 65
        ){


            obj.active=false;



            if(
                obj.type==="bomb"
            ){

                endGame();

            }



            else if(
                obj.type==="trophy"
            ){

                score+=100;

            }



            else if(
                obj.type==="medal"
            ){

                score+=50;

            }



            else if(
                obj.type==="boost"
            ){

                score+=150;

                difficulty+=0.2;

            }



            updateHUD();

        }


    });



}

////////////////////////////////////////////////////
// PART 3 - SECTION 3
// PLAYER + GAME MANAGEMENT
////////////////////////////////////////////////////



////////////////////////////////////////////////////
// PLAYER MOVEMENT
////////////////////////////////////////////////////


function updatePlayer(){



    let movement = 0;



    // Tilt control
    movement += tiltValue * player.speed;



    // Keyboard
    if(leftPressed){

        movement -= player.speed;

    }


    if(rightPressed){

        movement += player.speed;

    }



    // Touch fallback
    if(touchX !== null){

        const center =
        width / 2;


        if(touchX < center - 20){

            movement -= player.speed;

        }


        else if(touchX > center + 20){

            movement += player.speed;

        }

    }



    player.x += movement;



    // boundaries

    if(player.x < 40){

        player.x = 40;

    }


    if(player.x > width-40){

        player.x = width-40;

    }



}





////////////////////////////////////////////////////
// DRAW PLAYER
////////////////////////////////////////////////////


function drawPlayer() {

    const x = player.x;
    const y = player.y;

    const width = 120;
    const height = 28;

    const pulse = Math.sin(gameTime * 0.12) * 2;

    ctx.save();

    // ---------- Glow ----------
    ctx.shadowColor = "#7ddcff";
    ctx.shadowBlur = 20 + pulse;

    // Outer Portal Ring
    const outer = ctx.createLinearGradient(
        x,
        y - height,
        x,
        y + height
    );

    outer.addColorStop(0, "#bff8ff");
    outer.addColorStop(0.45, "#7ddcff");
    outer.addColorStop(1, "#59d5ff");

    ctx.strokeStyle = outer;
    ctx.lineWidth = 8;

    ctx.beginPath();
    ctx.ellipse(
        x,
        y,
        width / 2,
        height,
        0,
        0,
        Math.PI * 2
    );
    ctx.stroke();


    // Inner Portal
    ctx.shadowBlur = 12;

    const inner = ctx.createLinearGradient(
        x,
        y - height,
        x,
        y + height
    );

    inner.addColorStop(0, "#3e1268");
    inner.addColorStop(1, "#080015");

    ctx.fillStyle = inner;

    ctx.beginPath();
    ctx.ellipse(
        x,
        y,
        width / 2 - 8,
        height - 6,
        0,
        0,
        Math.PI * 2
    );
    ctx.fill();


    // Energy Core
    const glow = ctx.createRadialGradient(
        x,
        y,
        0,
        x,
        y,
        width / 2
    );

    glow.addColorStop(0, "rgba(125,220,255,0.35)");
    glow.addColorStop(1, "rgba(125,220,255,0)");

    ctx.fillStyle = glow;

    ctx.beginPath();
    ctx.ellipse(
        x,
        y,
        width / 2 - 12,
        height - 10,
        0,
        0,
        Math.PI * 2
    );
    ctx.fill();


    // Side Energy Nodes
    ctx.shadowBlur = 15;
    ctx.fillStyle = "#ffffff";

    ctx.beginPath();
    ctx.arc(
        x - width / 2,
        y,
        5,
        0,
        Math.PI * 2
    );
    ctx.fill();

    ctx.beginPath();
    ctx.arc(
        x + width / 2,
        y,
        5,
        0,
        Math.PI * 2
    );
    ctx.fill();


    // Animated Energy Sweep
    ctx.shadowBlur = 0;

    const sweep =
        ((gameTime * 4) % width) - width / 2;

    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(
        x + sweep,
        y - height + 3
    );
    ctx.lineTo(
        x + sweep,
        y + height - 3
    );
    ctx.stroke();


    ctx.restore();

}






////////////////////////////////////////////////////
// BACKGROUND
////////////////////////////////////////////////////


function drawBackground(){


    // pixel arcade floor


    ctx.fillStyle="#120022";


    ctx.fillRect(
        0,
        0,
        width,
        height
    );



    ctx.strokeStyle=
    "rgba(255,255,255,0.05)";


    for(
        let y=0;
        y<height;
        y+=40
    ){

        ctx.beginPath();

        ctx.moveTo(
            0,
            y
        );

        ctx.lineTo(
            width,
            y
        );

        ctx.stroke();

    }



}






////////////////////////////////////////////////////
// MAIN UPDATE
////////////////////////////////////////////////////


function update(){


    gameTime++;



    // increase difficulty slowly

    if(
        gameTime % 600 === 0
    ){

        difficulty += 0.15;


        if(spawnRate > 45){

            spawnRate -= 5;

        }

    }



    updatePlayer();


    updateObjects();


    checkCollision();

    checkMilestones();

    updateHUD();


}





////////////////////////////////////////////////////
// MAIN DRAW
////////////////////////////////////////////////////


function draw(){


    drawBackground();


    drawObjects();


    drawPlayer();


}





////////////////////////////////////////////////////
// LIVES
////////////////////////////////////////////////////


function loseLife(){


    lives--;


    updateHUD();



    if(lives <= 0){

        endGame();

    }


}




////////////////////////////////////////////////////
// HUD UPDATE
////////////////////////////////////////////////////


function updateHUD(){


    scoreText.textContent =
    score;


    livesText.textContent =
    lives;


}







////////////////////////////////////////////////////
// START GAME
////////////////////////////////////////////////////


function startGame(){


    score=0;

    lives=3;

    gameTime=0;

    difficulty=1;


    spawnRate=90;


    objects.forEach(
        obj=>{
            obj.active=false;
        }
    );



    player.x =
    width/2;



    updateHUD();



    homeScreen.classList.remove(
        "active"
    );


    gameOverScreen.classList.remove(
        "active"
    );



    gameRunning=true;



    enableTilt();


}







////////////////////////////////////////////////////
// GAME OVER
////////////////////////////////////////////////////


function endGame(){


    gameRunning=false;


    finalScoreText.textContent =
    score;


    gameOverScreen.classList.add(
        "active"
    );


}







////////////////////////////////////////////////////
// BUTTON EVENTS
////////////////////////////////////////////////////


startButton.addEventListener(
    "click",
    startGame
);



restartButton.addEventListener(
    "click",
    startGame
);




////////////////////////////////////////////////////
// INITIAL SCREEN
////////////////////////////////////////////////////


updateHUD();

