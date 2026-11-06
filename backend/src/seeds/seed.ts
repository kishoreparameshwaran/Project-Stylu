import { db, initializeDatabase } from '../config/database';
import fs from 'fs';
import path from 'path';

async function seed() {
  await initializeDatabase();

  console.log('🌱 Seeding database...\n');

  // Seed Judges
  const judges = [
    {
      slug: 'mall-cop',
      channel_no: 1,
      name: '90s MALL COP',
      persona_prompt: 'You are a strict 90s mall security guard who takes fashion very seriously. Reference mall culture, cargo shorts violations, and "no shirt no shoes no service" energy. You have zero tolerance for sloppy fits but respect mall rat aesthetic when done right. Use cop radio codes occasionally.',
      severity: 6,
      sort_order: 1
    },
    {
      slug: 'harajuku-elite',
      channel_no: 2,
      name: 'HARAJUKU ELITE',
      persona_prompt: 'You are an avant-garde Tokyo street fashion connoisseur. You worship experimental silhouettes, bold color blocking, and fearless layering. Mainstream boring fits get instant dismissal. Reference Harajuku districts, Japanese streetwear brands, and the importance of "kawaii with edge".',
      severity: 8,
      sort_order: 2
    },
    {
      slug: 'vintage-thrift-king',
      channel_no: 3,
      name: 'VINTAGE THRIFT KING',
      persona_prompt: 'You are a vintage clothing archaeologist and thrift store guru. You can spot fast fashion from a mile away. You celebrate worn-in textures, retro cuts, and sustainable style. Reference thrift bins, estate sales, and the sin of wearing H&M. Bonus points for visible mending and 70s-90s pieces.',
      severity: 7,
      sort_order: 3
    },
    {
      slug: 'strict-auntie',
      channel_no: 4,
      name: 'STRICT AUNTIE',
      persona_prompt: 'You are everyone\'s judgmental auntie at the family gathering. You care about modesty, matching, and "looking presentable". Wrinkles are unacceptable. Clashing colors hurt your soul. But you secretly respect bold confidence. Use auntie phrases like "is that what young people wear now?" and "you\'re going out like that?"',
      severity: 5,
      sort_order: 4
    },
    {
      slug: 'runway-czar',
      channel_no: 5,
      name: 'RUNWAY CZAR',
      persona_prompt: 'You are a brutal high fashion critic who lives for couture and runway excellence. Reference designer names, fashion weeks, and the importance of "editorial energy". You have no mercy for basics or safe choices. Streetwear must be elevated. Everything is judged against Paris, Milan, and New York runways.',
      severity: 9,
      sort_order: 5
    }
  ];

  for (const judge of judges) {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO judges (slug, channel_no, name, persona_prompt, severity, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.bind([
      judge.slug,
      judge.channel_no,
      judge.name,
      judge.persona_prompt,
      judge.severity,
      judge.sort_order
    ]);
    stmt.step();
    stmt.free();
  }

  console.log(`✓ Seeded ${judges.length} judges`);

  // Seed Dresscodes
  const dresscodes = [
    {
      day_index: 0,
      day: 'MON',
      full_name: 'MONDAY',
      title: 'NEO-TAILORED',
      score_pct: 88,
      description: 'Sharp blazers, pleated wide-leg trousers, and sleek structured leather accessories.',
      rule: 'Keep silhouette sharp; cuff clean & tuck shirt line',
      crime: 'Wrinkled collars or unpolished footwear',
      swatches: JSON.stringify(['#006194', '#3f4850', '#eae1d2']),
      items: 'Sharp structured blazer, pleated wide trousers, leather tote.',
      status: 'APPROVED'
    },
    {
      day_index: 1,
      day: 'TUE',
      full_name: 'TUESDAY',
      title: 'WASHED DENIM GOD',
      score_pct: 94,
      description: 'Double denim ensemble with faded vintage wash, boxy tee, and chunky dark loafers.',
      rule: 'Ensure distinct contrasting denim tones or strict matching set',
      crime: 'Skinny jeans or overly distress knee rips',
      swatches: JSON.stringify(['#0284c7', '#e0f2fe', '#1f1b15']),
      items: 'Layered washed denim, boxy tee, chunky loafers.',
      status: 'LOCKED IN'
    },
    {
      day_index: 2,
      day: 'WED',
      full_name: 'WEDNESDAY',
      title: 'CYBER UTILITY',
      score_pct: 86,
      description: 'Tactical olive cargos, modular chest rig/harness, and silver industrial link chains.',
      rule: 'Balance high pocket count with clean unadorned upper layer',
      crime: 'Neon safety vests without aesthetic cohesion',
      swatches: JSON.stringify(['#4d5f47', '#8c7865', '#17130e']),
      items: 'Olive cargos, tactical harness vest, silver link chains.',
      status: 'MANDATORY'
    },
    {
      day_index: 3,
      day: 'THU',
      full_name: 'THURSDAY',
      title: 'TOASTED KNITWEAR',
      score_pct: 91,
      description: 'Earth-tone mohair sweater, relaxed wide corduroy pants, and minimal suede mules.',
      rule: 'Textural contrast is paramount; pair fuzzy knit with rigid ribbing',
      crime: 'Synthetic scratchy polyester fleece blends',
      swatches: JSON.stringify(['#785a3c', '#f4dfca', '#3f4850']),
      items: 'Earth-tone mohair sweater, relaxed corduroy trousers.',
      status: 'APPROVED'
    },
    {
      day_index: 4,
      day: 'FRI',
      full_name: 'FRIDAY',
      title: 'BIKER REBEL',
      score_pct: 96,
      description: 'Distressed vintage leather motorcycle jacket, band tee, and heavy lug combat boots.',
      rule: 'Hardware silver zippers must catch light; broken-in patina required',
      crime: 'Brand new faux plastic pleather sheen',
      swatches: JSON.stringify(['#3b2b23', '#1f1b15', '#ba1a1a']),
      items: 'Distressed leather bomber, vintage tee, heavy combat boots.',
      status: 'ELITE PICK'
    },
    {
      day_index: 5,
      day: 'SAT',
      full_name: 'SATURDAY',
      title: 'STREET RUNNER',
      score_pct: 89,
      description: 'Cropped heavyweight zip hoodie, tonal relaxed nylon track pants, and chunky runners.',
      rule: 'Stack socks neatly over sneaker collars with 90s proportions',
      crime: 'Gym rat neon ankle compression socks',
      swatches: JSON.stringify(['#1e3a5f', '#38bdf8', '#dfd0bc']),
      items: 'Cropped zip hoodie, tonal track pants, chunky retro sneakers.',
      status: 'APPROVED'
    },
    {
      day_index: 6,
      day: 'SUN',
      full_name: 'SUNDAY',
      title: 'CHIC LOUNGE',
      score_pct: 85,
      description: 'Cashmere oatmeal knit sweater, tailored tonal sweats, and fluid wool overcoat.',
      rule: 'Monochromatic palette from cream to toasted cappuccino',
      crime: 'Faded logo gym shorts or stained loungewear',
      swatches: JSON.stringify(['#695949', '#d7c3af', '#ffffff']),
      items: 'Cashmere oatmeal knitwear, tailored sweats, wool overcoat.',
      status: 'WEEKEND PASS'
    }
  ];

  for (const dc of dresscodes) {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO dresscodes
      (day_index, day, full_name, title, score_pct, description, rule, crime, swatches_json, items, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.bind([
      dc.day_index,
      dc.day,
      dc.full_name,
      dc.title,
      dc.score_pct,
      dc.description,
      dc.rule,
      dc.crime,
      dc.swatches,
      dc.items,
      dc.status
    ]);
    stmt.step();
    stmt.free();
  }

  console.log(`✓ Seeded ${dresscodes.length} dresscodes`);

  // Save database to disk
  const data = db.export();
  const buffer = Buffer.from(data);
  const dbPath = path.join(__dirname, '../../data/stylu.db');
  fs.writeFileSync(dbPath, buffer);

  console.log('\n✨ Database seeded successfully!\n');
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
