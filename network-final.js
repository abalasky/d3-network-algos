
window.addEventListener('load', makeNetwork);


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


function makeNetwork(numVertices = 5) {

    //Declare handlers
    var svg = d3.select('#network');

    var width = d3.select('#network').attr('width');
    var height = d3.select('#network').attr('height');


    //Create SVG groups for links and nodes
    linksG = svg.append('g').attr('class', 'links');
    nodesG = svg.append('g').attr('class', 'nodes');


    //Configure Simulation
    var simulation = d3.forceSimulation()
        .force('center', d3.forceCenter(width/2,height/2))
        .force('link', d3.forceLink()
            .id(function (d) {return d.id;}))
        .force('collide', d3.forceCollide(2*20))
        .force('charge', d3.forceManyBody())
        .force('link', d3.forceLink().id(function(d) {return d.id;}));



    //Draw the network
    simulation.nodes(graph.nodes);
    drawNodes();
    simulation.on('tick', ticked);

    simulation.force('link').links(graph.links);
    drawLinks();

    //Register Listeners
    d3.select('#start-btn').on('click',run);
    d3.select('#reset-btn').on('click',makeGraph)





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
        .attr("y2", function(d) { return d.target.y; });

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

    return newGraph;

}

function run() {

    let test = ['Node0', 'Node1', 'Node2', 'Node3', 'Node4'];

    d3.interval( function() {
        console.log('Changing node');

        d3.select('#' + test[0]).transition().duration(1000).attr('fill', 'red');


        //Pop front
        test.shift();


    }, 500);




}



