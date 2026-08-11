import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { mockCategories } from '@/lib/mock-data';

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

function withTimeout<T>(promise: Promise<T>, ms = 500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), ms)),
  ]);
}

export async function GET() {
  try {
    // Get product categories from MongoDB
    const products = await withTimeout(
      prisma.product.findMany({
        select: { category: true },
      })
    );

    const categoryMap: Record<string, number> = {};
    products.forEach((p) => {
      if (p.category) {
        categoryMap[p.category] = (categoryMap[p.category] || 0) + 1;
      }
    });

    const categories = Object.entries(categoryMap)
      .map(([cat, count]) => ({
        id: cat,
        name: CATEGORY_META[cat] || cat,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    if (categories.length === 0) {
      return NextResponse.json({ categories: mockCategories });
    }

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Categories API error, returning mock categories:', error);
    return NextResponse.json({ categories: mockCategories });
  }
}
