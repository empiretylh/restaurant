from django.urls import path, include


from . import views
from . import apiview
from django.conf.urls.static import static
from django.conf import settings


from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [

     # kitchen
     path('api/kitchen/', apiview.KitchenAPIView.as_view(), name='kitchen'),
     path('api/food/', apiview.FoodAPIView.as_view(), name='food'),
     path('api/floor/', apiview.FloorAPIView.as_view(), name='floor'),
     path('api/table/', apiview.TableAPIView.as_view(), name='table'),
     path('api/accounts/', apiview.AccountsAPIView.as_view(), name='accounts'),
     path('api/orders/', apiview.OrderAPIView.as_view()),
     path('api/sendorder/', apiview.SendOrder.as_view()),
     path('api/orderscomplete/', apiview.OrderCompleteAPIView.as_view()),
     path('api/itemdiscount/',apiview.ItemDiscountAPIView.as_view()),
     path('api/deliveryOrder/',apiview.DeliveryOrderAPIView.as_view()),
     path('api/wasteproduct/',apiview.WasteProductView.as_view()),

    path('api/categorys/', apiview.Category.as_view(), name='category'),
    path('api/products/', apiview.Product.as_view(), name='product'), 
    path('api/products/changewithperentage/', apiview.ProductPriceChangeWithPercentage.as_view(), name='product_change_with_perentage'),
    path('api/soldproducts/', apiview.SoldProduct.as_view(), name='sold_product'),
    path('api/sales/', apiview.Sales.as_view(), name='sales'),        
    path('api/expenses/', apiview.Expense.as_view(), name='expense'),
    path('api/purchases/', apiview.Purchase.as_view(), name='purchase'),
    path('api/otherincome/', apiview.OtherIncome.as_view(), name='otherincome'),
    path('api/profitnloss/', apiview.ProfitAndLoss.as_view(), name='profitnloss'),
    path('api/profile/', apiview.ProfileAPIView.as_view(), name='profile'),
    path('api/customer/', apiview.CustomerView.as_view(), name='customer_view'),
    path('api/supplier/', apiview.SupplierView.as_view(), name='supplier_view'),

    path('api/toproduct/', apiview.TopProductsView.as_view(), name='topproduct'),
    path('api/feedback/', apiview.FeedBackAPIView.as_view(), name='feedback'),
    path('api/pricing/', apiview.PricingAPIView.as_view(), name='pricing'),
    path('api/pricingrequest/', apiview.PricingRequestView.as_view(),
         name='pricing_request'),

    path('api/exportprofitnloss/',
         apiview.ExcelExportProfitandLoss.as_view(), name='export_profitnloss'),
    path('api/exportallreport/',
         apiview.ExcelExportAllReportAPIView.as_view(), name='export_report'),

     path('api/excelproductreport/',apiview.ExcelUploadNExportAPIView.as_view(),name='excel_product_report'),
     
     path('api/exportbarcode/',apiview.ExcelExportBarCodeAPIView.as_view(),name='export_barcode'),   



     path('api/profileupdate/',apiview.ProfileUpdate.as_view(),name='profile_update'),

    path('auth/login/', apiview.LoginView.as_view(), name='auth_user_login'),


     # path('auth/user/', apiview.UserAPIView.as_view(), name='auth_user'),
    path('auth/register/', apiview.CreateUserApiView.as_view(),
         name='auth_user_create'),
    path('auth/logout/', apiview.LogoutUserAPIView.as_view(),
         name='auth_user_logout'),
     path('auth/forgotpassword/', apiview.password_recovery.as_view(), name='password_recovery'),
     path('auth/changepassword/', apiview.CheckOTPandChangePassword.as_view(), name='change_password'),
     path('howtopaymoney/', views.howtopaymoney, name='howtopaymoney'),


     # Company Profile
     path('api/companyprofile/', apiview.CreateCompany.as_view(), name='companyprofile'),
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,document_root=settings.MEDIA_ROOT)