import type {
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class DattoBackupApi implements ICredentialType {
	name = 'dattoBackupApi';

	displayName = 'Datto Backup API';

	documentationUrl = 'https://portal.dattobackup.com/integrations/api';

	icon = {
		light: 'file:../nodes/DattoBackup/dattobackup.svg',
		dark: 'file:../nodes/DattoBackup/dattobackup.svg',
	} as const;

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.datto.com/v1',
			url: '/bcdr/device',
			method: 'GET',
			qs: {
				_perPage: 1,
			},
			auth: {
				username: '={{$credentials.publicKey}}',
				password: '={{$credentials.secretKey}}',
			},
		},
	};

	properties: INodeProperties[] = [
		{
			displayName: 'Public API Key',
			name: 'publicKey',
			type: 'string',
			default: '',
			required: true,
			description: 'The Public API Key from Datto Partner Portal (Admin > Integrations > API Keys)',
		},
		{
			displayName: 'Secret API Key',
			name: 'secretKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'The Secret API Key from Datto Partner Portal (Admin > Integrations > API Keys)',
		},
	];

}
