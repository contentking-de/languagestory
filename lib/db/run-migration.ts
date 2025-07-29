import { ContentMigration } from './content-migration';
import path from 'path';

async function runContentMigration() {
  console.log('🚀 Starting A Language Story Content Migration');
  console.log('=' .repeat(50));
  
  const migration = new ContentMigration();
  const xmlFilePath = path.join(process.cwd(), 'alanguagestory.WordPress.2025-07-29.xml');
  
  try {
    const stats = await migration.runMigration(xmlFilePath);
    
    console.log('\n✅ Migration completed successfully!');
    console.log('Your WordPress content has been imported into the new A Language Story platform.');
    console.log('\nNext steps:');
    console.log('1. Review imported content in the database');
    console.log('2. Test course navigation and functionality');
    console.log('3. Set up user accounts for teachers and students');
    console.log('4. Configure institution settings');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runContentMigration()
  .then(() => {
    console.log('\n🎉 Migration process completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration process failed:', error);
    process.exit(1);
  }); 