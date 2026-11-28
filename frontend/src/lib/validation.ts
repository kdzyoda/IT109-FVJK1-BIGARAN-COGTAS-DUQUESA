export const USERNAME_RE = /^[a-zA-Z0-9_]{5,30}$/;
export const NAME_RE = /^[A-Za-z .'-]{2,60}$/;
export const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const USERNAME_HINT = "Username: 5-30 letters, numbers or underscores.";
export const NAME_HINT = "Full name: 2-60 letters, spaces, . ' or -";
export const PASSWORD_HINT =
  "Password: 8+ characters with uppercase, lowercase, number and symbol.";