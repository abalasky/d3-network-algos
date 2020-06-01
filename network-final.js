'using strict';

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

//Global Default Start Node
//@todo Allow user to change this by selecting node
    //set start to id of selected
var start = 'Node0'


function makeNetwork(numVertices = 5) {
    //Main function called on page load to render network on svg

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
        // let x = Math.floor(Math.random() * (900+1));

        //Random number between 100 and 800
        let x = Math.floor(Math.random() * (800-100 + 1) + 100);
        node.x = x;

        //Assigns rand y coordinate between 0 and 600 (height of svg)
        // let y = Math.floor(Math.random() * (600+1));

        //Random number between 100 and 500
        let y = Math.floor(Math.random() * (500-100 + 1) + 100)
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
        .attr('cy', (d) => d.y)
        .attr("id", (d) => d['id'])


    d3.select('.links').selectAll('line').data(graph.links).enter().append('line')
        .attr('stroke-width',2)
        .attr('stroke', 'black')
        .attr("x1", (d) => (pos[d.source][0]))
        .attr("y1", (d) => pos[d.source][1])
        .attr("x2", (d) => pos[d.target][0])
        .attr("y2", (d) => pos[d.target][1])
        .attr('id', (d) => d.source + '-' + d.target);



    //Register Listeners
    d3.select('#start-btn').on('click',run);
    d3.select('#reset-btn').on('click',makeGraph)


    var drag_handler = d3.drag()
        .on('drag', function (d) {
            d3.select(this)
            .attr('cx', d.x = d3.event.x)
            .attr('cy', d.y = d3.event.y);
        });


    //apply drag_handler to our circles
    drag_handler(d3.select('.nodes').selectAll('circle'));
    coordsPixels('svg');


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
    //Called on button to reset graph with specified # of nodes

    var numNodes = document.querySelector('#numNodes').value
    console.log(numNodes);


    d3.selectAll('g').remove();

    // //Create new graph and overwrite global

    //Call generate graph
    generateGraph(numNodes);


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

    //Hard coded adjList
    let adjList = {
        'Node0':{'Node1': 4,'Node2': 1},
        'Node1':{'Node0': 4, 'Node2': 2, 'Node3': 1},
        'Node2':{'Node0':1, 'Node1': 2, 'Node3': 5},
        'Node3':{'Node1': 1, 'Node2': 5, 'Node4': 3},
        'Node4':{'Node3': 3}
    }

    //Creates min priority queue with tuples of the form [d(v), v]
    let compareTuples = function(a,b) {return a[0] - b[0]};
    let pq = new PriorityQueue({comparator: compareTuples});

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

    //Set start Node to distance zero
    dist.set(start, 0);
    pred.set(start,start);

    //Lists for events

    //Nodes in order visited
    let nodeId = [];

    //Links in order traversed linkIds[0] is the link used to
    //traverse from start to nodeId[0]
    let linkId = [];

    //List of lists, at each node enumerates connection tried
    let checking = [];


    pq.queue([0,start]);
    while (pq.length !== 0) {

        //Get the name of shortest distance node
        let currNode = pq.dequeue()[1];

        console.log(`On ${currNode}`);


        //Skip this iteration of the loop
        if (visited.has(currNode)) {
            continue;
        }

        //Add the currNode and where it come from
        //to the event lists
        nodeId.push(currNode);
        let fromNode = pred.get(currNode);
        let link = `${fromNode}-${currNode}`;
        linkId.push(link);


        console.log(`Traveled to ${currNode} from ${fromNode}`);

        //List of neighbor checks performed from currNode
        let checks = [];

        //Check each neighbor of currNode that has not been visited
        for (let neighbor of Object.keys(adjList[currNode])) {



            if (!visited.has(neighbor)) {
                //Check if there is a better path

                console.log(`Checking ${neighbor}`);
                checks.push(neighbor);

                //if(d[v] > d[curr] + c(curr,v))
                let newDist = dist.get(currNode) + adjList[currNode][neighbor];

                if (newDist < dist.get(neighbor)) {
                    //A shorter distance was found
                    //Update distance, set new pred, push to PQ

                    dist.set(neighbor, newDist);
                    pred.set(neighbor, currNode);
                    pq.queue([dist.get(neighbor), neighbor]);
                }
            }
        }

        //Push all check events to checking array
        checking.push(checks);

        //Mark as visited;
        visited.add(currNode);

    }

    //Debug
    console.log(nodeId);
    console.log(linkId);




    //***** Begin Animation ******
    //****************************

    console.log('Starting node is:', start);
    d3.select('#' + nodeId[0]).transition().duration(50).attr('fill', 'yellow');

    nodeId.shift();
    linkId.shift();

    console.log('After first shift:')
    console.log(nodeId);
    console.log(linkId);


    let iters = nodeId.length;

    let interval = d3.interval( function() {

        if (iters === 0) {
            interval.stop();
            return;
        }

        console.log('Traversing to', nodeId[0], 'using edge', linkId[0]);

        d3.select('#' + linkId[0]).transition().duration(5000).attr('stroke', 'green');
        d3.select('#' + nodeId[0]).transition().duration(5000).attr('fill', 'blue');

        //Pop front
        nodeId.shift();
        linkId.shift();

        iters -= 1;


    }, 1000);






}

function flipLinks(links) {


    for (let link of links) {
        nodeA[nodeA.length-1] > nodeB[nodeB.length-1]
    }
}




function makeAdjList(edges) {
///Turns edges into adjList, updates global adjList, called from
//generateGraph

}











