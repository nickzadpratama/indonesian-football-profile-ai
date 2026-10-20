'use strict';

const { STOCKS } = require('../constants/stocks');

module.exports = {
  async up(queryInterface, Sequelize) {
    const cryptoStocks = STOCKS.filter((stock) => stock.sector === 'Crypto');

    for (const stock of cryptoStocks) {
      const existing = await queryInterface.sequelize.query(
        'SELECT id FROM "Stocks" WHERE symbol = :symbol AND exchange = :exchange LIMIT 1',
        {
          replacements: { symbol: stock.symbol, exchange: 'BINANCE' },
          type: Sequelize.QueryTypes.SELECT,
        },
      );

      if (existing.length === 0) {
        await queryInterface.bulkInsert('Stocks', [
          {
            symbol: stock.symbol,
            name: stock.name,
            sector: stock.sector,
            exchange: 'BINANCE',
            country: 'GLB',
            regulator: 'NONE',
            updated_at: new Date(),
            created_at: new Date(),
          },
        ]);
        console.log(`[Seed] Added crypto asset: ${stock.symbol}`);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Stocks', { sector: 'Crypto' }, {});
  },
};
