/**
 * Created by andre on 21/05/2018.
 */
function randomizeByPerlinNoise(offset, minNum, maxNum) {
    var perlinNoise = noise(offset);
    return Math.floor(perlinNoise*(maxNum-minNum+1)+minNum);
}

var xoff = 0;

function randAutoPerlin(minNum, maxNum) {

    if(maxNum == undefined && minNum == undefined){
        minNum = 0;
        maxNum = 1;
    }

    else if(maxNum == undefined){
        maxNum = minNum;
        minNum = 0;
    }

    xoff += 0.1;
    return randomizeByPerlinNoise(xoff, minNum, maxNum);
}