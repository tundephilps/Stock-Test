import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import PortfolioScreen from './src/screens/PortfolioScreen';

const Stack = createStackNavigator();

const App = () => {
    return (
        <NavigationContainer>


          
          
            <Stack.Navigator>
                <Stack.Screen name="Portfolio" component={PortfolioScreen} options={{ headerShown: false}} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default App;
