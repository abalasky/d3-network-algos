
window.addEventListener('load', makeNetwork);

//Global Default Graph
var graph = {
    nodes: [
        {id:'Node0'}, {id:'Node1'}, {id:'Node2'}, {id: 'Node3'},
        {id:'Node4'}
    ],
    links: [
        {source:'Node0',target:'Node1'},
        {source:'Node0',target:'Node2'},
        {source:'Node1',target:'Node2'},
        {source:'Node1',target:'Node3'},
        {source:'Node2',target:'Node3'},
        {source:'Node3',target:'Node4'}
    ]
};

//Global Default adjList
var adjList = {
    'Node0': {'Node1': 4, 'Node2': 1},
    'Node1': {'Node0': 4, 'Node2': 2, 'Node3': 1},
    'Node2': {'Node0': 1, 'Node1': 2, 'Node3': 5},
    'Node3': {'Node1': 1, 'Node2': 5, 'Node4': 3},
    'Node4': {'Node3': 3}
};


function makeNetwork(numVertices = 5) {

    //Declare handlers
    var svg = d3.select('#network');

    var width = d3.select('#network').attr('width');
    var height = d3.select('#network').attr('height');


    //Create SVG groups for links and nodes
    linksG = svg.append('g').attr('class', 'links');
    nodesG = svg.append('g').attr('class', 'nodes');

    //Object to store x,y position as array for each node by name
    var pos = {}


    //Assign random x, y attributes to each object in nodes arrays
    for (let node of graph.nodes) {
        //Assigns rand x coordinate between 0 and 900 (width of svg)
        let x = Math.floor(Math.random() * (900+1));
        node.x = x;

        //Assigns rand y coordinate between 0 and 600 (height of svg)
        let y = Math.floor(Math.random() * (600+1));
        node.y = y;


        pos[node.id] = [x,y];

    }


    var svg = d3.select('svg');

    svg.append('g').attr('class', 'links');

    svg.append('g').attr('class', 'nodes');




    d3.select('.nodes').selectAll('circle').data(graph.nodes).enter().append('circle')
        .attr('id', (d) => {return d['name']})
        .attr('r',10).attr('fill', "red")
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y);



    d3.select('.links').selectAll('line').data(graph.links).enter().append('line')
        .attr('stroke-width',2)
        .attr('stroke', 'black')
        .attr("x1", (d) => (pos[d.source][0]))
        .attr("y1", (d) => pos[d.source][1])
        .attr("x2", (d) => pos[d.target][0])
        .attr("y2", (d) => pos[d.target][1]);

    coordsPixels('svg');









    //Register Listeners
    d3.select('#start-btn').on('click',run);
    d3.select('#reset-btn').on('click',makeGraph)





}


//Continuosly displays in text the coords of your mouse w crosshair
function coordsPixels(selector) {
    var txt = d3.select(selector).append('text');
    var svg = d3.select(selector).attr('cursor', 'crosshair')
        .on('mousemove', function() {

            //uses d3.mouse(parent dom element/node) to get coordinates
            //of mouse

            //d3.mouse() returns [x,y] array
            var pt = d3.mouse(svg.node());
            txt.attr('x', 18+pt[0]).attr('y', 6+pt[1])
                .text("" + pt[0] + ',' + pt[1]);
        });
}





function drawNodes() {
    nodesG.selectAll("circle")
        .data(graph.nodes).enter().append("circle")
        .attr("id", (d) => d['id'])
        .attr("r", 10)
        .attr("fill", 'black');
}


function drawLinks() {
    linksG.selectAll('line').data(graph.links).enter()
        .append('line')
        .attr('stroke-width',2)
        .attr('stroke','black');
}

function ticked() {

    nodesG.selectAll('circle')
        .attr('cx', d=>d.x)
        .attr('cy', d=>d.y)

    linksG.selectAll('line')
        .attr("x1", (d) => d.source.x)
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; })
        .attr('id', (d) => d.source.id + '-' + d.target.id);

}


function makeGraph() {

    var numNodes = document.querySelector('#numNodes').value
    console.log(numNodes);




    d3.selectAll('g').remove();

    //Create new graph and overwrite global
    graph = generateGraph(numNodes);


    makeNetwork();
}


//********DJIKSTRA FUNCTIONS******
//********************************

// Implements Erdos-Renyi Model for Random Graph Construction with numNodes nodes
// and probability = success

// Given a set of k nodes {n_1, ..., n_k}  each edge (n_i, n_j) for all i & j <= k
// where i != j is included with a uniform random probability

// More info: https://en.wikipedia.org/wiki/Erd%C5%91s%E2%80%93R%C3%A9nyi_model
// Implementation: https://www.youtube.com/watch?v=0SdzPJksV3Q

// @params: nodes is a list containing name of each node

// @returns list of edges with weights defaulted to 1

// @todo: modify to fit power law instead of uniform distribution
function generateGraph(numNodes) {

    //Creates list of strings specifying Node0 -> NodenumNodes
    let graphNodes = [];
    for(let i = 0; i < numNodes; i++) {
        graphNodes.push('Node' + i);
    }


    //Start E-R
    let edges = [];
    let success = .2;

    for (let i = 0; i < numNodes; i++) {
        for (let j = i+1; j < numNodes; j++) {
            if (i !== j) {
                r = Math.random();

                if (r >= success) {
                    let edge = [graphNodes[i], graphNodes[j], 1];
                    edges.push(edge);
                }
            }
        }
    }


    //Modify global graph
    let newGraph = {
        nodes: [],
        links: []
    }

    //Add nodes to newGraph object
    for (let i = 0; i < numNodes; i++) {
        //Create node object and push
        let newNode = {id:graphNodes[i]};
        newGraph['nodes'].push(newNode);
    }

    //Add links to newGraph object
    for(let i = 0; i < edges.length; i++) {
        //Create link object and push
        let newLink = {source: edges[i][0], target: edges[i][1]};
        newGraph['links'].push(newLink);
    }


    //Update global adjList

    // adjList = makeAdjList(edges);



    return newGraph;

}

function run() {
//Runs Djikstras Algorithm generarting list of visited nodes in order
//as well as list of traversed links in order


    let start = 'Node0';

    let visited = new Set();
    let dist = new Map();
    let pred = new Map();

    //Initialize all distances to infinity
    for (let key of Object.keys(adjList)) {
        dist.set(key, Number.MAX_VALUE);
    }

    //Initialize all preds to null
    for (let key of Object.keys(adjList)) {
        pred.set(key, null);
    }

    dist.set(start, 0);





    // let nodeIds = ['Node0', 'Node1', 'Node2', 'Node3', 'Node4'];

    // let linkIds = ['Node0-Node2', 'Node1-Node2', 'Node1-Node3',
    //     'Node2-Node3', 'Node3-Node4'];

    // d3.interval( function() {
    //     console.log('Changing node');

    //     d3.select('#' + nodeIds[0]).transition().duration(1000).attr('fill', 'red');
    //     d3.select('#' + linkIds[0]).transition().duration(1000).attr('stroke', 'red');

    //     //Pop front
    //     nodeIds.shift();
    //     linkIds.shift();

    // }, 1000);




}



function makeAdjList(edges) {
///Turns edges into adjList, updates global adjList, called from
//generateGraph

}











