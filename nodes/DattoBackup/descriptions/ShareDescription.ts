import type { INodeProperties } from 'n8n-workflow';

export const shareOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['share'],
			},
		},
		options: [
			{
				name: 'Get Many',
				value: 'getMany',
				description: 'Get all shares for a BCDR device',
				action: 'Get many shares',
			},
		],
		default: 'getMany',
	},
];

export const shareFields: INodeProperties[] = [
	// ----------------------------------
	//         share:getMany
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
				resource: ['share'],
				operation: ['getMany'],
			},
		},
		description: 'The serial number of the BCDR device. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['share'],
				operation: ['getMany'],
			},
		},
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: {
			minValue: 1,
		},
		default: 50,
		displayOptions: {
			show: {
				resource: ['share'],
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
				resource: ['share'],
				operation: ['getMany'],
			},
		},
		description: 'Additional options',
		options: [
			{
				displayName: 'Sort By',
				name: 'sortBy',
				type: 'options',
				default: '',
				options: [
					{ name: 'None', value: '' },
					{ name: 'Name', value: 'name' },
					{ name: 'Last Snapshot', value: 'lastSnapshot' },
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
