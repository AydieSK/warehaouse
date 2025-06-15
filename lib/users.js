export const users = [
  {
    id: 1,
    email: 'szymon@example.com',
    password: 'admin123',
    name: 'Szymon',
    role: 'admin',
    accessLevel: 3
  },
  {
    id: 2,
    email: 'waldek@example.com',
    password: 'user123',
    name: 'Waldek',
    role: 'user',
    accessLevel: 2
  }
];

export function findUser(email, password) {
  return users.find(u => u.email === email && u.password === password);
}