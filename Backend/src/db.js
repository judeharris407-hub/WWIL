// Re-export the primary database configuration from /config/db.js
const db = require('../config/db');

module.exports = {
  pool: db,
  query: (text, params) => db.query(text, params),
  checkConnection: async () => {
    try {
      const res = await db.query('SELECT NOW() AS current_time, current_database() AS db_name');
      return {
        connected: true,
        time: res.rows[0].current_time,
        database: res.rows[0].db_name,
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message,
      };
    }
  },
};
