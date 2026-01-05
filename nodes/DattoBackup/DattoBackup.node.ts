import type {
	IExecuteFunctions,
	IDataObject,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import {
	dattoApiRequest,
	dattoApiRequestAllItems,
	getDevices,
	getSaasCustomers,
} from './GenericFunctions';

import {
	deviceOperations,
	deviceFields,
	agentOperations,
	agentFields,
	alertOperations,
	alertFields,
	assetOperations,
	assetFields,
	shareOperations,
	shareFields,
	volumeOperations,
	volumeFields,
	vmRestoreOperations,
	vmRestoreFields,
	activityLogOperations,
	activityLogFields,
	saasDomainOperations,
	saasDomainFields,
	saasSeatOperations,
	saasSeatFields,
	saasApplicationOperations,
	saasApplicationFields,
	dtcAssetOperations,
	dtcAssetFields,
	dtcRmmTemplateOperations,
	dtcRmmTemplateFields,
	dtcStoragePoolOperations,
	dtcStoragePoolFields,
} from './descriptions';

export class DattoBackup implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Datto Backup',
		name: 'dattoBackup',
		icon: 'file:dattobackup.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Datto BCDR API for backup monitoring and management',
		defaults: {
			name: 'Datto Backup',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'dattoBackupApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Activity Log',
						value: 'activityLog',
						description: 'User activity audit log',
					},
					{
						name: 'Agent',
						value: 'agent',
						description: 'Backup agents on protected systems',
					},
					{
						name: 'Alert',
						value: 'alert',
						description: 'Device alerts and notifications',
					},
					{
						name: 'Asset',
						value: 'asset',
						description: 'Combined agents and shares for a device',
					},
					{
						name: 'Device',
						value: 'device',
						description: 'BCDR hardware and cloud devices',
					},
					{
						name: 'DTC Asset',
						value: 'dtcAsset',
						description: 'Direct-to-Cloud assets (endpoint backup)',
					},
					{
						name: 'DTC RMM Template',
						value: 'dtcRmmTemplate',
						description: 'RMM deployment templates',
					},
					{
						name: 'DTC Storage Pool',
						value: 'dtcStoragePool',
						description: 'Storage pool usage information',
					},
					{
						name: 'SaaS Application',
						value: 'saasApplication',
						description: 'SaaS Protection backup data',
					},
					{
						name: 'SaaS Domain',
						value: 'saasDomain',
						description: 'SaaS Protection domains',
					},
					{
						name: 'SaaS Seat',
						value: 'saasSeat',
						description: 'SaaS Protection seats',
					},
					{
						name: 'Share',
						value: 'share',
						description: 'Network shares being backed up',
					},
					{
						name: 'VM Restore',
						value: 'vmRestore',
						description: 'Virtual machine restore operations',
					},
					{
						name: 'Volume',
						value: 'volume',
						description: 'Storage volumes on a device',
					},
				],
				default: 'device',
			},
			// Device
			...deviceOperations,
			...deviceFields,
			// Agent
			...agentOperations,
			...agentFields,
			// Alert
			...alertOperations,
			...alertFields,
			// Asset
			...assetOperations,
			...assetFields,
			// Share
			...shareOperations,
			...shareFields,
			// Volume
			...volumeOperations,
			...volumeFields,
			// VM Restore
			...vmRestoreOperations,
			...vmRestoreFields,
			// Activity Log
			...activityLogOperations,
			...activityLogFields,
			// SaaS Domain
			...saasDomainOperations,
			...saasDomainFields,
			// SaaS Seat
			...saasSeatOperations,
			...saasSeatFields,
			// SaaS Application
			...saasApplicationOperations,
			...saasApplicationFields,
			// DTC Asset
			...dtcAssetOperations,
			...dtcAssetFields,
			// DTC RMM Template
			...dtcRmmTemplateOperations,
			...dtcRmmTemplateFields,
			// DTC Storage Pool
			...dtcStoragePoolOperations,
			...dtcStoragePoolFields,
		],
		usableAsTool: true,
	};

	methods = {
		loadOptions: {
			async getDevices(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return getDevices.call(this);
			},
			async getSaasCustomers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return getSaasCustomers.call(this);
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: IDataObject | IDataObject[];

				// ----------------------------------------
				//              device
				// ----------------------------------------
				if (resource === 'device') {
					if (operation === 'get') {
						const serialNumber = this.getNodeParameter('serialNumber', i) as string;
						responseData = await dattoApiRequest.call(
							this,
							'GET',
							`/bcdr/device/${serialNumber}`,
						);
					} else if (operation === 'getMany') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const options = this.getNodeParameter('options', i) as IDataObject;
						const qs: IDataObject = {};

						if (options.showHiddenDevices !== undefined) {
							qs.showHiddenDevices = options.showHiddenDevices ? '1' : '0';
						}
						if (options.showChildResellerDevices !== undefined) {
							qs.showChildResellerDevices = options.showChildResellerDevices ? '1' : '0';
						}

						if (returnAll) {
							responseData = await dattoApiRequestAllItems.call(
								this,
								'GET',
								'/bcdr/device',
								{},
								qs,
							);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							qs._perPage = limit;
							const response = (await dattoApiRequest.call(
								this,
								'GET',
								'/bcdr/device',
								{},
								qs,
							)) as IDataObject;
							responseData = (response.items as IDataObject[]) || [];
						}
					} else {
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
					}
				}

				// ----------------------------------------
				//              agent
				// ----------------------------------------
				else if (resource === 'agent') {
					if (operation === 'getMany') {
						const serialNumber = this.getNodeParameter('serialNumber', i) as string;
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;

						if (returnAll) {
							responseData = await dattoApiRequestAllItems.call(
								this,
								'GET',
								`/bcdr/device/${serialNumber}/asset/agent`,
							);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							const response = (await dattoApiRequest.call(
								this,
								'GET',
								`/bcdr/device/${serialNumber}/asset/agent`,
								{},
								{ _perPage: limit },
							)) as IDataObject;
							responseData = (response.items as IDataObject[]) || [];
						}
					} else {
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
					}
				}

				// ----------------------------------------
				//              alert
				// ----------------------------------------
				else if (resource === 'alert') {
					if (operation === 'getMany') {
						const serialNumber = this.getNodeParameter('serialNumber', i) as string;
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;

						if (returnAll) {
							responseData = await dattoApiRequestAllItems.call(
								this,
								'GET',
								`/bcdr/device/${serialNumber}/alert`,
							);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							const response = (await dattoApiRequest.call(
								this,
								'GET',
								`/bcdr/device/${serialNumber}/alert`,
								{},
								{ _perPage: limit },
							)) as IDataObject;
							responseData = (response.items as IDataObject[]) || [];
						}
					} else {
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
					}
				}

				// ----------------------------------------
				//              asset
				// ----------------------------------------
				else if (resource === 'asset') {
					if (operation === 'getMany') {
						const serialNumber = this.getNodeParameter('serialNumber', i) as string;
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;

						if (returnAll) {
							responseData = await dattoApiRequestAllItems.call(
								this,
								'GET',
								`/bcdr/device/${serialNumber}/asset`,
							);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							const response = (await dattoApiRequest.call(
								this,
								'GET',
								`/bcdr/device/${serialNumber}/asset`,
								{},
								{ _perPage: limit },
							)) as IDataObject;
							responseData = (response.items as IDataObject[]) || [];
						}
					} else {
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
					}
				}

				// ----------------------------------------
				//              share
				// ----------------------------------------
				else if (resource === 'share') {
					if (operation === 'getMany') {
						const serialNumber = this.getNodeParameter('serialNumber', i) as string;
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;

						if (returnAll) {
							responseData = await dattoApiRequestAllItems.call(
								this,
								'GET',
								`/bcdr/device/${serialNumber}/asset/share`,
							);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							const response = (await dattoApiRequest.call(
								this,
								'GET',
								`/bcdr/device/${serialNumber}/asset/share`,
								{},
								{ _perPage: limit },
							)) as IDataObject;
							responseData = (response.items as IDataObject[]) || [];
						}
					} else {
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
					}
				}

				// ----------------------------------------
				//              volume
				// ----------------------------------------
				else if (resource === 'volume') {
					if (operation === 'get') {
						const serialNumber = this.getNodeParameter('serialNumber', i) as string;
						const volumeName = this.getNodeParameter('volumeName', i) as string;
						responseData = await dattoApiRequest.call(
							this,
							'GET',
							`/bcdr/device/${serialNumber}/asset/volume`,
							{},
							{ volumeName },
						);
					} else {
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
					}
				}

				// ----------------------------------------
				//              vmRestore
				// ----------------------------------------
				else if (resource === 'vmRestore') {
					if (operation === 'getMany') {
						const serialNumber = this.getNodeParameter('serialNumber', i) as string;
						responseData = await dattoApiRequest.call(
							this,
							'GET',
							`/bcdr/device/${serialNumber}/vm-restores`,
						);
						// Normalize response to array
						if (!Array.isArray(responseData)) {
							responseData = (responseData as IDataObject).items as IDataObject[] || [responseData];
						}
					} else {
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
					}
				}

				// ----------------------------------------
				//              activityLog
				// ----------------------------------------
				else if (resource === 'activityLog') {
					if (operation === 'getMany') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const filters = this.getNodeParameter('filters', i) as IDataObject;
						const qs: IDataObject = {};

						if (filters.clientName) {
							qs.clientName = filters.clientName;
						}
						if (filters.since) {
							qs.since = filters.since;
						}
						if (filters.sinceUnits) {
							qs.sinceUnits = filters.sinceUnits;
						}
						if (filters.targetType) {
							qs.targetType = filters.targetType;
						}
						if (filters.user) {
							qs.user = filters.user;
						}

						if (returnAll) {
							responseData = await dattoApiRequestAllItems.call(
								this,
								'GET',
								'/report/activity-log',
								{},
								qs,
							);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							qs._perPage = limit;
							const response = (await dattoApiRequest.call(
								this,
								'GET',
								'/report/activity-log',
								{},
								qs,
							)) as IDataObject;
							responseData = (response.items as IDataObject[]) || [];
						}
					} else {
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
					}
				}

				// ----------------------------------------
				//              saasDomain
				// ----------------------------------------
				else if (resource === 'saasDomain') {
					if (operation === 'getMany') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;

						if (returnAll) {
							responseData = await dattoApiRequestAllItems.call(
								this,
								'GET',
								'/saas/domains',
							);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							const response = (await dattoApiRequest.call(
								this,
								'GET',
								'/saas/domains',
								{},
								{ _perPage: limit },
							)) as IDataObject;
							responseData = (response.items as IDataObject[]) || [];
						}
					} else {
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
					}
				}

				// ----------------------------------------
				//              saasSeat
				// ----------------------------------------
				else if (resource === 'saasSeat') {
					if (operation === 'getMany') {
						const saasCustomerId = this.getNodeParameter('saasCustomerId', i) as string;
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;

						if (returnAll) {
							responseData = await dattoApiRequestAllItems.call(
								this,
								'GET',
								`/saas/${saasCustomerId}/seats`,
							);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							const response = (await dattoApiRequest.call(
								this,
								'GET',
								`/saas/${saasCustomerId}/seats`,
								{},
								{ _perPage: limit },
							)) as IDataObject;
							responseData = (response.items as IDataObject[]) || [];
						}
					} else {
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
					}
				}

				// ----------------------------------------
				//              saasApplication
				// ----------------------------------------
				else if (resource === 'saasApplication') {
					if (operation === 'getMany') {
						const saasCustomerId = this.getNodeParameter('saasCustomerId', i) as string;
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;

						if (returnAll) {
							responseData = await dattoApiRequestAllItems.call(
								this,
								'GET',
								`/saas/${saasCustomerId}/applications`,
							);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							const response = (await dattoApiRequest.call(
								this,
								'GET',
								`/saas/${saasCustomerId}/applications`,
								{},
								{ _perPage: limit },
							)) as IDataObject;
							responseData = (response.items as IDataObject[]) || [];
						}
					} else {
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
					}
				}

				// ----------------------------------------
				//              dtcAsset
				// ----------------------------------------
				else if (resource === 'dtcAsset') {
					if (operation === 'get') {
						const clientId = this.getNodeParameter('clientId', i) as string;
						const assetUuid = this.getNodeParameter('assetUuid', i) as string;
						responseData = await dattoApiRequest.call(
							this,
							'GET',
							`/dtc/${clientId}/assets/${assetUuid}`,
						);
					} else if (operation === 'getMany') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;

						if (returnAll) {
							responseData = await dattoApiRequestAllItems.call(
								this,
								'GET',
								'/dtc/assets',
							);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							const response = (await dattoApiRequest.call(
								this,
								'GET',
								'/dtc/assets',
								{},
								{ _perPage: limit },
							)) as IDataObject;
							responseData = (response.items as IDataObject[]) || [];
						}
					} else if (operation === 'getManyByClient') {
						const clientId = this.getNodeParameter('clientId', i) as string;
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;

						if (returnAll) {
							responseData = await dattoApiRequestAllItems.call(
								this,
								'GET',
								`/dtc/${clientId}/assets`,
							);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							const response = (await dattoApiRequest.call(
								this,
								'GET',
								`/dtc/${clientId}/assets`,
								{},
								{ _perPage: limit },
							)) as IDataObject;
							responseData = (response.items as IDataObject[]) || [];
						}
					} else {
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
					}
				}

				// ----------------------------------------
				//              dtcRmmTemplate
				// ----------------------------------------
				else if (resource === 'dtcRmmTemplate') {
					if (operation === 'getMany') {
						responseData = await dattoApiRequest.call(
							this,
							'GET',
							'/dtc/rmm-templates',
						);
						// Normalize response to array
						if (!Array.isArray(responseData)) {
							responseData = (responseData as IDataObject).items as IDataObject[] || [responseData];
						}
					} else {
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
					}
				}

				// ----------------------------------------
				//              dtcStoragePool
				// ----------------------------------------
				else if (resource === 'dtcStoragePool') {
					if (operation === 'getMany') {
						responseData = await dattoApiRequest.call(
							this,
							'GET',
							'/dtc/storage-pool',
						);
						// Normalize response to array
						if (!Array.isArray(responseData)) {
							responseData = (responseData as IDataObject).items as IDataObject[] || [responseData];
						}
					} else {
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
					}
				} else {
					throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`);
				}

				// Handle response
				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
