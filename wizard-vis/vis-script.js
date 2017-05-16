/*DataSet that will hold any arbitrary data linked to nodes*/
var arbNodeData = new vis.DataSet();
arbNodeData.add( [ { id: 0, label: 'Base Node', description: 'This is the base node for the graph.'} ] );

/*DataSet that will store the nodes of the graph*/
var nodes = new vis.DataSet();

/*Creating the initial Node*/
nodes.add( [ { id: 0, label: arbNodeData.get(0).label, group: 'Omega', title: '<strong>ID:</strong> 0</br><strong>Label:</strong>' +  arbNodeData.get(0).label + '</br><strong>Description:</strong> ' + arbNodeData.get(0).description } ] );

/*DataSet that will store the edges of the graph*/
var edges = new vis.DataSet();

/*Stores what the Network will be contained within*/
var container = document.getElementById('graph');

/*Object that contains the nodes and edges*/
var data = {
	nodes: nodes,
	edges: edges,
};

/*Object for formatting the Network*/
var options = {
	stabilize: false,
	dragNetwork: false,
	/*dataManipulation: {
		enabled: true,
		initiallyVisible: true
	},*/
	edges: {
		style: 'line',
		/*Does not appear to work (highlighting an edge should turn it red)*/
		color: {
			highlight: 'red'
		}
	},
	groups: {
		Omega: {
			shape: 'star',
			color: 'orange'
		},
		Alpha: {
			shape: 'triangle',
			color: 'gray'
		},
		Beta: {
			shape: 'triangleDown',
			color: 'green'
		}
	}
};

/*Function for adding nodes when the graph detects a mouse click.*/
var newNodeID = 0;
function addNode(parent) {
	var newNodeGroup = checkGroup();
	if (newNodeGroup === 'Cancel') { return; };
	++newNodeID;
	var newNodeLbl = checkInput('Enter a label for the new Node:');
	var newNodeDesc = checkInput('Enter a description for the new Node:');
	
	/*Checks that the choice of group is valid*/
	function checkGroup() {
		var nodeGroup = prompt('What type of Node would you like to create: Alpha or Beta?', 'Alpha').toLowerCase();
		if (nodeGroup === null || nodeGroup === '') {
			return 'Cancel';
		} else if (nodeGroup === 'alpha'){
			return 'Alpha';
		} else if (nodeGroup === 'beta') {
			return 'Beta';
		} else {
			alert('That is not a valid group! Please choose between the following: Alpha or Beta.');
			checkGroup();
		}
	}
	
	/*Checks that the input from the user is valid*/
	function checkInput(query, isLabel) {
		var initVal = 'Node' + newNodeID;
		
		var input = prompt(query, initVal);
		if (input === '' || input === null) {
			alert('Invalid input, please try again.');
			checkInput(query, isLabel);
		} else {
			return input;
		}
	}
	/*Adds the node and the data associated with it to their respective DataSets*/
	arbNodeData.add( [ { id: newNodeID, label: newNodeLbl, description: newNodeDesc } ] );
	nodes.add( [ { id: newNodeID, label: newNodeLbl, group: newNodeGroup,  title: '<strong>ID:</strong> ' + newNodeID + 
																				  '</br><strong>Label:</strong> ' + newNodeLbl + 
																				  '</br><strong>Description:</strong> ' + arbNodeData.get(newNodeID).description } ] );
	/*Only adds an edge if their is a parent node to connect (nodes can therefore be added by dblclicking on any part of the canvas without causing errors)*/
	if (parent !== null) {
		edges.add( [ { from: newNodeID, to: parent } ] );
	};
};

/*Creates the Network*/
var network = new vis.Network(container, data, options);

/*Create child nodes when double-clicking a node*/
network.on('doubleClick', function (properties) {
	addNode(properties.nodes);
});













