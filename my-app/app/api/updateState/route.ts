import { NextResponse } from 'next/server';
import { globalState } from '../../lib/state';

export async function POST(request: Request) {
  const body = await request.json();

  if (typeof body.shutdown === 'boolean') {
    globalState.isShutdown = body.shutdown;
    console.log(`[Server] isShutdown = ${globalState.isShutdown}`);
  }

  return NextResponse.json({ success: true, isShutdown: globalState.isShutdown });
}
