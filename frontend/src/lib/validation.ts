export const USERNAME_RE = /^[a-zA-Z0-9_]{4,20}$/;
export const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const USERNAME_HINT = "Username: 4-20 letters, numbers or underscores.";
export const PASSWORD_HINT =
  "Password: 8+ characters with uppercase, lowercase, number and symbol.";