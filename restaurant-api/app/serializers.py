from rest_framework import serializers
from django.contrib.auth import get_user_model
from . import models

from django.utils import timezone
from datetime import datetime, timedelta


class CreateUserSerializer(serializers.ModelSerializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True,
                                     style={'input_type': 'password'})

    class Meta:
        model = get_user_model()
        fields = ['name', 'username', 
                  'phoneno', 'password']
        write_only_fields = ('password')

    def create(self, validated_data):
        user = super(CreateUserSerializer, self).create(validated_data)
        user.set_password(validated_data['password'])
        user.save()

        return user

class CompanyProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.CompanyProfile
        fields = ['id', 'name', 'email', 'phoneno', 'address', 'logo']


class KitchenSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Kitchen
        fields = ['id', 'name', 'description']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Category()
        fields = ['id', 'title']

class ExtraPriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.ProductPrice()       
        fields =['extraprice']

class ProductSerializer(serializers.ModelSerializer):

    extraprice = ExtraPriceSerializer(many=True, read_only=True)

    class Meta:
        model = models.Product()
        fields = ['id', 'name', 'price', 'cost', 'qty',
                  'date', 'description', 'category', 'pic','barcode','supplier_payment','expiry_date','extraprice','unit','totalunit','isUnit','kitchen']

class FoodIntegrientSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='product.name')
    id = serializers.CharField(source='product.id')
    class Meta:
        model = models.FoodIntegrient()
        fields = ['id', 'product', 'useunit','name']

class FoodSerializer(serializers.ModelSerializer):
    integrient = FoodIntegrientSerializer(many=True, read_only=True)
   
    class Meta:
        model = models.Food()
        fields = ['id','name','price','qty','description','category','pic','kitchen','integrient','isavaliable']

# floor and table serializer
    
class TableSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Table()
        fields = ['id', 'name', 'floor','status']


class FloorSerializer(serializers.ModelSerializer):
    tables = TableSerializer(many=True, read_only=True)
    
    class Meta:
        model = models.Floor()
        fields = ['id', 'name','tables']


class SoldProductSerializer(serializers.ModelSerializer):
    # product_name = serializers.CharField(source='name.name')

    class Meta:
        model = models.SoldProduct()
        fields = ['id', 'name', 'price', 'profit', 'qty', 'date']


class SalesSerializer(serializers.ModelSerializer):
    sproduct = SoldProductSerializer(many=True, read_only=True)

    class Meta:
        model = models.Sales()
        fields = ['receiptNumber','voucherNumber', 'customerName', 'sproduct', 'totalAmount', 'totalProfit', 
                  'tax','isDiscountAmount', 'discount', 'grandtotal', 'deliveryCharges', 'date', 'description','customer_payment']

class CustomerSerializer(serializers.ModelSerializer):
    sales = SalesSerializer(many=True, read_only=True)

    class Meta:
        model = models.CustomerName()
        fields = ['id','name','description', 'sales']


class SupplierSerializer(serializers.ModelSerializer):
    products = ProductSerializer(many=True, read_only=True)

    class Meta:
        model = models.Supplier()
        fields = ['id','name','description', 'products']

class DTSalesSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Sales()
        fields = ['grandtotal', 'date']


class OtherIncomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.OtherIncome()
        fields = ['id', 'title', 'price', 'date', 'description']


class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Expense()
        fields = ['id', 'title', 'price', 'date', 'description']


class PurchaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Purchase()
        fields = ['id', 'title', 'price', 'date', 'description']


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.User
        fields = ['id', 'username', 'name',
                  'phoneno', 'acc_type']


class FeedBackSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.FeedBack
        fields = ['id', 'message']


class AppVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.AppVersion
        fields = ['version', 'url', 'releaseNote']


class PricingSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Pricing
        fields = ['id', 'title', 'price', 'days', 'discount', 'is_digits']


class PricingRequestSerializer(serializers.ModelSerializer):
    user = ProfileSerializer(read_only=True)
    rq_price = PricingSerializer(read_only=True)

    class Meta:
        model = models.PricingRequest
        fields = ['id', 'user', 'rq_price', 'date', 'done']

