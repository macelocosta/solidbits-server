const Influx = require('influx');

let database_name = 'solidbits';

module.exports = function() {
  const influx = new Influx.InfluxDB({
    host: 'localhost',
    database: database_name,
    schema: [
      {
        measurement: 'bin',
        fields: {
          temperature: Influx.FieldType.FLOAT,
          humidity: Influx.FieldType.FLOAT,
          fill: Influx.FieldType.FLOAT,
          volume: Influx.FieldType.FLOAT,
          weight: Influx.FieldType.FLOAT,
          isLidEvent: Influx.FieldType.BOOLEAN,
          isLidOpened: Influx.FieldType.BOOLEAN,
          lidOpenedDuration: Influx.FieldType.INTEGER
        },
        tags: ['bin_id']
      }
    ]
  });

  influx.getDatabaseNames()
  .then(names => {
    if (!names.includes(database_name)) {
      let db = influx.createDatabase(database_name);
      influx.createRetentionPolicy('solidbits', {duration: 'inf', replication: 1, database: database_name, isDefault: 1});
      return db;
    }
  });


  console.log("InfluxDB connection estabilished");
  
  return influx;
}