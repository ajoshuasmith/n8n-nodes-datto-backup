import type { INodeProperties } from 'n8n-workflow';

export const dtcStoragePoolOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['dtcStoragePool'],
			},
		},
		options: [
			{
				name: 'Get Many',
				value: 'getMany',
				description: 'Get storage pool usage by pool name',
				action: 'Get many storage pools',
			},
		],
		default: 'getMany',
	},
];

export const dtcStoragePoolFields: INodeProperties[] = [
	// No additional fields required - endpoint takes no parameters
];
