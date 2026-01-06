import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Download, TrendingUp, Users, DollarSign, ArrowUpRight } from "lucide-react";

export default function Analytics() {
  const [dateFrom, setDateFrom] = useState("2024-01-01");
  const [dateTo, setDateTo] = useState("2024-01-06");

  // Mock data for transactions
  const transactionData = [
    { date: "Jan 1", count: 45, amount: 12500 },
    { date: "Jan 2", count: 52, amount: 15300 },
    { date: "Jan 3", count: 48, amount: 14200 },
    { date: "Jan 4", count: 61, amount: 18900 },
    { date: "Jan 5", count: 55, amount: 16700 },
    { date: "Jan 6", count: 67, amount: 20100 },
  ];

  // Mock data for exchange rates
  const exchangeRateData = [
    { date: "Jan 1", lbpToUsdt: 0.00055, usdtToLbp: 1818.18 },
    { date: "Jan 2", lbpToUsdt: 0.00056, usdtToLbp: 1785.71 },
    { date: "Jan 3", lbpToUsdt: 0.00057, usdtToLbp: 1754.39 },
    { date: "Jan 4", lbpToUsdt: 0.00058, usdtToLbp: 1724.14 },
    { date: "Jan 5", lbpToUsdt: 0.000585, usdtToLbp: 1709.40 },
    { date: "Jan 6", lbpToUsdt: 0.00059, usdtToLbp: 1694.92 },
  ];

  // Mock data for currency distribution
  const currencyDistribution = [
    { name: "LBP", value: 65, color: "#3b82f6" },
    { name: "USDT", value: 35, color: "#10b981" },
  ];

  // Mock data for user growth
  const userGrowthData = [
    { month: "Dec", users: 150 },
    { month: "Jan 1-2", users: 180 },
    { month: "Jan 3-4", users: 220 },
    { month: "Jan 5-6", users: 280 },
  ];

  // Statistics
  const stats = [
    {
      title: "إجمالي المعاملات",
      value: "328",
      change: "+12.5%",
      icon: TrendingUp,
      color: "text-blue-600",
    },
    {
      title: "إجمالي الحجم",
      value: "$97,700",
      change: "+8.2%",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "المستخدمين النشطين",
      value: "280",
      change: "+15.3%",
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "متوسط التحويل",
      value: "$297.56",
      change: "+3.1%",
      icon: ArrowUpRight,
      color: "text-orange-600",
    },
  ];

  const handleExportPDF = () => {
    console.log("Exporting PDF...");
    // Implementation would call the backend API
  };

  const handleExportCSV = () => {
    console.log("Exporting CSV...");
    // Implementation would call the backend API
  };

  const handleExportExcel = () => {
    console.log("Exporting Excel...");
    // Implementation would call the backend API
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">التحليلات والإحصائيات</h1>
          <p className="text-muted-foreground">عرض شامل لأداء النظام والمعاملات</p>
        </div>

        {/* Date Range Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">من</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">إلى</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleExportPDF} variant="outline" size="sm">
                  <Download size={16} className="ml-2" />
                  PDF
                </Button>
                <Button onClick={handleExportCSV} variant="outline" size="sm">
                  <Download size={16} className="ml-2" />
                  CSV
                </Button>
                <Button onClick={handleExportExcel} variant="outline" size="sm">
                  <Download size={16} className="ml-2" />
                  Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-green-600 mt-1">{stat.change}</p>
                    </div>
                    <Icon size={32} className={`${stat.color} opacity-20`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts */}
        <Tabs defaultValue="transactions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="transactions">المعاملات</TabsTrigger>
            <TabsTrigger value="rates">الأسعار</TabsTrigger>
            <TabsTrigger value="distribution">التوزيع</TabsTrigger>
            <TabsTrigger value="users">المستخدمين</TabsTrigger>
          </TabsList>

          {/* Transactions Chart */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>المعاملات اليومية</CardTitle>
                <CardDescription>عدد المعاملات والحجم المالي</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={transactionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="count" fill="#3b82f6" name="عدد المعاملات" />
                    <Bar yAxisId="right" dataKey="amount" fill="#10b981" name="الحجم ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exchange Rates Chart */}
          <TabsContent value="rates">
            <Card>
              <CardHeader>
                <CardTitle>تطور أسعار الصرف</CardTitle>
                <CardDescription>سعر الصرف LBP/USDT و USDT/LBP</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={exchangeRateData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="lbpToUsdt"
                      stroke="#3b82f6"
                      name="LBP إلى USDT"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="usdtToLbp"
                      stroke="#10b981"
                      name="USDT إلى LBP"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Currency Distribution */}
          <TabsContent value="distribution">
            <Card>
              <CardHeader>
                <CardTitle>توزيع العملات</CardTitle>
                <CardDescription>نسبة المعاملات حسب العملة</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={currencyDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {currencyDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Growth */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>نمو المستخدمين</CardTitle>
                <CardDescription>عدد المستخدمين النشطين</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="المستخدمين"
                      dot={{ fill: "#3b82f6", r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Summary Table */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>ملخص الإحصائيات</CardTitle>
            <CardDescription>ملخص شامل للبيانات المختارة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-right py-3 px-4 font-semibold">المقياس</th>
                    <th className="text-right py-3 px-4 font-semibold">القيمة</th>
                    <th className="text-right py-3 px-4 font-semibold">التغيير</th>
                    <th className="text-right py-3 px-4 font-semibold">النسبة</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4">إجمالي المعاملات</td>
                    <td className="py-3 px-4 font-semibold">328</td>
                    <td className="py-3 px-4 text-green-600">+41</td>
                    <td className="py-3 px-4">14.3%</td>
                  </tr>
                  <tr className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4">إجمالي الحجم</td>
                    <td className="py-3 px-4 font-semibold">$97,700</td>
                    <td className="py-3 px-4 text-green-600">+$7,800</td>
                    <td className="py-3 px-4">8.7%</td>
                  </tr>
                  <tr className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4">متوسط التحويل</td>
                    <td className="py-3 px-4 font-semibold">$297.56</td>
                    <td className="py-3 px-4 text-green-600">+$9.15</td>
                    <td className="py-3 px-4">3.2%</td>
                  </tr>
                  <tr className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4">المستخدمين النشطين</td>
                    <td className="py-3 px-4 font-semibold">280</td>
                    <td className="py-3 px-4 text-green-600">+40</td>
                    <td className="py-3 px-4">16.7%</td>
                  </tr>
                  <tr className="hover:bg-muted/50">
                    <td className="py-3 px-4">معدل النمو</td>
                    <td className="py-3 px-4 font-semibold">12.5%</td>
                    <td className="py-3 px-4 text-green-600">+2.1%</td>
                    <td className="py-3 px-4">20.2%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
