import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export async function GET() {
  const rates = await redis.get('gold_rates');
  return NextResponse.json({ rates });
}