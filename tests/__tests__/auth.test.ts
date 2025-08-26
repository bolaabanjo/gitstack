import { render, screen, fireEvent } from '@testing-library/react';
import { AuthCard } from '../../src/components/auth/AuthCard';
import { useAuth } from '../../src/hooks/useAuth';

jest.mock('../../src/hooks/useAuth');

describe('AuthCard', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      login: jest.fn(),
      signup: jest.fn(),
      resetPassword: jest.fn(),
    });
  });

  test('renders login form by default', () => {
    render(<AuthCard />);
    expect(screen.getByText(/login/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('switches to signup form when "Create an account" is clicked', () => {
    render(<AuthCard />);
    fireEvent.click(screen.getByText(/create an account/i));
    expect(screen.getByText(/sign up/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  test('switches to reset password form when "Forgot password?" is clicked', () => {
    render(<AuthCard />);
    fireEvent.click(screen.getByText(/forgot password\?/i));
    expect(screen.getByText(/reset password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
  });

  test('calls login function on login form submission', () => {
    const { login } = useAuth();
    render(<AuthCard />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(login).toHaveBeenCalledWith('test@example.com', 'password');
  });

  test('calls signup function on signup form submission', () => {
    const { signup } = useAuth();
    render(<AuthCard />);
    fireEvent.click(screen.getByText(/create an account/i));
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    expect(signup).toHaveBeenCalledWith('test@example.com', 'password');
  });

  test('calls resetPassword function on reset password form submission', () => {
    const { resetPassword } = useAuth();
    render(<AuthCard />);
    fireEvent.click(screen.getByText(/forgot password\?/i));
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));
    expect(resetPassword).toHaveBeenCalledWith('test@example.com');
  });
});