
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

//Reusable Chart Format
const Network = function() {

  // variables we want to access
  // in multiple places of Network
  const width = 960;
  const height = 800;


  let curLinks = [];
  let curNodes = [];

  // these will hold the svg groups for
  // accessing the nodes and links display
  let nodesG = null;
  let linksG = null;
  // these will point to the circles and lines
  // of the nodes and links
  let node = null;
  let link = null;


  //Create Force Simulation
  const simulation = d3.forceSimulation()
        .force('x', d3.forceX(width/2))
        .force('y', d3.forceY(height/2))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collide', d3.forceCollide(2*20))
        .force('charge', d3.forceManyBody()
        .strength(-400))
        .force('link', d3.forceLink()
            .id(function (d) {return d.name;}))



  // Starting point for network visualization
  // Initializes visualization and starts force layout
  let network = function(selection) {

    // create our svg and groups
    const vis = d3.select(selection).append("svg")
      .attr("width", width)
      .attr("height", height);
    linksG = vis.append("g").attr("id", "links");
    nodesG = vis.append("g").attr("id", "nodes");

    // setup the size of the force environment
    simulation.size([width, height]);

    // perform rendering and start force layout
    setLayout();

    return update();
  };


  var update = function() {
    // filter data to show based on current filter settings.

    //Allow dynamic changes
    // curNodesData = filterNodes(allData.nodes);
    // curLinksData = filterLinks(allData.links, curNodesData);


    currNodes = myGraph.nodes;

    currLinks = myGraph.links;

    // reset nodes in force layout
    simulation.nodes(curNodes);

    // enter / exit for nodes
    updateNodes();

    simulation.force('link').links(currLinks);

    updateLinks();

  };


  // enter/exit display for nodes
  var updateNodes = function() {
    node = nodesG.selectAll("circle.node")
      .data(curNodes, d => d.id);

    node.enter().append("circle")
      .attr("class", "node")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", d => d.radius)
      .style("stroke", d => strokeFor(d))
      .style("stroke-width", 1.0);

    // node.on("mouseover", showDetails)
    //   .on("mouseout", hideDetails);

    return node.exit().remove();
  };

  // enter/exit display for links
  var updateLinks = function() {
    link = linksG.selectAll("line.link")
      .data(curLinks, d => `${d.source.id}_${d.target.id}`);
    link.enter().append("line")
      .attr("class", "link")
      .attr("stroke", "#ddd")
      .attr("stroke-opacity", 0.8)
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    return link.exit().remove();
  };


  var tickActions = function () {
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

        console.log('Tickactions');
  };


  var setLayout = function() {

     return force.on("tick", tickActions)
        .charge(-200)
        .linkDistance(50);
  }

  // Final act of Network() function is to return the inner 'network()' function.
  return network;
};

$(document).ready( function() {
  const myNetwork = Network();

  d3.selectAll("#start-btn").on("click", function(d) {
      console.log('Button works');
  });


});
