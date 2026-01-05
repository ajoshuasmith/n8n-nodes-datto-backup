import type { INodeProperties } from 'n8n-workflow';

export const saasApplicationOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['saasApplication'],
			},
		},
		options: [
			{
				name: 'Get Many',
				value: 'getMany',
				description: 'Get SaaS Protection backup data for a customer',
				action: 'Get many saa s applications',
			},
		],
		default: 'getMany',
	},
];

export const saasApplicationFields: INodeProperties[] = [
	// ----------------------------------
	//         saasApplication:getMany
	// ----------------------------------
	{
		displayName: 'SaaS Customer Name or ID',
		name: 'saasCustomerId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getSaasCustomers',
		},
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['saasApplication'],
				operation: ['getMany'],
			},
		},
		hint: 'Select from dropdown or use an expression for dynamic workflows',
		description: 'The SaaS Protection customer. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['saasApplication'],
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
				resource: ['saasApplication'],
				operation: ['getMany'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	},
];
