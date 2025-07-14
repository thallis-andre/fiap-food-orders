// Set global timeout for all tests
jest.setTimeout(30000);

// Suppress console warnings during tests
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args.length > 0 && typeof args[0] === 'string') {
    // Suppress specific warnings
    if (
      args[0].includes('Error dropping database:') ||
      args[0].includes('Error closing app:') ||
      args[0].includes('Error deleting RabbitMQ vhost:')
    ) {
      return;
    }
  }
  originalWarn(...args);
};
