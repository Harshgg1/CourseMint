const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

// Use dotenv if not already loaded by prisma config
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgresql://root:password@localhost:5432/courses';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

module.exports = {
  prisma,
};