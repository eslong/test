/*Counter for the ID of the next Node, to be used in generating the node's ID and the index for data relating to the node to be added.*/
var nodeID = 1;

/*Object that will store any data relating to the Node.*/
function Data(id, label, description) {
	this.id = id;
	this.label = label;
	this.description = description;
}

/*Array that will store the created Data objects by index relating to the ID of their respective Nodes.*/
var arbNodeData = [];

/*Data for the base Node.*/
arbNodeData[0] = new Data('0', 'Base Node', 'This is the base Node for the graph.');

/*Function that handles operations and settings for the graph.*/
$(function(){
	//An instance of Cytoscape is created within the div with the id 'cy'
	$('#cy').cytoscape({
		
		/*Specifies the layout to use (once I can get Arbor to work, that will be the layout used).*/
		layout: { name: 'grid', padding: 430, zoom: 1.0 },
		
		/*Disabled to improve formatting.*/
		zoomingEnabled: false,
		
		/*Style settings for the graph and it's elements.*/
		style: cytoscape.stylesheet()
		
			/*Styling for all nodes.*/
			.selector('node')
				.css({
						'content': 'data(name)',
						'text-valign': 'center',
						'color': 'white',
						'background-color': 'pink',
						'text-outline-width': 2,
						'text-outline-color': '#888'
				})
				
			/*Styling for all edges.*/
			.selector('edge').css( { 'line-color': 'black' } )
			
			/*Styling for all selected items.*/
			.selector(':selected')
				.css({
					'border-color':'black',
					'line-color':'blue',
					'target-arrow-color':'blue'
				}),
				
		/*Add the initial node for the graph.*/
		elements: { nodes: [ { data: { id: '0', name: 'Base Node' } } ] },
		
		/*Function that handles what actions the graph can take.*/
		ready: function() {
			window.cy = this;
			var currentNode = null;
			var tooltipHidden = true;
			
			/*Events for qTip*/
			cy.on('tap', 'node', function(e) {
				var targetNode = e.cyTarget;
				var targetID = targetNode.data('id');
				var targetLbl = targetNode.data('name');
				var x = e.cyPosition.x;
                var y = e.cyPosition.y;
                
                /*If the node you clicked has an open tooltip...*/
				if ( currentNode === targetNode ) {
					/*...show it if it has been hidden.*/
					if (tooltipHidden) {
						$('#tooltip').qtip('show');
						tooltipHidden = false;
					/*...hide it if it is not already.*/
					} else {
						$('#tooltip').qtip('hide');
						tooltipHidden = true;
					}
				/*If you clicked on a different node, create and show the tooltip with the node's information.*/
				} else {   
					if ( $('#tooltip').data('qtip') ) $('#tooltip').qtip('destroy');   //Remove any previous tooltips.
					
					$('#tooltip').css({left: x, top: y - 2});   //Position the tooltip
					
					//Creating the tooltip (content, positioning, and styling)
					$('#tooltip').qtip({
						content: '<strong>ID:</strong> ' + targetID + 
								 '</br><strong>Label:</strong> ' + targetLbl + 
								 '</br><strong>Description: </strong> ' + arbNodeData[ parseInt(targetID) ].description,
						show: {
							ready: true
						},
						position: {
							my: 'top center',
							at: 'bottom center',
							adjust: {
								x: 10,
                            	y: 10
							}
						},
						style: {
							tip: 'topLeft'
						}
					});
					
					currentNode = targetNode;
					tooltipHidden = false;
				}
			});
		
			/*Event handler for adding Nodes when an existing Node is right-clicked*/
			cy.on('cxttap', 'node', function(e) {
				var source = e.cyTarget;
				addNode( source.data('id'), source.renderedPosition( 'x' ), source.renderedPosition( 'y' ) );
			});
		}
	});
});

/*Function that handles to adding of Nodes and Edges to the graph.*/
function addNode( parentNode, x, y ) {
	var newNodeID = nodeID.toString();
	var newNodeLabel = prompt('Enter a name to label your new Node:', 'Node ' + nodeID);
	var newEdge = parentNode + '->' + newNodeID;
	
	//Positions the new Nodes in random positions around the parent Node.
	var nodeX = x + Math.floor( Math.random() * 300 - 150);
	var nodeY = y + Math.floor( Math.random() * 300 - 150);
	
	//Add the new Node and the Edge that connects it to it's parent.
	cy.add([
	    { group: 'nodes', data: { id: newNodeID, name: newNodeLabel }, renderedPosition: { x: nodeX, y: nodeY } },
		{ group: 'edges', data: { id: newEdge, source: parentNode, target: newNodeID } }
	]);
	
	//Check what type of node the user would like to create.
	nodeGroup();
	
	//Add a description to the created node.
	var newNodeDesc = prompt('Enter a description for your new Node:', 'Node ' + nodeID);
	arbNodeData[nodeID] = new Data(newNodeID, newNodeLabel, newNodeDesc);
	
	//Function for checking Node type and changing the Node's properties accordingly.
	function nodeGroup() {
		var group = prompt('What type of node would you like: Alpha or Beta?', 'Alpha').toLowerCase();
		if (group === null || group === '') {
			return;
		} else if (group === 'alpha') {
			cy.elements('node#' + newNodeID).css( { 'shape': 'triangle', 'background-color': 'green', 'text-outline-color': 'red' } );
		} else if (group === 'beta') {
			cy.elements('node#' + newNodeID).css( { 'shape': 'rectangle', 'background-color': 'orange', 'text-outline-color': 'purple' } );
		} else {
			alert('That is not a valid type for a node! Please choose between the following: Alpha or Beta.');
			nodeGroup();
		}
	}
	
	//Increment the ID for the next Node.
	++nodeID;
}







