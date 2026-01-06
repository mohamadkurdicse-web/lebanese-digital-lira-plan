import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp, Send, Plus } from "lucide-react";
import { useEffect, useState } from "react";

interface WalletData {
  id: number;
  walletAddress: string;
  walletType: string;
  isActive: boolean;
}

interface BalanceData {
  currency: string;
  amount: number;
}

interface TransactionData {
  id: number;
  amount: string;
  currency: string;
  status: string;
  transactionType: string;
  createdAt: string;
}

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [balances, setBalances] = useState<BalanceData[]>([]);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Simulate API calls - في الإنتاج ستكون استدعاءات API حقيقية
      setWallets([
        {
          id: 1,
          walletAddress: "0x1234...5678",
          walletType: "HYBRID",
          isActive: true,
        },
      ]);

      setBalances([
        { currency: "LBP", amount: 50000 },
        { currency: "USDT", amount: 500 },
      ]);

      setTransactions([
        {
          id: 1,
          amount: "1000",
          currency: "LBP",
          status: "CONFIRMED",
          transactionType: "TRANSFER",
          createdAt: "2026-01-06",
        },
        {
          id: 2,
          amount: "100",
          currency: "USDT",
          status: "CONFIRMED",
          transactionType: "DEPOSIT",
          createdAt: "2026-01-05",
        },
      ]);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>يرجى تسجيل الدخول</CardTitle>
            <CardDescription>لعرض لوحة التحكم الخاصة بك</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 dark:text-slate-400">يجب عليك تسجيل الدخول أولاً للوصول إلى لوحة التحكم.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalBalance = balances.reduce((sum, b) => sum + b.amount, 0);
  const chartData = [
    { month: "يناير", LBP: 40000, USDT: 400 },
    { month: "فبراير", LBP: 45000, USDT: 450 },
    { month: "مارس", LBP: 50000, USDT: 500 },
  ];

  const pieData = balances.map((b) => ({
    name: b.currency,
    value: b.amount,
  }));

  const COLORS = ["#3b82f6", "#10b981"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ل</span>
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white">Digital Lira</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-600 dark:text-slate-300">مرحباً، {user?.name || "المستخدم"}</span>
            <Button variant="outline" size="sm">تسجيل الخروج</Button>
          </div>
        </div>
      </nav>

      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">لوحة التحكم</h1>
          <p className="text-slate-600 dark:text-slate-400">إدارة محافظك والمعاملات الخاصة بك</p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">إجمالي الرصيد</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {totalBalance.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-500">USD متكافئ</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                المحافظ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{wallets.length}</div>
              <p className="text-xs text-slate-500 dark:text-slate-500">محفظة نشطة</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                المعاملات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{transactions.length}</div>
              <p className="text-xs text-slate-500 dark:text-slate-500">معاملة مؤكدة</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="wallets">المحافظ</TabsTrigger>
            <TabsTrigger value="transactions">المعاملات</TabsTrigger>
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle>رصيدك على مدار الوقت</CardTitle>
                  <CardDescription>تطور الأرصدة بالعملات المختلفة</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="LBP" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="USDT" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle>توزيع الأرصدة</CardTitle>
                  <CardDescription>نسبة كل عملة</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle>آخر المعاملات</CardTitle>
                <CardDescription>أحدث 5 معاملات</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          {tx.transactionType === "TRANSFER" ? (
                            <Send className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Plus className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{tx.transactionType}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{tx.createdAt}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-slate-900 dark:text-white">
                          {tx.amount} {tx.currency}
                        </p>
                        <p className="text-sm text-green-600">{tx.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wallets Tab */}
          <TabsContent value="wallets" className="space-y-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">محافظي</h2>
              <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                <Plus className="w-4 h-4" />
                محفظة جديدة
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {wallets.map((wallet) => (
                <Card key={wallet.id} className="border-slate-200 dark:border-slate-800">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{wallet.walletType}</span>
                      <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                        نشطة
                      </span>
                    </CardTitle>
                    <CardDescription>{wallet.walletAddress}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">رصيد LBP</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">50,000</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">رصيد USDT</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">500</p>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button variant="outline" size="sm" className="flex-1">
                          إرسال
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          استقبال
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-8">
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle>سجل المعاملات</CardTitle>
                <CardDescription>جميع معاملاتك</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-slate-300">النوع</th>
                        <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-slate-300">المبلغ</th>
                        <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-slate-300">العملة</th>
                        <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-slate-300">الحالة</th>
                        <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-slate-300">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900">
                          <td className="py-3 px-4">{tx.transactionType}</td>
                          <td className="py-3 px-4 font-medium">{tx.amount}</td>
                          <td className="py-3 px-4">{tx.currency}</td>
                          <td className="py-3 px-4">
                            <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                              {tx.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500">{tx.createdAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-8">
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle>إعدادات الحساب</CardTitle>
                <CardDescription>إدارة إعدادات حسابك</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-slate-900 dark:text-white">البريد الإلكتروني</label>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">{user?.email || "لم يتم تعيين"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-900 dark:text-white">المصادقة الثنائية</label>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">غير مفعلة</p>
                  <Button variant="outline" size="sm" className="mt-3">
                    تفعيل 2FA
                  </Button>
                </div>
                <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                  <Button variant="destructive">حذف الحساب</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
