/**
 * Elite Barber Shop - Payment Service
 * Handles payment processing, billing, and financial transactions
 * @version 2.0.0
 */

class PaymentService {
  constructor() {
    this.stripe = null;
    this.paymentMethods = [];
    this.transactions = [];
    this.isInitialized = false;
    this.supportedMethods = ['card', 'pix', 'boleto', 'wallet'];
    
    this.init();
  }

  async init() {
    try {
      await this.initializeStripe();
      await this.loadPaymentMethods();
      this.isInitialized = true;
      console.log('💳 Payment Service initialized');
    } catch (error) {
      console.error('Payment Service initialization failed:', error);
    }
  }

  /**
   * Initialize Stripe
   */
  async initializeStripe() {
    if (typeof Stripe === 'undefined') {
      console.warn('Stripe not loaded, payment features will be limited');
      return;
    }

    try {
      // In production, get this from environment
      const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_demo';
      this.stripe = Stripe(publishableKey);
      console.log('Stripe initialized');
    } catch (error) {
      console.error('Stripe initialization failed:', error);
    }
  }

  /**
   * Load saved payment methods
   */
  async loadPaymentMethods() {
    try {
      const saved = localStorage.getItem('paymentMethods');
      this.paymentMethods = saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load payment methods:', error);
      this.paymentMethods = [];
    }
  }

  /**
   * Process payment for appointment
   */
  async processPayment(appointmentData, paymentData) {
    try {
      const transaction = {
        id: this.generateTransactionId(),
        appointmentId: appointmentData.id,
        amount: appointmentData.totalAmount,
        currency: 'BRL',
        method: paymentData.method,
        status: 'processing',
        createdAt: Date.now(),
        metadata: {
          barberId: appointmentData.barberId,
          serviceId: appointmentData.serviceId,
          customerEmail: appointmentData.customerEmail
        }
      };

      // Add to transactions
      this.transactions.push(transaction);

      // Process based on payment method
      let result;
      switch (paymentData.method) {
        case 'card':
          result = await this.processCardPayment(transaction, paymentData);
          break;
        case 'pix':
          result = await this.processPixPayment(transaction, paymentData);
          break;
        case 'boleto':
          result = await this.processBoletoPayment(transaction, paymentData);
          break;
        case 'wallet':
          result = await this.processWalletPayment(transaction, paymentData);
          break;
        default:
          throw new Error('Método de pagamento não suportado');
      }

      // Update transaction status
      transaction.status = result.status;
      transaction.paymentIntentId = result.paymentIntentId;
      transaction.completedAt = Date.now();

      // Save transaction
      this.saveTransaction(transaction);

      // Emit payment event
      document.dispatchEvent(new CustomEvent('payment-processed', {
        detail: { transaction, result }
      }));

      return {
        success: true,
        transaction,
        ...result
      };

    } catch (error) {
      console.error('Payment processing failed:', error);
      throw error;
    }
  }

  /**
   * Process card payment via Stripe
   */
  async processCardPayment(transaction, paymentData) {
    if (!this.stripe) {
      // Simulate card payment for demo
      return this.simulatePayment(transaction, 'card');
    }

    try {
      // Create payment intent
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          amount: transaction.amount * 100, // Convert to cents
          currency: transaction.currency.toLowerCase(),
          appointmentId: transaction.appointmentId,
          metadata: transaction.metadata
        })
      });

      const { clientSecret } = await response.json();

      // Confirm payment
      const result = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: paymentData.cardElement,
          billing_details: {
            name: paymentData.billingDetails.name,
            email: paymentData.billingDetails.email
          }
        }
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      return {
        status: 'completed',
        paymentIntentId: result.paymentIntent.id,
        method: 'card'
      };

    } catch (error) {
      console.error('Card payment failed:', error);
      throw error;
    }
  }

  /**
   * Process PIX payment
   */
  async processPixPayment(transaction, paymentData) {
    try {
      // Generate PIX code
      const pixCode = this.generatePixCode(transaction);
      const qrCode = await this.generateQRCode(pixCode);

      return {
        status: 'pending',
        method: 'pix',
        pixCode,
        qrCode,
        expiresAt: Date.now() + (15 * 60 * 1000) // 15 minutes
      };

    } catch (error) {
      console.error('PIX payment failed:', error);
      throw error;
    }
  }

  /**
   * Process Boleto payment
   */
  async processBoletoPayment(transaction, paymentData) {
    try {
      // Generate boleto
      const boleto = {
        barcode: this.generateBoleto(transaction),
        dueDate: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)), // 7 days
        amount: transaction.amount,
        recipient: 'Elite Barber Shop',
        instructions: 'Pagamento referente ao agendamento'
      };

      return {
        status: 'pending',
        method: 'boleto',
        boleto
      };

    } catch (error) {
      console.error('Boleto payment failed:', error);
      throw error;
    }
  }

  /**
   * Process wallet payment (stored balance)
   */
  async processWalletPayment(transaction, paymentData) {
    try {
      const walletBalance = await this.getWalletBalance();
      
      if (walletBalance < transaction.amount) {
        throw new Error('Saldo insuficiente na carteira');
      }

      // Deduct from wallet
      await this.deductFromWallet(transaction.amount);

      return {
        status: 'completed',
        method: 'wallet',
        walletBalance: walletBalance - transaction.amount
      };

    } catch (error) {
      console.error('Wallet payment failed:', error);
      throw error;
    }
  }

  /**
   * Simulate payment for demo purposes
   */
  async simulatePayment(transaction, method) {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate success/failure (90% success rate)
    const isSuccess = Math.random() > 0.1;

    if (!isSuccess) {
      throw new Error('Pagamento recusado pelo banco');
    }

    return {
      status: 'completed',
      paymentIntentId: `sim_${Date.now()}`,
      method
    };
  }

  /**
   * Add payment method
   */
  async addPaymentMethod(methodData) {
    try {
      const paymentMethod = {
        id: this.generateMethodId(),
        type: methodData.type,
        isDefault: this.paymentMethods.length === 0,
        createdAt: Date.now(),
        ...methodData
      };

      // Encrypt sensitive data
      if (methodData.type === 'card') {
        paymentMethod.last4 = methodData.number.slice(-4);
        paymentMethod.brand = this.detectCardBrand(methodData.number);
        // Don't store full card number
        delete paymentMethod.number;
        delete paymentMethod.cvv;
      }

      this.paymentMethods.push(paymentMethod);
      this.savePaymentMethods();

      return paymentMethod;

    } catch (error) {
      console.error('Failed to add payment method:', error);
      throw error;
    }
  }

  /**
   * Remove payment method
   */
  async removePaymentMethod(methodId) {
    try {
      const index = this.paymentMethods.findIndex(m => m.id === methodId);
      if (index === -1) {
        throw new Error('Método de pagamento não encontrado');
      }

      const removed = this.paymentMethods.splice(index, 1)[0];

      // If removed method was default, set another as default
      if (removed.isDefault && this.paymentMethods.length > 0) {
        this.paymentMethods[0].isDefault = true;
      }

      this.savePaymentMethods();
      return true;

    } catch (error) {
      console.error('Failed to remove payment method:', error);
      throw error;
    }
  }

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(methodId) {
    try {
      // Remove default from all methods
      this.paymentMethods.forEach(method => {
        method.isDefault = method.id === methodId;
      });

      this.savePaymentMethods();
      return true;

    } catch (error) {
      console.error('Failed to set default payment method:', error);
      throw error;
    }
  }

  /**
   * Get payment methods
   */
  getPaymentMethods() {
    return [...this.paymentMethods];
  }

  /**
   * Get default payment method
   */
  getDefaultPaymentMethod() {
    return this.paymentMethods.find(method => method.isDefault);
  }

  /**
   * Calculate fees and taxes
   */
  calculateTotal(baseAmount, options = {}) {
    let total = baseAmount;
    const breakdown = {
      baseAmount,
      fees: 0,
      taxes: 0,
      discount: 0,
      total: 0
    };

    // Apply discount if any
    if (options.discountPercent) {
      breakdown.discount = baseAmount * (options.discountPercent / 100);
      total -= breakdown.discount;
    }

    // Apply service fee (2.9% for card payments)
    if (options.paymentMethod === 'card') {
      breakdown.fees = total * 0.029;
      total += breakdown.fees;
    }

    // Apply taxes if applicable
    if (options.includeTax) {
      breakdown.taxes = total * 0.05; // 5% service tax
      total += breakdown.taxes;
    }

    breakdown.total = Math.round(total * 100) / 100; // Round to 2 decimals

    return breakdown;
  }

  /**
   * Process refund
   */
  async processRefund(transactionId, amount = null, reason = '') {
    try {
      const transaction = this.transactions.find(t => t.id === transactionId);
      if (!transaction) {
        throw new Error('Transação não encontrada');
      }

      const refundAmount = amount || transaction.amount;
      
      if (refundAmount > transaction.amount) {
        throw new Error('Valor do reembolso não pode ser maior que o valor da transação');
      }

      const refund = {
        id: this.generateTransactionId(),
        originalTransactionId: transactionId,
        amount: refundAmount,
        reason,
        status: 'processing',
        createdAt: Date.now()
      };

      // Process refund based on original payment method
      if (transaction.method === 'card' && this.stripe) {
        await this.stripe.refunds.create({
          payment_intent: transaction.paymentIntentId,
          amount: refundAmount * 100
        });
      } else if (transaction.method === 'wallet') {
        // Add back to wallet
        await this.addToWallet(refundAmount);
      }

      refund.status = 'completed';
      refund.completedAt = Date.now();

      this.transactions.push(refund);
      this.saveTransaction(refund);

      return refund;

    } catch (error) {
      console.error('Refund processing failed:', error);
      throw error;
    }
  }

  /**
   * Get transaction history
   */
  getTransactionHistory(filters = {}) {
    let transactions = [...this.transactions];

    if (filters.status) {
      transactions = transactions.filter(t => t.status === filters.status);
    }

    if (filters.method) {
      transactions = transactions.filter(t => t.method === filters.method);
    }

    if (filters.dateFrom) {
      transactions = transactions.filter(t => t.createdAt >= filters.dateFrom);
    }

    if (filters.dateTo) {
      transactions = transactions.filter(t => t.createdAt <= filters.dateTo);
    }

    return transactions.sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance() {
    const balance = localStorage.getItem('walletBalance');
    return balance ? parseFloat(balance) : 0;
  }

  /**
   * Add to wallet
   */
  async addToWallet(amount) {
    const currentBalance = await this.getWalletBalance();
    const newBalance = currentBalance + amount;
    localStorage.setItem('walletBalance', newBalance.toString());
    return newBalance;
  }

  /**
   * Deduct from wallet
   */
  async deductFromWallet(amount) {
    const currentBalance = await this.getWalletBalance();
    if (currentBalance < amount) {
      throw new Error('Saldo insuficiente');
    }
    const newBalance = currentBalance - amount;
    localStorage.setItem('walletBalance', newBalance.toString());
    return newBalance;
  }

  // Utility methods
  generateTransactionId() {
    return 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  generateMethodId() {
    return 'pm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  generatePixCode(transaction) {
    // Simplified PIX code generation
    return `00020126580014BR.GOV.BCB.PIX0136${transaction.id}5204000053039865802BR5925Elite Barber Shop6009Sao Paulo62070503***6304`;
  }

  async generateQRCode(pixCode) {
    // In production, use a proper QR code library
    return `data:image/svg+xml;base64,${btoa(`<svg>QR Code for: ${pixCode}</svg>`)}`;
  }

  generateBoleto(transaction) {
    // Simplified boleto generation
    return `23790.00000 00000.000000 00000.000000 0 ${Math.floor(Date.now() / 1000)}${transaction.amount.toString().padStart(10, '0')}`;
  }

  detectCardBrand(number) {
    const patterns = {
      visa: /^4/,
      mastercard: /^5[1-5]/,
      amex: /^3[47]/,
      discover: /^6(?:011|5)/,
      elo: /^(4011|4312|4389|4514|4573|6362|6363)/
    };

    for (const [brand, pattern] of Object.entries(patterns)) {
      if (pattern.test(number)) {
        return brand;
      }
    }

    return 'unknown';
  }

  savePaymentMethods() {
    localStorage.setItem('paymentMethods', JSON.stringify(this.paymentMethods));
  }

  saveTransaction(transaction) {
    const stored = JSON.parse(localStorage.getItem('transactions') || '[]');
    stored.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(stored));
  }

  loadTransactions() {
    const stored = localStorage.getItem('transactions');
    this.transactions = stored ? JSON.parse(stored) : [];
  }

  /**
   * Validate payment data
   */
  validatePaymentData(paymentData) {
    const errors = [];

    if (!paymentData.method || !this.supportedMethods.includes(paymentData.method)) {
      errors.push('Método de pagamento inválido');
    }

    if (paymentData.method === 'card') {
      if (!paymentData.number || paymentData.number.length < 13) {
        errors.push('Número do cartão inválido');
      }
      if (!paymentData.expiryMonth || !paymentData.expiryYear) {
        errors.push('Data de validade inválida');
      }
      if (!paymentData.cvv || paymentData.cvv.length < 3) {
        errors.push('CVV inválido');
      }
    }

    return errors;
  }

  /**
   * Format currency
   */
  formatCurrency(amount, currency = 'BRL') {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency
    }).format(amount);
  }
}

// Export for use in other modules
window.PaymentService = PaymentService;
