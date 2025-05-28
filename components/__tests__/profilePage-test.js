import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProfileMenu from '../../app/profileMenu';

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('../../FirebaseConfig', () => ({
  auth: { currentUser: { uid: '1234567890' }},
}));

jest.mock('../../components/userFuncs', () => ({
  getProfileInformation: jest.fn(() => Promise.resolve({
    profileID: '1234567890',
    displayName: 'Test name',
    avatarURL: '',
    descriptionText: 'Test description',
  })),
  createDefaultProfile: jest.fn(),
  changeDisplayName: jest.fn(),
  changeDescription: jest.fn(),
  changeAvatar: jest.fn(),
}));

describe('Profile page', () => {
  it('display name renders correctly', async () => {
    const { findByText } = render(<ProfileMenu />);
    const displayNameText = await findByText(`Display Name: Test name`);
    expect(displayNameText).toBeTruthy();
  });

  it('allows the user to change their display name', async () => {
    const { findByPlaceholderText, findByText } = render(<ProfileMenu />);
    const input = await findByPlaceholderText('Enter new display name');
    const updateButton = await findByText('Update Name');

    fireEvent.changeText(input, 'new name'); //simulate text input
    fireEvent.press(updateButton);

    const updatedDisplayName = await findByText('Display Name: new name');
    expect(updatedDisplayName).toBeTruthy();

    const { changeDisplayName } = require('../../components/userFuncs');
    expect(changeDisplayName).toHaveBeenCalledWith('new name', '1234567890');
  });

  it('description text renders correctly', async () => {
    const { findByText } = render(<ProfileMenu />);
    const displayNameText = await findByText(`Description: Test description`);
    expect(displayNameText).toBeTruthy();
  });  

  it('allows the user to change their description text', async () => {
    const { findByPlaceholderText, findByText } = render(<ProfileMenu />);
    const input = await findByPlaceholderText('Enter new description');
    const updateButton = await findByText('Update Description');

    fireEvent.changeText(input, 'new description text'); //simulate text input
    fireEvent.press(updateButton);

    const updatedDisplayName = await findByText('Description: new description text');
    expect(updatedDisplayName).toBeTruthy();

    const { changeDescription } = require('../../components/userFuncs');
    expect(changeDescription).toHaveBeenCalledWith('new description text', '1234567890');
  });
});