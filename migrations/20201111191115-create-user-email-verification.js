'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        'users',
        'verification_id',
        {
          type: Sequelize.UUID,
          unique: true
        }
      ),
      queryInterface.addColumn(
        'users',
        'account_verified',
        {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        }
      )
    ]);

  },
  down: async (queryInterface, Sequelize) => {
    }
};