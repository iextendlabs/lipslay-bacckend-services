const { StaffZone, Currency } = require("../models");

// helpers/currency.js
async function formatCurrency(amount, zoneId = null, extraCharges = false) {
    try {
        let symbol = 'AED';
        let modifiedAmount = Number(amount);

        if (zoneId) {
            const staffZone = await StaffZone.findOne({
                where: { id: zoneId },
                include: [{ model: Currency, as: 'currency' }]
            });

            if (staffZone) {
                const charges = extraCharges && staffZone.extra_charges ? parseFloat(staffZone.extra_charges) : 0;
                if (staffZone.currency) {
                    symbol = staffZone.currency.symbol;
                    const currencyRate = parseFloat(staffZone.currency.rate);
                    modifiedAmount = (Number(amount) + charges) * currencyRate;
                } else {
                    modifiedAmount = Number(amount) + charges;
                }
            }
        }

        return formatWithSymbol(symbol, modifiedAmount);
    } catch (error) {
        console.error('Currency formatting error:', error);
        return formatWithSymbol('AED', amount);
    }
}

function formatWithSymbol(symbol, amount) {
    return `${symbol}${parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

module.exports = { formatCurrency };