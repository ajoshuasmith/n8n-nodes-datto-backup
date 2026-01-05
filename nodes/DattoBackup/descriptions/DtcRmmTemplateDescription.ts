import type { INodeProperties } from 'n8n-workflow';

export const dtcRmmTemplateOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['dtcRmmTemplate'],
			},
		},
		options: [
			{
				name: 'Get Many',
				value: 'getMany',
				description: 'Get all RMM templates',
				action: 'Get many RMM templates',
			},
		],
		default: 'getMany',
	},
];

export const dtcRmmTemplateFields: INodeProperties[] = [
	// No additional fields required - endpoint takes no parameters
];
