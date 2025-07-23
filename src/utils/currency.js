
const { StaffZone, Currency } = require("../models");
const cache = require("./cache");

async function getZoneData(zoneId) {

    const cacheKey = `staffZone:${zoneId}`;
    let staffZone = await cache.get(cacheKey);
    if (staffZone) return staffZone;
    let result = null;
    staffZone = await StaffZone.findOne({
        where: { id: zoneId },
        include: [{ model: Currency, as: 'currency' }]
    });
    if (staffZone) {
        result = {
            extra_charges: staffZone.extra_charges,
            currency: staffZone.currency ? {
                symbol: staffZone.currency.symbol,
                rate: staffZone.currency.rate
            } : null
        };
    }
    await cache.set(cacheKey, result);
    return result;
}

// helpers/currency.js
async function formatCurrency(amount, zoneId = null, extraCharges = false) {
    try {
        let symbol = 'AED';
        let modifiedAmount = Number(amount);

        if (zoneId) {
            const staffZone = await getZoneData(zoneId);
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