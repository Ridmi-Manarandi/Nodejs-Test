const sql = require('mssql/msnodesqlv8');

const dbConfig = {
    driver: 'msnodesqlv8',
    connectionString: 'Driver={SQL Server Native Client 11.0};Server={ITELPTD083\\SQLEXPRESS02};Database={testdb};Trusted_Connection=yes;',
  };

  sql.connect(dbConfig);