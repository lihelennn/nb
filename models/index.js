// import Sequelize from 'sequelize';
const Sequelize = require("sequelize");
const config = require("../config");

if (!global.hasOwnProperty('db')) {
  var sequelize = null

  if (process.env.DATABASE_URL) {
    // the application is executed on Heroku ... use the postgres database
    var match = process.env.DATABASE_URL.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect:  'postgres',
      protocol: 'postgres',
      port:     match[4],
      host:     match[3],
      logging:  false,
      define: {
        underscored: true
      }
    });
  } else {
    // the application is executed on the local machine ... use mysql
    sequelize = new Sequelize(config.db.name, config.db.user, config.db.pass, {
      host: 'localhost',
      dialect: 'postgres',
      logging: false,
      port: 5432,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      define: {
        underscored: true
      }
    });
  }

  const models = {
    User: sequelize.import('./Users'),
    Institution: sequelize.import('./Classes/Institutions'),
    Class: sequelize.import('./Classes/Classes'),
    Section: sequelize.import('./Classes/Sections'),
    PseudoUser: sequelize.import('./Classes/PseudoUsers'),

    Source: sequelize.import('./Annotations/Sources'),
    Location: sequelize.import('./Annotations/Locations'),
    HtmlLocation: sequelize.import('./Annotations/HTMLLocations'),
    Thread: sequelize.import('./Annotations/Threads'),
    Annotation: sequelize.import('./Annotations/Annotations'),

    TagType: sequelize.import('./AnnotationActions/TagTypes'),
    Tag: sequelize.import('./AnnotationActions/Tags'),

    FileSystemObject: sequelize.import('./FileSystem/FileSystemObjects'),

    GradingSystem: sequelize.import('./Grading/GradingSystems'),
    GradingThreshold: sequelize.import('./Grading/GradingThresholds'),
    CriteriaCount: sequelize.import('./Grading/CriteriaCounts'),
    Criteria: sequelize.import('./Grading/Criteria'),
    Assignment: sequelize.import('./Grading/Assignments')
  };

  global.db = {
    Sequelize: Sequelize,
    sequelize: sequelize,
  }
  global.db = Object.assign(global.db, models);

  Object.keys(models).forEach(function (modelName) {
    if ('classMethods' in models[modelName].options) {
      if ('associate' in models[modelName].options.classMethods) {
        global.db[modelName].options.classMethods.associate(global.db);
      }
    }
  });
}

sequelize.sync().then(() => {
  global.db.Class.findAll().then(nb_classes =>
    nb_classes.forEach(nb_class => {
      const tagDefaults = [
        {value: "curious", emoji: "1F914"},
        {value: "confused", emoji: "1F616"},
        {value: "useful", emoji: "1F600"},
        {value: "interested", emoji: "1F9D0"},
        {value: "frustrated", emoji: "1F621"},
        {value: "help", emoji: "1F61F"},
        {value: "question", emoji: "2753"},
        {value: "idea",emoji: "1F4A1"}
      ];
      Promise.all(tagDefaults.map(tagDefault =>
        global.db.TagType.findOrCreate({where: tagDefault}).then(res => res[0])
      )).then(tag_types => nb_class.setTagTypes(tag_types));
    })
  );
});

module.exports = global.db;
