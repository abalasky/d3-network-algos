'using strict';

let graph = {
    nodes: [
        {name:'Node0'}, {name:'Node1'}, {name:'Node2'}, {name: 'Node3'},
        {name:'Node4'}
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


var width = 900;
var height = 600;

var linkG = null;
var nodeG = null;

var node = null;
var link = null;


// create our svg and groups
var svg = d3.select('svg')
  .attr("width", width)
  .attr("height", height);
linksG = svg.append("g").attr("class", "links");
nodesG = svg.append("g").attr("class", "nodes");



//Create Force Simulation
var simulation = d3.forceSimulation()
    .force('charge', d3.forceManyBody())
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collide', d3.forceCollide(2*20))
        .force('charge', d3.forceManyBody()
            .strength(-500))
        .force('link', d3.forceLink()
            .id(function (d) {return d.name;}))

function update() {
    //Add Nodes
    simulation.nodes(graph.nodes)

    updateNodes();

    simulation.on("tick", ticked);


    //Add links
    simulation.force('link').links(graph.links)

    updateLinks();
}

// Function that draws all nodes
var updateNodes = function() {
    node = nodesG.selectAll("circle.node")
      .data(graph.nodes);

    //draw circles for the links
    node.enter().append("circle")
      .attr("class", "node")
      .attr("r",10)
      .attr("fill", circleColor);

    return node.exit().remove()
}


//draw lines for the links
var updateLinks = function(){
    link = linksG.selectAll("line.node")
        .data(graph.links)

    link.enter().append("line")
      .attr("class", "link")
      .attr("stroke-width",2)
      .style("stroke", linkColor);

    return link.exit().remove()
}


//Function to choose what color circle we have
//Let's return blue for males and red for females
function circleColor(d){
    return 'black';
}

//Function to choose the line colour and thickness
//If the link type is "A" return green
//If the link type is "E" return red
function linkColor(d){
    return 'black';
}


var ticked = function() {
    //update circle positions each tick of the simulation
    node
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });

    //update link positions
    //simply tells one end of the line to follow one node around
    //and the other end of the line to follow the other node around
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
};

update();


