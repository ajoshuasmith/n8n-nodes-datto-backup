import type { INodeProperties } from 'n8n-workflow';

export const activityLogOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['activityLog'],
			},
		},
		options: [
			{
				name: 'Get Many',
				value: 'getMany',
				description: 'Get activity log entries',
				action: 'Get many activity log entries',
			},
		],
		default: 'getMany',
	},
];

export const activityLogFields: INodeProperties[] = [
	// ----------------------------------
	//         activityLog:getMany
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['activityLog'],
				operation: ['getMany'],
			},
		},
		hint: 'Use filters to reduce the dataset for better performance',
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
				resource: ['activityLog'],
				operation: ['getMany'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['activityLog'],
				operation: ['getMany'],
			},
		},
		description: 'Filter activity log entries to reduce response size',
		options: [
			{
				displayName: 'Client Name',
				name: 'clientName',
				type: 'string',
				default: '',
				placeholder: 'e.g., Acme Corp',
				description: 'Filter by client/organization name',
			},
			{
				displayName: 'Since',
				name: 'since',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 1,
				hint: 'Use with "Since Units" to define time range',
				description: 'Filter to entries within the last N time units (e.g., last 7 days)',
			},
			{
				displayName: 'Since Units',
				name: 'sinceUnits',
				type: 'options',
				options: [
					{
						name: 'Days',
						value: 'days',
					},
					{
						name: 'Hours',
						value: 'hours',
					},
					{
						name: 'Minutes',
						value: 'minutes',
					},
				],
				default: 'days',
				description: 'Time unit for the "Since" filter',
			},
			{
				displayName: 'Target Type',
				name: 'targetType',
				type: 'string',
				default: '',
				placeholder: 'e.g., device, agent',
				description: 'Filter by the type of object affected',
			},
			{
				displayName: 'User',
				name: 'user',
				type: 'string',
				default: '',
				placeholder: 'e.g., user@example.com',
				description: 'Filter by the user who performed the action',
			},
		],
	},
];
