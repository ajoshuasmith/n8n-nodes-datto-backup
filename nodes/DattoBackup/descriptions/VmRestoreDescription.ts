import type { INodeProperties } from 'n8n-workflow';

export const vmRestoreOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['vmRestore'],
			},
		},
		options: [
			{
				name: 'Get Many',
				value: 'getMany',
				description: 'Get all VM restores for a BCDR device',
				action: 'Get many VM restores',
			},
		],
		default: 'getMany',
	},
];

export const vmRestoreFields: INodeProperties[] = [
	// ----------------------------------
	//         vmRestore:getMany
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
				resource: ['vmRestore'],
				operation: ['getMany'],
			},
		},
		hint: 'Lists all VM restore operations (past and active) for this device',
		description: 'The serial number of the BCDR device. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
];
