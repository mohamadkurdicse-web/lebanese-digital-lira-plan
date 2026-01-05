import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Shield, Zap, TrendingUp, Lock, Smartphone, BarChart3, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("overview");

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
          <div className="flex gap-4">
            <Button variant="ghost" size="sm">العربية</Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">اتصل بنا</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight">
                الليرة الرقمية اللبنانية
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
                نظام دفع إلكتروني متكامل يجمع بين الأمان والابتكار، مع دعم العملات المستقرة والتحويلات الفورية.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 gap-2">
                  اكتشف المزيد <ArrowRight className="w-4 h-4" />
                </Button>
                <Button size="lg" variant="outline">شاهد العرض التوضيحي</Button>
              </div>
            </div>
            <div className="relative h-96 lg:h-full">
              <img
                src="/images/hero-banner.png"
                alt="Hero Banner"
                className="w-full h-full object-cover rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Tabs */}
      <section className="container py-16">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="architecture">الهيكلية</TabsTrigger>
            <TabsTrigger value="features">الميزات</TabsTrigger>
            <TabsTrigger value="timeline">الجدول الزمني</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                    سريع
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-400">
                    تحويلات فورية بين المحافظ برسوم منخفضة جداً
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    آمن
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-400">
                    تشفير من طرف إلى طرف مع مصادقة متعددة العوامل
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    مستقر
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-400">
                    عملة مربوطة بقيمة الليرة اللبنانية مع دعم USDT
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle>حول المشروع</CardTitle>
                <CardDescription>نظام دفع إلكتروني متكامل للعملات الرقمية</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-700 dark:text-slate-300">
                  يهدف مشروع الليرة الرقمية اللبنانية إلى توفير حل دفع إلكتروني آمن وموثوق يعالج التحديات المالية التي يواجهها لبنان. يجمع المشروع بين تقنية البلوكتشين والعملات المستقرة لتوفير:
                </p>
                <ul className="space-y-2">
                  {[
                    "محفظة رقمية آمنة مع دعم Multi-Signature",
                    "تحويلات فورية بين المستخدمين",
                    "دعم العملات المستقرة (LBP Digital و USDT)",
                    "واجهة سهلة الاستخدام للجميع",
                    "معايير أمان عالية جداً"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Architecture Tab */}
          <TabsContent value="architecture" className="space-y-8">
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle>معمارية النظام</CardTitle>
                <CardDescription>الطبقات الرئيسية للتطبيق</CardDescription>
              </CardHeader>
              <CardContent>
                <img
                  src="/images/architecture-diagram.png"
                  alt="System Architecture"
                  className="w-full rounded-lg shadow-lg"
                />
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="text-lg">خدمة المحفظة</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-400 mb-3">
                    إدارة المحافظ الرقمية بشكل آمن مع دعم:
                  </p>
                  <ul className="space-y-2 text-sm">
                    {[
                      "إنشاء محافظ جديدة",
                      "تخزين آمن للمفاتيح (HSM)",
                      "Multi-Signature Support",
                      "تتبع الأرصدة"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="text-lg">خدمة الدفع</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-400 mb-3">
                    معالجة التحويلات والدفع مع:
                  </p>
                  <ul className="space-y-2 text-sm">
                    {[
                      "تحويلات فورية",
                      "التحقق من الأرصدة",
                      "حساب الرسوم",
                      "تسوية المعاملات"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    واجهة المستخدم
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-slate-600 dark:text-slate-400">
                    تطبيق ويب وجوال سهل الاستخدام مع:
                  </p>
                  <ul className="space-y-2 text-sm">
                    {[
                      "لوحة تحكم حديثة",
                      "تصميم مستجيب",
                      "دعم اللغة العربية",
                      "وضع ليلي"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    الأمان
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-slate-600 dark:text-slate-400">
                    معايير أمان عالية جداً:
                  </p>
                  <ul className="space-y-2 text-sm">
                    {[
                      "تشفير E2E",
                      "مصادقة 2FA/3FA",
                      "HSM للمفاتيح",
                      "MPC Technology"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    التقارير
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-slate-600 dark:text-slate-400">
                    تقارير شاملة وتحليلات:
                  </p>
                  <ul className="space-y-2 text-sm">
                    {[
                      "سجل المعاملات",
                      "رسوم بيانية",
                      "تقارير ضريبية",
                      "تحليل الاستخدام"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    العملات
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-slate-600 dark:text-slate-400">
                    دعم عملات متعددة:
                  </p>
                  <ul className="space-y-2 text-sm">
                    {[
                      "LBP Digital (عملة مستقرة)",
                      "USDT ERC20",
                      "تحويل فوري بين العملات",
                      "أسعار صرف حية"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-orange-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-8">
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle>جدول التطوير</CardTitle>
                <CardDescription>مراحل تطوير المشروع على مدار سنة واحدة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    {
                      phase: "المرحلة 1",
                      title: "التأسيس والتخطيط",
                      duration: "الشهر 1-2",
                      items: ["تحليل المتطلبات", "تصميم المعمارية", "إعداد البيئة"]
                    },
                    {
                      phase: "المرحلة 2",
                      title: "التطوير الأساسي",
                      duration: "الشهر 3-6",
                      items: ["خدمة المحفظة", "خدمة الأمان", "واجهة المستخدم"]
                    },
                    {
                      phase: "المرحلة 3",
                      title: "التكامل والاختبار",
                      duration: "الشهر 7-9",
                      items: ["تكامل البلوكتشين", "اختبار الأمان", "اختبار الحمل"]
                    },
                    {
                      phase: "المرحلة 4",
                      title: "الإطلاق التجريبي",
                      duration: "الشهر 10-11",
                      items: ["Testnet Launch", "جمع الملاحظات", "التحسينات"]
                    },
                    {
                      phase: "المرحلة 5",
                      title: "الإطلاق الرسمي",
                      duration: "الشهر 12",
                      items: ["Mainnet Launch", "التسويق", "الدعم المستمر"]
                    }
                  ].map((stage, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                          {i + 1}
                        </div>
                        {i < 4 && <div className="w-1 h-16 bg-blue-200 dark:bg-blue-900 mt-2" />}
                      </div>
                      <div className="pb-8">
                        <h4 className="font-semibold text-slate-900 dark:text-white">{stage.phase}: {stage.title}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{stage.duration}</p>
                        <ul className="space-y-1">
                          {stage.items.map((item, j) => (
                            <li key={j} className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* Security Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-400 py-16 text-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">أمان من الدرجة الأولى</h2>
              <p className="text-lg mb-6 text-blue-50">
                نستخدم أحدث تقنيات التشفير والأمان لحماية أموالك وبيانات شخصية:
              </p>
              <ul className="space-y-3">
                {[
                  "تشفير من طرف إلى طرف (E2E)",
                  "مصادقة متعددة العوامل (2FA/3FA)",
                  "تخزين آمن للمفاتيح (HSM)",
                  "تقنية Multi-Party Computation (MPC)"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Shield className="w-5 h-5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <img
                src="/images/security-illustration.png"
                alt="Security"
                className="w-full rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20 text-center">
        <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">
          جاهز للبدء؟
        </h2>
        <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
          انضم إلينا في بناء مستقبل مالي أفضل للبنان مع نظام دفع آمن وموثوق
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 gap-2">
            اطلب عرض توضيحي <ArrowRight className="w-4 h-4" />
          </Button>
          <Button size="lg" variant="outline">
            تحميل الوثائق
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-white mb-4">عن المشروع</h3>
              <p className="text-sm">نظام دفع إلكتروني متكامل للعملات الرقمية اللبنانية</p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">الموارد</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">الوثائق</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
                <li><a href="#" className="hover:text-white">الأمثلة</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">الشركة</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">حول</a></li>
                <li><a href="#" className="hover:text-white">الفريق</a></li>
                <li><a href="#" className="hover:text-white">اتصل بنا</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">قانوني</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">الخصوصية</a></li>
                <li><a href="#" className="hover:text-white">الشروط</a></li>
                <li><a href="#" className="hover:text-white">الامتثال</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>© 2026 مشروع الليرة الرقمية اللبنانية. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
