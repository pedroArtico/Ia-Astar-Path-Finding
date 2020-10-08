/**
 * Created by andre on 23/05/2018.
 */
/*Função que embaralha os elementos de um vetor*/
function shuffleArr(a) {
    var aLen = a.length;
    for (var i = aLen - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}


function openHeuristicModal() {
    document.getElementById('id01').style.display='block';
}

/*
 * Remoção de um elemento de um vetor: o javascript não faz isso nativamente, é preciso codificar esse comportamento.
 * */
function removeFromArray(arr, elem) {
    for(var i = arr.length -1; i >= 0; i--){
        if(arr[i] == elem){
            arr.splice(i, 1);
        }
    }
}

function colorAsStrRGBA(red, green, blue, alpha) {
    if(alpha == undefined){
        alpha = 255;
    }
    var tmp = color(red, green, blue, alpha).toString();
    return tmp;
}

function genColor(number, max) {
    var numTemp = number / (max / 2);

    var from = color(255, 0, 0);
    var to = color(0, 255, 0);
    var to2 = color(0, 255, 255);
    var clr;

    if (numTemp < 1) {
        clr = lerpColor(from, to, numTemp);
    } else {
        clr = lerpColor(to, to2, numTemp - 1);
    }
    var strClr = rgbaToHex(clr.toString());
    print(numTemp + ' ' + strClr);
    return strClr;
}

function mySleep(milliseconds) {
    print('Sleeping ' + milliseconds +'...');
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
            break;
        }
    }
}