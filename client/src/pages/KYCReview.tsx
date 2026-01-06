import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Search, FileText, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface KYCRequest {
  id: string;
  userId: number;
  userName: string;
  email: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  submittedAt: string;
  reviewedAt?: string;
  documents: {
    idFront: string;
    idBack: string;
    selfie: string;
    addressProof: string;
  };
  personalData: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    nationality: string;
  };
  address: {
    street: string;
    city: string;
    country: string;
    zipCode: string;
  };
  reviewNotes?: string;
}

export default function KYCReview() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [selectedRequest, setSelectedRequest] = useState<KYCRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [showReviewDialog, setShowReviewDialog] = useState(false);

  // Mock data
  const kycRequests: KYCRequest[] = [
    {
      id: "KYC001",
      userId: 1,
      userName: "محمد كردي",
      email: "mohammad@example.com",
      status: "PENDING",
      submittedAt: "2024-01-06 14:30",
      documents: {
        idFront: "id_front_1.jpg",
        idBack: "id_back_1.jpg",
        selfie: "selfie_1.jpg",
        addressProof: "address_1.pdf",
      },
      personalData: {
        firstName: "محمد",
        lastName: "كردي",
        dateOfBirth: "1990-05-15",
        nationality: "لبناني",
      },
      address: {
        street: "شارع الحمراء",
        city: "بيروت",
        country: "لبنان",
        zipCode: "1107 2020",
      },
    },
    {
      id: "KYC002",
      userId: 2,
      userName: "فاطمة أحمد",
      email: "fatima@example.com",
      status: "PENDING",
      submittedAt: "2024-01-06 10:15",
      documents: {
        idFront: "id_front_2.jpg",
        idBack: "id_back_2.jpg",
        selfie: "selfie_2.jpg",
        addressProof: "address_2.pdf",
      },
      personalData: {
        firstName: "فاطمة",
        lastName: "أحمد",
        dateOfBirth: "1995-03-20",
        nationality: "لبنانية",
      },
      address: {
        street: "شارع بغداد",
        city: "طرابلس",
        country: "لبنان",
        zipCode: "1300",
      },
    },
    {
      id: "KYC003",
      userId: 3,
      userName: "علي محمود",
      email: "ali@example.com",
      status: "APPROVED",
      submittedAt: "2024-01-05 09:00",
      reviewedAt: "2024-01-06 11:30",
      documents: {
        idFront: "id_front_3.jpg",
        idBack: "id_back_3.jpg",
        selfie: "selfie_3.jpg",
        addressProof: "address_3.pdf",
      },
      personalData: {
        firstName: "علي",
        lastName: "محمود",
        dateOfBirth: "1988-07-10",
        nationality: "لبناني",
      },
      address: {
        street: "شارع النيل",
        city: "صيدا",
        country: "لبنان",
        zipCode: "1800",
      },
      reviewNotes: "جميع المستندات صحيحة وواضحة",
    },
  ];

  const filteredRequests = kycRequests.filter((req) => {
    const matchesSearch =
      req.userName.includes(searchTerm) ||
      req.email.includes(searchTerm) ||
      req.id.includes(searchTerm);
    const matchesStatus = filterStatus === "ALL" || req.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock size={14} className="ml-1" />
            قيد الانتظار
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle size={14} className="ml-1" />
            موافق عليه
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle size={14} className="ml-1" />
            مرفوض
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleApprove = () => {
    if (selectedRequest) {
      console.log("Approved:", selectedRequest.id, reviewNotes);
      setShowReviewDialog(false);
      setReviewNotes("");
    }
  };

  const handleReject = () => {
    if (selectedRequest) {
      console.log("Rejected:", selectedRequest.id, reviewNotes);
      setShowReviewDialog(false);
      setReviewNotes("");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">مراجعة طلبات KYC</h1>
          <p className="text-muted-foreground">إدارة ومراجعة طلبات التحقق من الهوية</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ابحث عن الاسم أو البريد الإلكتروني أو الرقم..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>

          <Tabs value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
            <TabsList>
              <TabsTrigger value="ALL">الكل</TabsTrigger>
              <TabsTrigger value="PENDING">قيد الانتظار</TabsTrigger>
              <TabsTrigger value="APPROVED">موافق عليه</TabsTrigger>
              <TabsTrigger value="REJECTED">مرفوض</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                لا توجد طلبات تطابق معايير البحث
              </CardContent>
            </Card>
          ) : (
            filteredRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-semibold text-lg">{request.userName}</p>
                        <p className="text-sm text-muted-foreground">{request.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">رقم الطلب</p>
                        <p className="font-mono font-semibold">{request.id}</p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">تاريخ الإرسال</p>
                      <p className="font-medium">{request.submittedAt}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">المدينة</p>
                      <p className="font-medium">{request.address.city}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">الجنسية</p>
                      <p className="font-medium">{request.personalData.nationality}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">تاريخ الميلاد</p>
                      <p className="font-medium">{request.personalData.dateOfBirth}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Dialog open={showReviewDialog && selectedRequest?.id === request.id} onOpenChange={setShowReviewDialog}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedRequest(request)}
                          className="flex-1"
                        >
                          <FileText size={16} className="ml-2" />
                          عرض التفاصيل
                        </Button>
                      </DialogTrigger>
                      <DialogContent dir="rtl" className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>مراجعة طلب KYC</DialogTitle>
                          <DialogDescription>
                            {request.id} - {request.userName}
                          </DialogDescription>
                        </DialogHeader>

                        <Tabs defaultValue="data">
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="data">البيانات</TabsTrigger>
                            <TabsTrigger value="documents">المستندات</TabsTrigger>
                            <TabsTrigger value="review">المراجعة</TabsTrigger>
                          </TabsList>

                          {/* Data Tab */}
                          <TabsContent value="data" className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">الاسم الأول</p>
                                <p className="font-semibold">{request.personalData.firstName}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">الاسم الأخير</p>
                                <p className="font-semibold">{request.personalData.lastName}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                                <p className="font-semibold">{request.email}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">تاريخ الميلاد</p>
                                <p className="font-semibold">{request.personalData.dateOfBirth}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-sm text-muted-foreground">العنوان</p>
                                <p className="font-semibold">
                                  {request.address.street}, {request.address.city}, {request.address.country}
                                </p>
                              </div>
                            </div>
                          </TabsContent>

                          {/* Documents Tab */}
                          <TabsContent value="documents" className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 border border-border rounded-lg text-center">
                                <FileText size={32} className="mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm font-medium">الهوية - الأمام</p>
                                <p className="text-xs text-muted-foreground mt-1">{request.documents.idFront}</p>
                              </div>
                              <div className="p-4 border border-border rounded-lg text-center">
                                <FileText size={32} className="mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm font-medium">الهوية - الخلف</p>
                                <p className="text-xs text-muted-foreground mt-1">{request.documents.idBack}</p>
                              </div>
                              <div className="p-4 border border-border rounded-lg text-center">
                                <FileText size={32} className="mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm font-medium">صورة شخصية</p>
                                <p className="text-xs text-muted-foreground mt-1">{request.documents.selfie}</p>
                              </div>
                              <div className="p-4 border border-border rounded-lg text-center">
                                <FileText size={32} className="mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm font-medium">إثبات العنوان</p>
                                <p className="text-xs text-muted-foreground mt-1">{request.documents.addressProof}</p>
                              </div>
                            </div>
                          </TabsContent>

                          {/* Review Tab */}
                          <TabsContent value="review" className="space-y-4">
                            <div>
                              <label className="text-sm font-medium mb-2 block">ملاحظات المراجعة</label>
                              <textarea
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                placeholder="أدخل ملاحظاتك حول هذا الطلب..."
                                className="w-full p-3 border border-border rounded-lg"
                                rows={4}
                              />
                            </div>

                            {request.status === "PENDING" && (
                              <div className="flex gap-3">
                                <Button
                                  onClick={handleReject}
                                  variant="outline"
                                  className="flex-1 text-red-600 border-red-200"
                                >
                                  <XCircle size={16} className="ml-2" />
                                  رفض الطلب
                                </Button>
                                <Button
                                  onClick={handleApprove}
                                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <CheckCircle size={16} className="ml-2" />
                                  الموافقة على الطلب
                                </Button>
                              </div>
                            )}

                            {request.status !== "PENDING" && (
                              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                  <strong>الحالة:</strong> {request.status === "APPROVED" ? "موافق عليه" : "مرفوض"}
                                </p>
                                {request.reviewedAt && (
                                  <p className="text-sm text-blue-800 mt-1">
                                    <strong>تاريخ المراجعة:</strong> {request.reviewedAt}
                                  </p>
                                )}
                                {request.reviewNotes && (
                                  <p className="text-sm text-blue-800 mt-1">
                                    <strong>الملاحظات:</strong> {request.reviewNotes}
                                  </p>
                                )}
                              </div>
                            )}
                          </TabsContent>
                        </Tabs>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">قيد الانتظار</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-600">
                {kycRequests.filter((r) => r.status === "PENDING").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">موافق عليه</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {kycRequests.filter((r) => r.status === "APPROVED").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">مرفوض</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">
                {kycRequests.filter((r) => r.status === "REJECTED").length}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
