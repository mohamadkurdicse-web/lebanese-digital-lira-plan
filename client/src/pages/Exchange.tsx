import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowRightLeft, TrendingUp, Zap, AlertCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ExchangeRate {
  lbpToUsdt: number;
  usdtToLbp: number;
  timestamp: Date;
}

interface ExchangeFee {
  percentage: number;
  fixed: number;
  total: number;
}

export default function Exchange() {
  const [fromCurrency, setFromCurrency] = useState<"LBP" | "USDT">("LBP");
  const [toCurrency, setToCurrency] = useState<"USDT" | "LBP">("USDT");
  const [fromAmount, setFromAmount] = useState<string>("1000");
  const [toAmount, setToAmount] = useState<string>("0.59");
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate>({
    lbpToUsdt: 0.00059,
    usdtToLbp: 1694.92,
    timestamp: new Date(),
  });
  const [fee, setFee] = useState<ExchangeFee>({
    percentage: 0.5,
    fixed: 0,
    total: 0,
  });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const rateHistory = [
    { date: "Jan 1", rate: 0.00055 },
    { date: "Jan 2", rate: 0.00056 },
    { date: "Jan 3", rate: 0.00057 },
    { date: "Jan 4", rate: 0.00058 },
    { date: "Jan 5", rate: 0.00059 },
    { date: "Jan 6", rate: 0.00059 },
  ];

  // Calculate exchange amount
  useEffect(() => {
    let amount = 0;
    let feeAmount = 0;

    if (fromCurrency === "LBP" && toCurrency === "USDT") {
      amount = parseFloat(fromAmount) * exchangeRate.lbpToUsdt;
      feeAmount = amount * (fee.percentage / 100) + fee.fixed;
    } else if (fromCurrency === "USDT" && toCurrency === "LBP") {
      amount = parseFloat(fromAmount) * exchangeRate.usdtToLbp;
      feeAmount = amount * (fee.percentage / 100) + fee.fixed;
    }

    const finalAmount = amount - feeAmount;
    setToAmount(finalAmount.toFixed(2));
    setFee((prev) => ({ ...prev, total: feeAmount }));
  }, [fromAmount, fromCurrency, toCurrency, exchangeRate, fee.percentage, fee.fixed]);

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency === "USDT" ? "USDT" : "LBP");
    setToCurrency(fromCurrency === "LBP" ? "USDT" : "LBP");
    setFromAmount(toAmount);
  };

  const handleConfirmExchange = async () => {
    setIsProcessing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setShowConfirmDialog(false);
    // Show success message
    alert("تم التحويل بنجاح!");
  };

  const currentRate = fromCurrency === "LBP" ? exchangeRate.lbpToUsdt : exchangeRate.usdtToLbp;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">تحويل العملات</h1>
          <p className="text-muted-foreground">حول بين الليرة الرقمية و USDT بأسعار فورية</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Exchange Card */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle>تحويل العملات</CardTitle>
                <CardDescription>أدخل المبلغ الذي تريد تحويله</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* From Currency */}
                <div>
                  <label className="text-sm font-medium mb-2 block">من</label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        type="number"
                        value={fromAmount}
                        onChange={(e) => setFromAmount(e.target.value)}
                        placeholder="أدخل المبلغ"
                        className="text-lg"
                      />
                    </div>
                    <div className="w-32 px-4 py-2 border border-border rounded-lg bg-muted flex items-center justify-center font-semibold">
                      {fromCurrency}
                    </div>
                  </div>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleSwapCurrencies}
                    className="rounded-full w-12 h-12 hover:bg-blue-50"
                  >
                    <ArrowRightLeft size={20} className="text-blue-600" />
                  </Button>
                </div>

                {/* To Currency */}
                <div>
                  <label className="text-sm font-medium mb-2 block">إلى</label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        type="number"
                        value={toAmount}
                        readOnly
                        placeholder="0.00"
                        className="text-lg bg-muted"
                      />
                    </div>
                    <div className="w-32 px-4 py-2 border border-border rounded-lg bg-muted flex items-center justify-center font-semibold">
                      {toCurrency}
                    </div>
                  </div>
                </div>

                {/* Exchange Details */}
                <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">السعر الحالي</span>
                    <span className="font-semibold">
                      1 {fromCurrency} = {currentRate.toFixed(6)} {toCurrency}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">الرسوم ({fee.percentage}%)</span>
                    <span className="font-semibold text-red-600">
                      {fee.total.toFixed(2)} {toCurrency}
                    </span>
                  </div>
                  <div className="border-t border-blue-200 pt-3 flex justify-between">
                    <span className="font-semibold">المبلغ النهائي</span>
                    <span className="font-bold text-lg text-green-600">{toAmount} {toCurrency}</span>
                  </div>
                </div>

                {/* Confirm Button */}
                <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg">
                      <Zap size={20} className="ml-2" />
                      تأكيد التحويل
                    </Button>
                  </DialogTrigger>
                  <DialogContent dir="rtl">
                    <DialogHeader>
                      <DialogTitle>تأكيد التحويل</DialogTitle>
                      <DialogDescription>تحقق من التفاصيل قبل تأكيد التحويل</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">المبلغ المرسل</span>
                          <span className="font-semibold">
                            {fromAmount} {fromCurrency}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">الرسوم</span>
                          <span className="font-semibold text-red-600">
                            {fee.total.toFixed(2)} {toCurrency}
                          </span>
                        </div>
                        <div className="border-t border-blue-200 pt-3 flex justify-between">
                          <span className="font-semibold">المبلغ المستقبل</span>
                          <span className="font-bold text-green-600">{toAmount} {toCurrency}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-yellow-800">
                          تأكد من أن جميع التفاصيل صحيحة. لا يمكن استرجاع التحويل بعد التأكيد.
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setShowConfirmDialog(false)}
                          className="flex-1"
                        >
                          إلغاء
                        </Button>
                        <Button
                          onClick={handleConfirmExchange}
                          disabled={isProcessing}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          {isProcessing ? "جاري المعالجة..." : "تأكيد التحويل"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>

          {/* Info Cards */}
          <div className="space-y-4">
            {/* Current Rate Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp size={18} className="text-green-600" />
                  السعر الحالي
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">
                  {currentRate.toFixed(6)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {fromCurrency} / {toCurrency}
                </p>
                <p className="text-xs text-green-600 mt-2">↑ 0.2% آخر 24 ساعة</p>
              </CardContent>
            </Card>

            {/* Fee Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">الرسوم</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">نسبة الرسم</span>
                    <span className="font-semibold">{fee.percentage}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">الحد الأدنى</span>
                    <span className="font-semibold">${fee.fixed}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Limits Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">الحدود</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <p className="text-muted-foreground">الحد الأدنى</p>
                  <p className="font-semibold">$10</p>
                </div>
                <div className="text-sm">
                  <p className="text-muted-foreground">الحد الأقصى</p>
                  <p className="font-semibold">$50,000</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Rate History Chart */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>سجل الأسعار</CardTitle>
            <CardDescription>آخر 6 أيام</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={rateHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: any) => (typeof value === 'number' ? value.toFixed(6) : value)} />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
