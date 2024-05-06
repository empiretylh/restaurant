from django.db import models
from django.contrib.auth.models import AbstractUser, Group

from polymorphic.models import PolymorphicModel
from django.core.files.base import ContentFile
# Create your models here.

class CompanyProfile(models.Model):
    name = models.CharField(max_length=255, null=True, blank=False)
    email = models.CharField(max_length=255, null=True, blank=False)
    phoneno = models.CharField(max_length=11, null=True, blank=False)
    address = models.TextField(blank=True, null=True)
    logo = models.ImageField(upload_to="img/company/%y/%mm/%dd", null=True)
 
 
    def uploadimage(self, logo: str):
        temp_file = ContentFile(logo)
        self.logo.save(f'{self.pk}.jpeg', temp_file)

    def __str__(self):
        return self.name


class User(AbstractUser):
    name = models.CharField(max_length=255, null=True, blank=False)
    phoneno = models.CharField(max_length=11, null=True, blank=False)
    acc_type = models.CharField(max_length=50, null=True, default="Cashier") # Admin, Counter, Cashier, Chef, Waiter, Manager, 
    device_limit = models.IntegerField(null=True, blank=True, default=6)
    def __str__(self):
        return self.name

class Kitchen(models.Model):
    name = models.CharField(max_length=255, null=False, blank=False)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name + ' ' + self.description

class Category(models.Model):
    title = models.CharField(max_length=255, null=False, blank=False)
    show = models.BooleanField(default=True)

    def __str__(self):
        return self.title + ' ' + self.user.username


class Product(models.Model):
    name = models.CharField(max_length=255, null=False, blank=False)
    # this is products sales price
    price = models.CharField(max_length=30, null=False, blank=False)
    # this is products cost price
    cost = models.CharField(max_length=30, null=False, blank=False, default=0)
    qty = models.CharField(max_length=30, null=False, blank=False)
    date = models.DateTimeField(auto_now_add=True)
    description = models.TextField(blank=True, null=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    pic = models.ImageField(upload_to="img/product/%y/%mm/%dd", null=True)
    barcode =  models.CharField(max_length=255, null=True, blank=True, default=0)
    supplier_payment  = models.CharField(max_length=255, null=True, blank=True, default=0)
    expiry_date = models.DateField(null=True, blank=True, default=None)
    unit = models.CharField(max_length=255, null=True, blank=True)
    totalunit =  models.CharField(max_length=255, null=True, blank=True)
    isUnit = models.BooleanField(default=False)
    kitchen = models.ForeignKey(Kitchen, on_delete=models.CASCADE, null=True, blank=True)


    def __str__(self):
        return self.name

class ProductPrice(models.Model):
    pdid = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="extraprice")
    extraprice = models.CharField(max_length=30, null=False, blank=False)

class FoodIntegrient(models.Model):
    product = models.ForeignKey(Product, related_name='food', on_delete=models.CASCADE)
    useunit = models.CharField(max_length=30, null=False, blank=False)

    def __str__(self):
        return self.food.name + ' ' + self.product.name

class Food(models.Model):
    name = models.CharField(max_length=255, null=False, blank=False)
    price = models.CharField(max_length=30, null=False, blank=False)
    qty = models.CharField(max_length=30, null=False, blank=False, default=0)
    description = models.TextField(blank=True, null=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    pic = models.ImageField(upload_to="img/food/%y/%mm/%dd", null=True)
    kitchen = models.ForeignKey(Kitchen, on_delete=models.CASCADE, null=True, blank=True)
    integrient = models.ManyToManyField(FoodIntegrient, related_name='integrient')
    isavaliable = models.BooleanField(default=True)

    def __str__(self):
        return self.name

# // floor and table
class Floor(models.Model):
    name = models.CharField(max_length=255, null=False, blank=False)

    def __str__(self):
        return self.name

class Table(models.Model):
    name = models.CharField(max_length=255, null=False, blank=False)
    floor = models.ForeignKey(Floor, on_delete=models.CASCADE, related_name='tables')
    status = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class Order(PolymorphicModel):
    qty = models.CharField(max_length=10)
    total_price = models.CharField(max_length=10)
    isCooking = models.BooleanField(default=False)
    isComplete = models.BooleanField(default=False)
    kitchen  = models.ForeignKey(Kitchen, on_delete=models.CASCADE, related_name="kitchens")


    def __str__(self):
        return str(self.id)  # 

class FoodOrder(Order):
    food = models.ForeignKey(Food, on_delete=models.CASCADE, related_name="food")
   
class ProductOrder(Order):
    product = models.ForeignKey(Product,on_delete=models.CASCADE,related_name="product")
   
class OrderDetail(models.Model):
    table = models.ForeignKey(Table, on_delete=models.CASCADE, related_name="table_name")
    waiter = models.ForeignKey(User, on_delete=models.CASCADE, related_name="waiter")
    product_orders = models.ManyToManyField(ProductOrder, related_name ="product_orders")
    food_orders = models.ManyToManyField(FoodOrder, related_name="food_orders")
    guest = models.CharField(max_length=5, default=1)
    date = models.DateTimeField(auto_now_add=True)
    is_paid = models.BooleanField(default=False)
    isOrder = models.BooleanField(default=False)

class RealOrder(models.Model):
    order_time = models.DateTimeField(auto_now_add=True)
    isCooking = models.BooleanField(default=False)
    isFinish = models.BooleanField(default=False)
    start_cooking_time = models.DateTimeField(blank=True, null=True)
    end_cooking_time = models.DateTimeField(blank=True, null=True)
    orders = models.ForeignKey(OrderDetail, on_delete=models.CASCADE)







class SoldProduct(models.Model):
    name = models.CharField(max_length=255, null=False,
                            blank=False, default='')
    price = models.CharField(max_length=30, null=False, blank=False)
    profit = models.CharField(
        max_length=30, null=False, blank=False, default=0)
    qty = models.CharField(max_length=30, null=False, blank=False)
    date = models.DateTimeField(auto_now_add=True)
    sales = models.ForeignKey(
        'Sales', related_name='sproduct', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE, default=1)
    productid = models.CharField(max_length=30, null=False, blank=False,default=0)

    def __str__(self):
        return self.name


class Sales(models.Model):
    receiptNumber = models.AutoField(primary_key=True)
    voucherNumber = models.CharField(
        max_length=50, null=False, blank=False, default=0)
    customerName = models.CharField(max_length=30, null=False, blank=False)
    totalAmount = models.CharField(max_length=20, null=False, blank=False)
    totalProfit = models.CharField(max_length=20, null=False, blank=False,default=0)
    tax = models.CharField(max_length=20, null=False, blank=False)
    discount = models.CharField(max_length=20, null=False, blank=False)
    grandtotal = models.CharField(max_length=20, null=False, blank=False)
    deliveryCharges = models.CharField(max_length=20, null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add=True)
    description = models.TextField(blank=True, null=True)
    customer_payment = models.CharField(max_length=20, null=True, blank=True, default='0')
    isDiscountAmount = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if self.customer_payment == None:
            self.customer_payment = self.grandtotal
          
        super().save(*args, **kwargs)
    
class CustomerName(models.Model):
    name = models.CharField(max_length=255, null=False, blank=False, unique=True)
    description = models.TextField(blank=True, null=True)
    sales = models.ManyToManyField(Sales, related_name='customer_sales')
    user =  models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.name + ' ' + self.user.username


class Supplier(models.Model):
    name =  models.CharField(max_length=255, null=False, blank=False)
    description = models.TextField(blank=True, null=True)
    products = models.ManyToManyField(Product, related_name='suppliers')


class OtherIncome(models.Model):
    title = models.CharField(max_length=255, null=True, blank=False)
    price = models.CharField(max_length=20, null=True, blank=False)
    date = models.DateField(null=True)
    description = models.TextField(blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.title + ' ' + self.description


class Expense(models.Model):
    title = models.CharField(max_length=255, null=False, blank=False)
    price = models.CharField(max_length=20, null=False, blank=False)
    date = models.DateField(null=True)
    description = models.TextField(blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.title + ' ' + self.description


class Purchase(models.Model):
    title = models.CharField(max_length=255, null=False, blank=False)
    price = models.CharField(max_length=20, null=False, blank=False)
    date = models.DateField()
    description = models.TextField(blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.title + ' ' + self.description


class FeedBack(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField(blank=True, null=False)

    def __str__(self):
        return self.user.username + ' ' + self.message


class AppVersion(models.Model):
    version = models.CharField(max_length=255, null=False)
    url = models.TextField(null=False)
    releaseNote = models.TextField()

    def __str__(self):
        return self.version


class Pricing(models.Model):
    title = models.CharField(max_length=255)
    price = models.CharField(max_length=30)
    days = models.CharField(max_length=5, null=True)
    discount = models.CharField(max_length=255, null=True)
    is_digits = models.BooleanField(default=False)

    def __str__(self):
        return self.title + ' ' + self.price


class PricingRequest(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='user')
    rq_price = models.ForeignKey(
        Pricing, on_delete=models.CASCADE, related_name='rq_price')
    date = models.DateTimeField(auto_now_add=True)
    done = models.BooleanField(default=False)

    def __str__(self):
        return self.user.username + '-' + self.rq_price.price


def showdate(self):
    if self.is_done:
        return self.end_datetime.date().strftime("%d/%m/%Y, %H:%M:%S")
    return 'Not Done'


class OTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)



class Device(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    unique_id = models.CharField(max_length=255, null=False)
    device_name = models.CharField(max_length=244, null=False)
    acc_type = models.CharField(max_length=50, null=True, default="Cashier")
    login_time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username + ' ' + self.device_name


