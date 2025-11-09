import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Button, Switch, Alert, Modal, KeyboardAvoidingView, Platform, useColorScheme, ActivityIndicator } from 'react-native';
import { usePortfolioStore } from '../store/usePortfolioStore';
import { fetchStockPrice, fetchCompanyProfile, searchStockSymbols } from '../utils/api';

const PortfolioScreen = () => {
    const [symbol, setSymbol] = useState('');
    const [quantity, setQuantity] = useState('');
    const [isAddingStock, setIsAddingStock] = useState(false);
    const { stocks, addStock, updateStockPrice } = usePortfolioStore();
    const [loading, setLoading] = useState(false);
        const [error, setError] = useState<string | null>(null);
            const [searchQuery, setSearchQuery] = useState('');
            const [suggestions, setSuggestions] = useState([]);
            const searchTimeout = React.useRef(null);
            const [userColorScheme, setUserColorScheme] = useState<'light' | 'dark' | null>(null);
        
            const [liveFeedStocks, setLiveFeedStocks] = useState([]);
        
            const systemColorScheme = useColorScheme();
            const effectiveColorScheme = userColorScheme || systemColorScheme;
            const styles = getStyles(effectiveColorScheme);
    useEffect(() => {
        const fetchLiveFeedData = async () => {
            const symbolsToFetch = ['AAPL', 'GOOGL', 'MSFT', 'AMZN']; // Example symbols
            const fetchedStocks = [];
            for (const symbol of symbolsToFetch) {
                try {
                    const profile = await fetchCompanyProfile(symbol);
                    const priceData = await fetchStockPrice(symbol);
                    fetchedStocks.push({
                        symbol: symbol,
                        name: profile.name,
                        price: priceData.price,
                    });
                } catch (error) {
                    console.error(`Failed to fetch live feed data for ${symbol}:`, error);
                }
            }
            setLiveFeedStocks(fetchedStocks);
        };

        fetchLiveFeedData();

        const interval = setInterval(fetchLiveFeedData, 30000); // Refresh live feed every 30 seconds

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            stocks.forEach(async (stock) => {
                try {
                    const stockData = await fetchStockPrice(stock.symbol);
                    if (stockData && stockData.price) {
                        updateStockPrice(stock.symbol, stockData.price);
                    }
                } catch (error) {
                    console.error(`Failed to update price for ${stock.symbol}:`, error);
                }
            });
        }, 60000); // 60 seconds

        return () => clearInterval(interval);
    }, [stocks, updateStockPrice]);

    const toggleTheme = () => {
        setUserColorScheme(effectiveColorScheme === 'dark' ? 'light' : 'dark');
    };

    const handleSymbolChange = (text: string) => {
        setSymbol(text);
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }
        if (text.length > 1) {
            searchTimeout.current = setTimeout(async () => {
                try {
                    const result = await searchStockSymbols(text);
                    setSuggestions(result);
                } catch (err) {
                    console.error('Error searching symbols:', err);
                    setSuggestions([]);
                }
            }, 500);
        } else {
            setSuggestions([]);
        }
    };

    const handleSelectSuggestion = (selectedSymbol: string) => {
        setSymbol(selectedSymbol);
        setSuggestions([]);
    };

    const handleAddStock = async () => {
        if (!symbol.trim() || !quantity.trim() || parseInt(quantity) <= 0) {
            Alert.alert('Invalid Input', 'Please enter a valid stock symbol and a quantity greater than 0.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const stockData = await fetchStockPrice(symbol.toUpperCase());
            if (stockData && stockData.price) {
                addStock({ symbol: symbol.toUpperCase(), quantity: parseInt(quantity), price: stockData.price });
                setSymbol('');
                setQuantity('');
                setIsAddingStock(false);
            } else {
                throw new Error('Invalid stock symbol or no price available.');
            }
        } catch (error) {
            setError(error.message);
            console.error(error);
            console.error(error.stack);
            Alert.alert('Error','This stock requires a premium API plan or the stock symbol is invalid.');
        } finally {
            setLoading(false);
        }
    };

    const totalValue = stocks.reduce((total, stock) => {
        if (typeof stock.price === 'number' && typeof stock.quantity === 'number') {
            return total + stock.price * stock.quantity;
        }
        return total;
    }, 0);

    const filteredStocks = stocks.filter(stock =>
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const portfolioData = filteredStocks.map(stock => ({
        ...stock,
        shares: stock.quantity,
        value: stock.price * stock.quantity,
    }));

    const renderItem = ({ item }) => (
        <View style={styles.row}>
            <Text style={styles.cell}>{item.symbol}</Text>
            <Text style={styles.cell}>{item.shares}</Text>
            <Text style={styles.cell}>${item.price?.toFixed(2) ?? 'N/A'}</Text>
            <Text style={styles.cell}>${item.value?.toFixed(2) ?? 'N/A'}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.liveFeedTitle}>Live Stock Feed</Text>
            <FlatList
                data={liveFeedStocks}
                keyExtractor={(item) => item.symbol}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.liveFeedContainer}
                renderItem={({ item }) => (
                    <View style={styles.liveFeedItem}>
                        <Text style={styles.liveFeedSymbol}>{item.symbol}</Text>
                        <Text style={styles.liveFeedName}>{item.name}</Text>
                        <Text style={styles.liveFeedPrice}>${item.price?.toFixed(2) ?? 'N/A'}</Text>
                    </View>
                )}
            />
            <View style={styles.headerContainer}>
                <Text style={styles.title}>📈 My Portfolio</Text>
                <View style={styles.themeToggleContainer}>
                    <Text style={styles.themeToggleText}>Light</Text>
                    <Switch
                        trackColor={{ false: "#767577", true: "#81b0ff" }}
                        thumbColor={effectiveColorScheme === 'dark' ? "#f5dd4b" : "#f4f3f4"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={toggleTheme}
                        value={effectiveColorScheme === 'dark'}
                    />
                    <Text style={styles.themeToggleText}>Dark</Text>
                </View>
            </View>
            <Text style={styles.totalValue}>Total Value: ${totalValue.toLocaleString()}</Text>

            <TextInput
                style={styles.searchBar}
                placeholder="Search Stocks..."
                placeholderTextColor={effectiveColorScheme === 'dark' ? '#888' : '#aaa'}
                value={searchQuery}
                onChangeText={setSearchQuery}
            />

            <View style={styles.tableHeader}>
                <Text style={styles.headerText}>Symbol</Text>
                <Text style={styles.headerText}>Shares</Text>
                <Text style={styles.headerText}>Price</Text>
                <Text style={styles.headerText}>Value</Text>
            </View>

            {loading && <ActivityIndicator size="large" color={effectiveColorScheme === 'dark' ? '#fff' : '#000'} />}
            {error && <Text style={styles.errorText}>{error}</Text>}


            <FlatList
                data={portfolioData}
                keyExtractor={(item) => item.symbol}
                renderItem={renderItem}
                style={styles.table}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No stocks yet. Add one to get started!</Text>
                }
            />

            <Modal
                visible={isAddingStock}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsAddingStock(false)}
            >
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Add Stock</Text>
                            <TextInput style={styles.input} placeholder="Stock Symbol" value={symbol} onChangeText={handleSymbolChange} placeholderTextColor={effectiveColorScheme === 'dark' ? '#888' : '#aaa'} />
                            {suggestions.length > 0 && (
                                <FlatList
                                    data={suggestions}
                                    keyExtractor={(item) => item.symbol}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={styles.suggestionItem}
                                            onPress={() => handleSelectSuggestion(item.symbol)}
                                        >
                                            <Text style={styles.suggestionText}>{item.symbol} - {item.description}</Text>
                                        </TouchableOpacity>
                                    )}
                                    style={styles.suggestionsList}
                                />
                            )}
                            <TextInput style={styles.input} placeholder="Quantity" value={quantity} keyboardType="numeric" onChangeText={setQuantity} placeholderTextColor={effectiveColorScheme === 'dark' ? '#888' : '#aaa'} />
                            <Button title="Add Stock" onPress={handleAddStock} disabled={loading} />
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsAddingStock(false)}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            <TouchableOpacity style={styles.addButton} onPress={() => setIsAddingStock(true)}>
                <Text style={styles.addButtonText}>＋ Add Stock</Text>
            </TouchableOpacity>
        </View>
    );
};

export default PortfolioScreen;

const getStyles = (colorScheme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
        paddingHorizontal: 20,
        paddingTop: 60,
    },
    title: {
        fontSize: 26,
        fontWeight: "700",
        marginBottom: 10,
        color: colorScheme === 'dark' ? '#fff' : '#000',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    themeToggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    themeToggleText: {
        color: colorScheme === 'dark' ? '#fff' : '#000',
        marginHorizontal: 5,
    },
    totalValue: {
        fontSize: 18,
        marginBottom: 20,
        color: colorScheme === 'dark' ? '#fff' : '#000',
    },
    tableHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderBottomColor: colorScheme === 'dark' ? '#444' : '#ddd',
        paddingBottom: 8,
        marginBottom: 10,
    },
    headerText: {
        fontSize: 14,
        fontWeight: "600",
        flex: 1,
        textAlign: "center",
        color: colorScheme === 'dark' ? '#fff' : '#000',
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colorScheme === 'dark' ? '#333' : '#f1f1f1',
    },
    cell: {
        flex: 1,
        textAlign: "center",
        fontSize: 15,
        color: colorScheme === 'dark' ? '#fff' : '#000',
    },
    table: {
        marginBottom: 30,
    },
    addButton: {
        borderWidth: 1,
        borderColor: colorScheme === 'dark' ? '#fff' : '#000',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: "center",
        marginBottom: 70,
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: colorScheme === 'dark' ? '#fff' : '#000',
    },
    input: {
        borderWidth: 1,
        borderColor: colorScheme === 'dark' ? '#555' : '#ddd',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
        color: colorScheme === 'dark' ? '#fff' : '#000',
        backgroundColor: colorScheme === 'dark' ? '#222' : '#fff',
    },
    cancelButton: {
        marginTop: 10,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: 'red',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: colorScheme === 'dark' ? '#111' : '#fff',
        padding: 20,
        borderRadius: 10,
        width: '80%',
    },
    suggestionsList: {
        maxHeight: 150,
        borderColor: colorScheme === 'dark' ? '#555' : '#ddd',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
    },
    suggestionItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: colorScheme === 'dark' ? '#333' : '#eee',
    },
    suggestionText: {
        color: colorScheme === 'dark' ? '#fff' : '#000',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#999',
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 10,
    },
    searchBar: {
        borderWidth: 1,
        borderColor: colorScheme === 'dark' ? '#555' : '#ddd',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
        color: colorScheme === 'dark' ? '#fff' : '#000',
        backgroundColor: colorScheme === 'dark' ? '#222' : '#fff',
    },
    liveFeedTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colorScheme === 'dark' ? '#fff' : '#000',
        marginBottom: 10,
        textAlign: 'center',
    },
    liveFeedContainer: {
        height: 80,
        marginBottom: 10,
    },
    liveFeedItem: {
        backgroundColor: colorScheme === 'dark' ? '#333' : '#f0f0f0',
        borderRadius: 8,
        padding: 10,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
        width: 120,
    },
    liveFeedSymbol: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colorScheme === 'dark' ? '#fff' : '#000',
    },
    liveFeedName: {
        fontSize: 12,
        color: colorScheme === 'dark' ? '#ccc' : '#555',
        textAlign: 'center',
    },
    liveFeedPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: colorScheme === 'dark' ? '#fff' : '#000',
        marginTop: 5,
    },
});