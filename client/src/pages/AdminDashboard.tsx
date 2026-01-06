import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, TrendingUp, Wallet, AlertCircle } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  balance: number;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  joinedAt: string;
}

interface Transaction {
  id: string;
  userId: number;
  type: "TRANSFER" | "DEPOSIT" | "WITHDRAWAL";
  amount: string;
  currency: string;
  status: "PENDING" | "CONFIRMED" | "FAILED";
  timestamp: string;
}

export default function AdminDashboard() {
  const [users] = useState<User[]>([
    {
      id: 1,
      name: "محمد كردي",
      email: "mohammad@example.com",
      balance: 125000,
      status: "ACTIVE",
      joinedAt: "2025-01-01",
    },
    {
      id: 2,
      name: "فاطمة علي",
      email: "fatima@example.com",
      balance: 85000,
      status: "ACTIVE",
      joinedAt: "2025-01-02",
    },
    {
      id: 3,
      name: "علي محمد",
      email: "ali@example.com",
      balance: 0,
      status: "INACTIVE",
      joinedAt: "2024-12-15",
    },
  ]);

  const [transactions] = useState<Transaction[]>([
    {
      id: "1",
      userId: 1,
      type: "TRANSFER",
      amount: "1000",
      currency: "LBP",
      status: "CONFIRMED",
      timestamp: "2025-01-06 14:30",
    },
    {
      id: "2",
      userId: 2,
      type: "DEPOSIT",
      amount: "100",
      currency: "USDT",
      status: "CONFIRMED",
      timestamp: "2025-01-05 10:15",
    },
  ]);

  const statsData = [
    { date: "Jan 1", users: 5, transactions: 12, volume: 45000 },
    { date: "Jan 2", users: 8, transactions: 18, volume: 62000 },
    { date: "Jan 3", users: 12, transactions: 25, volume: 85000 },
    { date: "Jan 4", users: 15, transactions: 32, volume: 105000 },
    { date: "Jan 5", users: 18, transactions: 38, volume: 125000 },
    { date: "Jan 6", users: 20, transactions: 42, volume: 145000 },
  ];

  const userStatusData = [
    { name: "نشط", value: 18, color: "#10b981" },
    { name: "غير نشط", value: 2, color: "#6b7280" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "text-green-600 bg-green-50";
      case "INACTIVE":
        return "text-gray-600 bg-gray-50";
      case "SUSPENDED":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusAr = (status: string) => {
    const statuses: Record<string, string> = {
      ACTIVE: "نشط",
      INACTIVE: "غير نشط",
      SUSPENDED: "معلق",
    };
    return statuses[status] || status;
  };

  const getTransactionTypeAr = (type: string) => {
    const types: Record<string, string> = {
      TRANSFER: "تحويل",
      DEPOSIT: "إيداع",
      WITHDRAWAL: "سحب",
    };
    return types[type] || type;
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">لوحة تحكم الإدارة</h1>
          <p className="text-muted-foreground">مراقبة النظام والمستخدمين والمعاملات</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users size={18} className="text-blue-600" />
                إجمالي المستخدمين
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">20</p>
              <p className="text-xs text-green-600 mt-1">+2 هذا الأسبوع</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp size={18} className="text-green-600" />
                المعاملات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">42</p>
              <p className="text-xs text-green-600 mt-1">+8 اليوم</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Wallet size={18} className="text-purple-600" />
                إجمالي الحجم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">$145K</p>
              <p className="text-xs text-green-600 mt-1">+20K اليوم</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertCircle size={18} className="text-red-600" />
                التنبيهات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">3</p>
              <p className="text-xs text-red-600 mt-1">تحتاج مراجعة</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="users">المستخدمين</TabsTrigger>
            <TabsTrigger value="transactions">المعاملات</TabsTrigger>
            <TabsTrigger value="reports">التقارير</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Users Growth */}
              <Card>
                <CardHeader>
                  <CardTitle>نمو المستخدمين</CardTitle>
                  <CardDescription>آخر 6 أيام</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={statsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Transaction Volume */}
              <Card>
                <CardHeader>
                  <CardTitle>حجم المعاملات</CardTitle>
                  <CardDescription>آخر 6 أيام</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={statsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="volume" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* User Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>توزيع حالة المستخدمين</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={userStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {userStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>قائمة المستخدمين</CardTitle>
                <CardDescription>جميع المستخدمين المسجلين</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right py-3 px-4">الاسم</th>
                        <th className="text-right py-3 px-4">البريد الإلكتروني</th>
                        <th className="text-right py-3 px-4">الرصيد</th>
                        <th className="text-right py-3 px-4">الحالة</th>
                        <th className="text-right py-3 px-4">تاريخ الانضمام</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">{user.name}</td>
                          <td className="py-3 px-4">{user.email}</td>
                          <td className="py-3 px-4">${user.balance.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(user.status)}`}>
                              {getStatusAr(user.status)}
                            </span>
                          </td>
                          <td className="py-3 px-4">{user.joinedAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>سجل المعاملات</CardTitle>
                <CardDescription>جميع المعاملات في النظام</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <p className="font-medium">{getTransactionTypeAr(tx.type)}</p>
                        <p className="text-sm text-muted-foreground">{tx.timestamp}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {tx.amount} {tx.currency}
                        </p>
                        <p className="text-sm text-muted-foreground">المستخدم #{tx.userId}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>التقارير</CardTitle>
                <CardDescription>تقارير النظام والإحصائيات</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border border-border rounded-lg">
                    <h3 className="font-semibold mb-2">تقرير النشاط اليومي</h3>
                    <p className="text-sm text-muted-foreground">إجمالي المستخدمين النشطين: 18</p>
                    <p className="text-sm text-muted-foreground">إجمالي المعاملات: 42</p>
                    <p className="text-sm text-muted-foreground">حجم التحويلات: $145,000</p>
                  </div>
                  <div className="p-4 border border-border rounded-lg">
                    <h3 className="font-semibold mb-2">تقرير الأمان</h3>
                    <p className="text-sm text-muted-foreground">محاولات تسجيل دخول فاشلة: 2</p>
                    <p className="text-sm text-muted-foreground">حسابات مشبوهة: 0</p>
                    <p className="text-sm text-muted-foreground">تنبيهات الأمان: 3</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
