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


// Append svg with width and height to the viz div
var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

//Create Force Simulation
var simulation = d3.forceSimulation()
    .force('charge', d3.forceManyBody())
    .force('center', d3.forceCenter(900 / 2, 600 / 2))
    .force('collide', d3.forceCollide(2*20))
        .force('charge', d3.forceManyBody()
            .strength(-100))
        .force('link', d3.forceLink()
            .id(function (d) {return d.name;}))
    .on('tick', ticked);


simulation.nodes(graph.nodes)
simulation.force('link').links(graph.links)



// Function that draws all nodes

var node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(graph.nodes)
        .enter()
        .append("circle")
        .attr("r", 10)
        .attr("fill", circleColor);





//draw lines for the links

var link = svg.append("g")
      .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line")
      .attr("stroke-width", 2)
      .style("stroke", linkColour);



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


function ticked() {
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
}
