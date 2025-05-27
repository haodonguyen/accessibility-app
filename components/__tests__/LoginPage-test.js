import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginPage from '../../app/login';

//note that this doesn't actually test the firebase auth since we mock that functionality.
//we're just testing the frontend components

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(() =>
    Promise.resolve({ user: { uid: '1234567890' } }) //always resolve with a dummy user object to simulate a successful login
  ),
}));

jest.mock('../../FirebaseConfig', () => ({
  auth: {},
}));

jest.mock('../../components/userFuncs', () => ({
  createDefaultProfile: jest.fn(() => 
    Promise.resolve()),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.useFakeTimers();

describe('LoginPage', () => {
  it('user can log in with an account (frontend only)', async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<LoginPage />);
    const emailInput = getByPlaceholderText('Email Address');
    const passwordInput = getByPlaceholderText('Password');
    const signInButton = getByText('Sign In');

    fireEvent.changeText(emailInput, 'test@gmail.com');
    fireEvent.changeText(passwordInput, 'password');
    fireEvent.press(signInButton);

    await waitFor(() =>
      expect(queryByText('Successfully logged in!')).toBeTruthy()
    );
    jest.runAllTimers();
  });

  it('invalid credentials (frontend only)', async () => {
    const { signInWithEmailAndPassword } = require('firebase/auth');
    signInWithEmailAndPassword.mockImplementationOnce(() =>
      Promise.reject({ message: 'Firebase: Error (auth/invalid-credential).' })
    );

    const { getByPlaceholderText, getByText, queryByText } = render(<LoginPage />);
    const emailInput = getByPlaceholderText('Email Address');
    const passwordInput = getByPlaceholderText('Password');
    const signInButton = getByText('Sign In');

    fireEvent.changeText(emailInput, 'wrong@email.com');
    fireEvent.changeText(passwordInput, 'wrongpassword');
    fireEvent.press(signInButton);

    await waitFor(() =>
      expect(queryByText('Bad credentials.')).toBeTruthy()
    );
  });
});
