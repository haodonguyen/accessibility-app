import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons'; // Or any other icon library you prefer

interface SearchBarProps {
    onSearch: (searchText: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
    const [searchText, setSearchText] = useState('');

    const handleSearchTextChange = (text: string) => {
        setSearchText(text);
        onSearch(text); // Call the onSearch function passed from the parent
    };

    return (
        <View style={styles.container}>
            <Feather name="search" size={30} color="gray" style={styles.icon} />
            <TextInput
                style={styles.input}
                placeholder="Search places..."
                value={searchText}
                onChangeText={handleSearchTextChange}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 8,
        margin: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    icon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
});

export default SearchBar;