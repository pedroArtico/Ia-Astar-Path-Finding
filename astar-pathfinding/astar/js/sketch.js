


function setVariables() {
    randomSeed(randomSeedInput.value());
    noiseSeed(randomSeedInput.value());
    randomWallPercentage = randomObstaclePercentageSlider.value();
    allowDiagonalMovement = allowDiagonalMovementRadio.value() == 1;
    difficultPathToWallAmount = groupObstacleSlider.value();

    choosenDistanceMethod = distanceHeuristicTypes[parseInt(distanceMethodRadio.value()) - 1];
}



/*Função que gera o grid colocando e conectando os nós*/
function generateGrid() {
    var i;
    
    //Fazendo uma matriz bidimencional
    
    print('Generating matrix.');
    grid = new Array(cols);
    for(i = 0; i < cols; i++){
        grid[i] = new Array(rows);
    }

    //Colocando um objeto em cada posição do vetor
    print('Generating cells');
    for(i = 0; i < cols; i++){
        for(var j = 0; j < rows; j++){
            grid[i][j] = new Cell(i, j);
        }
    }

    initMap();
    totalNodesCount = countTotalWalkableNodes();
}


function initMap() {


    calculateNeigbours(true);
    defineStartEndPoints();
    defineDifficulty();
    defineRiskAreas();

    calculateNeigbours(false);
    
    


    getRandomNode().beginRoad(ceil(rows * 0.7), undefined, 0, random(0.2, 0.7));
    getRandomNode().beginRoad(ceil(rows * 0.7), undefined, 1, random(0.2, 0.7));
    getRandomNode().beginRoad(ceil(rows * 0.7), undefined, 2, random(0.2, 0.7));
    getRandomNode().beginRoad(ceil(rows * 0.7), undefined, 3, random(0.2, 0.7));
    end.beginRoad(ceil(rows * 0.7), undefined, 3, random(0.2, 0.7));
    end.beginRoad(ceil(rows * 0.7), undefined, 3, random(0.2, 0.7));
    start.beginRoad(ceil(rows * 0.7), undefined, 3, random(0.2, 0.7));



    calculateNeigbours(allowDiagonalMovement);
}

function cleanMark() {
    var i;
    for(i = 0; i < cols; i++){
        for(var j = 0; j < rows; j++){
            grid[i][j].mark = false;
        }
    }
}

function getRandomNode() {
    var nodex = ceil(random(0, rows-1));
    var nodey = ceil(random(0, cols-1));

    return grid[nodex][nodey];
}

function defineStartEndPoints() {
    //Definindo os pontos final e inicial
    var startPoint = ceil(random(0, rows/4));
    var endPoint = ceil(random(rows/4, rows-1));

    start = grid[startPoint][startPoint];
    end = grid[endPoint][endPoint];

    //Colocando o ponto inicial na lista de nós abertos
    start.g = 0;
    start.h = cellDistance(start, end, choosenDistanceMethod);
    start.f = start.g + start.h;
    openSet.push(start);
}

function defineDifficulty() {
    end.setDifficulty(3);

    var i, j;

    for(i = 0; i < cols; i++){
        for(j = 0; j < rows; j++){
            var elem = grid[i][j];
            if(elem.difficulty == undefined){
                print('undefined difficulty found at x: ' + elem.x + ' y:'+ elem.y);
                elem.setDifficulty(3);
            }

        }
    }




    end.wall = false;
    start.wall = false;
    for(var i = 0; i < end.neighbors.length; i++){
        end.neighbors[i].wall = false;
    }


    for(var i = 0; i < start.neighbors.length; i++){
        start.neighbors[i].wall = false;
    }

    cleanMark();
}

function defineRiskAreas(){

    //
    var i;
    var riskAreaNumber = ceil(random(1, (rows/10)/5));

    for(i = 0 ; i < riskAreaNumber; i++){

        var riskLevels = 1 + random(1, 2) * 2;
        var riskAreaSize = ceil(riskLevels * riskLevels);
        var initialRiskAmount = floor(random(50, cellDistance(start, end)/3));
        var riskX = ceil(random(0, rows-1));
        var riskY = ceil(random(0, cols-1));

        grid[riskX][riskY].setRisk(riskAreaSize,0,initialRiskAmount);
    }

    end.risk = 0;
    start.risk = 0;
    for(i = 0; i < end.neighbors.length; i++){
        end.neighbors[i].risk = 0;
    }


    for(i = 0; i < start.neighbors.length; i++){
        start.neighbors[i].risk = 0;
    }
    cleanMark();
}




function countTotalWalkableNodes() {
    var i, j;
    var walkables = 0;
    for(i = 0; i < cols; i++){
        for(j = 0; j < rows; j++){
            if(!grid[i][j].wall){
                walkables += 1;
            }
        }
    }
    return walkables;
}

function showMap() {
    var i;
    for(i = 0; i < cols; i++){
        for(var j = 0; j < rows; j++){
            grid[i][j].show();
        }
    }
}



var totalNodesCount = 0;
/*Função que desenha a interface: essa função é chamada repetidamente pelo
* framework utilizado, ela é utilizada ao invés de uma estrutura de repetição,
* dessa forma cada etapa do algoritmo será desenhada na tela*/


var countPathCost = 0;

function draw() {
    background(0);
    start.show();
    var i;

    /*Se a flag que indica que o algoritmo deve executar for ativada*/
    if(execute && !fastExecuteFlag){
        pathfindStep();
    }

    var closedSetLen = closeSet.length;
    var openSetLen = openSet.length;


    var closedHtml = "";
    var openedHtml = "";
    var pathHtml = "";


    for(i = 0; i < closedSetLen; i++){
        closedHtml += formatItemForColumn(closeSet[i]);
    }

    for(i = 0; i < openSetLen; i++){
        openedHtml += formatItemForColumn(openSet[i]);
    }

    showMap();

    countPathCost = 0;
    var pathLenValue = path.length;
    
    for(i = 0; i < pathLenValue; i++){
        if((i == calcPathBlinkIndex()) && !execute ){
            path[i].showPath(color(0, 119, 255));
        }else{
            path[i].showPath(color(49, 0, 198));
        }
        pathHtml += formatItemForColumn(path[i]);
    }



    countPathCost = calcPathCost(path);

    stepsText.html('<strong>Passos: </strong>' + stepsCount);
    pathLen.html("<strong>Tamanho do caminho: </strong>" + path.length);
    pathCost.html('<strong>Custo do caminho:</strong> ' + countPathCost);


    openedNodesText.html('<strong>Nós abertos:</strong> ' + openSet.length);
    closedNodesText.html('<strong>Nós fechados:</strong> ' + closeSet.length);
    totalNodes.html('<strong>Nós totais:</strong> ' + totalNodesCount);

    
    closedNodesLog.html(closedHtml);
    openedNodesLog.html(openedHtml);
    pathNodesLog.html(pathHtml);
}

function calcPathCost(arr) {

    var cost = 0;
    //countPathCost += 1 + path[i].difficulty + path[i].risk +

    var i;
    var pathLenValue = arr.length;

    for(i = 0; i < pathLenValue; i++){
        var nodeElem = arr[i];
        
        cost += cellDistance(nodeElem, nodeElem.previous, choosenDistanceMethod) + nodeElem.difficulty + nodeElem.risk /*+ cellDistance(path[i], end, choosenDistanceMethod)*/;
    }

    return cost;
}

var pathBlinkN = -1;
var tempCount = 0;
var times = 5;
function calcPathBlinkIndex() {
    if(tempCount % (path.length * times) == 0){
        pathBlinkN = floor((pathBlinkN + 1) % path.length);
    }
    tempCount++;
    return pathBlinkN;
}

function configsChanged() {

    randomObstaclePercentageText.html('<strong>Chance de um nó ser água:</strong> ' + randomObstaclePercentageSlider.value() + "\% (x100)");
    groupObstacleText.html('<strong>Chance de água em grupos:</strong> ' + groupObstacleSlider.value() + '\% (x100)');
    allowDiagonalMovementText.html('<strong>Permitir movimento na diagonal:</strong> ' + (allowDiagonalMovementRadio.value() == 1 ? "sim" : "não"));
    distanceMethodText.html('<strong>Método de cálculo de distância:</strong>  ' + (distanceMethodRadio.value() == 2 ? "Manhattan" : "Euclidiana"));

    setVariables();
}


function generateHeuristicFormulaHtml(showNumbers) {
    var gnw = wValueInput.value();
    var hnw = xValueInput.value();
    var difnw = yValueInput.value();
    var riskw = zValueInput.value();

    var valueg;
    var valueh;
    var valuedif;
    var valuerisk;

    if(showNumbers){
        valueg = "<span class='formulaVariable'>" + gnw + "</span>";
        valueh = "<span class='formulaVariable'>" + hnw + "</span>";
        valuedif = "<span class='formulaVariable'>" + difnw + "</span>";
        valuerisk = "<span class='formulaVariable'>" + riskw + "</span>";
    }else{
        valueg = "<span class='formulaVariable'>w</span>";
        valueh = "<span class='formulaVariable'>x</span>";
        valuedif = "<span class='formulaVariable'>y</span>";
        valuerisk = "<span class='formulaVariable'>z</span>";
    }


    //Fórmula base: f(n) = w * (y * dif(n) + z * rsk(n) + dist(n, n.previous)) + x *(h(n))

    var formula = "";

    if((gnw == 0 && hnw == 0) || ( (hnw  == 0) && (difnw == 0 && riskw == 0)) ){
        formula = "<strong>Sem heurística: busca cega em amplitude.</strong>";
        return formula;
    }

    formula = "<span class='formula'>f(n) = ";
    if(gnw > 0){
        formula += "<span class='formulaColor1'> " + valueg + " * (";

        if(difnw > 0){
           formula += valuedif + " * dif(n)";
        }

        if(difnw > 0 && riskw > 0){
            formula += " + ";
        }

        if(riskw > 0){
            formula += " " +valuerisk+ " * rsk(n) ";
        }

        if(difnw > 0 || riskw > 0){
            formula += " + ";
        }


        formula += "dist(n, n.previous)";
        formula += ") </span>"
    }

    if(hnw > 0){
        if(gnw > 0){
            formula += " + "
        }
        formula += "<span class='formulaColor2'>" + valueh + " *(dist(n, target))" + "</span>"
    }
    formula += "</span>";

    if(hnw == 1 && gnw == 1){
        formula += " (Algoritmo A*)"
    }
    else if(hnw == 1 && gnw == 0){
        formula += " (Algoritmo Best First)"
    }

    return formula;
}

function changeHeuristicFormulaView(){
    var formulaHtml = "Heurística: "+ generateHeuristicFormulaHtml(false) +"<br>";
    formulaHtml += "Nova Heurística: "+ generateHeuristicFormulaHtml(true);

    heuristicFormula.html(formulaHtml);


    wValueText.html('<strong>w: controla <span class="formula">g(n)</span>:</strong> ' +     wValueInput.value());
    xValueText.html('<strong>x: controla <span class="formula">h(n)</span>:</strong>' +      xValueInput.value());
    yValueText.html('<strong>y: controla <span class="formula">dif(n)</span>:</strong> ' +   yValueInput.value());
    zValueText.html('<strong>z: controls <span class="formula">risk(n)</span>:</strong>' +   zValueInput.value());
}

function formatItemForColumn(elem) {
    return "<span>" +
        "<strong class='listItemTitle'>xy(" + elem.x + ", " + elem.y + ")</strong><br>" +
        " <strong>f: </strong>" + elem.f.toFixed(1) +
        " <strong>g: </strong>" + elem.g.toFixed(1) +
        " <strong>h: </strong>" + elem.h.toFixed(1) +
        " <br><strong>difficulty: </strong>" + elem.difficulty +
        " <br><strong>risk: </strong>" + elem.risk +
        "</span>" +
        "<hr>";
}


/*Função para definir os vizinhos de cada nó*/
function calculateNeigbours(isDiagonal) {
    for(var i = 0; i < cols; i++){
        for(var j = 0; j < rows; j++){
            grid[i][j].addNeibors(grid, isDiagonal);
        }
    }
}

function fastExecute() {
    noLoop();
    runStatus.html('<strong>Status: </strong> executando rapidamente...');
    fastExecuteFlag = true;
    begin();

    while(execute){
        pathfindStep();
    }
    fastExecuteFlag = false;
    loop();
}

function stepExecute() {
    runStatus.html('<strong>Status: </strong> execução passo a passo: novo passo.');
    pathfindStep();
}


function pauseExecution() {
    execute = false;
    runStatus.html('<strong>Status: </strong> pausado.');
}

function randomizeInputSeedText(){
    randomSeedInput.value( parseFloat(random(-500, 500).toFixed(2)) );
    reset();
}


/*Função que dispara o início da busca*/
function begin() {
    m = wValueInput.value();
    n = xValueInput.value();
    execute = true;
    runStatus.html('<strong>Status: </strong> executando...');
}

var treeNet = undefined;
var treeContainerName = 'mynetwork';

/*Função que limpa as estruturas de dados geradas e prepara uma nova execução*/






function reset() {
    print('\n\n--------------------RESETING--------------------\n\n');
    grid = null;

    var size = inputSize.value();

    stepsText.html('<strong>Etapas:</strong> 0');
    runStatus.html('<strong>Status:</strong> não está sendo executado.');
    pathLen.html('<strong>Tamanho do caminho:</strong> 0');
    pathCost.html('<strong>Custo do caminho:</strong> 0');
    openedNodesText.html('<strong>Nós abertos:</strong> 0');
    closedNodesText.html('<strong>Nós fechados:</strong> 0');
    totalNodes.html('<strong>Nós totais:</strong> 0');

    //randomObstaclePercentageText.html('<strong>Chance de um nó ser água:</strong> 0% (x100)');
    //groupObstacleText.html('<strong>Chance de água em grupos:</strong> 0% (x100)');
    //allowDiagonalMovementText.html('<strong>Permitir movimento na diagonal:</strong> sim');
    //distanceMethodText.html('<strong>Método de cálculo de distância:</strong> Euclidiana');

    if(size > 3 && size <= 300){
        cols = size;
        rows = size;
    }

    setVariables();
    w = width/cols;
    h = height/rows;

    execute = false;


    openSet = [];
    closeSet = [];
    path = [];

    stepsCount = 0;
    generateGrid();
    runStatus.html('<strong>Status: </strong> grafo gerado, esperando para executar...');

    
    if(treeNet == undefined){
        treeNet = new MyTreeNetwork();
    }
    treeNet.deleteNetwork();
    treeNet.createNetwork(treeContainerName);
    treeNet.addFirstNodeWithId(getIdFrom(start), formatNetElemText(start), start);

    wWeight = wValueInput.value();
    xWeight = xValueInput.value();
    yWeight = yValueInput.value();
    zWeight = zValueInput.value();
}

function showTreeNetwork(){
    if(treeNet == undefined){
        treeNet = new MyTreeNetwork();
    }
    treeNet.commitNetwork(path, start, end);
    treeNet.createNetwork(treeContainerName);

    treeCreatedModal.open();
}

function showSubtitleModal() {
    document.getElementById('id02').style.display='block';
}

function formatNetElemId(elem){
    elem.idCount += 1;
    return parseInt('1' + elem.x + '00' + elem.y + '00' + elem.idCount);
}

function getIdFrom(elem) {
    return parseInt('1' + elem.x + '00' + elem.y + '00' + elem.idCount);
}

function formatNetElemText(elem){
    return 'xy('+ elem.x + ', '  + elem.y +')\nf(n) = ' + elem.f.toFixed(2);
}

function formatArrowText(elem) {
    return 'h(n) = ' + elem.h.toFixed(2) + '\n' +
           'g(n) = ' + elem.g.toFixed(2) + '\n' +
           'dif(n) = ' + elem.difficulty.toFixed(2) + '\n' +
           'risk(n) = ' + elem.risk.toFixed(2) + '\n';
}

function mantainPathClean() {
    for(var i = 0; i < cols; i++){
        for(var j = 0; j < rows; j++){
            grid[i][j].inClosedSet = false;
            grid[i][j].inOpenSet = false;
        }
    }
}





function mouseIsOverSquare(element){
    showToolipOnCell(element);
    drawWithMouse(element);
}



function mouseIsOutOfCanvas() {
    hideToolipOnCell();
}



var brushTypes = ['off', 'water', 'terrain', 'risk', 'road'];
var brushType = brushTypes[0];

function drawWithMouse(element) {
    if(mouseIsPressed){
        if (mouseButton === LEFT) {

            switch (brushType){
                case brushTypes[1]:
                    element.wall = true;
                    if(element.isRoad){
                        element.isRoad = false;
                    }
                    break;
                case brushTypes[2]:
                    element.wall = false;
                    break;
                case brushTypes[3]:
                    var initialRiskAmount = floor(random(50, cellDistance(start, end)/3));
                    var riskLevels = 1 + random(1, 2) * 2;
                    var riskAreaSize = ceil(riskLevels * riskLevels);
                    element.setRisk(riskAreaSize,0,initialRiskAmount);
                    cleanMark();
                    break;
                case brushTypes[4]:
                    element.setRoad();
                    break;
                default:
                    break;
            }




        }
        /*if (mouseButton === RIGHT) {

        }
        if (mouseButton === CENTER) {
        }*/
    }
}

function showToolipOnCell(element) {
    var htmlVal = '<strong>Mouse sobre o nó: </strong> (x: '+element.x+', y: '+ element.y + ')';

    if(element == end){
        htmlVal += '<br><strong>Tipo:</strong> nó objetivo';
    }else if(element == start){
        htmlVal += '<br><strong>Tipo:</strong> nó inicial';
    }else if(element.wall) {
        htmlVal += '<br><strong>Tipo:</strong> água';
    }else if(element.isRoad){
        htmlVal += '<br><strong>Tipo:</strong> trilha';
    }else{
        htmlVal += '<br><strong>Tipo:</strong> floresta';
    }

    if(element.supereasy && element != end && element != start && !element.wall){
        htmlVal += " descampada";
    }

    if(element.risk > 0){
        htmlVal += " com risco";
    }

    if(element.wall){
        htmlVal += '<br><strong>dificuldade:</strong> -';
        htmlVal += '<br><strong>risco:</strong> -';
        htmlVal += '<br><strong>f:</strong> -';
        htmlVal += '<br><strong>g:</strong> -';
        htmlVal += '<br><strong>h:</strong> -';
    }else{
        htmlVal += '<br><strong>dificuldade:</strong> ' + element.difficulty;
        htmlVal += '<br><strong>risco:</strong> ' + element.risk;
        htmlVal += '<br><strong>f:</strong> ' + element.f;
        htmlVal += '<br><strong>g:</strong> ' + element.g;
        htmlVal += '<br><strong>h:</strong> ' + element.h;
    }

    htmlVal += '<br><strong>Distância até objetivo:</strong> ' + cellDistance(element, end, choosenDistanceMethod);
    mouseOverText.html(htmlVal);

    divTextAboutNode.position(mouseX + 50, mouseY + 100);
    var tempClr = element.mycolor;
    var otherColor;

    var minColor = 85;

    if(red(tempClr) < minColor && green(tempClr) < minColor && blue(tempClr) < minColor){
        otherColor = colorAsStrRGBA((red(tempClr) + 50) * 3, (green(tempClr) + 50) * 3, (blue(tempClr) + 50) * 3);
    }else{
        otherColor = colorAsStrRGBA(red(tempClr) /4, green(tempClr)/4, blue(tempClr)/4);
    }

    divTextAboutNode.style(
        'visibility: visible; background: '+colorAsStrRGBA(red(tempClr), green(tempClr), blue(tempClr), 210)+';' +
        'color: ' + otherColor +';' +
        'border: solid 1px ' + otherColor + ';'
    );
}

function hideToolipOnCell() {
    divTextAboutNode.style('visibility: hidden;');
}

function saveExecution() {

    //savedExecutions
    var execDiv = createDiv();
    execDiv.parent("savedExecutions");
    execDiv.class('listBox');
    execDiv.style('position: relative;');

    var rowDiv = createDiv();
    rowDiv.parent(execDiv);
    rowDiv.class('row');

    var colDiv1 = createDiv();
    colDiv1.parent(rowDiv);
    colDiv1.class('columnSmall');

    var colDiv2 = createDiv();
    colDiv2.parent(rowDiv);
    colDiv2.class('columnLarge');
    colDiv2.style('padding-left: 10px; line-height: 0.8;');

    var imgdiv = createDiv();
    imgdiv.parent(colDiv1);

    var deleteSavedBtn = createElement("span", "&times;");
    deleteSavedBtn.parent(execDiv);
    deleteSavedBtn.class('w3-button topRight');
    deleteSavedBtn.mouseClicked(function () {
        execDiv.style('display:none;');
    });



    //<span onclick="closeModal('id01')"class=""></span>

    //saveFrames(filename, extension, duration, framerate, [callback])
    saveFrames('out'+ceil(millis()), 'png', 1, 1, function(data) {

        var img = data[0]['imageData'];

        var imgHtml = createImg(img);
        imgHtml.width = 50;

        imgHtml.parent(imgdiv);
        imgHtml.style('width: 100%; height 100%;');

    });

    createP("<strong>Fórmula Heurística: </strong>"+ generateHeuristicFormulaHtml(true)).parent(colDiv2);
    createP("<strong>Tamanho do grid: </strong>"+ rows + " x " + cols).parent(colDiv2);
    createP("<strong>Semente para a geração do mapa: </strong>" + randomSeedInput.value()).parent(colDiv2);
    createP('<strong>Chance de um nó ser água:</strong> ' + randomObstaclePercentageSlider.value() + "\% (x100)").parent(colDiv2);
    createP('<strong>Chance de água em grupos:</strong> ' + groupObstacleSlider.value() + '\% (x100)').parent(colDiv2);
    createP('<strong>Permitir movimento na diagonal:</strong> ' + (allowDiagonalMovementRadio.value() == 1 ? "sim" : "não")).parent(colDiv2);
    createP('<strong>Método de cálculo de distância:</strong>  ' + (distanceMethodRadio.value() == 2 ? "Manhattan" : "Euclidiana")).parent(colDiv2);
    createP('<strong>Passos: </strong>' + stepsCount).parent(colDiv2);
    createP("<strong>Tamanho do caminho: </strong>" + path.length).parent(colDiv2);
    createP('<strong>Custo do caminho:</strong> ' + countPathCost).parent(colDiv2);
    createP('<strong>Nós abertos:</strong> ' + openSet.length).parent(colDiv2);
    createP('<strong>Nós fechados:</strong> ' + closeSet.length).parent(colDiv2);
    createP('<strong>Nós totais:</strong> ' + totalNodesCount).parent(colDiv2);


    executionSavedModal.open();
}

function setSlidersToAStar(){
    xValueInput.value(1);
    wValueInput.value(1);
    yValueInput.value(1);
    zValueInput.value(1);
    changeHeuristicFormulaView();
}

function setSlidersToBestFirst() {
    xValueInput.value(1);
    wValueInput.value(0);
    yValueInput.value(0);
    zValueInput.value(0);
    changeHeuristicFormulaView();
}

function setSlidersToAmplitude() {
    xValueInput.value(0);
    wValueInput.value(0);
    yValueInput.value(0);
    zValueInput.value(0);
    changeHeuristicFormulaView();
}
