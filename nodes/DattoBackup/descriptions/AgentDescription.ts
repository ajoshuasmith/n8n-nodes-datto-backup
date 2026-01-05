import type { INodeProperties } from 'n8n-workflow';

export const agentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['agent'],
			},
		},
		options: [
			{
				name: 'Get Many',
				value: 'getMany',
				description: 'Get all agents for a BCDR device',
				action: 'Get many agents',
			},
		],
		default: 'getMany',
	},
];

export const agentFields: INodeProperties[] = [
	// ----------------------------------
	//         agent:getMany
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
				resource: ['agent'],
				operation: ['getMany'],
			},
		},
		hint: 'The BCDR appliance that manages these agents',
		description: 'The serial number of the BCDR device. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['agent'],
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
			maxValue: 500,
		},
		default: 50,
		displayOptions: {
			show: {
				resource: ['agent'],
				operation: ['getMany'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	},
];
