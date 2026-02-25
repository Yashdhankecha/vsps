/**
 * Creates all collections in MongoDB Atlas based on the models defined in the codebase.
 * 
 * Mongoose model names and their corresponding MongoDB collection names:
 *   Model Name      → Collection Name
 *   ─────────────────────────────────
 *   Booking         → bookings
 *   Contact         → contacts
 *   EventCategory   → eventcategories
 *   Form            → forms
 *   GalleryItem     → galleryitems
 *   HomeContent     → homecontents
 *   Resource        → resources
 *   Article         → articles
 *   Review          → reviews
 *   SamuhLagan      → samuhlagans
 *   StudentAward    → studentawards
 *   User            → users
 */

const { MongoClient } = require('mongodb');
const dns = require('dns');

// Fix DNS for MongoDB Atlas SRV resolution
const currentServers = dns.getServers();
if (currentServers.length === 0 || (currentServers.length === 1 && currentServers[0] === '127.0.0.1')) {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
    console.log('✅ DNS servers set to Google/Cloudflare for SRV resolution');
}

const MONGO_URI = 'mongodb+srv://harshvyas:Harsh%40123@vsps.kgvc4oa.mongodb.net/';
const DB_NAME = 'vsps'; // Default database name from the URI

// All collections based on mongoose models in the codebase
const COLLECTIONS = [
    'bookings',
    'contacts',
    'eventcategories',
    'forms',
    'galleryitems',
    'homecontents',
    'resources',
    'articles',
    'reviews',
    'samuhlagans',
    'studentawards',
    'users',
];

async function createCollections() {
    let client;

    try {
        console.log('\n📡 Connecting to MongoDB Atlas...');
        client = new MongoClient(MONGO_URI);
        await client.connect();
        console.log('✅ Connected successfully!\n');

        const db = client.db(DB_NAME);

        // Get existing collections
        const existingCollections = await db.listCollections().toArray();
        const existingNames = existingCollections.map(c => c.name);

        console.log('📋 Existing collections:', existingNames.length > 0 ? existingNames.join(', ') : '(none)');
        console.log('─'.repeat(60));

        let created = 0;
        let skipped = 0;

        for (const collectionName of COLLECTIONS) {
            if (existingNames.includes(collectionName)) {
                console.log(`  ⏭️  ${collectionName} — already exists`);
                skipped++;
            } else {
                await db.createCollection(collectionName);
                console.log(`  ✅ ${collectionName} — created`);
                created++;
            }
        }

        console.log('─'.repeat(60));
        console.log(`\n🎉 Done! Created: ${created}, Skipped (already existed): ${skipped}`);
        console.log(`📦 Total collections in database: ${existingNames.length + created}`);

        // List all collections after creation
        const finalCollections = await db.listCollections().toArray();
        console.log('\n📂 All collections in the database:');
        finalCollections.forEach((col, i) => {
            console.log(`   ${i + 1}. ${col.name}`);
        });

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    } finally {
        if (client) {
            await client.close();
            console.log('\n🔌 Connection closed.');
        }
    }
}

createCollections();
