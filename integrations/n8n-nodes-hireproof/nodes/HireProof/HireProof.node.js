const { buildAuditRequestOptions } = require('../../lib/hireproof-request')

class HireProof {
  constructor() {
    this.description = {
      displayName: 'HireProof',
      name: 'hireProof',
      icon: 'file:hireproof.svg',
      group: ['transform'],
      version: 1,
      subtitle: '={{$parameter["operation"]}}',
      description: 'Run HireProof job-safety audits before automated job workflows continue.',
      defaults: {
        name: 'HireProof',
      },
      inputs: ['main'],
      outputs: ['main'],
      credentials: [
        {
          name: 'hireProofApi',
          required: true,
        },
      ],
      properties: [
        {
          displayName: 'Operation',
          name: 'operation',
          type: 'options',
          noDataExpression: true,
          options: [
            {
              name: 'Run Audit',
              value: 'runAudit',
              description: 'Run a synchronous HireProof audit and return an AuditReport',
              action: 'Run a job-safety audit',
            },
            {
              name: 'Run Async Audit',
              value: 'runAsyncAudit',
              description: 'Start an audit and deliver the report to a webhook_url',
              action: 'Start an async job-safety audit',
            },
          ],
          default: 'runAudit',
        },
        {
          displayName: 'Text',
          name: 'text',
          type: 'string',
          typeOptions: {
            rows: 5,
          },
          default: '',
          required: true,
          description: 'Job post, recruiter message, OCR text, or URL description to audit.',
        },
        {
          displayName: 'Location',
          name: 'location',
          type: 'string',
          default: '',
          description: 'Optional location context for local-presence and salary checks.',
        },
        {
          displayName: 'Mode',
          name: 'mode',
          type: 'options',
          options: [
            {
              name: 'Demo',
              value: 'demo',
              description: 'Use deterministic demo fixtures.',
            },
            {
              name: 'Live',
              value: 'live',
              description: 'Use live provider credentials configured on the target deployment/account.',
            },
          ],
          default: 'demo',
        },
        {
          displayName: 'Webhook URL',
          name: 'webhookUrl',
          type: 'string',
          default: '',
          required: true,
          displayOptions: {
            show: {
              operation: ['runAsyncAudit'],
            },
          },
          description: 'Callback URL that receives the completed signed AuditReport.',
        },
      ],
    }
  }

  async execute() {
    const items = this.getInputData()
    const returnData = []
    const credentials = await this.getCredentials('hireProofApi')

    for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
      const operation = this.getNodeParameter('operation', itemIndex)
      const text = this.getNodeParameter('text', itemIndex)
      const location = this.getNodeParameter('location', itemIndex, '')
      const mode = this.getNodeParameter('mode', itemIndex, 'demo')
      const webhookUrl = operation === 'runAsyncAudit'
        ? this.getNodeParameter('webhookUrl', itemIndex)
        : ''

      const requestOptions = buildAuditRequestOptions({
        baseUrl: credentials.baseUrl,
        apiKey: credentials.apiKey,
        text,
        location,
        mode,
        webhookUrl,
      })

      const response = await this.helpers.request(requestOptions)
      returnData.push({ json: response, pairedItem: { item: itemIndex } })
    }

    return [returnData]
  }
}

module.exports = {
  HireProof,
}
