// client/utils/statHelpers.js

export const calculateStats = (pantryData = []) => {
    const today = new Date();
    const soonToExpireDate = new Date();
    soonToExpireDate.setDate(today.getDate() + 7);

    const stats = {
        totalItems: pantryData.length,
        expiredItems: 0,
        soonToExpire: 0,
        totalValue: 0,
        categoryCounts: {}
    };

    pantryData.forEach(item => {
        const expiryDate = new Date(item.expiration_date);
        
        if (expiryDate < today) {
            stats.expiredItems++;
        }

        if (expiryDate > today && expiryDate <= soonToExpireDate) {
            stats.soonToExpire++;
        }

        stats.totalValue += item.quantity || 0;

        const categoryName = item.category_name || 'Uncategorized';
        stats.categoryCounts[categoryName] = (stats.categoryCounts[categoryName] || 0) + 1;
    });

    return stats;
};
