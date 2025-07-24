#!/usr/bin/env python3
import json
import asyncio
import asyncpg
import logging
from typing import List, Dict
import os
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

class DatabasePopulator:
    def __init__(self):
        self.db_url = os.getenv('DATABASE_URL', 'postgresql://college_admin:your_secure_password@localhost/maharashtra_colleges')

    async def connect(self):
        """Connect to PostgreSQL database"""
        self.conn = await asyncpg.connect(self.db_url)
        logger.info("Connected to database")

    async def close(self):
        """Close database connection"""
        await self.conn.close()
        logger.info("Database connection closed")

    async def insert_college(self, college_data: Dict) -> int:
        """Insert a single college and return its ID"""
        query = """
        INSERT INTO colleges (name, category, district, city, type, autonomous, minority, hostel_available, established_year)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (name, district, city)
        DO UPDATE SET
            category = EXCLUDED.category,
            type = EXCLUDED.type,
            autonomous = EXCLUDED.autonomous,
            minority = EXCLUDED.minority,
            hostel_available = EXCLUDED.hostel_available,
            established_year = EXCLUDED.established_year,
            updated_at = CURRENT_TIMESTAMP
        RETURNING id;
        """

        college_id = await self.conn.fetchval(
            query,
            college_data['name'],
            college_data['category'],
            college_data['district'],
            college_data['city'],
            college_data['type'],
            college_data['autonomous'],
            college_data['minority'],
            college_data['hostel_available'],
            college_data.get('established_year')
        )

        return college_id

    async def insert_contact_info(self, college_id: int, college_data: Dict):
        """Insert contact information for a college"""
        if not any([college_data.get('phone'), college_data.get('email'),
                   college_data.get('website'), college_data.get('address')]):
            return

        query = """
        INSERT INTO contact_info (college_id, phone, email, website, address)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (college_id)
        DO UPDATE SET
            phone = EXCLUDED.phone,
            email = EXCLUDED.email,
            website = EXCLUDED.website,
            address = EXCLUDED.address;
        """

        await self.conn.execute(
            query,
            college_id,
            college_data.get('phone'),
            college_data.get('email'),
            college_data.get('website'),
            college_data.get('address')
        )

    async def populate_from_json(self, json_file: str):
        """Populate database from JSON file"""
        with open(json_file, 'r') as f:
            colleges = json.load(f)

        logger.info(f"Populating database with {len(colleges)} colleges...")

        for college in colleges:
            try:
                # Insert college
                college_id = await self.insert_college(college)
                logger.info(f"Inserted/Updated college: {college['name']} (ID: {college_id})")

                # Insert contact info
                await self.insert_contact_info(college_id, college)

            except Exception as e:
                logger.error(f"Error inserting {college['name']}: {e}")

        logger.info("Database population completed!")

    async def get_stats(self):
        """Get database statistics"""
        stats = {}

        # Total colleges
        stats['total_colleges'] = await self.conn.fetchval("SELECT COUNT(*) FROM colleges")

        # By district
        district_stats = await self.conn.fetch("""
            SELECT district, COUNT(*) as count
            FROM colleges
            GROUP BY district
            ORDER BY count DESC
        """)
        stats['by_district'] = dict(district_stats)

        # By category
        category_stats = await self.conn.fetch("""
            SELECT category, COUNT(*) as count
            FROM colleges
            GROUP BY category
            ORDER BY count DESC
        """)
        stats['by_category'] = dict(category_stats)

        return stats

async def main():
    populator = DatabasePopulator()

    try:
        await populator.connect()

        # Populate from collected data
        await populator.populate_from_json('raw-data/maharashtra_colleges.json')

        # Show statistics
        stats = await populator.get_stats()
        logger.info("Database Statistics:")
        logger.info(f"Total Colleges: {stats['total_colleges']}")
        logger.info("By District:")
        for district, count in stats['by_district'].items():
            logger.info(f"  {district}: {count}")
        logger.info("By Category:")
        for category, count in stats['by_category'].items():
            logger.info(f"  {category}: {count}")

    finally:
        await populator.close()

if __name__ == "__main__":
    asyncio.run(main())
