



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


let width = 900;
let height = 600;

var svg = d3.select("svg")

var simulation = d3.forceSimulation()
    .nodes(graph.nodes)


var link_force =  d3.forceLink(graph.links)
                        .id(function(d) { return d.name; });

simulation
    .force("charge_force", d3.forceManyBody())
    .force("center_force", d3.forceCenter(width / 2, height / 2))
    .force("links",link_force);


//add tick instructions:
simulation.on("tick", ticked);

//draw circles for the links
var node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(graph.nodes)
        .enter()
        .append("circle")
        .attr("r", 10)
        .attr("fill", circleColour);

//draw lines for the links
var link = svg.append("g")
      .attr("class", "links")
    .selectAll("line")
    .data(links_data)
    .enter().append("line")
      .attr("stroke-width", 2)
      .style("stroke", linkColour)



/** Functions **/

//Function to choose what color circle we have
//Let's return blue for males and red for females
function circleColour(d){
    if(d.sex =="M"){
        return "blue";
    } else {
        return "pink";
    }
}

//Function to choose the line colour and thickness
//If the link type is "A" return green
//If the link type is "E" return red
function linkColour(d){
    if(d.type == "A"){
        return "green";
    } else {
        return "red";
    }
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





