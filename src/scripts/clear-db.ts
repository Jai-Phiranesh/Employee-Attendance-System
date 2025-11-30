import { sequelize, Attendance, User } from '../models';

const clearDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Deactivate foreign key checks to avoid constraint errors on truncate
    await sequelize.query('SET session_replication_role = \'replica\';');
    console.log('Foreign key checks temporarily disabled.');

    // Truncate tables
    await Attendance.destroy({ where: {}, truncate: true });
    console.log('✔ All records from "Attendances" table cleared.');

    await User.destroy({ where: {}, truncate: true });
    console.log('✔ All records from "Users" table cleared.');

    // Reactivate foreign key checks
    await sequelize.query('SET session_replication_role = \'origin\';');
    console.log('Foreign key checks re-enabled.');

    console.log('\n✅ All data has been successfully cleared. You can now test from scratch.');
    
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('Database connection closed.');
  }
};

clearDatabase();
