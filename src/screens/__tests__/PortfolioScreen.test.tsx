import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import PortfolioScreen from '../PortfolioScreen';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import { fetchStockPrice } from '../../utils/api';
import { Alert } from 'react-native';

// Mock the zustand store
jest.mock('../../store/usePortfolioStore', () => ({
    usePortfolioStore: jest.fn(),
}));

// Mock the API call
jest.mock('../../utils/api', () => ({
    fetchStockPrice: jest.fn(),
}));

// Mock Alert
jest.mock('react-native', () => ({
    ...jest.requireActual('react-native'),
    Alert: {
        alert: jest.fn(),
    },
    useColorScheme: jest.fn(() => 'light'), // Mock useColorScheme to return 'light' by default
}));

describe('PortfolioScreen', () => {
    const mockAddStock = jest.fn();
    const mockUpdateStockPrice = jest.fn();
    const mockStocks = [
        // { symbol: 'AAPL', quantity: 10, price: 150 },
        // { symbol: 'GOOG', quantity: 5, price: 2500 },
    ];

    beforeEach(() => {
        usePortfolioStore.mockImplementation(() => ({
            stocks: mockStocks,
            addStock: mockAddStock,
            updateStockPrice: mockUpdateStockPrice,
        }));
        fetchStockPrice.mockClear();
        mockAddStock.mockClear();
        mockUpdateStockPrice.mockClear();
        Alert.alert.mockClear();
    });

    it('renders correctly', () => {
        render(<PortfolioScreen />);
        expect(screen.getByText('📈 My Portfolio')).toBeTruthy();
        expect(screen.getByText('Total Value: $14,000')).toBeTruthy(); // 10*150 + 5*2500 = 1500 + 12500 = 14000
    });

    it('displays empty message when no stocks are present', () => {
        usePortfolioStore.mockImplementation(() => ({
            stocks: [],
            addStock: mockAddStock,
            updateStockPrice: mockUpdateStockPrice,
        }));
        render(<PortfolioScreen />);
        expect(screen.getByText('No stocks yet. Add one to get started!')).toBeTruthy();
    });

    it('adds a new stock successfully', async () => {
        fetchStockPrice.mockResolvedValueOnce({ price: 200 });

        render(<PortfolioScreen />);

        fireEvent.press(screen.getByText('＋ Add Stock'));

        const symbolInput = screen.getByPlaceholderText('Stock Symbol');
        const quantityInput = screen.getByPlaceholderText('Quantity');
        const addButton = screen.getByText('Add Stock');

        fireEvent.changeText(symbolInput, 'MSFT');
        fireEvent.changeText(quantityInput, '10');
        fireEvent.press(addButton);

        await waitFor(() => {
            expect(fetchStockPrice).toHaveBeenCalledWith('MSFT');
            expect(mockAddStock).toHaveBeenCalledWith({ symbol: 'MSFT', quantity: 10, price: 200 });
            expect(Alert.alert).not.toHaveBeenCalled();
        });
    });

    it('shows an alert for invalid input when adding stock', async () => {
        render(<PortfolioScreen />);

        fireEvent.press(screen.getByText('＋ Add Stock'));

        const addButton = screen.getByText('Add Stock');

        // Test with empty symbol and quantity
        fireEvent.press(addButton);
        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Invalid Input', 'Please enter a valid stock symbol and a quantity greater than 0.');
        });

        Alert.alert.mockClear();

        // Test with quantity <= 0
        const symbolInput = screen.getByPlaceholderText('Stock Symbol');
        const quantityInput = screen.getByPlaceholderText('Quantity');
        fireEvent.changeText(symbolInput, 'MSFT');
        fireEvent.changeText(quantityInput, '0');
        fireEvent.press(addButton);
        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Invalid Input', 'Please enter a valid stock symbol and a quantity greater than 0.');
        });
    });

    it('handles API error when adding stock', async () => {
        fetchStockPrice.mockRejectedValueOnce(new Error('Stock not found'));

        render(<PortfolioScreen />);

        fireEvent.press(screen.getByText('＋ Add Stock'));

        const symbolInput = screen.getByPlaceholderText('Stock Symbol');
        const quantityInput = screen.getByPlaceholderText('Quantity');
        const addButton = screen.getByText('Add Stock');

        fireEvent.changeText(symbolInput, 'UNKNOWN');
        fireEvent.changeText(quantityInput, '1');
        fireEvent.press(addButton);

        await waitFor(() => {
            expect(fetchStockPrice).toHaveBeenCalledWith('UNKNOWN');
            expect(mockAddStock).not.toHaveBeenCalled();
            expect(Alert.alert).toHaveBeenCalledWith('Error', 'Stock not found');
        });
    });

    it('filters stocks based on search query', () => {
        render(<PortfolioScreen />);

        const searchInput = screen.getByPlaceholderText('Search Stocks...');
        fireEvent.changeText(searchInput, 'AAPL');

        expect(screen.getByText('AAPL')).toBeTruthy();
        expect(screen.queryByText('GOOG')).toBeNull();

        fireEvent.changeText(searchInput, 'GOOG');
        expect(screen.queryByText('AAPL')).toBeNull();
        expect(screen.getByText('GOOG')).toBeTruthy();
    });

    it('displays loading indicator when adding stock', async () => {
        fetchStockPrice.mockReturnValueOnce(new Promise(() => {})); // Never resolve to keep loading

        render(<PortfolioScreen />);

        fireEvent.press(screen.getByText('＋ Add Stock'));

        const symbolInput = screen.getByPlaceholderText('Stock Symbol');
        const quantityInput = screen.getByPlaceholderText('Quantity');
        const addButton = screen.getByText('Add Stock');

        fireEvent.changeText(symbolInput, 'MSFT');
        fireEvent.changeText(quantityInput, '10');
        fireEvent.press(addButton);

        await waitFor(() => {
            expect(screen.getByTestId('ActivityIndicator')).toBeTruthy();
        });
    });
});
