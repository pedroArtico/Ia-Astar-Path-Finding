/**
 * Created by andre on 23/05/2018.
 */
/*Definção do objeto que representa cada célula do grid / nó do grafo*/

var bestPathDifficultyImportance = 0.2;
var perlincount = 0;



function Cell(xpos, ypos){
    this.f = 0;
    this.g = 0;
    this.h = 0;

    this.x = xpos;
    this.y = ypos;
    this.mark = false;
    this.previous = undefined;
    this.neighbors = [];
    this.wall = random(1) < randomWallPercentage;
    this.supereasy = false;
    this.risk = 0;
    this.difficulty =  undefined;
    this.inClosedSet = false;
    this.inOpenSet = false;
    this.mycolor = color(0, 0, 0);
    this.idCount = 0;
    this.isRoad = false;
}

Cell.prototype.isMouseOverMe = function (mx, my) {
    var rectWidth = w;
    var rectHeight = h;
    var rectX = this.x * w;
    var rectY = this.y * h;

    return (mx > rectX && mx < rectX + rectWidth) && (my > rectY && my < rectY + rectHeight) ;
};


/*Função que calcula para cada nó quais são seus vizinhos*/
Cell.prototype.addNeibors = function (grd, isDiagonal) {
    this.neighbors = [];

    var x = this.x;
    var y = this.y;

    if(x < rows-1){ this.neighbors.push(grd[x+1][y]);   }
    if(y < cols-1){ this.neighbors.push(grd[x][y+1]);   }
    if(x > 0){      this.neighbors.push(grd[x-1][y]);   }
    if(y > 0){      this.neighbors.push(grd[x][y-1]);   }

    if(isDiagonal){
        if(x < rows -1 && y < cols -1 /*&&
         !grd[x][y+1].wall && !grd[x+1][y].wall*/)
        {
            this.neighbors.push(grd[x+1][y+1]);
        }

        if(x > 0 && y > 0 /*&&
         !grd[x-1][y].wall && !grd[x-1][y].wall*/)
        {
            this.neighbors.push(grd[x-1][y-1]);
        }

        if(x < rows -1 && y > 0 /*&&
         !grd[x+1][y].wall && !grd[x][y-1].wall*/)
        {
            this.neighbors.push(grd[x+1][y-1]);
        }

        if(x > 0 && y < cols -1 /*&&
         !grd[x-1][y].wall && !grd[x][y+1].wall*/)
        {
            this.neighbors.push(grd[x-1][y+1]);
        }
    }
};

/*Cell.prototype.noSetRisk = function (maxIterations, currentIteration) {
    var tempArr = shuffleArr(this.neighbors);
    for(var i = 0; i < tempArr.length; i++){
        if(!tempArr[i].wall && currentIteration < maxIterations){
            tempArr[i].setRisk(maxIterations, currentIteration + 1);
            this.risk = floor(random(50, cellDistance(start, end)/5));
        }
    }
};*/

var initialRisk = 200;
Cell.prototype.setRisk = function (maxIterations, currentIteration, nextRisk) {

    if(currentIteration == 0){
        initialRisk = nextRisk;
    }

    if(nextRisk < 10){
        nextRisk = initialRisk + random(-10, 10);
    }

    if(currentIteration >= maxIterations || nextRisk < 1){
        return;
    }



    this.mark = true;
    this.risk = parseFloat((nextRisk).toFixed(2));
    var neib = undefined;
    var i;
    var tempArr = shuffleArr(this.neighbors);
    //var tempArr = this.neighbors;

    for(i = 0; i < tempArr.length; i++){
        neib = tempArr[i];
        if(!neib.wall && !neib.mark && !neib.supereasy){
            neib.setRisk(maxIterations, currentIteration + 1, nextRisk * 0.9);
        }
    }
};

/*Função que gera o mapa*/
Cell.prototype.setDifficulty = function (initialDif) {
    var sumAmount, i;
    sumAmount = random(0.1, 0.7);
    var maxValue = calculateMaxDifficulty();
    this.difficulty = floor(initialDif);
    var tempArr = shuffleArr(this.neighbors);


    //Wall
    if(this.difficulty > maxValue - floor(difficultPathToWallAmount * 100) * bestPathDifficultyImportance){
        this.wall = true;
        this.difficulty = 0;
    }

    //Common
    if(this.difficulty > maxValue - floor(difficultPathToWallAmount * 100)/3){
        this.difficulty += 20;
    }

    //Supereasy
    if(this.difficulty < maxValue - (maxValue * 0.8) && !this.wall){
        this.supereasy = true;
        this.difficulty = 2;
    }
    //Detect beach
    else{
        for(i = 0; i < this.neighbors.length; i++){
            if(this.neighbors[i].wall && !this.wall){
                this.supereasy = true;
                this.difficulty = 3;
                break;
            }
        }


    }

    //Recursive call
    for(i = 0; i < tempArr.length; i++){
        if(!tempArr[i].mark && !tempArr[i].wall){
            tempArr[i].mark = true;
            tempArr[i].setDifficulty(   floor((initialDif + sumAmount) % maxValue) + 1  );
        }
    }

    this.difficulty = floor(this.difficulty/2);
};


/*Definição das cores padrão dependendo do tipo e parâmetros do nó*/

Cell.prototype.show = function () {
    var r = 1;
    var g = 1;
    var b = 1;

    if(this == start){
        b = 0;
        g = 0;
        r = random(0, 1) < 0.7 ? 255 : 0;
    }
    else if(this == end){
        b = 0;
        g = 0;
        r = random(0, 1) < 0.1 ? 255 : 0;
    }else if(this.isRoad){
        r = 155;
        g = 97;
        b = 0;
    }
    else if(this.wall){
        //Wall

        var countTerrain = 0;
        for(var i = 0; i < this.neighbors.length; i++){
            if(!this.neighbors[i].wall){
                countTerrain ++;
            }
        }

        r = 2;
        g = map(countTerrain, 0, 8, 220, 255);
        b = map(countTerrain, 0, 8, 180, 255);
        perlincount += 0.1;
        b += (20 * noise(perlincount));

    }else if(this.supereasy){
        //Supereasy cell
        r = 56;
        g = 255;
        b = 66;
    }else if(this.risk > 0){
        r = 234;
        g = map(this.risk, 10, initialRisk, 0, 255) + ceil(random(-20, +10));
        b = 0;
    }
    else{
        //Normal cell
        r = 32;
        //g = 255 - ((this.difficulty * 3) / bestPathDifficultyImportance);
        g = 300 - map(this.difficulty, 3, calculateMaxDifficulty(), 100, 255);
        b = 0;
    }

    if(this != start && this != end){
        if(this.inClosedSet){
            r = r/2 + 150;
            g = g/2 + 150;
            b = b/2 + 150;
        }
        else
        if(this.inOpenSet){
            r = 221;
            g = 0;
            b = 166;
        }
    }
    var mouseOverTest = this.isMouseOverMe(mouseX, mouseY);
    if(mouseOverTest){
        r = 250;
        g = 255;
        b = 0;
        mouseIsOverSquare(this);
    }

    if(!mouseOverTest){
        this.mycolor =  color(r, g, b);
    }
    fill(color(r, g, b));
    noStroke();
    rect(this.x * w, this.y * h, w, h);
};

/*Mostrar o nó de forma visual: com uma cor especidifacada como argumento*/
Cell.prototype.showPath = function (clr) {
    if(clr.toString() != this.mycolor.toString() && this != start && this!= end){
        fill(clr);
        this.mycolor = clr;
        noStroke();
        rect(this.x * w, this.y * h, w, h);
    }
};

Cell.prototype.beginRoad = function (roadLen, previousNode, previousNodeIndex, roadTurnPercentage){

    if(roadLen <= 0){
        return;
    }

   this.setRoad();
    var turn = random(0, 1) < roadTurnPercentage;

    if(turn){
        var tempArr = shuffleArr(this.neighbors);
        var len = tempArr.length;

        for(var i = 0; i < len; i++){
            if(tempArr[i] != previousNode && !tempArr.isRoad) {

                var indx = 0;
                for(var j = 0; j < this.neighbors.length; j++){
                    if(this.neighbors.length[j] == tempArr[i]){
                        indx = j;
                        break;
                    }
                }

                tempArr[i].beginRoad(roadLen -1, this, indx, roadTurnPercentage);
                return;
            }
        }
    }
    else{//Tentar continuar reto
        var nextSquare = this.neighbors[previousNodeIndex];
        if(typeof nextSquare === 'undefined') {//O vizinho não existe,nesse caso é preciso virar
            nextSquare = this.neighbors[floor(random(0, this.neighbors.length -1))]
        }
        nextSquare.beginRoad(roadLen -1, this, previousNodeIndex, roadTurnPercentage);
    }
};

Cell.prototype.setRoad = function(){
    this.difficulty = 0.1;
    this.risk = 0;
    this.isRoad = true;
    this.wall = false;
};

Cell.prototype.setCellAsWall = function(){
    this.difficulty = 0;
    this.risk = 0;
    this.isRoad = false;
    this.wall = true;
};

function calculateMaxDifficulty() {
    return floor(abs(cellDistance(start, end, choosenDistanceMethod)/2));
}