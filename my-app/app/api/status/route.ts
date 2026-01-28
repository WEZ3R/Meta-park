import { NextResponse } from 'next/server';
import { globalState } from '../../lib/state';

export async function GET() {
  return NextResponse.json({ isShutdown: globalState.isShutdown });
}
