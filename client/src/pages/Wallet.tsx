import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ArrowUpRight, ArrowDownLeft, Send, Copy, Eye, EyeOff } from "lucide-react";

interface WalletBalance {
  lbp: number;
  usdt: number;
  totalUSD: number;
}

interface Transaction {
  id: string;
  type: "TRANSFER" | "DEPOSIT" | "WITHDRAWAL";
  amount: string;
  currency: string;
  status: "PENDING" | "CONFIRMED" | "FAILED";
  timestamp: string;
  recipient?: string;
}

export default function Wallet() {
  const [balances, setBalances] = useState<WalletBalance>({
    lbp: 125000,
    usdt: 500,
    totalUSD: 8500,
  });

  const [showBalance, setShowBalance] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "1",
      type: "TRANSFER",
      amount: "1000",
      currency: "LBP",
      status: "CONFIRMED",
      timestamp: "2025-01-06 14:30",
      recipient: "0x742d...8f2a",
    },
    {
      id: "2",
      type: "DEPOSIT",
      amount: "100",
      currency: "USDT",
      status: "CONFIRMED",
      timestamp: "2025-01-05 10:15",
    },
    {
      id: "3",
      type: "WITHDRAWAL",
      amount: "500",
      currency: "LBP",
      status: "PENDING",
      timestamp: "2025-01-04 16:45",
    },
  ]);

  const chartData = [
    { date: "Jan 1", balance: 7500 },
    { date: "Jan 2", balance: 7800 },
    { date: "Jan 3", balance: 8100 },
    { date: "Jan 4", balance: 8300 },
    { date: "Jan 5", balance: 8400 },
    { date: "Jan 6", balance: 8500 },
  ];

  const currencyDistribution = [
    { name: "LBP", value: 70, color: "#3b82f6" },
    { name: "USDT", value: 30, color: "#10b981" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "text-green-600 bg-green-50";
      case "PENDING":
        return "text-yellow-600 bg-yellow-50";
      case "FAILED":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusAr = (status: string) => {
    const statuses: Record<string, string> = {
      CONFIRMED: "مؤكدة",
      PENDING: "قيد الانتظار",
      FAILED: "فشلت",
    };
    return statuses[status] || status;
  };

  const getTypeAr = (type: string) => {
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
          <h1 className="text-4xl font-bold text-foreground mb-2">محفظتي</h1>
          <p className="text-muted-foreground">إدارة أرصدتك والمعاملات</p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Total Balance */}
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">الرصيد الإجمالي</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">
                    {showBalance ? `$${balances.totalUSD.toLocaleString()}` : "••••••"}
                  </p>
                  <p className="text-xs opacity-75 mt-1">USD</p>
                </div>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="p-2 hover:bg-white/20 rounded-lg transition"
                >
                  {showBalance ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* LBP Balance */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">الليرة الرقمية</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">
                {showBalance ? `${balances.lbp.toLocaleString()}` : "••••••"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">LBP</p>
            </CardContent>
          </Card>

          {/* USDT Balance */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">USDT</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {showBalance ? `${balances.usdt.toLocaleString()}` : "••••••"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">USDT</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Send size={18} className="ml-2" />
            إرسال
          </Button>
          <Button variant="outline">
            <ArrowDownLeft size={18} className="ml-2" />
            استقبال
          </Button>
          <Button variant="outline">
            <ArrowUpRight size={18} className="ml-2" />
            تحويل
          </Button>
          <Button variant="outline">
            <Copy size={18} className="ml-2" />
            نسخ العنوان
          </Button>
        </div>

        {/* Charts and Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Balance Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>رصيدك على مدار الوقت</CardTitle>
              <CardDescription>آخر 6 أيام</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Currency Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>توزيع العملات</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={currencyDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {currencyDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>سجل المعاملات</CardTitle>
            <CardDescription>آخر المعاملات</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        tx.type === "TRANSFER"
                          ? "bg-blue-100"
                          : tx.type === "DEPOSIT"
                            ? "bg-green-100"
                            : "bg-red-100"
                      }`}
                    >
                      {tx.type === "TRANSFER" ? (
                        <Send size={20} className="text-blue-600" />
                      ) : tx.type === "DEPOSIT" ? (
                        <ArrowDownLeft size={20} className="text-green-600" />
                      ) : (
                        <ArrowUpRight size={20} className="text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{getTypeAr(tx.type)}</p>
                      <p className="text-sm text-muted-foreground">{tx.timestamp}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {tx.type === "WITHDRAWAL" ? "-" : "+"}
                        {tx.amount} {tx.currency}
                      </p>
                      <p className={`text-sm px-2 py-1 rounded ${getStatusColor(tx.status)}`}>
                        {getStatusAr(tx.status)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
