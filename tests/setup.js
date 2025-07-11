// Mock chrome API
global.chrome = {
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    },
    getURL: jest.fn(path => `chrome-extension://mock-extension-id/${path}`),
    getManifest: jest.fn(() => ({ version: '2.0.0' }))
  },
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn()
    },
    sync: {
      get: jest.fn(),
      set: jest.fn()
    }
  },
  tabs: {
    query: jest.fn(),
    sendMessage: jest.fn(),
    update: jest.fn()
  },
  webRequest: {
    onBeforeRequest: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    }
  }
};

// Mock for localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    length: jest.fn(() => Object.keys(store).length),
    key: jest.fn(index => Object.keys(store)[index] || null)
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});
