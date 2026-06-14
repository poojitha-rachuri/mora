const RINGG_BASE_URL = 'https://prod-api.ringg.ai/ca/api/v0';

export class RinggClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: Record<string, unknown> | FormData
  ): Promise<T> {
    const headers: Record<string, string> = {
      'X-API-KEY': this.apiKey,
    };

    let bodyContent: BodyInit | undefined;
    if (body instanceof FormData) {
      bodyContent = body;
    } else if (body) {
      headers['Content-Type'] = 'application/json';
      bodyContent = JSON.stringify(body);
    }

    const response = await fetch(`${RINGG_BASE_URL}${path}`, {
      method,
      headers,
      body: bodyContent,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => response.statusText);
      throw new Error(`Ringg.ai API error ${response.status}: ${text}`);
    }

    return response.json() as Promise<T>;
  }

  async getAssistants(): Promise<unknown[]> {
    return this.request<unknown[]>('GET', '/agent/v1');
  }

  async getNumbers(): Promise<unknown[]> {
    return this.request<unknown[]>('GET', '/number/v1');
  }

  async createCampaign(params: {
    name: string;
    contacts: Array<{ mobile_number: string; name?: string; [key: string]: string | undefined }>;
  }): Promise<{ list_id: string; campaign_id: string }> {
    const formData = new FormData();

    // Create CSV content
    const headers = Object.keys(params.contacts[0] ?? { mobile_number: '', name: '' });
    const csvLines = [
      headers.join(','),
      ...params.contacts.map((c) =>
        headers.map((h) => `"${(c[h] ?? '').replace(/"/g, '""')}"`).join(',')
      ),
    ];
    const csvBlob = new Blob([csvLines.join('\n')], { type: 'text/csv' });
    formData.append('file', csvBlob, `${params.name}.csv`);
    formData.append('name', params.name);

    return this.request('POST', '/campaign/save', formData);
  }

  async startCampaign(params: {
    agentId: string;
    listId: string;
    fromNumberId: string;
    callbackUrl?: string;
  }): Promise<{ success: boolean; campaign_id: string }> {
    return this.request('POST', '/campaign/start', {
      agent_id: params.agentId,
      list_id: params.listId,
      from_number_id: params.fromNumberId,
      callback_url: params.callbackUrl,
    });
  }

  async getCampaigns(): Promise<unknown[]> {
    return this.request<unknown[]>('GET', '/campaign/v1');
  }

  async getCallHistory(
    bulkListId: string,
    limit = 100,
    offset = 0
  ): Promise<{ calls: unknown[]; total: number }> {
    return this.request('GET', `/calling/history?bulk_list_id=${bulkListId}&limit=${limit}&offset=${offset}`);
  }

  async terminateCampaign(campaignId: string): Promise<{ success: boolean }> {
    return this.request('POST', `/campaign/terminate/${campaignId}`);
  }

  async setupWebhooks(params: {
    agentId: string;
    callbackUrl: string;
  }): Promise<{ success: boolean }> {
    await this.request('PATCH', '/agent/v1', {
      agent_id: params.agentId,
      operation: 'edit_event_subscriptions',
      event_subscriptions: [
        {
          callback_url: params.callbackUrl,
          event_type: ['call_started', 'call_completed', 'all_processing_completed'],
        },
      ],
    });
    return { success: true };
  }

  async pushPrompt(params: {
    agentId: string;
    agentPrompt: string;
  }): Promise<{ success: boolean }> {
    await this.request('PATCH', '/agent/v1', {
      agent_id: params.agentId,
      operation: 'edit_prompt',
      agent_prompt: params.agentPrompt,
    });
    return { success: true };
  }

  async pushCustomAnalysis(params: {
    agentId: string;
    customAnalysisPrompt: Record<string, string>;
  }): Promise<{ success: boolean }> {
    await this.request('PATCH', '/agent/v1', {
      agent_id: params.agentId,
      operation: 'edit_custom_analysis_prompt',
      custom_analysis_prompt: params.customAnalysisPrompt,
    });
    return { success: true };
  }
}

export const ringg = new RinggClient(process.env.RINGG_API_KEY ?? '');
