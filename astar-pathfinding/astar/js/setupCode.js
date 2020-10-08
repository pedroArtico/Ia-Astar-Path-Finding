/**
 * Created by andre on 23/05/2018.
 */

/*
 * Este algoritmo gera um mapa e usa de algum algoritmo de busca com ou sem heurística para encontrar um caminho
 * (caso exista) entre um nó inicial e um nó final.
 *
 * O mapa gerado é dividido entre a parte verde (simulando solo) e a parte azul (simulando água),
 * o agente precisa encontrar o caminho entre dois nós do grid com a limitação de não poder passar pela água
 * os caminhos por terra estão representados em diferentes tons de verde - tons mais claros indicam caminhos mais fáceis
 * de serem percorridos e tons mais escuros, caminhos mais difíceis.
 *
 * A geração do mapa é aleatória, podendo haver mapas em que não existe caminho possível entre os dois nós, nele
 * os pedaços de terra que tocam água são mais fáceis de serem percorridos, simulando uma praia.
 *
 * Este é um código na linguagem JavaScript utilizando o framework P5.
 *
 * */


/*
 * */


/*Lista dos tipos de cálculo de distância entre pontos (utilizados na heurística)*/
var distanceHeuristicTypes = ['Euclidean', 'Manhattan'];

/*Cálculo da distância entre dois nós*/
function cellDistance(a, b, distance) {

    if(a == undefined  || b == undefined){
        return 0;
    }
    var d;
    if(distance == distanceHeuristicTypes[0]){
        //Euclidean distance
        d = dist(a.x, a.y, b.x, b.y);
    }else{
        //Manhattan distance
        d = abs(a.x - b.x) + abs(a.y - b.y);
    }
    return d;
}

/*Contadores*/
var stepsCount = 0;

/*Tamanho do grid*/
var cols = 60;
var rows = cols;

/*Declaração da variável que armazena o grid/grafo */
var grid = undefined;

/*Lista de nós abertos e nós fechados*/
var openSet = [];
var closeSet = [];

/*Lista de nós no caminho escolhido*/
var path = [];

/*Início e fim*/
var start;
var end;

/*Altura e largura de cada quadrado no mapa*/
var w, h;


/*Variáveis que armazenam objetos do DOM (interface)*/
var inputSize;
var stepsText;
var runStatus;
var pathLen;
var pathCost;
var openedNodesText;
var closedNodesText;
var totalNodes;
var wValueText;
var xValueText;
var xValueInput;
var wValueInput;
var yValueText;
var zValueText;
var yValueInput;
var zValueInput;
var heuristicFormula;
var randomSeedInput;
var randomObstaclePercentageText;
var randomObstaclePercentageSlider;
var allowDiagonalMovementText;
var allowDiagonalMovementRadio;
var distanceMethodText;
var distanceMethodRadio;
var groupObstacleText;
var groupObstacleSlider;
var openedNodesLog;
var closedNodesLog;
var pathNodesLog;
var mouseOverText;
var treeCreatedModal;
var executionSavedModal;
var divTextAboutNode;

/*Flag: algoritmo está em execução*/
var execute = false;
var fastExecuteFlag = false;


/*======================================= VARIÁVEIS QUE MUDAM O COMPORTAMENTO DO PROGRAMA ===========================*/

var wWeight = 1, xWeight = 1, yWeight = 1, zWeight = 1;

/*
 * A heurística utilizada será:
 *
 * f(i) = (m * g(i)) + (n * h(i))
 *
 * Em que i é um nó
 * g(i) é a soma do caminho percorrido até o momento somada à dificuldade de ir ao nó i
 * h(i) é a distância do nó i até o nó objetivo (o método de cálculo de distância pode ser escolhido posteriormente)
 *
 * Compotamentos do algoritmo
 *
 * SE m = 1 e n = 1 ENTÃO A FUNÇÃO HEURÍSTICA SERÁ: (f(i) = g(i) + h(i)) O QUE LEVA A UMA BUSCA: A* visto que a distância
 *   até o objetivo e a dificuldade do caminho serão considerados
 * SE m = 1 e n = 0 ENTÃO A FUNÇÃO HEURÍSTICA SERÁ: (f(i) = g(i)) O QUE LEVA A UMA BUSCA:
 *   mista entre amplitude e profundidade em que os nós de menor custo serão explorados primeiro.
 * SE m = 0 e n = 1 ENTÃO A FUNÇÃO HEURÍSTICA SERÁ: (f(i) = h(i)) O QUE LEVA A UMA BUSCA:
 *   best first com backtracking: caso o algoritmo chegue em um dead end tentará continuar a partir do nó aberto com
 *   menor distância até o objetivo.
 * SE m = 0 e n = 0 ENTÃO A FUNÇÃO HEURÍSTICA SERÁ: nenhuma O QUE LEVA A UMA BUSCA: em amplitude, os nós vizinhos do nós
 *   abertos serão explorados primeiro.
 * */


/*Porcentagem de barreiras em locais randômicos: chance de um nó qualquer ser uma barreira*/
var randomWallPercentage = 0.0;
/*Permitir que o agente se mova na diagonal*/
var allowDiagonalMovement = true;
/*Quantidade de barreiras geradas em grupos: quanto maior for o número maiores serão os "rios"*/
var difficultPathToWallAmount = 0.5;
/*Método do cálculo de distância
 * distanceHeuristicTypes[0] :  distância Euclidiana
 * distanceHeuristicTypes[1] :  distância de Manhattan
 * */
var choosenDistanceMethod = distanceHeuristicTypes[0];

/*====================================================================================================================*/

function updateHeuristic() {
    closeModal('id01');
    reset();
    new MySimpleModal('heuristicUpdatedModal',  '<p>A heurística foi atualizada.</p>').create().open();
}

/*Função de setup do algoritmo*/

function setup() {

    var mycanvas = createCanvas(600, 600);
    background(0);
    mycanvas.parent("leftSection");
    mycanvas.mouseOut(mouseIsOutOfCanvas);

    w = width/cols;
    h = height/rows;


    //INPUTS NA ÁREA DE CONFIGURAÇÕES

    inputSize = createInput("60", "number");
    createP("Tamanho do grid:").parent("configuration");
    inputSize.parent("configuration");
    inputSize.changed(reset);

    createP("Semente para a geração do mapa:").parent("configuration");
    randomSeedInput = createInput(ceil(random(0, 200)), "number");
    randomSeedInput.parent("configuration");
    randomSeedInput.changed(reset);

    var buttonRandomize = createButton('🔀 Randomizar');
    buttonRandomize.parent("configuration");
    buttonRandomize.mousePressed(randomizeInputSeedText);
    buttonRandomize.class("defaultButton blueButton");

    randomObstaclePercentageText = createP('<strong>Chance de um nó ser água:</strong> 0%');
    randomObstaclePercentageSlider = createSlider(0,1, 0, 0.1);//min, max, value, step
    randomObstaclePercentageText.parent('configuration2');
    randomObstaclePercentageSlider.parent('configuration2');
    randomObstaclePercentageSlider.changed(reset);

    groupObstacleText = createP('<strong>Chance de água em grupos:</strong> 0%');
    groupObstacleSlider = createSlider(0,1, 0.5, 0.1);//min, max, value, step
    groupObstacleText.parent('configuration2');
    groupObstacleSlider.parent('configuration2');
    groupObstacleSlider.changed(reset);

    allowDiagonalMovementText = createP('<strong>Permitir movimento na diagonal:</strong> yes');
    allowDiagonalMovementRadio = createRadio('');
    allowDiagonalMovementRadio.option('Sim   ', 1).checked = true;
    allowDiagonalMovementRadio.option('Não   ', 0);
    allowDiagonalMovementText.parent('configuration2');
    allowDiagonalMovementRadio.parent('configuration2');
    allowDiagonalMovementRadio.changed(reset);

    distanceMethodText = createP('<strong>Método de cálculo de distância:</strong> Manhattan');
    distanceMethodRadio = createRadio('');
    distanceMethodRadio.option('Euclidiana  ', 1).checked = true;
    distanceMethodRadio.option('Manhattan   ', 2);
    distanceMethodText.parent('configuration2');
    distanceMethodRadio.parent('configuration2');
    allowDiagonalMovementRadio.changed(reset);


    randomObstaclePercentageSlider.input(configsChanged);
    groupObstacleSlider.input(configsChanged);
    allowDiagonalMovementRadio.input(configsChanged);
    distanceMethodRadio.input(configsChanged);

    configsChanged();


    //LISTAS DE NÓS: ABERTOS, FECHADOS E DO CAMINHO

    openedNodesLog = createDiv('Nada a mostrar');
    closedNodesLog = createDiv('Nada a mostrar.');
    pathNodesLog = createDiv('Nada a mostrar.');

    openedNodesLog.parent('openedLog');
    closedNodesLog.parent('closedLog');
    pathNodesLog.parent('pathLog');

    openedNodesLog.class('divOverflow');
    closedNodesLog.class('divOverflow');
    pathNodesLog.class('divOverflow');

    createP("").parent("configuration");

    //ELEMENTOS DO MODAL: EDITAR HEURÍSTICA

    wValueText = createP("w: controla <span class='formula'>g(n)</span>").parent("editwx");
    wValueInput = createSlider(0,1, 1, 0.1);//min, max, value, step
    wValueInput.parent("editwx");

    xValueText = createP("x: controla <span class='formula'>h(n)</span>").parent("editwx");
    xValueInput = createSlider(0,1, 1, 0.1);//min, max, value, step
    xValueInput.parent("editwx");

    yValueText = createP("w: controla <span class='formula'>dif(n)</span>").parent("edityz");
    yValueInput = createSlider(0,1, 1, 0.1);//min, max, value, step
    yValueInput.parent("edityz");

    zValueText = createP("x: controla <span class='formula'>risk(n)</span>").parent("edityz");
    zValueInput = createSlider(0,1, 1, 0.1);//min, max, value, step
    zValueInput.parent("edityz");

    wValueInput.input(changeHeuristicFormulaView);
    xValueInput.input(changeHeuristicFormulaView);
    yValueInput.input(changeHeuristicFormulaView);
    zValueInput.input(changeHeuristicFormulaView);

    heuristicFormula = createP("<span class='formula'>f(n) = w * (1 + y * dif(n) + z * rsk(n)) + x *(h(n))</span><br><span class='formula'>f(n) = w * (1 + y * dif(n) + z * rsk(n)) + x *(h(n))</span>");
    heuristicFormula.parent('resutlFormula');


    var setAstarButton = createButton('A*');
    setAstarButton.parent('algChoices');
    setAstarButton.class('defaultButton blueButton');
    setAstarButton.mousePressed(setSlidersToAStar);

    var setAstarButton = createButton('Best First (com backtracking)');
    setAstarButton.parent('algChoices');
    setAstarButton.class('defaultButton blueButton');
    setAstarButton.mousePressed(setSlidersToBestFirst);

    var setBlindSeatchButton = createButton('Busca cega em amplitude');
    setBlindSeatchButton.parent('algChoices');
    setBlindSeatchButton.class('defaultButton blueButton');
    setBlindSeatchButton.mousePressed(setSlidersToAmplitude);

    changeHeuristicFormulaView();

    var setHeuristicButton = createButton('Definir nova heurística');
    setHeuristicButton.parent('confirmBtn');
    setHeuristicButton.class('defaultButton redButton center centerInModal');
    setHeuristicButton.mousePressed(updateHeuristic);

    
    createP("<i>Redefinir a heurística irá apagar o caminho atual.<br>" +
        "A heurística só será redefinida usando este botão ou o botão \"reset\"." +
        "</i>").parent('confirmBtn');



    //BOTÕES NA ÁREA DE CONFIGURAÇÕES

    var showHeuristicButton = createButton('⚙ Editar/Ver heurística');
    showHeuristicButton.mousePressed(openHeuristicModal);
    showHeuristicButton.class("defaultButton blueButton");

    var beginButton = createButton("🞂 Iniciar/Continuar");
    createP("").parent("configuration");
    var fastExecuteButton = createButton("⏭ Execução rápida");
    var resetButton = createButton("↺ Setar/Resetar");
    var pauseButton = createButton("❚❚ Pausar");
    var stepExecuteButton = createButton("↝ Próximo passo");
    var cleanNotPathButton = createButton("Manter apenas o caminho");
    var generateTreeButton = createButton("🌳 Gerar árvore");
    var subtitleButton = createButton("ℹ️ Legendas");

    createP("").parent("configuration");
    beginButton.parent("buttonArea");
    resetButton.parent("buttonArea");
    fastExecuteButton.parent("buttonArea");
    pauseButton.parent("buttonArea");
    stepExecuteButton.parent("buttonArea");
    cleanNotPathButton.parent("buttonArea");
    createP().parent('buttonArea');
    showHeuristicButton.parent("buttonArea");
    generateTreeButton.parent("buttonArea");
    subtitleButton.parent('buttonArea');
    createP('<i>A geração da árvore pode demorar alguns segundos.</i>').parent('buttonArea');
    

    beginButton.class("defaultButton greenButton");
    resetButton.class("defaultButton redButton");
    fastExecuteButton.class("defaultButton greenButton");
    pauseButton.class("defaultButton blackButton");
    stepExecuteButton.class("defaultButton blueButton");
    generateTreeButton.class("defaultButton greenButton");
    subtitleButton.class("defaultButton blackButton");
    cleanNotPathButton.class("defaultButton blackButton");

    beginButton.mousePressed(begin);
    resetButton.mousePressed(reset);
    fastExecuteButton.mousePressed(fastExecute);
    pauseButton.mousePressed(pauseExecution);
    stepExecuteButton.mousePressed(stepExecute);
    generateTreeButton.mousePressed(showTreeNetwork);
    subtitleButton.mousePressed(showSubtitleModal);
    cleanNotPathButton.mousePressed(mantainPathClean);


    //TEXTO SOBRE A EXECUÇÃO DO ALGORITMO

    stepsText = createP('<strong>Passos:</strong> 0');
    runStatus = createP('<strong>Status:</strong> parado.');
    pathLen = createP('<strong>Tamanho do caminho:</strong> 0');
    pathCost = createP('<strong>Custo do caminho:</strong> 0');
    openedNodesText = createP('<strong>Nós abertos:</strong> 0');
    closedNodesText = createP('<strong>Nós fechados:</strong> 0');
    totalNodes = createP('<strong>Nós totais:</strong> 0');
    var saveExecutionButton = createButton('Salvar execução');
    saveExecutionButton.class("defaultButton greenButton");
    saveExecutionButton.mousePressed(saveExecution);

    stepsText.parent("data");
    runStatus.parent("data");
    pathLen.parent("data");
    pathCost.parent("data");
    openedNodesText.parent("data");
    closedNodesText.parent("data");
    totalNodes.parent("data");
    saveExecutionButton.parent("data");


    //TOOLTIP TEXT COM INFORMAÇÕES DO NÓ

    divTextAboutNode = createDiv();
    //divTextAboutNode.style();
    divTextAboutNode.class('nodeTooltip');
    divTextAboutNode.position(0, 0);
    mouseOverText = createP('<strong>Mouse sob o nó: </strong> (x: ?, y: ?)');
    mouseOverText.parent(divTextAboutNode);

    //CRIANDO ALGUNS MODAIS SIMPLES


    treeCreatedModal = new MySimpleModal('treeCreatedModal',  '<p>A árvore foi criada.</p>').create();
    executionSavedModal = new MySimpleModal('executionSavedModal',  '<p>A execução foi salva, veja no fim da página.</p>').create();
    
    
    // CHAMANDO FUNÇÃO DE RESET
    reset();
}