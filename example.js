/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * DS208: Avoid top-level this
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

const root = typeof exports !== 'undefined' && exports !== null ? exports : this;


const Network = function() {
  // variables we want to access
  // in multiple places of Network
  const width = 960;
  const height = 800;
  // allData will store the unfiltered data
  let allData = [];
  let curLinksData = [];
  let curNodesData = [];
  const linkedByIndex = {};
  // these will hold the svg groups for
  // accessing the nodes and links display
  let nodesG = null;
  let linksG = null;
  // these will point to the circles and lines
  // of the nodes and links
  let node = null;
  let link = null;

  // Initializes visualization and starts force layout
  const network = function(selection) {
    // format our data
    allData = setupData(data);

    // create our svg and groups
    const vis = d3.select(selection).append("svg")
      .attr("width", width)
      .attr("height", height);
    linksG = vis.append("g").attr("id", "links");
    nodesG = vis.append("g").attr("id", "nodes");

    // setup the size of the force environment
    force.size([width, height]);

    setLayout("force");

    // perform rendering and start force layout
    return update();
  };

  // The update() function performs the bulk of the
  // work to setup our visualization based on the
  // current layout/sort/filter.
  //
  // update() is called everytime a parameter changes
  // and the network needs to be reset.
  var update = function() {
    // filter data to show based on current filter settings.
    curNodesData = filterNodes(allData.nodes);
    curLinksData = filterLinks(allData.links, curNodesData);


    // reset nodes in force layout
    force.nodes(curNodesData);

    // enter / exit for nodes
    updateNodes();

    force.links(curLinksData);
    updateLinks();

    // start me up!
    return force.start();
  };



  network.updateData = function(newData) {
    allData = setupData(newData);
    link.remove();
    node.remove();
    return update();
  };


  // Removes links from allLinks whose
  // source or target is not present in curNodes
  // Returns array of links
  var filterLinks = function(allLinks, curNodes) {
    curNodes = mapNodes(curNodes);
    return allLinks.filter(l => curNodes.get(l.source.id) && curNodes.get(l.target.id));
  };

  // enter/exit display for nodes
  var updateNodes = function() {
    node = nodesG.selectAll("circle.node")
      .data(curNodesData, d => d.id);

    node.enter().append("circle")
      .attr("class", "node")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", d => d.radius)
      .style("fill", d => nodeColors(d.artist))
      .style("stroke", d => strokeFor(d))
      .style("stroke-width", 1.0);

    node.on("mouseover", showDetails)
      .on("mouseout", hideDetails);

    return node.exit().remove();
  };

  // enter/exit display for links
  var updateLinks = function() {
    link = linksG.selectAll("line.link")
      .data(curLinksData, d => `${d.source.id}_${d.target.id}`);
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

  // switches force to new layout parameters
  var setLayout = function(newLayout) {
    layout = newLayout;
    if (layout === "force") {
      return force.on("tick", forceTick)
        .charge(-200)
        .linkDistance(50);
    } else if (layout === "radial") {
      return force.on("tick", radialTick)
        .charge(charge);
    }
  };


  // tick function for force directed layout
  var forceTick = function(e) {
    node
      .attr("cx", d => d.x)
      .attr("cy", d => d.y);

    return link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);
  };


  // Helper function that returns stroke color for
  // particular node.
  var strokeFor = d => d3.rgb(nodeColors(d.artist)).darker().toString();


  // Final act of Network() function is to return the inner 'network()' function.
  return network;
};


$(function() {
  const myNetwork = Network();


});
