import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../../database.sqlite');

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('데이터베이스 연결 오류:', err);
  } else {
    console.log('✅ SQLite 데이터베이스 연결 성공');
  }
});

// 프로미스 래퍼
export const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

export const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// 데이터베이스 초기화
export const initDatabase = async () => {
  try {
    const schemaPath = join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    const statements = schema.split(';').filter(stmt => stmt.trim());

    for (const statement of statements) {
      await dbRun(statement);
    }

    console.log('✅ 데이터베이스 스키마 초기화 완료');

    // 기본 카테고리 추가
    await seedData();
  } catch (error) {
    console.error('데이터베이스 초기화 오류:', error);
    throw error;
  }
};

// 초기 데이터 추가
const seedData = async () => {
  try {
    // 기본 카테고리 확인 및 추가
    const categoryCount = await dbGet('SELECT COUNT(*) as count FROM categories');

    if (categoryCount.count === 0) {
      const categories = [
        { name: '정치', slug: 'politics', description: '정치 관련 뉴스' },
        { name: '경제', slug: 'economy', description: '경제 관련 뉴스' },
        { name: '사회', slug: 'society', description: '사회 관련 뉴스' },
        { name: '문화', slug: 'culture', description: '문화 관련 뉴스' },
        { name: '스포츠', slug: 'sports', description: '스포츠 관련 뉴스' },
        { name: '기술', slug: 'technology', description: '기술 관련 뉴스' }
      ];

      for (const category of categories) {
        await dbRun(
          'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)',
          [category.name, category.slug, category.description]
        );
      }

      console.log('✅ 기본 카테고리 추가 완료');
    }
  } catch (error) {
    console.error('초기 데이터 추가 오류:', error);
  }
};
