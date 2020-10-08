
# Pathfinding

## Trabalho da disciplina SI702 A – Introdução à Inteligência Artificial (Unicamp - FT) realizado pelos alunos Pedro Artico e Andre Estevam

## Estrutura do diretório do projeto

	│   index.html //documento de execução do projeto (no browser)
	│
	├───css //folhas de estilo
	│       stylesheet.css //folha de estilo que pode ser editada
	│       w3sModal.css //estilos padrões do modal fornecido pela w3schools
	│
	├───imgs //imagens
	│       closednodes.PNG
	│       dangerzone.PNG
	│       endpoint-startpoint.PNG
	│       land.PNG
	│       openednodes.PNG
	│       path.PNG
	│       water.PNG
	│
	└───js //arquivos JavaScript
	    │   Cell.js //Arquivo com o objeto que descreve uma célula
	    │   pathfind.js //Arquivo com funções para executar o pathfind
	    │   setupCode.js //Arquivo com funções de setup e criação de view
	    │   sketch.js //funções diversas
	    │
	    ├───myUtils //arquivos de utilidade
	    │       deepCopy.js //funções para cópia de objetos
	    │       rgbaToHex.js //funções para converter cores de RGBA para HEXadecimal
	    │       tests_and_trash.js //funções de teste ou não mais utilizadas
	    │       util.js //pequenas funções de utilidade
	    │
	    ├───p5 //Arquivos do framework p5.js
	    │   │   p5.d.ts
	    │   │   p5.js
	    │   │   p5.min.js
	    │   │   p5.pre-min.js
	    │   │
	    │   ├───addons
	    │   │       p5.dom.js
	    │   │       p5.dom.min.js
	    │   │       p5.sound.js
	    │   │       p5.sound.min.js
	    │   │
	    │   └───empty-example
	    └───vis//Arquivos do framework vis.js
	            vis.min.css
	            vis.min.js
	            visNetHelper.js



# Heurística

Neste programa um agente deve encontrar um caminho entre dois pontos de um mapa gerado. Para isso foi utilizado como base o algoritmo A*.

Resumidamente, trata-se de um problema de pathfinfing em que os nós contém diferentes pesos (ou dificuldades).

A forma como o algoritmo é executado depende da heurística, que pode ser manipulada por meio de pesos, mudando o comportamento e até o tipo do algoritmo.

As seguintes fórmulas descrevem o comportamento do algoritmo:

 

## Parte 1: `f(n) = 1 + w * g(n) + x * h(n)`



- `1`: a distância padrão para se andar de um nó ao outro.
- `n`: o nó para o qual a função heurística será calculada.
- `f(n)`: função heurística para o nó n
- `g(n)`: função que acumula três aspectos de dificuldade (mostrados a seguir) do caminho desde o início até o nó n.
- `f(n)`: parte da heurística que considera a distância do nó n até o nó objetivo.
- `w, x`: pesos que controlam a importância de cada parte da fórmula.



## Parte 2: `g(n) = y * dif(n) + z * rsk(n)`

 

- `dif(n)`: o valor associado com a dificuldade de se passar pelo nó em questão. Se o nó for uma área de floresta densa, por exemplo, esse valor deve ser maior.
- `rsk(n)`: o risco associado a percorrer aquela área (o que é diferente da dificuldade, pois no mapa apenas algumas poucas áreas terão risco maior que zero). Pode representar que existem animais ou pessoas hostis nesses lugares, portanto devem ser evitados.
- `y, z`: pesos que controlam a importância de cada parte da fórmula.



## Cálculo final 



`f(n) = 1 + w * (y * dif(n) + z * rsk(n)) + x *(h(n))`



## Principais estruturas de dados utilizadas

**Breve explicação:** o programa possui um mapa quadrado dividido em quadrados menores, cada um deles pode representar água ou terreno. Para a execução do algoritmo são utilizadas duas listas, uma para os nós abertos e outra para os nós fechados.



| Parte do programa             | Estrutura de dados                                           | Comentários                                                  |
| ----------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Lista de nós abertos          | Objeto Javascript do tipo `Array`                            | `Array` é um tipo nativo do Javascript                       |
| Lista de nós fechados         | Objeto Javascript do tipo `Array`                            | `Array` é um tipo nativo do Javascript                       |
| Mapa                          | Objeto Javascript do tipo `Array` que contém objetos do tipo `Array` que contém instâncias de `Cell` | Para fazer uma matriz em javascript foi preciso fazer um vetor de vetores que guardam instâncias de objetos do tipo `Cell`. Vale ressaltar que nós obstáculo são armazenados da mesma forma que nós que podem ser percorridos, mas não são levados em consideração no cálculo da heurística. |
| Nó                            | Objeto de tipo `Cell`                                        |                                                              |
| Caminhos                      | Lista ligada de objetos do tipo `Cell`                       | Para poder montar o caminho percorrido, cada nó possui uma referência para o nó anterior, caracterizando uma lista ligada simples |
| Nós vizinhos a um nó qualquer | Objeto Javascript do tipo `Array`                            | Cada nó (objeto do tipo `Cell`) contém uma lista com seus vizinhos, essa lista faz a vez das arestas caso o problema fosse representado como um grafo. Por exemplo, ao permitir movimentos na diagonal, um nó adicionará em sua lista de vizinhos não só os nós acima, abaixo, direita e esquerda mas também os nós na diagonal: cima e direita, cima e esquerda, baixo e direita, baixo e esquerda, por exempl |



# Obs.

* Para iniciar o projeto basta abrir o arquivo  `index.html` em um navegador atualizado.
* Não é preciso utilizar servidores como o XAMPP ou WAMP



## Bibliotecas

Para a criação da interface foi utilizado o framework **p5.js**

Para a criação da árvore que demonstra o processo feito foi utilizado o framework **vis.js**



