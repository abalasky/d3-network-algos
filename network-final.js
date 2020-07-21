"using strict";

window.addEventListener("load", init);

//Global Default Graph
let graph = {
     nodes: [
          { id: "Node0" },
          { id: "Node1" },
          { id: "Node2" },
          { id: "Node3" },
          { id: "Node4" },
     ],
     links: [
          { source: "Node0", target: "Node1" },
          { source: "Node0", target: "Node2" },
          { source: "Node1", target: "Node2" },
          { source: "Node1", target: "Node3" },
          { source: "Node2", target: "Node3" },
          { source: "Node3", target: "Node4" },
     ],
     pos: {
          Node0: [294, 233],
          Node1: [313, 500],
          Node2: [521, 136],
          Node3: [557, 493],
          Node4: [117, 143],
     },
};

//Global Default adjList
let adjList = {
     Node0: { Node1: 4, Node2: 1 },
     Node1: { Node0: 4, Node2: 2, Node3: 1 },
     Node2: { Node0: 1, Node1: 2, Node3: 5 },
     Node3: { Node1: 1, Node2: 5, Node4: 3 },
     Node4: { Node3: 3 },
};

//Global Path values
let etxPathVals = {}


//Global Default Start Node
//@todo Allow user to change this by selecting node
//set start to id of selected
let start = "Node0";

//Global radius for nodes
let radius = 10;

//Global reset to interrupt DJ
let resetClicked = false;

//**********Viz Functions*********
//********************************

//Init function called on window load
function init() {
     //Register Event Listeners for buttons
     d3.select("#start-btn").on("click", run);
     d3.select("#reset-btn").on("click", makeGraph);
     d3.select("#clear-btn").on("click", reset);

     //Event listener for each node
     d3.select(".nodes").selectAll("circle").on("click", selectStart);

     //Event listeners for slidersd
     let sliderA = document.getElementById("sliderA");
     let sliderB = document.getElementById("sliderB");

     sliderA.oninput = function () {
          document.querySelector("#alab").innerHTML = this.value;
     };

     sliderB.oninput = function () {
          document.querySelector("#blab").innerHTML = this.value;
     };

     //Draw the SVG graph
     makeNetwork();

}

//Renders graph SVG
function makeNetwork(numVertices = 5) {
     //Declare handlers
     var svg = d3.select("#network");

     var width = d3.select("#network").attr("width");
     var height = d3.select("#network").attr("height");

     //Create SVG groups for links and nodes
     linksG = svg.append("g").attr("class", "links");
     nodesG = svg.append("g").attr("class", "nodes"); //Nodes over links

     //Assign pos to actual node objects for drawing
     let counter = 0;
     for (let node of graph.nodes) {
          node.x = graph.pos[node.id][0];

          node.y = graph.pos[node.id][1];

          counter += 1;
     }

     //Draw and associate nodes
     let node = d3
          .select(".nodes")
          .selectAll("circle")
          .data(graph.nodes)
          .enter()
          .append("g")
          .attr("class", "node");
     node.append("circle")
          .attr("id", (d) => {
               return d["name"];
          })
          .attr("r", radius)
          .attr("fill", "red")
          .attr("cx", (d) => d.x)
          .attr("cy", (d) => d.y)
          .attr("id", (d) => d["id"]);

     //Draw and associate links
     let link = d3
          .select(".links")
          .selectAll("line")
          .data(graph.links)
          .enter()
          .append("g")
          .attr("class", "link");
     link.append("line")
          .attr("stroke-width", 2)
          .attr("stroke", "black")
          .attr("x1", (d) => graph.pos[d.source][0])
          .attr("y1", (d) => graph.pos[d.source][1])
          .attr("x2", (d) => graph.pos[d.target][0])
          .attr("y2", (d) => graph.pos[d.target][1])
          .attr("id", (d) => d.source + "-" + d.target);

     //Add labels to nodes
     node.append("text")
          .text((d) => d.id)
          .attr("x", (d) => d.x)
          .attr("y", (d) => d.y);

     //Add labels to links at the midpoint
     link.append("text")
          .text((d) => d.source + "-" + d.target)
          .attr(
               "x",
               (d) => (graph.pos[d.source][0] + graph.pos[d.target][0]) / 2
          )
          .attr(
               "y",
               (d) => (graph.pos[d.source][1] + graph.pos[d.target][1]) / 2
          );

     //Create D3 drag handler for nodes/links
     var drag_handler = d3.drag().on("drag", function (d) {
          d3.select(this)
               .attr("cx", (d.x = d3.event.x))
               .attr("cy", (d.y = d3.event.y));

          //Update underlying data of links (graph.pos)
          graph.pos[d.id][0] = d3.event.x;
          graph.pos[d.id][1] = d3.event.y;

          //Initiate update pattern for links
          let link = d3.select(".links").selectAll("line").data(graph.links);
          link.exit().remove();
          link.enter()
               .append("line")
               .attr("stroke-width", 2)
               .attr("stroke", "black")
               .merge(link)
               .attr("x1", (d) => graph.pos[d.source][0])
               .attr("y1", (d) => graph.pos[d.source][1])
               .attr("x2", (d) => graph.pos[d.target][0])
               .attr("y2", (d) => graph.pos[d.target][1])
               .attr("id", (d) => d.source + "-" + d.target);

          //Reset labels
          node.selectAll("text").remove();
          link.selectAll("text").remove();

          node.append("text")
               .text((d) => d.id)
               .attr("x", (d) => d.x)
               .attr("y", (d) => d.y);

          link.append("text")
               .text((d) => d.source + "-" + d.target)
               .attr(
                    "x",
                    (d) => (graph.pos[d.source][0] + graph.pos[d.target][0]) / 2
               )
               .attr(
                    "y",
                    (d) => (graph.pos[d.source][1] + graph.pos[d.target][1]) / 2
               );
     });

     //Apply drag_handler to all circles
     drag_handler(d3.select(".nodes").selectAll("circle"));

     // coordsPixels('svg');
}

//Alows user to select start node for algorithm
function selectStart(d) {
     //Change prev start back to red
     d3.select("#" + start).attr("fill", "red");

     //Update start
     start = d.id;

     //Change to yellow
     d3.select("#" + d.id).attr("fill", "yellow");

     console.log("New start is", start);
}

//Clears current graph allowing djikstra to be run again
function reset() {
     //Breaks DJ anim
     resetClicked = true;

     d3.selectAll("g").remove();
     makeNetwork();
}

//Called by "make" button to create new graph with specified # of nodes
function makeGraph() {
     let numNodes = document.querySelector("#numNodes").value;

     d3.selectAll("g").remove();

     //Call generate graph to update global graph object with
     //new nodes and edges us geometric graph model
     genGeomGraph(numNodes, 120);

     makeNetwork();
}

//********DJIKSTRA FUNCTIONS******
//********************************

// Generates random geometric graph using naive algorithm
// Updates global graph object and adjacency list
function genGeomGraph(numNodes, r) {
     //Updates global graph object

     //Creates numNodes new nodes
     let newNodes = [];
     for (let i = 0; i < numNodes; i++) {
          //Create node object and push
          let nodeName = "Node" + i;
          let newNode = { id: nodeName };
          newNodes.push(newNode);
     }

     graph.nodes = newNodes;

     //Now assign uniform random x,y coordinates to create Geometric graph

     //Array of new positions to prevent overlap
     let newPos = [];

     //Place each node randomly, ensuring no overlap
     for (let node of graph.nodes) {
          placeNode(node, newPos);
          newPos.push(graph.pos[node.id]);
     }

     //Naive geomtric graph algorithm
     let edges = [];
     let nodes = Object.keys(graph.pos);

     for (let i = 0; i < numNodes; i++) {
          let nodeA = nodes[i];

          for (let j = i + 1; j < numNodes; j++) {
               let nodeB = nodes[j];

               //Calculate distance between nodeA and nodeB
               let dist = Math.sqrt(
                    Math.pow(graph.pos[nodeA][0] - graph.pos[nodeB][0], 2) +
                         Math.pow(graph.pos[nodeA][1] - graph.pos[nodeB][1], 2)
               );

               //Get ETX parameters from sliders

               if (i !== j) {
                    if (dist < r) {
                         let etx = calcETX(dist);

                         let edge = [nodeA, nodeB, etx];
                         edges.push(edge);
                    }
               }
          }
     }

     //Update links using the generated edges list
     let newLinks = [];
     for (let i = 0; i < edges.length; i++) {
          //Create link object and push
          let newLink = { source: edges[i][0], target: edges[i][1] };
          newLinks.push(newLink);
     }

     graph.links = newLinks;

     //Update global adj list using edge list
     makeAdjList(edges);

     //Calc percentage of ETX < 10
     let edgeArr = edges.values();
     let total = 0;
     let goodETX = 0;
     for (let etx of edgeArr) {
          total += 1;

          //Count < 10 ETX vals
          if (etx[2] < 10) {
               goodETX += 1;
          }
     }
     console.log("Percentage goodETX", goodETX / total);
}

//Helper function to assign weight of edge using ETX method
function calcETX(dist, a = 0.25, b = 20) {
     //ETX = 1 / success probability
     //1 - [exp ( a(x - b) ) / (exp (a (x - b))+1)],
     // try a = 0.25 and b = 20

     a = document.querySelector("#sliderA").value;
     b = document.querySelector("#sliderB").value;

     let prob = 1 - Math.exp(a * (dist - b)) / (Math.exp(a * (dist - b)) + 1);

     //Debug
     // console.log(prob);

     return 1 / prob;
}

//Helper function for genGraph
//Takes a node object and array of currently assigned positions as args
//Assigns coordinates to a node, preventing overlap
function placeNode(node, pos) {
     let padding = 10;
     let width = d3.select("svg").attr("width");
     let height = d3.select("svg").attr("height");

     let nodePlaced = false;
     while (!nodePlaced) {
          //Random number between 100 and 800
          var x = Math.floor(Math.random() * 750) + 50;

          //Random number between 100 and 500
          var y = Math.floor(Math.random() * 450) + 100;

          //Check against all other coordinates
          let valid = true;
          for (let cords of pos) {
               if (pos.length === 0) {
                    nodePlaced = true;
                    break;
               }

               //Ensure that distance between centers of
               //each drawn circle is greater than 2x radius + some padding

               //Pythagorean theorem
               let dist = Math.sqrt(
                    Math.pow(cords[0] - x, 2) + Math.pow(cords[1] - y, 2)
               );

               if (dist < 2 * radius + padding) {
                    valid = false;
                    break;
               }
          }

          //If out of the loop and still true, then the placement is valid
          if (valid === true) {
               nodePlaced = true;
          }
     }

     node.x = x;
     node.y = y;
     graph.pos[node.id] = [x, y];
}

//Runs Djikstras Algorithm generarting list of visited nodes in order
//as well as list of traversed links in order
function run() {
     //Creates min priority queue with tuples of the form [d(v), v]
     let compareTuples = function (a, b) {
          return a[0] - b[0];
     };
     let pq = new PriorityQueue({ comparator: compareTuples });

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
     pred.set(start, start);

     //Lists for events

     //Nodes in order visited
     let nodeId = [];

     //Links in order traversed linkIds[0] is the link used to
     //traverse from start to nodeId[0]
     let linkId = [];

     //List of lists, at each node enumerates connection tried
     let checking = [];

     pq.queue([0, start]);
     while (pq.length !== 0) {
          //Get the name of shortest distance node
            let currNode = pq.dequeue()[1];

        //   console.log(`On ${currNode}`);

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

        //   console.log(`Traveled to ${currNode} from ${fromNode}`);

          //List of neighbor checks performed from currNode
          let checks = [];

          //Check each neighbor of currNode that has not been visited
          for (let neighbor of Object.keys(adjList[currNode])) {
               if (!visited.has(neighbor)) {
                    //Check if there is a better path

                    // console.log(`Checking ${neighbor}`);
                    checks.push(neighbor);

                    //if(d[v] > d[curr] + c(curr,v))
                    let newDist =
                         dist.get(currNode) + adjList[currNode][neighbor];

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

     //Find path sums for all nodes
     let totalETX = calcETXPaths(pred);

     //Set global etxpathvals
     update_labels(totalETX);

     //Populate Histogram & Add Labels to Nodes
     create_histogram(totalETX);

     //***** Begin Animation ******
     //****************************

     //Highlights start and gets rid of starting events from DJ
    //  console.log("Starting node is:", start);
     d3.select("#" + nodeId[0])
          .transition()
          .duration(50)
          .attr("fill", "yellow");

     nodeId.shift();
     linkId.shift();


     //Flip all the links to be smallest to largest so they line up with svg id's
     linkId = linkId.map(function (item, index, aray) {
          let nodeTuple = item.split("-");
          let nodeA = nodeTuple[0];
          let nodeB = nodeTuple[1];

          //Regex to extract number from e.g. 'Node3243'
          let numA = nodeA.match(/\d+/g).map(Number);
          let numB = nodeB.match(/\d+/g).map(Number);

          if (numA[0] > numB[0]) {
               let reversed = nodeB + "-" + nodeA;
               return reversed;
          }

          return item;
     });


     let iters = nodeId.length;

     let interval = d3.interval(function () {
          if (iters === 0 || resetClicked) {
               interval.stop();
               resetClicked = false;
               return;
          }

        //   console.log("Traversing to", nodeId[0], "using edge", linkId[0]);

          d3.select("#" + linkId[0])
               .transition()
               .duration(2500)
               .attr("stroke", "yellow");
          d3.select("#" + nodeId[0])
               .transition()
               .duration(2600)
               .attr("fill", "blue");

          //Pop front
          nodeId.shift();
          linkId.shift();

          iters -= 1;
     }, 1000);
}

//Called when ETX paths are calculated
//updates labels of nodes to show ETX path to node
function update_labels(totalETX) {

     let node = d3.selectAll('.node');

     console.log(node);

     //Reset labels
     node.selectAll("text").remove();

     node.append("text")
          .text((d) => totalETX[d.id].toFixed(2))
          .attr("x", (d) => d.x)
          .attr("y", (d) => d.y);
}


//Calculates Total ETX of path from start to each Node
//used for histogram and labeling after conclusion of animation
function calcETXPaths(predNodes) {
     //Trace back paths using pred nodes
     let pathValues = {};

     for (let node of Object.keys(adjList)) {
        let pathSum = 0;

        //Trace the path back counting up ETX
        let currNode = node;
        while(currNode != predNodes.get(currNode)) {

            //One step back in the path
            let predNode = predNodes.get(currNode);

            //ETX of currNode <-> predNode
            let etx = adjList[currNode][predNode];

            //Add that to the pathsum
            if (currNode != predNode) {
                pathSum += etx;
            }

            //Move to pred
            currNode = predNode;
        }

        pathValues[node] = pathSum;
     }

     return pathValues;

}

function flipLinks(links) {
     //Helper function to flip link to align with svg id

     for (let link of links) {
          nodeA[nodeA.length - 1] > nodeB[nodeB.length - 1];
     }
}

///Turns edges into adjList, updates global adjList, called from
//generateGraph
function makeAdjList(edges) {
     let newAdjList = {};

     //Initialize keys
     for (let node of Object.keys(graph.pos)) {
          //Create an entry for each node
          newAdjList[node] = {};
     }

     for (let edge of edges) {
          let start = edge[0];
          let end = edge[1];
          let weight = edge[2];

          //Add end to starts list
          newAdjList[start][end] = weight;

          //Add start to ends list
          newAdjList[end][start] = weight;
     }

     adjList = newAdjList;
}


///Histogram

//Function to associate data with histgram and draw it
function create_histogram(totalETX) {

    //Select histogram div
    let HIST = document.querySelector("#etxhist");

    //Get array of etx path values
    let etxVals = Object.values(totalETX);

    //Filter NaNs
    etxVals = etxVals.filter(etx => !isNaN(etx))



    //x is a array of integers
    let trace = {
        x: etxVals,
        type: 'histogram',
    };

    let data = [trace];

    Plotly.newPlot(HIST, data);

    // var x = [];
    // for (var i = 0; i < 500; i ++) {
    //     x[i] = Math.random();
    // }

    // var trace = {
    //     x: x,
    //     type: 'histogram',
    // };
    // var data = [trace];
    // Plotly.newPlot(HIST, data);

}













