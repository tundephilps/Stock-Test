import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Stock {
    symbol: string;
    quantity: number;
    price: number;
}

interface PortfolioState {
    stocks: Stock[];
    addStock: (stock: Stock) => void;
    removeStock: (symbol: string) => void;
    updateStockPrice: (symbol: string, price: number) => void;
    clearPortfolio: () => void;
}

export const usePortfolioStore = create<PortfolioState>(
    persist(
        (set) => ({
            stocks: [],
            addStock: (stock) => set((state) => {
                const existingStock = state.stocks.find(s => s.symbol === stock.symbol);
                if (existingStock) {
                    return {
                        stocks: state.stocks.map(s =>
                            s.symbol === stock.symbol
                                ? { ...s, quantity: s.quantity + stock.quantity }
                                : s
                        )
                    };
                }
                return { stocks: [...state.stocks, stock] };
            }),
            removeStock: (symbol) => set((state) => ({
                stocks: state.stocks.filter(s => s.symbol !== symbol)
            })),
            updateStockPrice: (symbol, price) => set((state) => ({
                stocks: state.stocks.map(s =>
                    s.symbol === symbol ? { ...s, price } : s
                ),
            })),
            clearPortfolio: () => set({ stocks: [] }),
        }),
        {
            name: 'stock-portfolio',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);