/**
 * Created by andre on 23/05/2018.
 */


/*
*
* Função que executa a busca passo a passo, deve ser chamada repetidamente enquanto a variável `execute` for `true`
*
* */


function pathfindStep() {
    stepsCount ++;//Apenas para contar os passos

    //Declaração de variáveis utilizadas nos loops for para aumento de performance
    var i;
    var opensetLen = openSet.length;

    if(openSet.length > 0){//Enquanto houverem nós na lista de nós abertos, a busca pode continuar
        //BUSCANDO
        //Encontrando o nó com menor custo (f) dentro da lista de nós abertos
        var lowestIndex = 0;

        //Fazendo uma busca linear (o conjunto não está ordenado)
        for(i = 0; i < opensetLen; i++){
            if(openSet[i].f < openSet[lowestIndex].f){
                lowestIndex = i;
            }
        }
        var current = openSet[lowestIndex];

        //Se o nó de menor custo não for o nó objetivo
        if(current != end){
            /*tirando nó da lista de nós abertos (não existe função de remoção de array nativa então uma
            função personalizada teve de ser definida
             */
            removeFromArray(openSet, current);
            closeSet.push(current);//Colocando nó na lista de nós fechados
            /*Dizendo para o nó que ele foi fechado (para tirar a necessidade do proprio nó fazer a busca) já que nós
            fechados tem uma cor diferente
            */
            current.inClosedSet = true;
        }
        //Criando variáveis locais para não ter que usar a definição mais longa
        var neighbors = current.neighbors;
        var neighborsLen = neighbors.length;

        //Caso o nó aberto de menor custo seja o nó final
        if(current === end){

            //Procurando o nó com menor f que não seja o nó final
            var lowIndex2 = 0;
            for(i = 0; i < opensetLen-1; i++){
                if(openSet[i].f < openSet[lowIndex2].f && openSet[i] != end){
                    lowIndex2 = i;
                }
            }

            /*Se o custo desse nó for menor que o custo do nó final pode ser que exista um caminho ainda melhor
            e então devo continuar procurando, o nó final é mantido na lista de nós abertos
            */
            if(openSet[lowIndex2].f >= current.f){
                /*removeFromArray(openSet, current);
                closeSet.push(current);
                current.inClosedSet = true;*/

                runStatus.html('<strong>Status: </strong> caminho encontrado.');//Mudar o texto de status
                console.log("DONE!");//Colocar uma mensagem no terminal

                //Definindo o vetor para desenhar o caminho
                path = [];
                var temp = current;
                path.push(temp);
                while(temp.previous){
                    path.push(temp.previous);
                    temp = temp.previous;
                }
                execute = false;//Dizendo que algoritmo pode parar de ser executado
                return;
            }
        }

        /*DEFININDO A HEURÍSTICA*/

        //Para cada vizinho do nó aberto
        for(i = 0; i < neighborsLen; i++){
            var neighbour = neighbors[i];//shortcut
            var newPath = false;//Existe um novo caminho?

            //Caso o vizinho em questão não esteja fechado e não seja uma barreira então deve ser levado em consideração
            if(!closeSet.includes(neighbour) && !neighbour.wall){
                //Cálculo de um g(n) temporário para o vizinho em questão
                var tempg = (current.g +  (yWeight * neighbour.difficulty) + (zWeight * neighbour.risk) + cellDistance(current, neighbour, choosenDistanceMethod));

                /*
                Obs.: o vizinho pode ser um nó já aberto, portanto tem um valor de g ou um nó não aberto e tem que
                receber um valor de g
                 */

                //Se o vizinho estiver na lista de nós abertos
                if(openSet.includes(neighbour)){
                    //O g dele deve ser trocado apenas se o que foi calculado (tempg) for menor
                    if(tempg < neighbour.g){
                        neighbour.g = tempg;//o vizinho recebe um novo g
                        newPath = true;//é marcado que o caminho mudou
                    }
                }else{//Se o nó não foi aberto ainda
                    neighbour.g = tempg;//definindo o g do nó
                    openSet.push(neighbour);//colocando o nó na lista de abertos
                    /*
                    dizendo para o nó que ele está na lista (evita ter que procurar novamente e deixa)
                    a forma como o nó é mostrado variar independentemente dos vetores
                     */
                    neighbour.inOpenSet = true;
                    //Marcando que o caminho mudou
                    newPath = true;
                }
                //Se existe um novo caminho feito
                if(newPath){
                    //Cálculo da heurística
                    neighbour.h = parseFloat((xWeight * cellDistance(neighbour, end, choosenDistanceMethod)).toFixed(4));//cálculo do h
                    neighbour.f = parseFloat((((wWeight * neighbour.g) + neighbour.h)).toFixed(4));//cálculo do f
                    //g já foi caculado!
                    neighbour.previous = current;//dizendo para o nó quem é seu antecessor (assim é possível recuperar o caminho)
                }

                //Adicionando objetos temporários à árvore que poderá ser gerada
                treeNet.addNodeWithId(formatNetElemId(neighbour), formatNetElemText(neighbour), formatArrowText(neighbour), getIdFrom(current), neighbour);
            }


        }

        //Definindo variáveis para desenhar o caminho atual
        path = [];
        var temp = current;
        path.push(temp);
        while(temp.previous){
            path.push(temp.previous);
            temp = temp.previous;
        }

    }
    else{//Não existem nós abertos, portanto não é possível continuar
        //NÃO EXISTE SOLUÇÃO
        console.log('No solution');//Esvrevendo no terminal
        runStatus.html('<strong>Status: </strong> sem solução.');//Definindo o texto de status
        execute = false;//Dizendo que não é preciso chamar a função novamente
        return;
    }
}


