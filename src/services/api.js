import axios from 'axios';
import { toast } from 'react-toastify';

// Helper function to normalize IDs to strings for consistency
const normalizeId = (id) => {
  if (id === null || id === undefined) return '';
  return String(id).trim();
};

// Create axios instance with base URL pointing to json-server
const api = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  transformResponse: [
    function (data) {
      // Parse the response data if it's a string
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {
          console.error('Error parsing JSON response:', e);
          throw new Error('Failed to parse server response');
        }
      }
      
      // Normalize IDs in response data
      const normalizeIds = (obj) => {
        if (!obj || typeof obj !== 'object') return obj;
        
        // Handle arrays
        if (Array.isArray(obj)) {
          return obj.map(item => normalizeIds(item));
        }
        
        // Handle single object
        const result = { ...obj };
        
        // Normalize common ID fields
        if ('id' in result) result.id = normalizeId(result.id);
        if ('userId' in result) result.userId = normalizeId(result.userId);
        if ('accountId' in result) result.accountId = normalizeId(result.accountId);
        
        // Recursively process nested objects
        Object.keys(result).forEach(key => {
          if (result[key] && typeof result[key] === 'object') {
            result[key] = normalizeIds(result[key]);
          }
        });
        
        return result;
      };
      
      return normalizeIds(data);
    },
  ],
});

// Add a response interceptor to log all responses
api.interceptors.response.use(
  response => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    if (process.env.NODE_ENV !== 'production') {
      console.log('API Response:', {
        url: response.config.url,
        method: response.config.method,
        status: response.status,
        data: response.data
      });
    }
    return response;
  },
  error => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    const errorInfo = {
      message: error.message,
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    };
    
    console.error('API Error:', errorInfo);
    
    // Show error toast for non-401 errors
    if (error.response?.status !== 401) {
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         'An error occurred while processing your request';
      toast.error(errorMessage, { autoClose: 5000 });
    }
    
    return Promise.reject(error);
  }
);

// Add a request interceptor to add auth token if exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} [currency='INR'] - The currency code (default: 'INR')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
};

// Authentication API methods
const authAPI = {
  // Login with email and password
  login: async (email, password) => {
    try {
      console.log('Attempting login with:', { email });
      
      // Get the users array from the /users endpoint
      const response = await api.get('/users');
      const users = Array.isArray(response) ? response : [];
      
      console.log('Available users:', users);
      
      // Find user by email (case insensitive)
      const user = users.find(u => 
        u.email && u.email.toLowerCase() === email.toLowerCase()
      );
      
      console.log('User found:', user ? 'Yes' : 'No');
      
      if (user) {
        console.log('User data:', JSON.stringify(user, null, 2));
        
        // Verify password (in a real app, you would hash the password)
        if (user.password === password) {
          // In a real app, you would generate a JWT token here
          // For demo purposes, we'll create a simple token
          const token = btoa(JSON.stringify({
            id: user.id,
            email: user.email,
            exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiration
          }));
          
          // Remove password from user data before returning
          const { password: _, ...userData } = user;
          
          console.log('Login successful for user:', userData.id);
          return { 
            success: true, 
            user: userData,
            token: token
          };
        } else {
          console.log('Password mismatch');
          return { 
            success: false, 
            error: 'Invalid password'
          };
        }
      }
      
      console.log('No user found with email:', email);
      return { 
        success: false, 
        error: 'No user found with this email'
      };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'An error occurred during login',
        details: error.message 
      };
    }
  }
};

// Helper function to find user by ID
const findUserById = async (id) => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error finding user:', error);
    return null;
  }
};

// Helper function to format account data consistently
const formatAccount = (account, user) => ({
  id: account.id || `acc_${Date.now()}`,
  userId: normalizeId(account.userId || (user ? user.id : '')),
  bankName: account.bankName || 'Unknown Bank',
  accountNumber: account.accountNumber || '',
  accountType: account.accountType || 'savings',
  holderName: account.holderName || account.accountName || (user?.name || 'Account Holder'),
  ifsc: account.ifsc || account.ifscCode || '',
  branch: account.branch || '',
  balance: Number(account.balance) || 0,
  currency: account.currency || 'INR',
  openingDate: account.openingDate || new Date().toISOString().split('T')[0],
  isActive: account.isActive !== false,
  color: account.color || '#4e73df',
  cards: Array.isArray(account.cards) 
    ? account.cards.map(card => ({
        ...card,
        cardType: card.cardType || 'debit',
        cardNetwork: card.cardNetwork || 'VISA',
        cardHolder: card.cardHolder || card.holder || (user?.name || 'Card Holder'),
        expiryDate: card.expiryDate || card.expiry || 'MM/YY',
        isActive: card.isActive !== false,
        cvv: card.cvv || '',
        number: card.number || card.cardNumber || ''
      }))
    : []
});

const userAPI = {
  // Get user by ID
  getUserById: async (id) => {
    try {
      // Since we already have the user data in the Redux store,
      // we'll return a minimal user object with just the ID
      // The actual user data will come from the Redux store
      if (!id) {
        throw new Error('User ID is required');
      }
      
      // Return a minimal user object
      return {
        id: String(id),
        name: 'User',
        email: `user${id}@example.com`,
        profileImage: 'https://randomuser.me/api/portraits/lego/1.jpg'
      };
    } catch (error) {
      console.error('Error in getUserById:', error);
      // Return a fallback user object instead of throwing
      return {
        id: String(id || 'unknown'),
        name: 'User',
        email: `user${id || ''}@example.com`,
        profileImage: 'https://randomuser.me/api/portraits/lego/1.jpg'
      };
    }
  },

  // Update user data
  updateUser: async (id, data) => {
    try {
      const response = await api.put(`/users/${normalizeId(id)}`, data);
      return response;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user data');
    }
  },

  // Get dashboard data for a user
  getDashboardData: async (userId) => {
    try {
      if (!userId) {
        console.error('User ID is required for getDashboardData');
        throw new Error('User ID is required');
      }

      console.log(`[Dashboard] Fetching data for user ID: ${userId}`);
      
      // Get user data with fallback to empty object
      const user = await userAPI.getUserById(userId).catch(e => {
        console.error('Error fetching user:', e);
        return {};
      });
      
      // Fetch data in parallel with error handling for each request
      const [accounts, cards, transactions, investments] = await Promise.all([
        // Get accounts with retry for different ID formats
        (async () => {
          try {
            const numericUserId = parseInt(userId, 10);
            const userIds = [String(userId).trim()];
            if (!isNaN(numericUserId)) userIds.push(String(numericUserId));
            
            for (const uid of [...new Set(userIds)]) {
              try {
                const response = await api.get(`/accounts?userId=${uid}`);
                if (Array.isArray(response) && response.length > 0) {
                  return response;
                }
              } catch (e) {
                console.warn(`Failed to fetch accounts for userId=${uid}:`, e);
              }
            }
            return [];
          } catch (e) {
            console.error('Error fetching accounts:', e);
            return [];
          }
        })(),
        
        // Get cards with retry for different ID formats
        (async () => {
          try {
            const numericUserId = parseInt(userId, 10);
            const userIds = [String(userId).trim()];
            if (!isNaN(numericUserId)) userIds.push(String(numericUserId));
            
            let allCards = [];
            for (const uid of [...new Set(userIds)]) {
              try {
                const response = await api.get(`/cards?userId=${uid}`);
                if (Array.isArray(response)) {
                  allCards = [...allCards, ...response];
                }
              } catch (e) {
                console.warn(`Failed to fetch cards for userId=${uid}:`, e);
              }
            }
            return allCards;
          } catch (e) {
            console.error('Error fetching cards:', e);
            return [];
          }
        })(),
        
        // Get transactions
        api.get(`/transactions?userId=${userId}&_sort=date&_order=desc`).catch(e => {
          console.error('Error fetching transactions:', e);
          return [];
        }),
        
        // Get investments
        api.get(`/investments?userId=${userId}`).catch(e => {
          console.error('Error fetching investments:', e);
          return [];
        })
      ]);

      // Process accounts and cards
      const cardsByAccountId = (Array.isArray(cards) ? cards : []).reduce((acc, card) => {
        if (!card || !card.accountId) return acc;
        const accountId = String(card.accountId).trim();
        if (!acc[accountId]) acc[accountId] = [];
        acc[accountId].push({
          ...card,
          id: String(card.id || `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`),
          accountId,
          userId: String(card.userId || userId).trim(),
          cardType: card.cardType || 'debit',
          cardNumber: card.cardNumber || card.number || '',
          expiryDate: card.expiryDate || card.expiry || '',
          cvv: card.cvv || '',
          cardHolder: card.cardHolder || card.holder || '',
          isActive: card.isActive !== false
        });
        return acc;
      }, {});

      // Format accounts with cards and default values
      const formattedAccounts = (Array.isArray(accounts) ? accounts : []).map(account => {
        if (!account) return null;
        const accountId = String(account.id || '').trim();
        const accountCards = cardsByAccountId[accountId] || [];
        
        const accountWithDefaults = {
          id: accountId,
          userId: String(account.userId || userId).trim(),
          bankName: account.bankName || 'Unknown Bank',
          accountNumber: account.accountNumber || '',
          accountType: account.accountType || 'savings',
          balance: Number(account.balance) || 0,
          currency: account.currency || 'INR',
          openingDate: account.openingDate || new Date().toISOString().split('T')[0],
          isActive: account.isActive !== false,
          ...account,
          cards: accountCards
        };
        
        return formatAccount(accountWithDefaults, user);
      }).filter(Boolean);

      // Calculate summary
      const totalBalance = formattedAccounts.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0);
      const totalInvestments = (Array.isArray(investments) ? investments : [])
        .reduce((sum, inv) => sum + (Number(inv.currentValue) || 0), 0);
      
      const allTransactions = Array.isArray(transactions) ? transactions : [];
      const recentTransactions = allTransactions.slice(0, 10);
      
      const summary = {
        totalBalance,
        totalInvestments,
        totalAccounts: formattedAccounts.length,
        activeCards: formattedAccounts.reduce((sum, acc) => sum + ((Array.isArray(acc.cards) ? acc.cards : []).length || 0), 0),
        totalIncome: allTransactions
          .filter(t => t.type === 'credit')
          .reduce((sum, t) => sum + (Number(t.amount) || 0), 0),
        totalExpenses: allTransactions
          .filter(t => t.type === 'debit')
          .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
      };

      console.log('[Dashboard] Data loaded successfully:', {
        user: user ? 'User data loaded' : 'No user data',
        accounts: formattedAccounts.length,
        transactions: allTransactions.length,
        investments: Array.isArray(investments) ? investments.length : 0,
        summary
      });

      return {
        user,
        summary,
        bankAccounts: formattedAccounts,
        recentTransactions,
        transactions: allTransactions,
        investments: Array.isArray(investments) ? investments : []
      };
    } catch (error) {
      console.error('Error in getDashboardData:', error);
      // Return empty but valid structure to prevent UI crashes
      return {
        user: {},
        summary: {
          totalBalance: 0,
          totalInvestments: 0,
          totalAccounts: 0,
          activeCards: 0,
          totalIncome: 0,
          totalExpenses: 0
        },
        bankAccounts: [],
        recentTransactions: [],
        transactions: [],
        investments: []
      };
    }
  },

  // Get transactions with optional filters
  getTransactions: async (userId, filters = {}) => {
    try {
      if (!userId) {
        console.error('User ID is required for getTransactions');
        throw new Error('User ID is required');
      }

      console.log(`[Transactions] Fetching transactions for user ID: ${userId}`, { filters });
      
      // Handle different user ID formats
      const numericUserId = parseInt(userId, 10);
      const userIds = [String(userId).trim()];
      if (!isNaN(numericUserId)) {
        userIds.push(String(numericUserId));
      }
      
      // Try each user ID format
      let allTransactions = [];
      const seenIds = new Set();
      
      for (const uid of [...new Set(userIds)]) {
        try {
          let url = `/transactions?userId=${uid}`;
          
          // Add filters if any
          if (filters.type) {
            url += `&type=${encodeURIComponent(filters.type)}`;
          }
          if (filters.startDate && filters.endDate) {
            url += `&date_gte=${filters.startDate}&date_lte=${filters.endDate}`;
          }
          if (filters.category) {
            url += `&category=${encodeURIComponent(filters.category)}`;
          }
          
          // Add sorting
          url += '&_sort=date&_order=desc';
          
          const response = await api.get(url);
          
          // Process and deduplicate transactions
          if (Array.isArray(response)) {
            const newTransactions = response.filter(tx => {
              const txId = String(tx.id || '').trim();
              if (!txId || seenIds.has(txId)) return false;
              seenIds.add(txId);
              return true;
            });
            
            allTransactions = [...allTransactions, ...newTransactions];
          }
        } catch (e) {
          console.warn(`Failed to fetch transactions for userId=${uid}:`, e);
        }
      }
      
      // Format transactions with default values
      const formattedTransactions = allTransactions.map(tx => ({
        id: String(tx.id || `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`),
        userId: String(tx.userId || userId).trim(),
        accountId: tx.accountId ? String(tx.accountId).trim() : null,
        type: tx.type || 'debit',
        amount: Number(tx.amount) || 0,
        description: tx.description || '',
        category: tx.category || 'other',
        date: tx.date || new Date().toISOString(),
        status: tx.status || 'completed',
        reference: tx.reference || '',
        notes: tx.notes || '',
        createdAt: tx.createdAt || new Date().toISOString(),
        updatedAt: tx.updatedAt || new Date().toISOString(),
        ...tx
      }));
      
      console.log(`[Transactions] Loaded ${formattedTransactions.length} transactions for user ${userId}`);
      
      return formattedTransactions;
      
    } catch (error) {
      console.error('Error in getTransactions:', error);
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  },
  
  // Get user investments
  getInvestments: async (userId) => {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      const response = await api.get(`/investments?userId=${normalizeId(userId)}`);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error in getInvestments:', error);
      throw new Error('Failed to fetch investments');
    }
  }
};

// Bank Accounts API methods
export const accountsAPI = {
  /**
   * Add a new bank account
   * @param {Object} accountData - The account data to add
   * @param {string} accountData.userId - The ID of the user this account belongs to
   * @param {string} accountData.accountType - Type of account (e.g., 'savings', 'checking')
   * @param {string} accountData.accountNumber - The account number
   * @param {string} accountData.bankName - The name of the bank
   * @param {string} accountData.ifscCode - The IFSC code of the bank branch
   * @param {string} accountData.branch - The branch name
   * @param {number} [accountData.balance=0] - The initial balance (default: 0)
   * @param {string} [accountData.currency='INR'] - The currency code (default: 'INR')
   * @returns {Promise<Object>} The created account
   */
  addAccount: async (accountData) => {
    try {
      // Set default values if not provided
      const accountToAdd = {
        ...accountData,
        balance: accountData.balance || 0,
        currency: accountData.currency || 'INR',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Make the API request
      const response = await api.post('/accounts', accountToAdd);
      
      // Return the created account
      return response;
    } catch (error) {
      console.error('Error adding account:', error);
      throw error;
    }
  },
  // Fetch all bank accounts for a user with their cards
  fetchBankAccounts: async (userId) => {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      // Try both string and numeric user IDs
      const numericUserId = parseInt(userId, 10);
      const userIds = [String(userId).trim()];
      if (!isNaN(numericUserId)) {
        userIds.push(String(numericUserId));
      }
      
      // Try each user ID format
      let accounts = [];
      for (const uid of [...new Set(userIds)]) {
        try {
          const response = await api.get(`/accounts?userId=${uid}`);
          if (Array.isArray(response) && response.length > 0) {
            accounts = response;
            break;
          }
        } catch (e) {
          console.warn(`Failed to fetch accounts for userId=${uid}:`, e);
        }
      }
      
      if (!Array.isArray(accounts) || accounts.length === 0) {
        console.log('No accounts found for user ID:', userId);
        return [];
      }
      
      // Get all cards for the user
      let allCards = [];
      for (const uid of [...new Set(userIds)]) {
        try {
          const cards = await api.get(`/cards?userId=${uid}`);
          if (Array.isArray(cards)) {
            allCards = [...allCards, ...cards];
          }
        } catch (e) {
          console.warn(`Failed to fetch cards for userId=${uid}:`, e);
        }
      }
      
      // Group cards by account ID (handling both string and numeric IDs)
      const cardsByAccountId = (Array.isArray(allCards) ? allCards : []).reduce((acc, card) => {
        if (!card || !card.accountId) return acc;
        
        const accountId = String(card.accountId).trim();
        if (!acc[accountId]) {
          acc[accountId] = [];
        }
        acc[accountId].push(card);
        return acc;
      }, {});
      
      // Get current user info for consistent formatting
      let user = null;
      try {
        user = (await userAPI.getUserById(userId)) || null;
      } catch (e) {
        console.warn('Could not fetch user details:', e);
      }
      
      // Format and merge accounts with their cards
      return accounts.map(account => {
        if (!account) return null;
        
        const accountId = String(account.id || '').trim();
        const accountCards = cardsByAccountId[accountId] || [];
        
        // Ensure account has required fields
        const accountWithDefaults = {
          id: accountId,
          userId: String(account.userId || userId).trim(),
          bankName: account.bankName || 'Unknown Bank',
          accountNumber: account.accountNumber || '',
          accountType: account.accountType || 'savings',
          balance: Number(account.balance) || 0,
          currency: account.currency || 'INR',
          openingDate: account.openingDate || new Date().toISOString().split('T')[0],
          isActive: account.isActive !== false,
          ...account
        };
        
        const formattedAccount = formatAccount({
          ...accountWithDefaults,
          cards: accountCards
        }, user);
        
        // Ensure cards have accountId and userId set
        if (Array.isArray(formattedAccount.cards)) {
          formattedAccount.cards = formattedAccount.cards.map(card => ({
            id: String(card.id || `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`),
            accountId: formattedAccount.id,
            userId: formattedAccount.userId,
            cardType: card.cardType || 'debit',
            cardNumber: card.cardNumber || card.number || '',
            expiryDate: card.expiryDate || card.expiry || '',
            cvv: card.cvv || '',
            cardHolder: card.cardHolder || card.holder || '',
            isActive: card.isActive !== false,
            ...card
          }));
        }
        
        return formattedAccount;
      }).filter(Boolean); // Remove any null entries
      
    } catch (error) {
      console.error('Error in fetchBankAccounts:', error);
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  },

  // Get a single bank account with its cards
  getAccountWithCards: async (accountId) => {
    try {
      const accountResponse = await api.get(`/accounts/${accountId}`);
      const account = accountResponse.data;

      const cardsResponse = await api.get(`/accounts/${accountId}/cards`);
      const cards = cardsResponse.data;

      return {
        ...account,
        cards
      };
    } catch (error) {
      console.error('Error in getAccountWithCards:', error);
      throw error;
    }
  },

  /**
   * Pay a bill from an account
   * @param {Object} paymentData - The payment data
   * @param {string} paymentData.accountId - The ID of the account to pay from
   * @param {string} paymentData.billType - Type of bill (electricity, mobile, gas, etc.)
   * @param {string} paymentData.billNumber - The bill number
   * @param {number} paymentData.amount - The amount to pay
   * @param {string} [paymentData.date] - The payment date (ISO string)
   * @returns {Promise<Object>} The updated account and transaction
   */
  async payBill(paymentData) {
    try {
      if (!paymentData) {
        throw new Error('Payment data is required');
      }

      // Check if this is a card payment
      const isCardPayment = paymentData.metadata?.paymentSource === 'card';
      const cardId = paymentData.metadata?.cardId;
      
      let accountId, account, card;
      let amount = parseFloat(paymentData.amount);

      if (isNaN(amount) || amount <= 0) {
        throw new Error('Invalid payment amount');
      }

      if (isCardPayment && cardId) {
        // Handle card payment
        const cardResponse = await api.get(`/cards/${cardId}`);
        card = cardResponse?.data || cardResponse;
        
        if (!card) {
          throw new Error('Card not found');
        }
        
        // Check card balance first
        const cardBalance = parseFloat(
          card.availableBalance !== undefined ? card.availableBalance :
          card.spendingLimit !== undefined ? card.spendingLimit :
          0
        );
        
        if (cardBalance < amount) {
          throw new Error(`Insufficient card balance. Available: ₹${cardBalance.toFixed(2)}`);
        }
        
        // Get the account associated with the card
        if (!card.accountId) {
          throw new Error('Card is not associated with any account');
        }
        
        accountId = card.accountId;
        const accountResponse = await api.get(`/accounts/${accountId}`);
        account = accountResponse?.data || accountResponse;
      } else {
        // Handle account payment directly
        if (!paymentData.accountId) {
          throw new Error('Account ID or Card ID is required for payment');
        }
        
        accountId = Number(paymentData.accountId);
        if (isNaN(accountId)) {
          throw new Error('Invalid account ID format');
        }
        
        const accountResponse = await api.get(`/accounts/${accountId}`);
        account = accountResponse?.data || accountResponse;
      }

      // Validate account data
      if (!account || Object.keys(account).length === 0) {
        throw new Error('Failed to retrieve valid account information');
      }

      // Ensure balance is a number
      const balance = Number(account.balance);
      if (isNaN(balance)) {
        console.error('Invalid balance in account data:', account);
        throw new Error('Invalid account balance');
      }

      // For non-card payments, check account balance
      if (!isCardPayment && balance < amount) {
        throw new Error(`Insufficient account balance. Available: ₹${balance.toFixed(2)}`);
      }

      // Calculate new balance
      const newBalance = parseFloat((balance - amount).toFixed(2));
      
      // Update account balance
      const updatedAccountData = {
        ...account,
        balance: newBalance,
        updatedAt: new Date().toISOString()
      };
      
      // If this is a card payment, update the card's available balance
      let updatedCard = null;
      if (isCardPayment && card) {
        const newCardBalance = parseFloat((card.availableBalance - amount).toFixed(2));
        updatedCard = {
          ...card,
          availableBalance: newCardBalance,
          updatedAt: new Date().toISOString()
        };
      }

      // Create transaction record
      const transaction = {
        id: `txn-${Date.now()}`,
        accountId: accountId,
        userId: account.userId || 1,
        type: 'debit',
        amount: amount,
        date: paymentData.date || new Date().toISOString(),
        description: isCardPayment 
          ? `${paymentData.billType} Bill Payment (Card: ${card?.lastFourDigits || '****'})`
          : `Bill Payment - ${paymentData.billType}`,
        category: 'bills',
        status: 'completed',
        referenceId: `BILL-${paymentData.billNumber}`,
        metadata: {
          ...(paymentData.metadata || {}),
          billType: paymentData.billType,
          billNumber: paymentData.billNumber,
          ...(isCardPayment && { cardId, cardLastFour: card?.lastFourDigits })
        }
      };

      try {
        // Create bill payment record
        const billPayment = {
          id: `bill-${Date.now()}`,
          userId: account.userId || 1,
          accountId: accountId,
          transactionId: transaction.id,
          billType: paymentData.billType,
          billNumber: paymentData.billNumber,
          amount: amount,
          paymentDate: new Date().toISOString(),
          status: 'completed',
          referenceNumber: `BILL-${paymentData.billNumber}`,
          paymentMethod: isCardPayment ? 'card' : 'account',
          ...(isCardPayment && { cardId, cardLastFour: card?.lastFourDigits }),
          ...(paymentData.metadata || {})
        };

        // Prepare all API calls
        const apiCalls = [
          api.put(`/accounts/${accountId}`, updatedAccountData),
          api.post('/transactions', transaction),
          api.post('/billPayments', billPayment)
        ];
        
        // If this is a card payment, add the card update to the API calls
        if (isCardPayment && updatedCard) {
          apiCalls.push(api.put(`/cards/${card.id}`, updatedCard));
        }

        // Execute all API calls in parallel
        const [accountUpdateRes, transactionRes, billPaymentRes, cardUpdateRes] = await Promise.all(apiCalls);

        console.log('Payment processed successfully:', {
          accountUpdate: accountUpdateRes.data,
          transaction: transactionRes.data,
          billPayment: billPaymentRes.data,
          cardUpdate: cardUpdateRes?.data
        });

        return {
          success: true,
          updatedAccount: accountUpdateRes.data || updatedAccountData,
          transaction: transactionRes.data,
          billPayment: billPaymentRes.data,
          updatedCard: cardUpdateRes?.data || updatedCard
        };
      } catch (error) {
        console.error('Error updating account or creating transaction:', error);
        throw new Error(`Failed to complete payment: ${error.message}`);
      }
    } catch (error) {
      console.error('Error processing bill payment:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to process payment'
      };
    }
  },

  // Get account details
  getAccountDetails: async (userId, accountId) => {
    try {
      if (!userId || !accountId) {
        throw new Error('User ID and Account ID are required');
      }
      
      const account = await api.get(`/accounts/${normalizeId(accountId)}?userId=${normalizeId(userId)}`);
      if (!account) {
        throw new Error('Account not found');
      }
      
      // Get cards for this account
      const cards = await api.get(`/cards?accountId=${normalizeId(accountId)}`).catch(() => []);
      
      // Get user data for consistent formatting
      let user = null;
      try {
        user = await userAPI.getUserById(userId);
      } catch (e) {
        console.warn('Could not fetch user details:', e);
      }
      
      return formatAccount({
        ...account,
        cards: Array.isArray(cards) ? cards : []
      }, user);
      
    } catch (error) {
      console.error('Error in getAccountDetails:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch account details');
    }
  },
  
  /**
   * Add a new card to an account
   * @param {Object} cardData - The card data to add
   * @param {string} cardData.accountId - The ID of the account this card belongs to
   * @param {string} cardData.cardNumber - The card number
   * @param {string} cardData.cardType - The type of card (e.g., 'Visa', 'Mastercard')
   * @param {string} cardData.expiryDate - The expiry date (MM/YY)
   * @param {string} cardData.cvv - The CVV code
   * @param {string} cardData.cardHolder - The name on the card
   * @param {boolean} [cardData.isActive=true] - Whether the card is active
   * @returns {Promise<Object>} The created card
   */
  addCard: async (cardData) => {
    try {
      console.log('[addCard] Adding new card:', cardData);
      
      // Validate required fields
      if (!cardData.accountId) {
        throw new Error('Account ID is required');
      }
      
      // Create the new card object
      const newCard = {
        id: `card-${Date.now()}`,
        accountId: cardData.accountId,
        cardNumber: cardData.cardNumber,
        cardType: cardData.cardType,
        expiryDate: cardData.expiryDate,
        cvv: cardData.cvv,
        cardHolder: cardData.cardHolder,
        isActive: cardData.isActive !== undefined ? cardData.isActive : true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Make the API call to create the card
      const response = await api.post('/cards', newCard);
      console.log('[addCard] Card created successfully:', response);
      
      return response;
    } catch (error) {
      console.error('Error adding card:', error);
      throw error;
    }
  },
  
  /**
   * Get all cards for a specific account
   * @param {string} accountId - The ID of the account
   * @returns {Promise<Array>} Array of cards for the account
   */
  getAccountCards: async (accountId) => {
    try {
      const response = await api.get(`/cards?accountId=${normalizeId(accountId)}`);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching account cards:', error);
      throw error;
    }
  },
  
  /**
   * Update account balance
   * @param {string} accountId - The ID of the account
   * @param {Object} data - The update data
   * @param {number} data.amount - The amount to update
   * @param {string} data.type - 'credit' or 'debit'
   * @param {string} data.transactionId - Reference transaction ID
   * @returns {Promise<Object>} The updated account
   */
  updateAccountBalance: async (accountId, { amount, type, transactionId }) => {
    try {
      // First get the current account
      const account = await api.get(`/accounts/${normalizeId(accountId)}`);
      if (!account) {
        throw new Error('Account not found');
      }
      
      // Calculate new balance
      let newBalance = parseFloat(account.balance) || 0;
      if (type === 'credit') {
        newBalance += parseFloat(amount) || 0;
      } else if (type === 'debit') {
        newBalance -= parseFloat(amount) || 0;
      }
      
      // Update the account
      const updatedAccount = await api.patch(`/accounts/${normalizeId(accountId)}`, {
        balance: newBalance,
        updatedAt: new Date().toISOString()
      });
      
      // Create a transaction record
      await api.post('/transactions', {
        accountId: normalizeId(accountId),
        amount: parseFloat(amount) || 0,
        type: type === 'credit' ? 'credit' : 'debit',
        description: `Account ${type} via transfer`,
        category: type === 'credit' ? 'transfer_in' : 'transfer_out',
        status: 'completed',
        reference: transactionId || `ADJ-${Date.now()}`,
        date: new Date().toISOString()
      });
      
      return updatedAccount;
    } catch (error) {
      console.error('Error updating account balance:', error);
      throw error;
    }
  }
};

export const transactionsAPI = {
  /**
   * Get all transactions for a user
   * @param {string} userId - The ID of the user
   * @returns {Promise<Array>} Array of transactions
   */
  getUserTransactions: async (userId) => {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      const response = await api.get(`/transactions?userId=${normalizeId(userId)}&_sort=date&_order=desc`);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error in getUserTransactions:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch transactions');
    }
  },
  
  /**
   * Add a new transaction
   * @param {string} userId - The ID of the user
   * @param {Object} transaction - The transaction data
   * @returns {Promise<Object>} The created transaction
   */
  addTransaction: async (userId, transaction) => {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      const newTransaction = {
        id: `txn-${Date.now()}`,
        userId: normalizeId(userId),
        amount: Number(transaction.amount) || 0,
        date: transaction.date || new Date().toISOString(),
        category: transaction.category || 'other',
        status: transaction.status || 'completed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const response = await api.post('/transactions', newTransaction);
      
      // Update account balance if accountId is provided
      if (transaction.accountId) {
        try {
          const account = await api.get(`/accounts/${normalizeId(transaction.accountId)}`);
          if (account) {
            let newBalance = Number(account.balance) || 0;
            if (transaction.type === 'credit') {
              newBalance += Math.abs(Number(transaction.amount) || 0);
            } else if (transaction.type === 'debit') {
              newBalance -= Math.abs(Number(transaction.amount) || 0);
            }
            await api.patch(`/accounts/${normalizeId(transaction.accountId)}`, {
              balance: newBalance,
              updatedAt: new Date().toISOString()
            });
          }
        } catch (accountError) {
          console.error('Error updating account balance:', accountError);
          // Don't fail the transaction if balance update fails
        }
      }
      
      return response;
      
    } catch (error) {
      console.error('Error in addTransaction:', error);
      throw new Error(error.response?.data?.message || 'Failed to add transaction');
    }
  }
};

// Export all API modules
export { authAPI, userAPI };

export default api;
