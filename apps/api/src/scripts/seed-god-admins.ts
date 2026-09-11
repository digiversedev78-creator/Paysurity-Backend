import * as bcrypt from 'bcrypt';
import postgres from 'postgres';
import { randomUUID } from 'crypto';

const connectionString = process.env.DATABASE_URL ?? 'postgresql://paysurity:paysurity_local_2026@localhost:5436/paysurity_dev';

async function seedGodAdmins() {
  console.log('🌱 Seeding God Admins...');
  const sql = postgres(connectionString, { max: 1 });

  try {
    const passwordHash = await bcrypt.hash('YaAllahmadad@0997', 10);

    const admins = [
      {
        id: randomUUID(),
        email: 'rwbchicago@gmail.com',
        first_name: 'Asif',
        last_name: 'Khwaja',
        phone: '312-719-9786',
        role: 'SUPER_ADMIN',
        password_hash: passwordHash,
      },
      {
        id: randomUUID(),
        email: 'rullah1038@gmail.com',
        first_name: 'Rehanullah',
        last_name: 'rullah1038',
        phone: '773-865-4051',
        role: 'SUPER_ADMIN',
        password_hash: passwordHash,
      }
    ];

    for (const admin of admins) {
      const existing = await sql`SELECT 1 FROM internal_users WHERE email = ${admin.email}`;
      if (existing.length === 0) {
        await sql`
          INSERT INTO internal_users (id, email, first_name, last_name, phone, role, password_hash)
          VALUES (${admin.id}, ${admin.email}, ${admin.first_name}, ${admin.last_name}, ${admin.phone}, ${admin.role}, ${admin.password_hash})
        `;
        console.log(`✅ Inserted SUPER_ADMIN: ${admin.email}`);
      } else {
        console.log(`⏭️  SUPER_ADMIN already exists: ${admin.email}`);
      }
    }

  } catch (err) {
    console.error('❌ Seeding God Admins failed:', err);
  } finally {
    await sql.end();
  }
}

seedGodAdmins();
