//Counter for the ID of the next Node, to be used in generating the node's ID.
var nodeID = 1;
//Variable to check if the shift key is being pressed.
var shifted = false;
var controlled = false;

var isNodeEdit = false;
var isNodeAdd = false;

var addPosX;
var addPosY;
var parentNode;

var currentNode = null;

var defaultURI = 'http://thoughtwire.ca/demo/MedicalWard';

//Function that handles operations and settings for the graph.
$(function(){
	
	//Event handlers to check if the Shift key or the Control key is being held.
	var SHIFT = 16;
	var CTRL = 17;
	
	$(document).keydown(function(e) {
		if (e.keyCode == SHIFT) {
			shifted = true;
		} else if (e.keyCode == CTRL) {
			controlled = true;
		}
	});
	
	$(document).keyup(function(e) {
		if (e.keyCode == SHIFT) {
			shifted = false;
		} else if (e.keyCode == CTRL) {
			controlled = false;
		}
	});
	
	$('#dialog').dialog({
		autoOpen: false,
		modal: true,
		width: 550,
		height: 600
	});
	
	$('#dialog-submit').click(function(e) {
		e.preventDefault();
		if (isNodeEdit) {
			editNode();
		} else if (isNodeAdd) {
			addNode();
		}
		$('#dialog').dialog('close');
	});
	
	//An instance of Cytoscape is created within the div with the id 'cy'
	$('#cy').cytoscape({
		
		//Specifies the layout to use (once I can get Arbor to work, that will be the layout used).
		layout: { name: 'grid', padding: 430, zoom: 1.0 },
		
		//Disabled to improve formatting.
		zoomingEnabled: false,
		
		//Style settings for the graph and it's elements.
		style: cytoscape.stylesheet()
		
			//Styling for all nodes.
			.selector('node')
				.css({
						'content': 'data(label)',
						'text-valign': 'bottom',
						'shape': 'rectangle',
						'background-color': 'white',
						'color': 'white',
						'background-image': 'collaboration2.png',
						'background-fit': 'contain',
						'text-outline-width': 2,
						'text-outline-color': 'gray'
				})
				
			//Styling for all edges.
			.selector('edge')
				.css({ 
						'line-color': 'black', 
						'content': 'data(label)',
						'color': 'white',
						'text-valign': 'center',
						'text-outline-width': 2,
						'text-outline-color': 'black'
					})
			
			//Styling for all selected items.
			.selector(':selected')
				.css({
					'border-color': 'black',
					'line-color':'blue',
					'target-arrow-color':'blue'
				}),
				
		//Add the initial node for the graph.
		elements: { nodes: [ { data: { id: '0', label: 'Collaboration', group: 'Collaboration', uri: defaultURI, description: 'This is the base node for the graph.' } } ] },
		
		//Function that handles what actions the graph can take.
		ready: function() {
			window.cy = this;
			var tooltipHidden = true;
			var hiddenNodes;
			
			//Events for qTip
			cy.on('tap', 'node', function(e) {
				var targetNode = e.cyTarget;
				var targetID = targetNode.data('id');
				var targetLabel = targetNode.data('label');
				var targetGroup = targetNode.data('group');
				var targetURI = targetNode.data('uri');
				var targetDesc = targetNode.data('description');
				var x = e.cyPosition.x;
                var y = e.cyPosition.y;
                
                var cHidden = false;
                
                if ( shifted ) {
                	$('#dialog').dialog('open');
        			
        			document.getElementById('dialog-title').innerHTML = 'Edit Node';
        			document.getElementById('dialog-id-label').innerHTML = 'ID: ';
        			document.getElementById('dialog-id').innerHTML = targetID;
        			document.getElementById('dialog-name').value = targetLabel;
        			if ( targetGroup == 'Collaboration' ) {
        				document.getElementById('dialog-type-collaboration').checked = true;
        			} else if ( targetGroup == 'Controller' ) {
        				document.getElementById('dialog-type-controller').checked = true;
        			} else if ( targetGroup == 'Database' ) {
        				document.getElementById('dialog-type-database').checked = true;
        			}
        			document.getElementById('dialog-uri').value = targetURI;
        			document.getElementById('dialog-description').value = targetDesc;
        			
        			isNodeEdit = true;
        			isNodeAdd = false;
        			
                	shifted = false;
                } else if ( controlled ) {
                	var childEdges = cy.elements( 'edge[source="' + targetID + '"]' );
                	var childNodes = childEdges.targets();
                	if (cHidden) {
                		hiddenNodes.show();
                		cHidden = false;
                	} else {
                		childNodes.hide();
                		hiddenNodes = childNodes;
                		cHidden = true;
                	}
                	controlled = false;
                } else if ( currentNode === targetNode ) {    //If the node you clicked has an open tooltip...
					//...show it if it has been hidden.
					if (tooltipHidden) {
						addTooltip();
						tooltipHidden = false;
					//...hide it if it is not already.
					} else {
						$('#tooltip').qtip('destroy');
						tooltipHidden = true;
					}
				//If you clicked on a different node, create and show the tooltip with the node's information.
				} else {   
					addTooltip();
				}
                
                function addTooltip() {
                	if ( $('#tooltip').data('qtip') ) $('#tooltip').qtip('destroy');   //Remove any previous tooltips.
					
					$('#tooltip').css({left: x - 2, top: y + 4});   //Position the tooltip
					
					//Creating the tooltip (content, positioning, and styling)
					$('#tooltip').qtip({
						content: '<strong>ID:</strong> ' + targetID + 
								 '</br><strong>Label:</strong> ' + targetLabel +
								 '</br><strong>Type: </strong> ' + targetGroup +
								 '</br><strong>URI: </strong> <a href="http://www.thoughtwire.com">' + targetURI + '</a>' +
								 '</br><strong>Description: </strong> ' + targetDesc ,
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
					
					tooltipHidden = false;
                }
                
                currentNode = targetNode;
			});
		
			//Event handler for adding Nodes when an existing Node is right-clicked.
			cy.on('cxttap', 'node', function(e) {
				var target = e.cyTarget;
				var targetID = target.data('id');
				
				$('#dialog').dialog('open');
    			
    			document.getElementById('dialog-title').innerHTML = 'Add Node';
    			document.getElementById('dialog-id-label').innerHTML = 'Parent: ';
    			document.getElementById('dialog-id').innerHTML = targetID;
    			document.getElementById('dialog-name').value = '';
    			document.getElementById('dialog-type-collaboration').checked = true;
    			document.getElementById('dialog-uri').value = defaultURI;
    			document.getElementById('dialog-description').value = '';
    			
    			isNodeEdit = false;
    			isNodeAdd = true;
    			
    			addPosX = target.renderedPosition('x');
    			addPosY = target.renderedPosition('y');
    			parentNode = targetID;
			});
			//Event handler for editing an Edge when it is shift-clicked.
			cy.on('tap', 'edge', function(e) {
				if (shifted) {
					var target = e.cyTarget;
					var edgeLabel = prompt( 'Enter a name for the edge:', target.data('label') );
					target.data('label', edgeLabel);
					shifted = false;
				}
			});
		}
	});
});

//Function that handles to adding of Nodes and Edges to the graph.
function addNode() {
	var newNodeID = nodeID.toString();
	var newNodeLabel = document.getElementById('dialog-name').value;
	var newNodeGroup;
	if ( document.getElementById('dialog-type-collaboration').checked ) {
		newNodeGroup = 'Collaboration';
	} else if ( document.getElementById('dialog-type-controller').checked ) {
		newNodeGroup = 'Controller';
	} else if ( document.getElementById('dialog-type-database').checked ) {
		newNodeGroup = 'Database';
	}
	var newNodeURI = document.getElementById('dialog-uri').value;
	var newNodeDesc = document.getElementById('dialog-description').value;
	var newEdge = parentNode + '->' + newNodeID;
	
	//Positions the new Nodes in random positions around the parent Node.
	var nodeX = addPosX + Math.floor( Math.random() * 300 - 150);
	var nodeY = addPosY + Math.floor( Math.random() * 300 - 150);
	
	//Add the new Node and the Edge that connects it to it's parent.
	cy.add([
	    { group: 'nodes', data: { id: newNodeID, label: newNodeLabel, group: newNodeGroup, uri: newNodeURI, description: newNodeDesc }, renderedPosition: { x: nodeX, y: nodeY } },
		{ group: 'edges', data: { id: newEdge, source: parentNode, target: newNodeID, label: 'hasPart' } }
	]);
	
	var target = cy.elements('node#' + newNodeID);
	
	if (newNodeGroup == 'Collaboration') {
		target.css( { 'background-image': 'collaboration2.png', 'text-outline-color': 'gray' } );
	} else if (newNodeGroup == 'Controller') {
		target.css( { 'background-image': 'controller2.png', 'text-outline-color': 'purple' } );
	} else if (newNodeGroup == 'Database') {
		target.css( { 'background-image': 'database.png', 'text-outline-color': 'red' } );
	}
	
	//Increment the ID for the next Node.
	++nodeID;
}

function editNode() {
	var newNodeLabel = document.getElementById('dialog-name').value;
	var newNodeGroup;
	if ( document.getElementById('dialog-type-collaboration').checked ) {
		newNodeGroup = 'Collaboration';
	} else if ( document.getElementById('dialog-type-controller').checked ) {
		newNodeGroup = 'Controller';
	} else if ( document.getElementById('dialog-type-database').checked ) {
		newNodeGroup = 'Database';
	}
	var newNodeURI = document.getElementById('dialog-uri').value;
	var newNodeDesc = document.getElementById('dialog-description').value;
	
	currentNode.data('label', newNodeLabel);
	currentNode.data('group', newNodeGroup);
	currentNode.data('uri', newNodeURI);
	currentNode.data('description', newNodeDesc);
	
	if (newNodeGroup == 'Collaboration') {
		currentNode.css( { 'background-image': 'collaboration2.png', 'text-outline-color': 'gray' } );
	} else if (newNodeGroup == 'Controller') {
		currentNode.css( { 'background-image': 'controller2.png', 'text-outline-color': 'purple' } );
	} else if (newNodeGroup == 'Database') {
		currentNode.css( { 'background-image': 'database.png', 'text-outline-color': 'red' } );
	}
}













