import React from 'react';
import { View, Text, TextInput, Switch, StyleSheet } from 'react-native';

interface inputProps {
label: string;
switchValue: boolean;
onSwitchChange: (value: boolean) => void;
description: string;
onDescriptionChange: (text: string) => void;
placeholder: string;
backgroundColor: string;
}

const AccessibilityInput: React.FC<inputProps> = ({
  label,
  switchValue,
  onSwitchChange,
  description,
  onDescriptionChange,
  placeholder,
  backgroundColor
}) => {
  return (
    <View style={[styles.container, { backgroundColor }]}>
    <View style={styles.row}>
    <Text style={{ flex: 1, flexWrap: 'wrap', marginRight: 10 }}>{label}</Text>
    <Switch value={switchValue} onValueChange={onSwitchChange} />
        </View>
        <TextInput
        placeholder={placeholder}
        value={description}
        onChangeText={onDescriptionChange}
        multiline={true}
        style={styles.textInput}
        />
        </View>
  );
};

const styles = StyleSheet.create({
  container: {marginBottom: 10, padding: 10,},
  row: {flexDirection: 'row', alignItems: 'center',},
  textInput: {backgroundColor: 'white', padding: 10, borderRadius: 5, borderWidth: 1, borderColor: 'gray', marginTop: 10, width: '100%', height: 100, textAlignVertical: 'top',},
});

export default AccessibilityInput;