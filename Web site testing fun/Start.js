function BeginTotal() {
    startSoft();
}

var obstacles = [];
var balls = [];
const gravAcc = 1;

var bouncebutton;

var test = false;

function getLength(x1,y1,x2,y2) {
    return Math.sqrt(Math.pow(x2-x1,2) + Math.pow(y2-y1,2));
}

function startSoft() {
    initializeObstacles();
    for(var i = 0; i < 5; i++) {
        balls.push(new vertex((i+1) * 100, 5));
    }

    // balls.push(new vertex(300, 5));
    softObj.start();
}

function initializeObstacles() {
    obstacles.push([150,150,400,400]);
    obstacles.push([700,400,300,700]);
}

var softObj = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = 900;
        this.canvas.height = 900;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);

        bouncebutton = document.createElement("button");
        bouncebutton.innerHTML = "All Bounce";
        bouncebutton.onclick = function() {
            for(var i = 0; i < balls.length; i++) {
                balls[i].vely -= 30;
                balls[i].velx = Math.random() * 2 - 1;
                balls[i].doUpdate = true;
            }
        }

        document.body.appendChild(bouncebutton);

        this.interval = setInterval(updateSoft, 20);
    },
    clear : function() {
        this.context.clearRect(0,0, this.canvas.width, this.canvas.height);
    }
}

function updateSoft() {
    softObj.clear();
    const ctx = softObj.context;
    for(var i = 0; i < obstacles.length; i++) {
        ctx.beginPath();
        ctx.moveTo(obstacles[i][0], obstacles[i][1]);
        ctx.lineTo(obstacles[i][2], obstacles[i][3]);
        ctx.stroke();
    }


    for(var i = 0; i < balls.length; i++) {
        if(balls[i].doUpdate) {
            balls[i].updateSimple();
        }
        balls[i].show();
    }

}

function checkCollisions(vertex) { //Checks if any of the four corners of ball is hitting an obstacle
    var tempcheck = true;
    for(let j = 0; j < 5; j++) {
        if(tempcheck == false) {
            break;
        }
        for(var i = 0; i < obstacles.length; i++) {
            var posx = vertex.x + j;
            var posy = vertex.y + j;
            
            var lineLen = getLength(obstacles[i][0], obstacles[i][1], obstacles[i][2], obstacles[i][3]);
            var d11 = getLength(posx + 10, posy + 10, obstacles[i][0], obstacles[i][1]);
            var d21 = getLength(posx + 10, posy + 10, obstacles[i][2], obstacles[i][3]);
            var totd1 = d11 + d21;

            var d12 = getLength(posx + 10, posy - 10, obstacles[i][0], obstacles[i][1]);
            var d22 = getLength(posx + 10, posy - 10, obstacles[i][2], obstacles[i][3]);
            var totd2 = d12 + d22;

            var d13 = getLength(posx - 10, posy + 10, obstacles[i][0], obstacles[i][1]);
            var d23 = getLength(posx - 10, posy + 10, obstacles[i][2], obstacles[i][3]);
            var totd3 = d13 + d23;

            var d14 = getLength(posx - 10, posy - 10, obstacles[i][0], obstacles[i][1]);
            var d24 = getLength(posx - 10, posy - 10, obstacles[i][2], obstacles[i][3]);
            var totd4 = d14 + d24;

            var buffer = 0.1;

            if(totd1 >= lineLen - buffer && totd1 <= lineLen + buffer) {
                tempcheck = false;
                doBounce(1, obstacles[i], vertex);
            } else if(totd2 >= lineLen - buffer && totd2 <= lineLen + buffer) {
                tempcheck = false;
                doBounce(2, obstacles[i], vertex);
            } else if(totd3 >= lineLen - buffer && totd3 <= lineLen + buffer) {
                tempcheck = false;
                doBounce(3, obstacles[i], vertex);
            } else if(totd4 >= lineLen - buffer && totd4 <= lineLen + buffer) {
                tempcheck = false;
                doBounce(4, obstacles[i], vertex);
            }
        }
    }
}

function dotProduct(a,b) {
    return a[0]*b[0] + a[1]*b[1];
}

function checkFriction(vertex) {
    if(Math.abs(vertex.vely) <= 5 ) {
        vertex.timeonground += 1;
    } else {
        vertex.timeonground = 0;
    }

    if(vertex.timeonground > 5) {
        vertex.velx *= 0.95;
    }

    if(vertex.timeonground >= 120) {
        vertex.doUpdate = false;
    }
}

function doBounce(whichCase, obs, vertex) { //This will reflect the ball about the normal for bouncing
    //fillout
    // alert(whichCase);
    var tempx = obs[2] - obs[0];
    var tempy = obs[3] - obs[1];
    var newx, newy;
    newx = -tempy;
    newy = tempx;
    if(newy > tempy) {
        newy *= -1;
    }
    var normconst = getLength(0,0,newx,newy);
    console.log(newx);
    console.log(newy);
    console.log(vertex.vely);
    console.log("normconst: " + normconst);
    newx = newx / normconst;
    newy = newy / normconst;
    console.log(newx);
    var arr1 = [vertex.velx, vertex.vely];
    var arr2 = [newx, newy];
    var multer = dotProduct(arr1,arr2); 
    console.log("multer:" + multer);

    var newvelx = vertex.velx - (2 * multer * newx);
    var newvely = vertex.vely - (2 * multer * newy);
    console.log(newvelx);
    vertex.velx = 0;
    vertex.vely = 0;
    vertex.velx = newvelx;
    vertex.vely = newvely;
    // test = true;
}

class vertex {
    constructor(x,y) {
        this.x = x;
        this.y = y;
        // this.velx = 0;
        // this.vely = 0;
        this.velx = Math.random() * 10 - 5;
        this.vely = Math.random() * 10 - 5;
        this.timeonground = 0;
        this.doUpdate = true;
    }
    updateSimple() {
        this.vely += gravAcc;
        this.y += this.vely;
        this.x += this.velx;

        if(this.y >= softObj.canvas.width - 10) { //10 is the radius
            this.vely *= -1;
            this.y = softObj.canvas.width -10.01;
        }
        if(this.x >= softObj.canvas.height - 10) {
            this.velx *= -1;
            this.x = softObj.canvas.width - 10.01;
        }
        if(this.x <= 10) {
            this.velx *= -1;
            this.x = 10.01;
        }
        checkCollisions(this);
        checkFriction(this);
    }
    show() {
        const ctx = softObj.context;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 10, 2 * Math.PI,false);
        ctx.fillStyle = "rgb(20,50,100)";
        ctx.fill();
        ctx.stroke();
        if(test) {
            alert(this.velx);
        }
    }
}