// Game Currency Configuration - Single Source of Truth
// All currency displays should import from here

export const CURRENCY = {
    name: 'Shards',
    symbol: '◆',
    color: '#b0f',  // Purple to match HUD
} as const;

// Helper to format currency display
export function formatCurrency(amount: number): string {
    return `${CURRENCY.symbol} ${amount}`;
}

// Helper for reward text
export function formatReward(amount: number): string {
    return `+${amount} ${CURRENCY.symbol}`;
}
