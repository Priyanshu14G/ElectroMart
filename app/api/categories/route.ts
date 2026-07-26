import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const CATEGORY_META: Record<string, string> = {
  battery: 'Batteries',
  capacitor: 'Capacitors',
  resistor: 'Resistors',
  diode: 'Diodes',
  ic: 'ICs & Chips',
  microcontroller: 'Microcontrollers',
  connector: 'Connectors',
  sensor: 'Sensors',
  led: 'LEDs',
  motor: 'Motors',
  display: 'Displays',
  relay: 'Relays',
  mosfet: 'MOSFETs',
  transformer: 'Transformers',
  switch: 'Switches',
  inductor: 'Inductors',
  crystal: 'Crystals',
  fuse: 'Fuses',
  pcb: 'PCBs',
  cable: 'Cables',
  development_board: 'Dev Boards',
  robotics: 'Robotics Kits',
  iot: 'IoT Modules',
  rf_component: 'RF Components',
  test_equipment: 'Test Equipment',
  embedded_board: 'Embedded Boards',
  power_electronics: 'Power Electronics',
  industrial_automation: 'Industrial Automation',
  passive_component: 'Passive Components',
  semiconductor: 'Semiconductors',
  other: 'Other',
};

export async function GET() {
  try {
    // Get product counts per category from DB
    const categoryCounts = await prisma.product.groupBy({
      by: ['category'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    const categories = categoryCounts.map((c) => ({
      id: c.category,
      name: CATEGORY_META[c.category] || c.category,
      count: c._count.id,
    }));

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Categories API error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
