import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Clock, AlertCircle, Upload, FileText } from "lucide-react";

interface KYCData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
  idType: string;
  idNumber: string;
  address: string;
  city: string;
  country: string;
  zipCode: string;
}

interface KYCStatus {
  step: number;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  message: string;
}

export default function KYC() {
  const [currentStep, setCurrentStep] = useState(1);
  const [kycData, setKycData] = useState<KYCData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    nationality: "",
    idType: "PASSPORT",
    idNumber: "",
    address: "",
    city: "",
    country: "",
    zipCode: "",
  });

  const [uploadedFiles, setUploadedFiles] = useState<{
    idFront?: File;
    idBack?: File;
    selfie?: File;
    addressProof?: File;
  }>({});

  const [kycStatus, setKycStatus] = useState<KYCStatus>({
    step: 1,
    status: "PENDING",
    message: "قيد الانتظار",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setKycData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFiles((prev) => ({ ...prev, [fileType]: file }));
    }
  };

  const handleSubmitStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit KYC
      setKycStatus({
        step: 4,
        status: "VERIFIED",
        message: "تم التحقق من بيانات الهوية بنجاح",
      });
    }
  };

  const getStepStatus = (step: number) => {
    if (step < currentStep) return "VERIFIED";
    if (step === currentStep) return "PENDING";
    return "PENDING";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return <CheckCircle size={20} className="text-green-600" />;
      case "PENDING":
        return <Clock size={20} className="text-yellow-600" />;
      case "REJECTED":
        return <AlertCircle size={20} className="text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">التحقق من الهوية (KYC)</h1>
          <p className="text-muted-foreground">أكمل عملية التحقق من الهوية للوصول إلى جميع الميزات</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="text-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-white ${
                    step < currentStep
                      ? "bg-green-600"
                      : step === currentStep
                        ? "bg-blue-600"
                        : "bg-gray-300"
                  }`}
                >
                  {step < currentStep ? <CheckCircle size={24} /> : step}
                </div>
                <p className="text-xs font-medium">
                  {step === 1 && "البيانات الشخصية"}
                  {step === 2 && "الهوية"}
                  {step === 3 && "العنوان"}
                  {step === 4 && "التحقق"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle>الخطوة {currentStep} من 4</CardTitle>
            <CardDescription>
              {currentStep === 1 && "أدخل بياناتك الشخصية"}
              {currentStep === 2 && "أرفع صور وثيقة الهوية"}
              {currentStep === 3 && "أدخل عنوانك"}
              {currentStep === 4 && "تحقق من البيانات"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">الاسم الأول</label>
                    <Input
                      name="firstName"
                      value={kycData.firstName}
                      onChange={handleInputChange}
                      placeholder="محمد"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">الاسم الأخير</label>
                    <Input
                      name="lastName"
                      value={kycData.lastName}
                      onChange={handleInputChange}
                      placeholder="كردي"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">البريد الإلكتروني</label>
                    <Input
                      name="email"
                      type="email"
                      value={kycData.email}
                      onChange={handleInputChange}
                      placeholder="example@email.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">رقم الهاتف</label>
                    <Input
                      name="phone"
                      value={kycData.phone}
                      onChange={handleInputChange}
                      placeholder="+961 1 234 5678"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">تاريخ الميلاد</label>
                    <Input
                      name="dateOfBirth"
                      type="date"
                      value={kycData.dateOfBirth}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">الجنسية</label>
                    <Input
                      name="nationality"
                      value={kycData.nationality}
                      onChange={handleInputChange}
                      placeholder="لبناني"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Identity Documents */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">نوع الوثيقة</label>
                  <select
                    name="idType"
                    value={kycData.idType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-border rounded-lg"
                  >
                    <option value="PASSPORT">جواز السفر</option>
                    <option value="ID_CARD">بطاقة الهوية</option>
                    <option value="DRIVER_LICENSE">رخصة القيادة</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">رقم الوثيقة</label>
                  <Input
                    name="idNumber"
                    value={kycData.idNumber}
                    onChange={handleInputChange}
                    placeholder="أدخل رقم الوثيقة"
                  />
                </div>

                <div className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload size={32} className="mx-auto text-muted-foreground mb-2" />
                    <p className="font-medium mb-2">صورة الوثيقة (الأمام)</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "idFront")}
                      className="hidden"
                      id="idFront"
                    />
                    <label htmlFor="idFront" className="cursor-pointer">
                      <Button variant="outline" asChild>
                        <span>اختر الملف</span>
                      </Button>
                    </label>
                    {uploadedFiles.idFront && (
                      <p className="text-sm text-green-600 mt-2">✓ {uploadedFiles.idFront.name}</p>
                    )}
                  </div>

                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload size={32} className="mx-auto text-muted-foreground mb-2" />
                    <p className="font-medium mb-2">صورة الوثيقة (الخلف)</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "idBack")}
                      className="hidden"
                      id="idBack"
                    />
                    <label htmlFor="idBack" className="cursor-pointer">
                      <Button variant="outline" asChild>
                        <span>اختر الملف</span>
                      </Button>
                    </label>
                    {uploadedFiles.idBack && (
                      <p className="text-sm text-green-600 mt-2">✓ {uploadedFiles.idBack.name}</p>
                    )}
                  </div>

                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload size={32} className="mx-auto text-muted-foreground mb-2" />
                    <p className="font-medium mb-2">صورة شخصية (Selfie)</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "selfie")}
                      className="hidden"
                      id="selfie"
                    />
                    <label htmlFor="selfie" className="cursor-pointer">
                      <Button variant="outline" asChild>
                        <span>اختر الملف</span>
                      </Button>
                    </label>
                    {uploadedFiles.selfie && (
                      <p className="text-sm text-green-600 mt-2">✓ {uploadedFiles.selfie.name}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Address */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">العنوان</label>
                  <Input
                    name="address"
                    value={kycData.address}
                    onChange={handleInputChange}
                    placeholder="شارع الحمراء"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">المدينة</label>
                    <Input
                      name="city"
                      value={kycData.city}
                      onChange={handleInputChange}
                      placeholder="بيروت"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">الرمز البريدي</label>
                    <Input
                      name="zipCode"
                      value={kycData.zipCode}
                      onChange={handleInputChange}
                      placeholder="1107 2020"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">الدولة</label>
                  <Input
                    name="country"
                    value={kycData.country}
                    onChange={handleInputChange}
                    placeholder="لبنان"
                  />
                </div>

                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <FileText size={32} className="mx-auto text-muted-foreground mb-2" />
                  <p className="font-medium mb-2">إثبات العنوان</p>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileUpload(e, "addressProof")}
                    className="hidden"
                    id="addressProof"
                  />
                  <label htmlFor="addressProof" className="cursor-pointer">
                    <Button variant="outline" asChild>
                      <span>اختر الملف</span>
                    </Button>
                  </label>
                  {uploadedFiles.addressProof && (
                    <p className="text-sm text-green-600 mt-2">✓ {uploadedFiles.addressProof.name}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    تحقق من جميع البيانات المدخلة أدناه. إذا كانت هناك أي أخطاء، يمكنك العودة والتصحيح.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between p-3 border border-border rounded-lg">
                    <span className="text-muted-foreground">الاسم الكامل</span>
                    <span className="font-semibold">
                      {kycData.firstName} {kycData.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between p-3 border border-border rounded-lg">
                    <span className="text-muted-foreground">البريد الإلكتروني</span>
                    <span className="font-semibold">{kycData.email}</span>
                  </div>
                  <div className="flex justify-between p-3 border border-border rounded-lg">
                    <span className="text-muted-foreground">رقم الهاتف</span>
                    <span className="font-semibold">{kycData.phone}</span>
                  </div>
                  <div className="flex justify-between p-3 border border-border rounded-lg">
                    <span className="text-muted-foreground">العنوان</span>
                    <span className="font-semibold">
                      {kycData.city}, {kycData.country}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✓ تم تحميل جميع المستندات المطلوبة بنجاح
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-8">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex-1"
                >
                  السابق
                </Button>
              )}
              <Button
                onClick={handleSubmitStep}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {currentStep === 4 ? "إرسال للتحقق" : "التالي"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Status Card */}
        {kycStatus.status === "VERIFIED" && (
          <Card className="mt-8 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <CheckCircle size={32} className="text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">تم التحقق بنجاح</p>
                  <p className="text-sm text-green-700">يمكنك الآن الوصول إلى جميع الميزات</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
