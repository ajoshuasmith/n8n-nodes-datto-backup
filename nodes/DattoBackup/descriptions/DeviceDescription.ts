import type { INodeProperties } from 'n8n-workflow';

export const deviceOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['device'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get a specific BCDR device by serial number',
				action: 'Get a device',
			},
			{
				name: 'Get Many',
				value: 'getMany',
				description: 'Get all BCDR devices',
				action: 'Get many devices',
			},
		],
		default: 'getMany',
	},
];

export const deviceFields: INodeProperties[] = [
	// ----------------------------------
	//         device:get
	// ----------------------------------
	{
		displayName: 'Device Serial Number Name or ID',
		name: 'serialNumber',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getDevices',
		},
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['device'],
				operation: ['get'],
			},
		},
		hint: 'Select from dropdown or use an expression for dynamic workflows',
		description: 'The serial number of the BCDR device. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},

	// ----------------------------------
	//         device:getMany
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['device'],
				operation: ['getMany'],
			},
		},
		hint: 'Returns all devices including those from child resellers by default',
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: {
			minValue: 1,
			maxValue: 500,
		},
		default: 50,
		displayOptions: {
			show: {
				resource: ['device'],
				operation: ['getMany'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['device'],
				operation: ['getMany'],
			},
		},
		description: 'Additional options to filter device results',
		options: [
			{
				displayName: 'Show Hidden Devices',
				name: 'showHiddenDevices',
				type: 'boolean',
				default: true,
				hint: 'Hidden devices are typically decommissioned or archived',
				description: 'Whether to include hidden devices in the results',
			},
			{
				displayName: 'Show Child Reseller Devices',
				name: 'showChildResellerDevices',
				type: 'boolean',
				default: true,
				hint: 'Relevant for MSPs with sub-reseller hierarchies',
				description: 'Whether to include devices from child resellers in the results',
			},
			{
				displayName: 'Sort By',
				name: 'sortBy',
				type: 'options',
				default: '',
				options: [
					{ name: 'None', value: '' },
					{ name: 'Name', value: 'name' },
					{ name: 'Last Seen Date', value: 'lastSeenDate' },
					{ name: 'Registration Date', value: 'registrationDate' },
					{ name: 'Model', value: 'model' },
					{ name: 'Service Plan', value: 'servicePlan' },
				],
				description: 'Field to sort results by',
			},
			{
				displayName: 'Sort Order',
				name: 'sortOrder',
				type: 'options',
				default: 'asc',
				options: [
					{ name: 'Ascending', value: 'asc' },
					{ name: 'Descending', value: 'desc' },
				],
				description: 'Sort direction',
			},
		],
	},
];
