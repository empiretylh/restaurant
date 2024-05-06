from django.contrib import admin
from . import models
# Register your models here.=
admin.site.register(models.User)
admin.site.register(models.Category)
admin.site.register(models.Product)
admin.site.register(models.SoldProduct)
admin.site.register(models.Sales)
admin.site.register(models.OtherIncome)
admin.site.register(models.Expense)
admin.site.register(models.Purchase)
admin.site.register(models.FeedBack)
admin.site.register(models.AppVersion)
admin.site.register(models.Pricing)
admin.site.register(models.PricingRequest)
admin.site.register(models.Device)
admin.site.register(models.ProductPrice)
admin.site.register(models.Order)
admin.site.register(models.OrderDetail)
admin.site.register(models.FoodOrder)
admin.site.register(models.ProductOrder)


#Sales Digits App