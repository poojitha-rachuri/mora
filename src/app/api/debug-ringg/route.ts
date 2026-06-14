import { NextResponse } from 'next/server';
import { ringg } from '@/lib/ringg';

function cleanKey(val: string | undefined): string {
  return (val ?? '').replace(/^﻿/, '').trim();
}

export async function GET() {
  const keyRaw = process.env.RINGG_API_KEY ?? '';
  const keyCleaned = cleanKey(keyRaw);

  const info = {
    rawLen: keyRaw.length,
    rawFirstChar: keyRaw.charCodeAt(0),
    cleanedLen: keyCleaned.length,
    cleanedFirstChar: keyCleaned.charCodeAt(0),
    agentId: process.env.RINGG_AGENT_ID ?? '(not set)',
    fromNumberId: process.env.RINGG_FROM_NUMBER_ID ?? '(not set)',
  };

  // Test 1: get agents
  let agentsResult: unknown = null;
  let agentsError: string | null = null;
  try {
    agentsResult = await ringg.getAssistants();
  } catch (err) {
    agentsError = err instanceof Error ? err.message : String(err);
  }

  // Test 2: create a test campaign
  let campaignResult: unknown = null;
  let campaignError: string | null = null;
  try {
    campaignResult = await ringg.createCampaign({
      name: 'MORA Debug Test',
      contacts: [{ mobile_number: '919999999999', name: 'Test User' }],
    });
  } catch (err) {
    campaignError = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json({
    info,
    agents: { result: agentsResult, error: agentsError },
    campaign: { result: campaignResult, error: campaignError },
  });
}
