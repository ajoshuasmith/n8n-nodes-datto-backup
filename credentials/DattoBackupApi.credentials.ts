import type {
	IAuthenticateGeneric,
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

	// Tell n8n how to authenticate requests using this credential
	// This is used by both the test button AND httpRequestWithAuthentication
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			auth: {
				username: '={{$credentials.publicKey}}',
				password: '={{$credentials.secretKey}}',
			},
		},
	};

	// Simple declarative test request - uses the authenticate block above
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.datto.com/v1',
			url: '/bcdr/device',
			method: 'GET',
			qs: {
				_page: 1,
				_perPage: 1,
			},
		},
	};
}
