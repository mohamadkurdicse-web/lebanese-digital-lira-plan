# الهيكلية التقنية التفصيلية
## مشروع الليرة الرقمية اللبنانية

---

## 1. معمارية النظام الشاملة

### 1.1 الطبقات الرئيسية

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  (Web App - Mobile App - Admin Dashboard)                  │
└────────────────────┬────────────────────────────────────────┘
                     │ REST API / WebSocket
┌────────────────────▼────────────────────────────────────────┐
│                   API Gateway Layer                          │
│  - Authentication & Authorization                           │
│  - Rate Limiting & DDoS Protection                          │
│  - Request Validation & Logging                             │
│  - Load Balancing                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              Business Logic Layer                            │
│  ┌──────────────┬──────────────┬──────────────┐             │
│  │ Wallet Mgmt  │ Payment Proc │ Exchange Svc │             │
│  ├──────────────┼──────────────┼──────────────┤             │
│  │ User Mgmt    │ Compliance   │ Notification │             │
│  └──────────────┴──────────────┴──────────────┘             │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              Data Access Layer                               │
│  ┌──────────────┬──────────────┬──────────────┐             │
│  │ PostgreSQL   │ Redis Cache  │ Event Store  │             │
│  └──────────────┴──────────────┴──────────────┘             │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│           Blockchain Integration Layer                       │
│  ┌──────────────┬──────────────┬──────────────┐             │
│  │ Web3 Provider│ Smart Ctract │ Wallet Mgmt  │             │
│  │ (Infura)     │ Interaction  │ (HSM/MPC)    │             │
│  └──────────────┴──────────────┴──────────────┘             │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│          Blockchain Networks                                 │
│  ┌──────────────┬──────────────┬──────────────┐             │
│  │ Ethereum     │ Polygon      │ Testnet      │             │
│  │ Mainnet      │ Mainnet      │ Environment  │             │
│  └──────────────┴──────────────┴──────────────┘             │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. مكونات النظام التفصيلية

### 2.1 خدمة المحفظة (Wallet Service)

#### المسؤوليات:
- إنشاء محافظ جديدة
- إدارة المفاتيح الخاصة بشكل آمن
- تتبع الأرصدة
- دعم Multi-Signature

#### الهيكل:

```typescript
interface Wallet {
  id: string;
  userId: string;
  address: string;
  currency: 'LBP' | 'USDT';
  balance: BigNumber;
  publicKey: string;
  // المفتاح الخاص محفوظ في HSM فقط
  createdAt: Date;
  updatedAt: Date;
}

interface WalletService {
  createWallet(userId: string, currency: string): Promise<Wallet>;
  getBalance(walletId: string): Promise<BigNumber>;
  signTransaction(walletId: string, tx: Transaction): Promise<string>;
  validateAddress(address: string): boolean;
}
```

#### التدفق الأمني:
1. طلب إنشاء محفظة
2. توليد مفتاح عام/خاص في HSM
3. حفظ المفتاح العام في قاعدة البيانات
4. إرسال عنوان المحفظة للمستخدم
5. المفتاح الخاص لا يترك HSM أبداً

### 2.2 خدمة الدفع (Payment Service)

#### المسؤوليات:
- معالجة التحويلات
- التحقق من الأرصدة
- تسوية المعاملات
- إدارة حالة المعاملة

#### حالات المعاملة:

```
PENDING → CONFIRMED → SETTLED
   ↓
FAILED
```

#### الكود النموذجي:

```typescript
interface Transaction {
  id: string;
  fromWallet: string;
  toWallet: string;
  amount: BigNumber;
  currency: 'LBP' | 'USDT';
  status: 'pending' | 'confirmed' | 'failed';
  txHash?: string;
  fee: BigNumber;
  createdAt: Date;
  confirmedAt?: Date;
}

async function processTransfer(
  fromWalletId: string,
  toAddress: string,
  amount: BigNumber,
  currency: string
): Promise<Transaction> {
  // 1. التحقق من الرصيد
  const balance = await getBalance(fromWalletId);
  if (balance.lt(amount)) {
    throw new Error('Insufficient balance');
  }

  // 2. إنشاء معاملة جديدة
  const tx = await createTransaction({
    fromWallet: fromWalletId,
    toWallet: toAddress,
    amount,
    currency,
    status: 'pending'
  });

  // 3. توقيع المعاملة
  const signature = await signTransaction(fromWalletId, tx);

  // 4. بث المعاملة على البلوكتشين
  const txHash = await broadcastTransaction(signature);

  // 5. تحديث حالة المعاملة
  await updateTransaction(tx.id, {
    txHash,
    status: 'confirmed'
  });

  return tx;
}
```

### 2.3 خدمة الصرف (Exchange Service)

#### المسؤوليات:
- تحديث أسعار الصرف
- تحويل العملات
- إدارة احتياطيات العملات
- حساب الرسوم

#### نموذج السعر:

```typescript
interface ExchangeRate {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: Decimal;
  timestamp: Date;
  source: 'oracle' | 'market' | 'manual';
}

async function convertCurrency(
  fromCurrency: string,
  toCurrency: string,
  amount: BigNumber
): Promise<{
  fromAmount: BigNumber;
  toAmount: BigNumber;
  rate: Decimal;
  fee: BigNumber;
}> {
  // 1. الحصول على سعر الصرف الحالي
  const rate = await getExchangeRate(fromCurrency, toCurrency);

  // 2. حساب المبلغ المحول
  const toAmount = amount.times(rate);

  // 3. حساب الرسوم (0.5%)
  const fee = toAmount.times(0.005);

  // 4. إرجاع النتيجة
  return {
    fromAmount: amount,
    toAmount: toAmount.minus(fee),
    rate,
    fee
  };
}
```

### 2.4 خدمة الأمان (Security Service)

#### المسؤوليات:
- المصادقة والتفويض
- التشفير وفك التشفير
- مراقبة الاحتيال
- التحقق من الهوية

#### آليات الأمان:

```typescript
// 1. المصادقة متعددة العوامل
interface MFAChallenge {
  id: string;
  userId: string;
  method: 'email' | 'sms' | 'authenticator';
  code: string;
  expiresAt: Date;
}

// 2. التشفير
async function encryptSensitiveData(data: string): Promise<string> {
  const key = await getEncryptionKey();
  return nacl.secretbox.encrypt(data, key);
}

// 3. مراقبة الاحتيال
interface FraudDetectionRule {
  id: string;
  name: string;
  condition: (tx: Transaction) => boolean;
  action: 'block' | 'verify' | 'allow';
}

const fraudRules = [
  {
    name: 'Large Amount',
    condition: (tx) => tx.amount.gt(10000),
    action: 'verify'
  },
  {
    name: 'Unusual Time',
    condition: (tx) => isUnusualTime(tx.createdAt),
    action: 'verify'
  },
  {
    name: 'New Recipient',
    condition: (tx) => isNewRecipient(tx.toWallet),
    action: 'verify'
  }
];
```

### 2.5 خدمة الإشعارات (Notification Service)

#### المسؤوليات:
- إرسال إشعارات فورية
- إدارة تفضيلات الإشعارات
- تتبع حالة الإشعارات

#### القنوات:
- البريد الإلكتروني
- رسائل SMS
- إشعارات التطبيق (Push)
- WebSocket (فوري)

---

## 3. قاعدة البيانات

### 3.1 الجداول الرئيسية

```sql
-- جدول المستخدمين
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  kyc_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
  kyc_data JSONB,
  two_fa_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- جدول المحافظ
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  wallet_address VARCHAR(255) UNIQUE NOT NULL,
  currency ENUM('LBP', 'USDT') NOT NULL,
  balance NUMERIC(20, 8) DEFAULT 0,
  public_key VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_id (user_id),
  INDEX idx_address (wallet_address)
);

-- جدول المعاملات
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_wallet_id UUID NOT NULL REFERENCES wallets(id),
  to_wallet_id UUID REFERENCES wallets(id),
  to_address VARCHAR(255),
  amount NUMERIC(20, 8) NOT NULL,
  currency ENUM('LBP', 'USDT') NOT NULL,
  fee NUMERIC(20, 8) DEFAULT 0,
  status ENUM('pending', 'confirmed', 'failed') DEFAULT 'pending',
  tx_hash VARCHAR(255),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  confirmed_at TIMESTAMP,
  INDEX idx_from_wallet (from_wallet_id),
  INDEX idx_to_wallet (to_wallet_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- جدول أسعار الصرف
CREATE TABLE exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency VARCHAR(10) NOT NULL,
  to_currency VARCHAR(10) NOT NULL,
  rate NUMERIC(20, 8) NOT NULL,
  source VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(from_currency, to_currency)
);

-- جدول سجل الأمان
CREATE TABLE security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  event_type VARCHAR(50) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_id (user_id),
  INDEX idx_event_type (event_type)
);

-- جدول الإشعارات
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255),
  message TEXT,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_id (user_id),
  INDEX idx_read (read)
);
```

### 3.2 الفهارس والأداء

```sql
-- فهارس للأداء
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_user ON transactions USING (
  CASE WHEN from_wallet_id IS NOT NULL 
    THEN (SELECT user_id FROM wallets WHERE id = from_wallet_id)
  END
);

-- تجميع البيانات
CREATE MATERIALIZED VIEW daily_transaction_stats AS
SELECT 
  DATE(created_at) as date,
  currency,
  COUNT(*) as transaction_count,
  SUM(amount) as total_amount,
  AVG(amount) as avg_amount
FROM transactions
WHERE status = 'confirmed'
GROUP BY DATE(created_at), currency;
```

---

## 4. واجهات API

### 4.1 Authentication Endpoints

```
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "phone_number": "+961XXXXXXXX"
}

Response: 201 Created
{
  "id": "uuid",
  "email": "user@example.com",
  "message": "Registration successful. Please verify your email."
}

---

POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

Response: 200 OK
{
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token",
  "expiresIn": 3600,
  "mfaRequired": true
}

---

POST /api/v1/auth/2fa/verify
Content-Type: application/json

{
  "code": "123456"
}

Response: 200 OK
{
  "accessToken": "jwt_token",
  "message": "2FA verification successful"
}
```

### 4.2 Wallet Endpoints

```
POST /api/v1/wallet/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "currency": "LBP"
}

Response: 201 Created
{
  "id": "wallet_uuid",
  "address": "0x1234567890abcdef",
  "currency": "LBP",
  "balance": "0.00000000"
}

---

GET /api/v1/wallet/{walletId}
Authorization: Bearer {token}

Response: 200 OK
{
  "id": "wallet_uuid",
  "address": "0x1234567890abcdef",
  "currency": "LBP",
  "balance": "1000.50000000",
  "createdAt": "2026-01-05T10:00:00Z"
}

---

GET /api/v1/wallet/balance
Authorization: Bearer {token}

Response: 200 OK
{
  "wallets": [
    {
      "currency": "LBP",
      "balance": "1000.50000000"
    },
    {
      "currency": "USDT",
      "balance": "500.25000000"
    }
  ],
  "totalInUSD": "1500.75"
}
```

### 4.3 Transaction Endpoints

```
POST /api/v1/transaction/transfer
Authorization: Bearer {token}
Content-Type: application/json

{
  "fromWalletId": "wallet_uuid",
  "toAddress": "0xabcdef1234567890",
  "amount": "100.50",
  "currency": "LBP",
  "description": "Payment for services"
}

Response: 201 Created
{
  "id": "tx_uuid",
  "status": "pending",
  "amount": "100.50",
  "fee": "0.50",
  "createdAt": "2026-01-05T10:00:00Z"
}

---

GET /api/v1/transaction/history
Authorization: Bearer {token}
Query Parameters:
  - limit: 20
  - offset: 0
  - currency: LBP
  - status: confirmed

Response: 200 OK
{
  "transactions": [
    {
      "id": "tx_uuid",
      "from": "0x1234567890abcdef",
      "to": "0xabcdef1234567890",
      "amount": "100.50",
      "currency": "LBP",
      "status": "confirmed",
      "txHash": "0x...",
      "createdAt": "2026-01-05T10:00:00Z",
      "confirmedAt": "2026-01-05T10:02:00Z"
    }
  ],
  "total": 150,
  "limit": 20,
  "offset": 0
}

---

GET /api/v1/transaction/{transactionId}
Authorization: Bearer {token}

Response: 200 OK
{
  "id": "tx_uuid",
  "from": "0x1234567890abcdef",
  "to": "0xabcdef1234567890",
  "amount": "100.50",
  "currency": "LBP",
  "status": "confirmed",
  "txHash": "0x...",
  "fee": "0.50",
  "createdAt": "2026-01-05T10:00:00Z",
  "confirmedAt": "2026-01-05T10:02:00Z"
}
```

### 4.4 Exchange Endpoints

```
GET /api/v1/exchange/rates
Query Parameters:
  - from: LBP
  - to: USDT

Response: 200 OK
{
  "from": "LBP",
  "to": "USDT",
  "rate": "0.000067",
  "timestamp": "2026-01-05T10:00:00Z"
}

---

POST /api/v1/exchange/convert
Authorization: Bearer {token}
Content-Type: application/json

{
  "fromCurrency": "LBP",
  "toCurrency": "USDT",
  "amount": "1000.00"
}

Response: 200 OK
{
  "fromAmount": "1000.00",
  "fromCurrency": "LBP",
  "toAmount": "0.67",
  "toCurrency": "USDT",
  "rate": "0.000067",
  "fee": "0.0034",
  "timestamp": "2026-01-05T10:00:00Z"
}
```

---

## 5. العقود الذكية (Smart Contracts)

### 5.1 عقد LBP الرقمي

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract DigitalLBP is ERC20, Ownable, Pausable {
    // متغيرات الحالة
    uint256 public pegPrice = 1 ether; // 1 dLBP = 1 LBP
    uint256 public lastPegUpdate;
    address public oracleAddress;
    
    // الأحداث
    event PegAdjustment(uint256 newPrice, uint256 timestamp);
    event OracleUpdated(address newOracle);
    event Minted(address indexed to, uint256 amount);
    event Burned(address indexed from, uint256 amount);
    
    // المعدلات
    modifier onlyOracle() {
        require(msg.sender == oracleAddress, "Only oracle can call this");
        _;
    }
    
    constructor() ERC20("Digital Lebanese Pound", "dLBP") {
        lastPegUpdate = block.timestamp;
    }
    
    // دوال الإصدار والحرق
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
        emit Minted(to, amount);
    }
    
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
        emit Burned(msg.sender, amount);
    }
    
    // دوال إدارة الربط
    function updatePeg(uint256 newPrice) public onlyOracle {
        require(newPrice > 0, "Price must be positive");
        pegPrice = newPrice;
        lastPegUpdate = block.timestamp;
        emit PegAdjustment(newPrice, block.timestamp);
    }
    
    function setOracle(address _oracle) public onlyOwner {
        require(_oracle != address(0), "Invalid oracle address");
        oracleAddress = _oracle;
        emit OracleUpdated(_oracle);
    }
    
    // دوال الإيقاف الطارئ
    function pause() public onlyOwner {
        _pause();
    }
    
    function unpause() public onlyOwner {
        _unpause();
    }
    
    // تجاوز دالة Transfer
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
    
    // دالة الاستعلام عن الربط
    function getPegStatus() public view returns (
        uint256 currentPrice,
        uint256 lastUpdate,
        bool isHealthy
    ) {
        currentPrice = pegPrice;
        lastUpdate = lastPegUpdate;
        // يعتبر الربط صحياً إذا تم تحديثه في آخر 24 ساعة
        isHealthy = (block.timestamp - lastPegUpdate) < 1 days;
    }
}
```

### 5.2 عقد بوابة الدفع

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract PaymentGateway is Ownable, ReentrancyGuard {
    // متغيرات الحالة
    IERC20 public dLBP;
    IERC20 public USDT;
    
    uint256 public feePercentage = 50; // 0.5%
    address public feeRecipient;
    
    // الأحداث
    event PaymentProcessed(
        address indexed from,
        address indexed to,
        uint256 amount,
        address tokenAddress,
        uint256 fee
    );
    
    event FeeUpdated(uint256 newFee);
    
    constructor(address _dLBP, address _USDT, address _feeRecipient) {
        dLBP = IERC20(_dLBP);
        USDT = IERC20(_USDT);
        feeRecipient = _feeRecipient;
    }
    
    // دالة المعالجة الرئيسية
    function processPayment(
        address tokenAddress,
        address to,
        uint256 amount
    ) public nonReentrant returns (bool) {
        require(
            tokenAddress == address(dLBP) || tokenAddress == address(USDT),
            "Unsupported token"
        );
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be positive");
        
        IERC20 token = IERC20(tokenAddress);
        
        // حساب الرسوم
        uint256 fee = (amount * feePercentage) / 10000;
        uint256 netAmount = amount - fee;
        
        // التحقق من الموافقة
        require(
            token.allowance(msg.sender, address(this)) >= amount,
            "Insufficient allowance"
        );
        
        // نقل الأموال
        require(
            token.transferFrom(msg.sender, to, netAmount),
            "Payment transfer failed"
        );
        
        // نقل الرسوم
        require(
            token.transferFrom(msg.sender, feeRecipient, fee),
            "Fee transfer failed"
        );
        
        emit PaymentProcessed(msg.sender, to, netAmount, tokenAddress, fee);
        return true;
    }
    
    // دالة تحديث الرسوم
    function setFeePercentage(uint256 _feePercentage) public onlyOwner {
        require(_feePercentage <= 1000, "Fee too high"); // Max 10%
        feePercentage = _feePercentage;
        emit FeeUpdated(_feePercentage);
    }
}
```

---

## 6. الأمان والتشفير

### 6.1 معايير التشفير

```typescript
// استخدام TweetNaCl.js للتشفير
import nacl from 'tweetnacl';
import { secretbox, randomBytes } from 'tweetnacl';

// توليد مفتاح تشفير
function generateEncryptionKey(): Uint8Array {
  return nacl.randomBytes(secretbox.keyLength);
}

// تشفير البيانات
function encryptData(
  plaintext: string,
  key: Uint8Array
): { ciphertext: string; nonce: string } {
  const nonce = nacl.randomBytes(secretbox.nonceLength);
  const box = nacl.secretbox(
    Buffer.from(plaintext),
    nonce,
    key
  );
  
  return {
    ciphertext: Buffer.from(box).toString('hex'),
    nonce: Buffer.from(nonce).toString('hex')
  };
}

// فك التشفير
function decryptData(
  encrypted: { ciphertext: string; nonce: string },
  key: Uint8Array
): string {
  const box = Buffer.from(encrypted.ciphertext, 'hex');
  const nonce = Buffer.from(encrypted.nonce, 'hex');
  
  const plaintext = nacl.secretbox.open(box, nonce, key);
  if (!plaintext) {
    throw new Error('Decryption failed');
  }
  
  return Buffer.from(plaintext).toString('utf-8');
}
```

### 6.2 المصادقة متعددة العوامل

```typescript
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

// إنشاء سر 2FA
async function generateTwoFactorSecret(email: string) {
  const secret = speakeasy.generateSecret({
    name: `Digital Lira (${email})`,
    length: 32
  });
  
  const qrCode = await QRCode.toDataURL(secret.otpauth_url!);
  
  return {
    secret: secret.base32,
    qrCode
  };
}

// التحقق من رمز 2FA
function verifyTwoFactorCode(secret: string, code: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token: code,
    window: 2
  });
}
```

---

## 7. المراقبة والتسجيل

### 7.1 نظام التسجيل

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// أمثلة على التسجيل
logger.info('Transaction initiated', {
  transactionId: tx.id,
  amount: tx.amount,
  currency: tx.currency
});

logger.error('Payment processing failed', {
  error: error.message,
  transactionId: tx.id,
  timestamp: new Date()
});
```

### 7.2 المراقبة والتنبيهات

```typescript
// استخدام Prometheus للمراقبة
import prometheus from 'prom-client';

const transactionCounter = new prometheus.Counter({
  name: 'transactions_total',
  help: 'Total number of transactions',
  labelNames: ['currency', 'status']
});

const transactionDuration = new prometheus.Histogram({
  name: 'transaction_duration_seconds',
  help: 'Transaction processing duration',
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

// تسجيل المقاييس
transactionCounter.inc({
  currency: 'LBP',
  status: 'confirmed'
});

const timer = transactionDuration.startTimer();
// ... معالجة المعاملة
timer();
```

---

## 8. الاختبار والجودة

### 8.1 استراتيجية الاختبار

```typescript
// اختبار الوحدة (Unit Tests)
import { describe, it, expect } from 'vitest';

describe('WalletService', () => {
  it('should create a new wallet', async () => {
    const wallet = await walletService.createWallet('user123', 'LBP');
    expect(wallet).toBeDefined();
    expect(wallet.currency).toBe('LBP');
  });

  it('should throw error for invalid currency', async () => {
    expect(() => {
      walletService.createWallet('user123', 'INVALID');
    }).toThrow();
  });
});

// اختبار التكامل (Integration Tests)
describe('Payment Flow', () => {
  it('should process complete payment flow', async () => {
    // 1. إنشاء محافظ
    const wallet1 = await createWallet('user1', 'LBP');
    const wallet2 = await createWallet('user2', 'LBP');
    
    // 2. إضافة أموال
    await fundWallet(wallet1.id, 1000);
    
    // 3. معالجة التحويل
    const tx = await processTransfer(
      wallet1.id,
      wallet2.address,
      100
    );
    
    // 4. التحقق من النتائج
    expect(tx.status).toBe('confirmed');
    expect(await getBalance(wallet1.id)).toBe(900);
    expect(await getBalance(wallet2.id)).toBe(100);
  });
});
```

---

## 9. النشر والإنتاج

### 9.1 استراتيجية النشر

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://...
      - REDIS_URL=redis://...
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=digital_lira
      - POSTGRES_PASSWORD=secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

### 9.2 خطة النسخ الاحتياطي والاستعادة

```bash
# النسخ الاحتياطي اليومي
0 2 * * * pg_dump digital_lira | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz

# الاختبار الأسبوعي للاستعادة
0 3 * * 0 pg_restore /backups/db_latest.sql.gz -d digital_lira_test
```

---

**الإصدار**: 1.0
**آخر تحديث**: يناير 2026
