
var defaultURI = 'http://thoughtwire.ca/demo/MedicalWard';

//DataSet that will hold any arbitrary data linked to nodes
var arbNodeData = new vis.DataSet();
arbNodeData.add( [ { id: 0, label: 'Collaboration', group: 'Collaboration', uri: defaultURI, description: 'This is the base node for the graph.'} ] );

//DataSet that will hold any arbitrary data linked to edges.
var arbEdgeData = new vis.DataSet();

//DataSet that will store the nodes of the graph
var nodes = new vis.DataSet();

//Creating the initial Node
nodes.add( [ { id: 0, label: arbNodeData.get(0).label, group: 'Collaboration', title: '<strong>ID:</strong> 0</br><strong>Name:</strong>' +  arbNodeData.get(0).label + 
																					  '<br><strong>Type:</strong> Collaboration' +
																					  '</br><strong>URI:</strong> <a href="http://www.thoughtwire.com">' + arbNodeData.get(0).uri + '</a>' +
																					  '</br><strong>Description:</strong> ' + arbNodeData.get(0).description } ] );

//DataSet that will store the edges of the graph
var edges = new vis.DataSet();

//Stores what the Network will be contained within
var container = document.getElementById('graph');

//Object that contains the nodes and edges
var data = {
	nodes: nodes,
	edges: edges,
};

//Object for formatting the Network
var options = {
	stabilize: false,
	dragNetwork: false,
	zoomable: false,
	
	// Interface for editing nodes and moving edges that comes with the library, disabled by default.
	/*dataManipulation: {
		enabled: true,
		initiallyVisible: true
	},*/
	
	edges: {
		style: 'line',
		inheritColor: false,
		color: {
			highlight: 'blue'
		}
	},
	groups: {
		Collaboration: {
			shape: 'image',
			image: 'collaboration2.png',
			fontSize: '16'
		},
		Controller: {
			shape: 'image',
			image: 'controller2.png'
		},
		Database: {
			shape: 'image',
			image: 'database.png'
		}
	}
};

var isNodeEdit = false;
var isNodeAdd = false;

//Function for adding nodes when the graph detects a mouse click.
var newNodeID = 0;
var newEdgeID = 100000;
function addNode() {
	++newNodeID;
	
	var parentNode = document.getElementById('dialog-id').innerHTML;
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
	

	//Adds the node and the data associated with it to their respective DataSets
	arbNodeData.add( [ { id: newNodeID, label: newNodeLabel,group: newNodeGroup, uri: newNodeURI, description: newNodeDesc } ] );
	nodes.add( [ { id: newNodeID, label: newNodeLabel, group: newNodeGroup,  title: '<strong>ID:</strong> ' + newNodeID + 
																				  '</br><strong>Label:</strong> ' + arbNodeData.get(newNodeID).label + 
																				  '</br><strong>Type:</strong> ' + arbNodeData.get(newNodeID).group+
																				  '</br><strong>URI:</strong> <a href="http://www.thoughtwire.com">' + arbNodeData.get(newNodeID).uri + '</a>' +
																				  '</br><strong>Description:</strong> ' + arbNodeData.get(newNodeID).description } ] );
	//Add the edge linking the node to it's parent.
	++newEdgeID;
	edges.add( [ { id: newEdgeID, from: newNodeID, to: Number(parentNode), label: 'hasPart' } ] );
};

//Function for editing the labels of edges.
function editEdge(target) {
	var edgeLabel = prompt( 'Enter a name for the edge: ', edges.get(target).label );
	edges.update({
		id: target,
		label: edgeLabel
	});
}

//Function for editing the properties of a node.
function editNode() {
	var targetNode = document.getElementById('dialog-id').innerHTML;
	var nodeLabel = document.getElementById('dialog-name').value;
	var nodeGroup;
	if ( document.getElementById('dialog-type-collaboration').checked ) {
		nodeGroup = 'Collaboration';
	} else if ( document.getElementById('dialog-type-controller').checked ) {
		nodeGroup = 'Controller';
	} else if ( document.getElementById('dialog-type-database').checked ) {
		nodeGroup = 'Database';
	}
	var nodeURI = document.getElementById('dialog-uri').value;
	var nodeDesc = document.getElementById('dialog-description').value;
	
	arbNodeData.update({
		id: targetNode,
		label: nodeLabel,
		group: nodeGroup,
		uri: nodeURI,
		description: nodeDesc
	});
	
	nodes.update({
		id: targetNode,
		label: nodeLabel,
		group: nodeGroup,
		title:'<strong>ID:</strong> ' + newNodeID + 
		  '</br><strong>Label:</strong> ' + arbNodeData.get(newNodeID).label + 
		  '</br><strong>Type:</strong> ' + arbNodeData.get(newNodeID).group+
		  '</br><strong>URI:</strong> <a href="http://www.thoughtwire.com">' + arbNodeData.get(newNodeID).uri + '</a>' +
		  '</br><strong>Description:</strong> ' + arbNodeData.get(newNodeID).description
	});
}

//Creates the Network
var network = new vis.Network(container, data, options);

//Handlers for shift-clicking.
var shifted = false;

$(function(){
	//Event handlers to check if the Shift key is being held.
	var SHIFT = 16;
	
	$(document).keydown(function(e) {
		if (e.keyCode == SHIFT) {
			shifted = true;
		}
	});
	
	$(document).keyup(function(e) {
		if (e.keyCode == SHIFT) {
			shifted = false;
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
});


//Create child nodes when double-clicking a node
network.on('doubleClick', function(properties) {
	var node = properties.nodes[0];
	if (node != '') {
		$('#dialog').dialog('open');
		
		document.getElementById('dialog-title').innerHTML = 'Add Node';
		document.getElementById('dialog-id-label').innerHTML = 'Parent: ';
		document.getElementById('dialog-id').innerHTML = nodes.get(node).id;
		document.getElementById('dialog-name').value = '';
		document.getElementById('dialog-type-collaboration').checked = true;
		document.getElementById('dialog-uri').value = defaultURI;
		document.getElementById('dialog-description').value = '';
		
		isNodeAdd = true;
		isNodeEdit = false;
	}
});

//Edit the label of an edge when it is shift-clicked.
network.on('click', function(properties) {
	var edge = properties.edges[0];
	var node = properties.nodes[0];
	
	if ( shifted ) {
		if ( properties.edges != '' && properties.nodes == '') {
			editEdge( edge );
		} else if (properties.nodes != ''){
			$('#dialog').dialog('open');
			
			document.getElementById('dialog-title').innerHTML = 'Edit Node';
			document.getElementById('dialog-id-label').innerHTML = 'ID: ';
			document.getElementById('dialog-id').innerHTML = nodes.get(node).id;
			document.getElementById('dialog-name').value = nodes.get(node).label;
			if ( nodes.get(node).group == 'Collaboration' ) {
				document.getElementById('dialog-type-collaboration').checked = true;
			} else if ( nodes.get(node).group == 'Controller' ) {
				document.getElementById('dialog-type-controller').checked = true;
			} else if ( nodes.get(node).group == 'Database' ) {
				document.getElementById('dialog-type-database').checked = true;
			}
			document.getElementById('dialog-uri').value = arbNodeData.get(node).uri;
			document.getElementById('dialog-description').value = arbNodeData.get(node).description;
			
			isNodeAdd = false;
			isNodeEdit = true;
		}
	} 
	shifted = false;
});













