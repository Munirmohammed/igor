import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const agents = await prisma.agent.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ agents });
}

export async function POST(req: Request) {
  try {
    const { name, extension, status } = await req.json();
    if (!name || !extension) return NextResponse.json({ error: 'name and extension are required' }, { status: 400 });
    const agent = await prisma.agent.create({ data: { name, extension, status: status ?? 'online' } });
    return NextResponse.json({ success: true, agent });
  } catch (e: any) {
    if (e.code === 'P2002') return NextResponse.json({ error: 'Extension already in use' }, { status: 409 });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();
    if (!id || !status) return NextResponse.json({ error: 'id and status are required' }, { status: 400 });
    const agent = await prisma.agent.update({ where: { id }, data: { status } });
    return NextResponse.json({ success: true, agent });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
