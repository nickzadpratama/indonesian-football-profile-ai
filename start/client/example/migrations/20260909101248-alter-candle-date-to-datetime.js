'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.removeConstraint('Candles', 'uq_candle_stock_date_interval');

    await queryInterface.renameColumn('Candles', 'date', 'datetime');

    await queryInterface.changeColumn('Candles', 'datetime', {
      type: Sequelize.DATE,
      allowNull: false
    });

    await queryInterface.addConstraint('Candles', {
      fields: ['stock_id', 'datetime', 'interval'],
      type: 'unique',
      name: 'uq_candle_stock_datetime_interval'
    });
  },

  async down(queryInterface, Sequelize) {

    await queryInterface.removeConstraint('Candles', 'uq_candle_stock_datetime_interval');

    await queryInterface.changeColumn('Candles', 'datetime', {
      type: Sequelize.DATEONLY,
      allowNull: false
    });

    await queryInterface.renameColumn('Candles', 'datetime', 'date');

    await queryInterface.addConstraint('Candles', {
      fields: ['stock_id', 'date', 'interval'],
      type: 'unique',
      name: 'uq_candle_stock_date_interval'
    });
  }
};
