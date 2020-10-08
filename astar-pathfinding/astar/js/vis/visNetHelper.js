/**
 * Created by andre on 24/05/2018.
 */

// create an array with nodes


function MyTreeNetwork() {
    this.network = undefined;
    this.nodes = new vis.DataSet([]);
    this.edges = new vis.DataSet([]);

    this.lazyNodes = [];
    this.lazyEdges = [];
    
    this.data = {
        nodes: this.nodes,
        edges: this.edges
    };

    this.options = {
        height:(window.innerHeight + 1000) + "px",
        edges: {
            smooth: {
                type: 'cubicBezier',
                forceDirection: 'vertical',
                roundness: 0.4
            },
            arrows: {
                to: {
                    scaleFactor: 1
                }
            }
        },
        layout: {
            hierarchical: {
                direction: 'UD',
                nodeSpacing: 200,
                levelSeparation: 200
            }
        },
        physics:false
    };


    this.nodesLevelHashMap = new Array();


    this.addNodeWithId = function(nodeid, nodeLabel, arrowLabel, parentId, realNode) {
        //var level =  this.lazyNodes.get(parentId)['level'] + 1;
        var level = undefined;
        level = this.nodesLevelHashMap[parentId + '*'] + 1;

        if(level == undefined){
            for(var i = this.lazyNodes.length -1; i >= 0; i--){
                if(this.lazyNodes[i].id == parentId){
                    level = this.lazyNodes[i].level + 1;
                }
            }
        }

        var lnode = {id: nodeid, label: nodeLabel, level: level, node: realNode};
        var ledge = {from: parentId, to: nodeid, arrows:'to', label: arrowLabel};

        this.lazyNodes.push(lnode);
        this.lazyEdges.push(ledge);

        this.nodesLevelHashMap[nodeid + '*'] = level;
    };


    this.addFirstNodeWithId = function(nodeId, nodeLabel, realNode) {
        var lnode = {id: nodeId, label: nodeLabel, level: 0, node: realNode};
        this.lazyNodes.push( lnode );
        this.nodesLevelHashMap[nodeId + '*'] = 0;
    };

    this.createNetwork = function (containterID) {
        print('Creating network...');

        this.data = {
            nodes: this.nodes,
            edges: this.edges
        };

        var container = document.getElementById(containterID);
        this.network = new vis.Network(container, this.data, this.options);

        print('Network created.');
    };

    this.commitNetwork = function (aPath, aStart, aEnd) {
        this.nodes = new vis.DataSet([]);
        this.edges = new vis.DataSet([]);

        print('Committing network...');
        var i;
        var lazyNodesLen = this.lazyNodes.length;

        print('Committing nodes');
        for(i = 0; i < lazyNodesLen; i++){

            var tempinfo = this.lazyNodes[i];

            if(tempinfo.node == aStart)
            {
                tempinfo.color = '#ff0000';
            }
            else if(tempinfo['node'] == aEnd)
            {
                tempinfo.color = '#00ff00';
            }
            else if(aPath.includes(tempinfo['node']))
            {
                var hasChild = false;
                for(var j = 0; j < this.lazyEdges.length; j++){
                    if(tempinfo.id == this.lazyEdges[j].from){
                        hasChild = true;
                        break;
                    }
                }
                if(hasChild){
                    tempinfo.color = '#0000ff';
                }
            }
            this.nodes.add(tempinfo);
        }

        print('Committing edges');
        var lazyEdgesLen = this.lazyEdges.length;
        for(i = 0; i < lazyEdgesLen; i++){
            this.edges.add(this.lazyEdges[i]);
        }
        print('Network commited.');
    };
    
    

    this.deleteNetwork = function () {
        console.log('Deleting network!');
        if(this.network != undefined) {
            this.network.destroy();
        }

        this.network = undefined;
        this.nodes = new vis.DataSet([]);
        this.edges = new vis.DataSet([]);
        this.lazyEdges = new Array();
        this.lazyNodes = new Array();
    };

}