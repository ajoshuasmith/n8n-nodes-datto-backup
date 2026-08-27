import type { INodeProperties } from 'n8n-workflow';

export const customOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['custom'],
			},
		},
		options: [
			{
				name: 'Request',
				value: 'request',
				description: 'Make a raw authenticated request to any Datto API endpoint',
				action: 'Make a raw API request',
			},
		],
		default: 'request',
	},
];

export const customFields: INodeProperties[] = [
	{
		displayName: 'Method',
		name: 'method',
		type: 'options',
		options: [
			{ name: 'DELETE', value: 'DELETE' },
			{ name: 'GET', value: 'GET' },
			{ name: 'PATCH', value: 'PATCH' },
			{ name: 'POST', value: 'POST' },
			{ name: 'PUT', value: 'PUT' },
		],
		default: 'GET',
		displayOptions: { show: { resource: ['custom'], operation: ['request'] } },
		description: 'HTTP method to use',
	},
	{
		displayName: 'Path',
		name: 'path',
		type: 'string',
		required: true,
		default: '',
		placeholder: '/saas/{customerId}/seats',
		hint: 'Path relative to https://api.datto.com/v1 — must start with /',
		displayOptions: { show: { resource: ['custom'], operation: ['request'] } },
		description: 'Path appended to the Datto API base URL (https://api.datto.com/v1)',
	},
	{
		displayName: 'Query Parameters (JSON)',
		name: 'queryString',
		type: 'json',
		default: '{}',
		typeOptions: { rows: 3 },
		displayOptions: { show: { resource: ['custom'], operation: ['request'] } },
		description: 'JSON object of query string parameters',
	},
	{
		displayName: 'Body (JSON)',
		name: 'body',
		type: 'json',
		default: '{}',
		typeOptions: { rows: 5 },
		displayOptions: {
			show: {
				resource: ['custom'],
				operation: ['request'],
				method: ['POST', 'PUT', 'PATCH', 'DELETE'],
			},
		},
		description: 'JSON request body',
	},
];
