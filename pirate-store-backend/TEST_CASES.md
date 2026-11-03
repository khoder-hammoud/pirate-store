=====================================================
   سجل تجارب الباك آند - مشروع Pirate Store
=====================================================
المرحله الاولى :auth:
1- regester\users : 
post{{baseUrl}}/api/users/register 
1-body
{
  "name": "Test User",
  "email": "user@example.com",
  "password": "password123"
}
response
400 bad request
{
  "status": "fail",
  "message": "Invalid data"
}
2- body
{
  "name": "Test User",
  "email": "user@example.com",
  "password": "Password123@"
}
\\\ يعني بعد ما حققت شروط ال سكيما  شتغل 
response
201 created
{
  "_id": "6a3fc7a61170f52925199cd5",
  "name": "Test User",
  "email": "user@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhM2ZjN2E2MTE3MGY1MjkyNTE5OWNkNSIsImlhdCI6MTc4MjU2NDc3NCwiZXhwIjoxNzg1MTU2Nzc0fQ.8U_9_PdoJEYSmimAXpw9t-pKvGzLdFFBrnYuylmXHaQ"
}
3- body \\ رجعت سجل دخول ب نفس الاسم والايميل وكلمه السر 
{
  "name": "Test User",
  "email": "user@example.com",
  "password": "Password123@"
}
response 
400 Bad Request
{
  "status": "fail",
  "message": "User already exists"
}

وحاولت غير الاسم بس واترك الباقي كمان ما مشي الحالي يعني ما بيسمح بتكرار الايميل 

=========================================================
2- logen \ user :

post {{baseUrl}}/api/users/login

1-body
{
  "email": "{{userEmail}}",
  "password": "{{userPassword}}"
}
response 
401 Unauthorized

{
  "status": "fail",
  "message": "Invalid email or password"
}


2- body 
{
  "email": "user@example.com",
  "password": "Password123@"
}
response 
200 
{
  "_id": "6a3fc7a61170f52925199cd5",
  "name": "Test User",
  "email": "user@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhM2ZjN2E2MTE3MGY1MjkyNTE5OWNkNSIsImlhdCI6MTc4MjU2NTE2NCwiZXhwIjoxNzg1MTU3MTY0fQ.GZuG_BIAMktXSYzxAJHpK-0-v_nmDEYscHVjbzz5A3w"
}


اذا غيرت ب الايميل او الباسسورد بيعطيني 
401 Unauthorized
{
  "status": "fail",
  "message": "Invalid email or password"
}


واذا عملت تسجيل دخول مرتين ورا بعض عم يعطيني توكن جديد ب كل مره 


============================================================
3-logen \admin :
post {{baseUrl}}/api/users/login

1- body 
{
  "email": "{{adminEmail}}",
  "password": "{{adminPassword}}"
}
response 
401 Unauthorized
{
  "status": "fail",
  "message": "Invalid email or password"
}


2-body
{
  "email": "khoderadmin@gmail.com",
  "password": "Password123@123"
}

response
200
{
  "_id": "6a3d33c6fe8a40eb6c536a49",
  "name": "Test2",
  "email": "khoderadmin@gmail.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhM2QzM2M2ZmU4YTQwZWI2YzUzNmE0OSIsImlhdCI6MTc4MjU2NTcwOCwiZXhwIjoxNzg1MTU3NzA4fQ.Js2RdAbYYXughkW_uUJUzR2ovh0KtDs0cGnPlbnWtcI"
}

=======================================
4- create prodact 

{{baseUrl}}/api/products
1- body 

{
  "name": "Demo Product",
  "price": 19.99,
  "description": "Sample product for Postman collection",
  "category": "demo",
  "countInStock": 100,
  "image": "/images/demo.jpg"
}

header 
Bearer {{adminToken}}

response
201 Created
{
  "name": "Demo Product",
  "description": "Sample product for Postman collection",
  "price": 19.99,
  "category": "demo",
  "countInStock": 100,
  "image": "/images/demo.jpg",
  "rating": 0,
  "numReviews": 0,
  "_id": "6a3fcc1f1170f52925199ce1",
  "createdAt": "2026-06-27T13:11:59.167Z",
  "updatedAt": "2026-06-27T13:11:59.167Z",
  "__v": 0
}

2- body
{
  "name": "Demo Product2",
  "price": 20,
  "description": "Sample product for Postman collection",
  "category": "demo",
  "countInStock":90,
  "image": "/images/demo.jpg"
}

response 

201 Created
{
  "name": "Demo Product2",
  "description": "Sample product for Postman collection",
  "price": 20,
  "category": "demo",
  "countInStock": 90,
  "image": "/images/demo.jpg",
  "rating": 0,
  "numReviews": 0,
  "_id": "6a3fcc6c1170f52925199ce4",
  "createdAt": "2026-06-27T13:13:16.782Z",
  "updatedAt": "2026-06-27T13:13:16.782Z",
  "__v": 0
}

اذا ضفت نفس المنتج مرتين 
{
  "name": "Demo Product2",
  "description": "Sample product for Postman collection",
  "price": 20,
  "category": "demo",
  "countInStock": 90,
  "image": "/images/demo.jpg",
  "rating": 0,
  "numReviews": 0,
  "_id": "6a3fccb71170f52925199ce7",
  "createdAt": "2026-06-27T13:14:31.101Z",
  "updatedAt": "2026-06-27T13:14:31.101Z",
  "__v": 0
}
عطاني نفس الريسبونس لازم نعالجها @@@@@@@@@@       error
=============================================================
5- get all prodact 

{{baseUrl}}/api/products
Bearer {{userToken}}

200 

[{"_id":"69ea33bf907350f2b24a4304","name":"milk","description":"افضل ميلك بالعالم ","price":9.99,"category":"غزائيات ","countInStock":50,"image":"url:fgkdjlksj&(&*%kglkglkfglklbnl","rating":0,"numReviews":0,"createdAt":"2026-04-23T14:59:11.879Z","updatedAt":"2026-06-26T15:48:51.671Z","__v":0},{"_id":"69ea33e1907350f2b24a4307","name":"ege","description":"افضل ميلك بالعالم ","price":9.99,"category":"غزائيات ","countInStock":38,"image":"url:fgkdjlksj&(&*%kglkglkfglklbnl","rating":0,"numReviews":0,"createdAt":"2026-04-23T14:59:45.433Z","updatedAt":"2026-06-26T15:48:51.671Z","__v":0},{"_id":"69ea34ff907350f2b24a430d","name":"سردين","description":"افضل ميلك بالعالم ","price":9.99,"category":"غزائيات ","countInStock":48,"image":"url:fgkdjlksj&(&*%kglkglkfglklbnl","rating":0,"numReviews":0,"createdAt":"2026-04-23T15:04:31.002Z","updatedAt":"2026-06-26T15:48:51.671Z","__v":0},{"_id":"69ea3510907350f2b24a4310","name":"بطاطا","description":"افضل ميلك بالعالم ","price":9.99,"category":"غزائيات ","countInStock":50,"image":"url:fgkdjlksj&(&*%kglkglkfglklbnl","rating":0,"numReviews":0,"createdAt":"2026-04-23T15:04:48.270Z","updatedAt":"2026-06-26T15:48:51.671Z","__v":0},{"_id":"69ea352c907350f2b24a4313","name":"بازنجان","description":"افضل ميلك بالعالم ","price":9.99,"category":"غزائيات ","countInStock":50,"image":"url:fgkdjlksj&(&*%kglkglkfglklbnl","rating":0,"numReviews":0,"createdAt":"2026-04-23T15:05:16.265Z","updatedAt":"2026-06-26T15:48:51.671Z","__v":0},{"_id":"6a3e8e24d27ded35cf729fbd","name":"Demo Product","description":"Sample product for Postman collection","price":9.99,"category":"demo","countInStock":100,"image":"/images/demo.jpg","rating":0,"numReviews":0,"createdAt":"2026-06-26T14:35:16.054Z","updatedAt":"2026-06-26T15:48:51.671Z","__v":0},{"_id":"6a3e9faed27ded35cf729fd3","name":"Demo Product","description":"Sample product for Postman collection","price":19.99,"category":"demo","countInStock":99,"image":"/images/demo.jpg","rating":0,"numReviews":0,"createdAt":"2026-06-26T15:50:06.295Z","updatedAt":"2026-06-26T16:28:05.092Z","__v":0},{"_id":"6a3fcc1f1170f52925199ce1","name":"Demo Product","description":"Sample product for Postman collection","price":19.99,"category":"demo","countInStock":100,"image":"/images/demo.jpg","rating":0,"numReviews":0,"createdAt":"2026-06-27T13:11:59.167Z","updatedAt":"2026-06-27T13:11:59.167Z","__v":0},{"_id":"6a3fcc6c1170f52925199ce4","name":"Demo Product2","description":"Sample product for Postman collection","price":20,"category":"demo","countInStock":90,"image":"/images/demo.jpg","rating":0,"numReviews":0,"createdAt":"2026-06-27T13:13:16.782Z","updatedAt":"2026-06-27T13:13:16.782Z","__v":0},{"_id":"6a3fccb71170f52925199ce7","name":"Demo Product2","description":"Sample product for Postman collection","price":20,"category":"demo","countInStock":90,"image":"/images/demo.jpg","rating":0,"numReviews":0,"createdAt":"2026-06-27T13:14:31.101Z","updatedAt":"2026-06-27T13:14:31.101Z","__v":0}]


=========================================================
6-get prodact by id 

get {{baseUrl}}/api/products/{{productId}}


Bearer {{userToken}}


200
{
  "_id": "6a3fccb71170f52925199ce7",
  "name": "Demo Product2",
  "description": "Sample product for Postman collection",
  "price": 20,
  "category": "demo",
  "countInStock": 90,
  "image": "/images/demo.jpg",
  "rating": 0,
  "numReviews": 0,
  "createdAt": "2026-06-27T13:14:31.101Z",
  "updatedAt": "2026-06-27T13:14:31.101Z",
  "__v": 0
}


واذا غيرت ب ال  توكين ل توكين اليوزر 
Bearer {{userToken}}

401 Unauthorized
{
  "status": "fail",
  "message": "Invalid token"
}

@@@@@@@@@@@@@@@2 هاد على الاغلب ايرور لانو عادي انو المستخدم يجيب منتج ب ال id تبعو  error 


رجعت ال Bearer {{adminToken}}
بس لعبت ب ال id  وغيرتو هيك كانت النتيجه 
400 Bad Request
{
  "status": "fail",
  "message": "Invalid product ID"
}



========================================================================
7-تعديل قيمه منتج 

put {{baseUrl}}/api/products/{{productId}}
Bearer {{adminToken}}
{
  "price": 24.99,
  "countInStock": 90
}
200 
{
  "_id": "6a3fcf811170f52925199cf7",
  "name": "Demo Product2",
  "description": "Sample product for Postman collection",
  "price": 24.99,
  "category": "demo",
  "countInStock": 90,
  "image": "/images/demo.jpg",
  "rating": 0,
  "numReviews": 0,
  "createdAt": "2026-06-27T13:26:25.885Z",
  "updatedAt": "2026-06-27T13:27:52.159Z",
  "__v": 0
}

{
  "price": 24.99,
  "countInStock": 
}

500 Internal Server Error
{
  "status": "error",
  "message": "Something went very wrong!"
}

@@@@@@@@@@@@@@@@@@@@@@@@@@ هي الحاله مو مناقشينها اذا كان باعت واحد من الخانات فاضي 
ولما بعتت الكميه صفر عدل الطلب عادي يعني كمان في غلط 
=====
(node:18648) [MONGOOSE] Warning: mongoose: the `new` option for `findOneAndUpdate()` and `findOneAndReplace()` is deprecated. Use `returnDocument: 'after'` instead.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:18648) [MONGOOSE] Warning: mongoose: the `new` option for `findOneAndUpdate()` and `findOneAndReplace()` is deprecated. Use `returnDocument: 'after'` instead.
ERROR 💥 {
  expose: true,
  statusCode: 400,
  status: 400,
  body: '{\n  "price": 24.99,\n  "countInStock": \n}',
  type: 'entity.parse.failed',
  message: `Unexpected token '}', ..."nStock": \n}" is not valid JSON`
}
=======
لما عدلت وخليت السعر  0 
هيك عرضلي 
{
  "price": 0,
  "countInStock": 0
}
400 Bad Request
{
  "status": "fail",
  "message": "At least one field is required for product update"
}

============================================
8- حزف منتج ما 
deleate {{baseUrl}}/api/products/{{productId}}
200
{
  "message": "تم حذف المنتج بنجاح",
  "deletedProduct": {
    "_id": "6a3fcf811170f52925199cf7",
    "name": "Demo Product2",
    "description": "Sample product for Postman collection",
    "price": 9.99,
    "category": "demo",
    "countInStock": 0,
    "image": "/images/demo.jpg",
    "rating": 0,
    "numReviews": 0,
    "createdAt": "2026-06-27T13:26:25.885Z",
    "updatedAt": "2026-06-27T13:32:38.666Z",
    "__v": 0
  }
}
ونحزف من قاعده البيانات دغري يعني مافي سوفت ديليت @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@




===========================================================================
9-create ordderrr

Bearer {{userToken}}

{
  "orderItems": [ { "product": "{{productId}}", "quantity": 1 } ],
  "shippingAddress": { "address": "123 Demo St", "city": "Tunis", "postalCode": "1000", "country": "TN" }
}

201 Created
{
  "message": "Order created successfully",
  "order": {
    "invoiceNumber": "INV-1782568191104",
    "user": "6a3fc7a61170f52925199cd5",
    "orderItems": [
      {
        "product": "6a3fccb71170f52925199ce7",
        "name": "Demo Product2",
        "price": 9.99,
        "quantity": 1,
        "image": "/images/demo.jpg",
        "_id": "6a3fd4ff1170f52925199d0a"
      }
    ],
    "shippingAddress": {
      "address": "123 Demo St",
      "city": "Tunis",
      "postalCode": "1000",
      "country": "TN"
    },
    "itemsPrice": 9.99,
    "taxAmount": 1.5,
    "shippingPrice": 10,
    "discountAmount": 0,
    "totalPrice": 21.49,
    "status": "pending",
    "isPaid": false,
    "refund": null,
    "refundStatus": "none",
    "isDelivered": false,
    "isDeleted": false,
    "_id": "6a3fd4ff1170f52925199d09",
    "createdAt": "2026-06-27T13:49:51.116Z",
    "updatedAt": "2026-06-27T13:49:51.116Z",
    "__v": 0
  }
}


وجربت اذا البروداكت id او ال توكين تبع اليوزر خالصين كا بيشتغل 


======================================================
10- جلب اوردراتي 
get  {{baseUrl}}/api/orders/myorders


200

[
  {
    "shippingAddress": {
      "address": "123 Demo St",
      "city": "Tunis",
      "postalCode": "1000",
      "country": "TN"
    },
    "_id": "6a3fd4ff1170f52925199d09",
    "invoiceNumber": "INV-1782568191104",
    "user": "6a3fc7a61170f52925199cd5",
    "orderItems": [
      {
        "product": "6a3fccb71170f52925199ce7",
        "name": "Demo Product2",
        "price": 9.99,
        "quantity": 1,
        "image": "/images/demo.jpg",
        "_id": "6a3fd4ff1170f52925199d0a"
      }
    ],
    "itemsPrice": 9.99,
    "taxAmount": 1.5,
    "shippingPrice": 10,
    "discountAmount": 0,
    "totalPrice": 21.49,
    "status": "pending",
    "isPaid": false,
    "refund": null,
    "refundStatus": "none",
    "isDelivered": false,
    "isDeleted": false,
    "createdAt": "2026-06-27T13:49:51.116Z",
    "updatedAt": "2026-06-27T13:49:51.116Z",
    "__v": 0
  }
]



===============================================
11- get order by id 
{{baseUrl}}/api/orders/{{orderId}}

200

{
  "shippingAddress": {
    "address": "123 Demo St",
    "city": "Tunis",
    "postalCode": "1000",
    "country": "TN"
  },
  "_id": "6a3fd4ff1170f52925199d09",
  "invoiceNumber": "INV-1782568191104",
  "user": "6a3fc7a61170f52925199cd5",
  "orderItems": [
    {
      "product": "6a3fccb71170f52925199ce7",
      "name": "Demo Product2",
      "price": 9.99,
      "quantity": 1,
      "image": "/images/demo.jpg",
      "_id": "6a3fd4ff1170f52925199d0a"
    }
  ],
  "itemsPrice": 9.99,
  "taxAmount": 1.5,
  "shippingPrice": 10,
  "discountAmount": 0,
  "totalPrice": 21.49,
  "status": "pending",
  "isPaid": false,
  "refund": null,
  "refundStatus": "none",
  "isDelivered": false,
  "isDeleted": false,
  "createdAt": "2026-06-27T13:49:51.116Z",
  "updatedAt": "2026-06-27T13:49:51.116Z",
  "__v": 0
}

================================================================
12-تحويل الاوردر الى مدفوع بالعلم لسا ما عنا نظام دفع وهي للتجربه بس 
put {{baseUrl}}/api/orders/{{orderId}}/pay


200

{
  "message": "Order paid and stock updated successfully",
  "order": {
    "shippingAddress": {
      "address": "123 Demo St",
      "city": "Tunis",
      "postalCode": "1000",
      "country": "TN"
    },
    "_id": "6a3fd4ff1170f52925199d09",
    "invoiceNumber": "INV-1782568191104",
    "user": "6a3fc7a61170f52925199cd5",
    "orderItems": [
      {
        "product": "6a3fccb71170f52925199ce7",
        "name": "Demo Product2",
        "price": 9.99,
        "quantity": 1,
        "image": "/images/demo.jpg",
        "_id": "6a3fd4ff1170f52925199d0a"
      }
    ],
    "itemsPrice": 9.99,
    "taxAmount": 1.5,
    "shippingPrice": 10,
    "discountAmount": 0,
    "totalPrice": 21.49,
    "status": "paid",
    "isPaid": true,
    "refund": null,
    "refundStatus": "none",
    "isDelivered": false,
    "isDeleted": false,
    "createdAt": "2026-06-27T13:49:51.116Z",
    "updatedAt": "2026-06-27T13:57:24.857Z",
    "__v": 0,
    "paidAt": "2026-06-27T13:57:24.855Z"
  }
}


=================================================
13= تحويل الاوردر الى الشحن 
put {{baseUrl}}/api/orders/{{orderId}}/deliver
Bearer {{adminToken}}
الادمين بس 
{
  "message": "Order marked as delivered",
  "order": {
    "shippingAddress": {
      "address": "123 Demo St",
      "city": "Tunis",
      "postalCode": "1000",
      "country": "TN"
    },
    "_id": "6a3fd4ff1170f52925199d09",
    "invoiceNumber": "INV-1782568191104",
    "user": "6a3fc7a61170f52925199cd5",
    "orderItems": [
      {
        "product": "6a3fccb71170f52925199ce7",
        "name": "Demo Product2",
        "price": 9.99,
        "quantity": 1,
        "image": "/images/demo.jpg",
        "_id": "6a3fd4ff1170f52925199d0a"
      }
    ],
    "itemsPrice": 9.99,
    "taxAmount": 1.5,
    "shippingPrice": 10,
    "discountAmount": 0,
    "totalPrice": 21.49,
    "status": "delivered",
    "isPaid": true,
    "refund": null,
    "refundStatus": "none",
    "isDelivered": true,
    "isDeleted": false,
    "createdAt": "2026-06-27T13:49:51.116Z",
    "updatedAt": "2026-06-27T13:59:33.812Z",
    "__v": 0,
    "paidAt": "2026-06-27T13:57:24.855Z",
    "deliveredAt": "2026-06-27T13:59:33.811Z"
  }
}
 واذا غيرت التوكين بيطلع انفالد 

==============================================================

15- كانسل للاوردر ب اليوزرر توكين 
Bearer {{userToken}}
400 Bad Request
{
  "status": "fail",
  "message": "Invalid status transition"
}


===================================================================
16- استرداد الاموال 
post {{baseUrl}}/api/refunds/orders/{{orderId}}

{
  "amount": 5.00
}

201 Created
{
  "message": "Refund initiated successfully",
  "refund": {
    "order": "6a3fd4ff1170f52925199d09",
    "user": "6a3fc7a61170f52925199cd5",
    "amount": 5,
    "status": "pending",
    "retryCount": 0,
    "_id": "6a3fd8591170f52925199d23",
    "requestedAt": "2026-06-27T14:04:09.850Z",
    "createdAt": "2026-06-27T14:04:09.850Z",
    "updatedAt": "2026-06-27T14:04:09.850Z",
    "__v": 0
  }
}


=========================================================
الباقي كلو شغال الا ال ديليت يوزرر  by id 
500 Internal Server Error
{{baseUrl}}/api/users/{{userId}}

{
  "status": "error",
  "message": "Something went very wrong!"
}

ERROR 💥 {
  message: 'user.remove is not a function',
  statusCode: 500,
  status: 'error'
}

=======================================
==================================================
=========================================================================
error test 
=========================================================================
==================================================
=======================================
post {{baseUrl}}/api/users/register

{
  "name": "Error Test User",
  "email": "{{userEmail}}",
  "password": "{{userPassword}}"
}

400 Bad Request
{
  "status": "fail",
  "message": "User already exists"
}

==============================
Duplicate User (expect 400)

post {{baseUrl}}/api/users/register

{
  "name": "Error Test User",
  "email": "{{userEmail}}",
  "password": "{{userPassword}}"
}


400 Bad Request
{
  "status": "fail",
  "message": "User already exists"
}


========================

Invalid Email on Register


{
  "name": "Bad Email",
  "email": "not-an-email",
  "password": "123456"
}


400 Bad Request
{
  "status": "fail",
  "message": "Invalid data"
}

==========================================
Missing Token (protected) - GET /api/products

get {{baseUrl}}/api/products
401 Unauthorized
{
  "status": "fail",
  "message": "Not authorized, no token"
}



===========================================

Invalid ID (product) - GET /api/products/invalid-id

get {{baseUrl}}/api/products/invalid-id



401 Unauthorized
{
  "status": "fail",
  "message": "Invalid token"
}


===============================================

Unauthorized Access (user tries admin-only) - DELETE /api/products/{{productId}}


{{baseUrl}}/api/products/{{productId}}
401 Unauthorized
{
  "status": "fail",
  "message": "Invalid token"
}

==================================================

Validation Error - Create Product Missing Fields (admin)



post {{baseUrl}}/api/products
{
  "name": "",
  "price": 0
}

401 Unauthorized
{
  "status": "fail",
  "message": "Invalid token"
}
=================================================

Validation Error - Create Order Missing Fields (user)


{{baseUrl}}/api/orders

{ }

401 Unauthorized
{
  "status": "fail",
  "message": "Invalid token"
}
==============================================================================================================================================================================================================================================================================================================================================
تم اصلاح جميع المشاكل بالكامل لهون>><> >>>>>>>>>>>>>>>>>
=======================================================
=======================================================================================================================================================================================
test url sort & filter & pagination & serch

{{baseUrl}}/api/products?sort=price

{
  "page": 1,
  "limit": 10,
  "totalResults": 10,
  "totalPages": 1,
  "hasNextPage": false,
  "hasPrevPage": false,
  "products": [
    {
      "_id": "6a3fccb71170f52925199ce7",
      "name": "Demo Product2",
      "description": "Sample product for Postman collection",
      "price": 0,
      "category": "demo",
      "countInStock": 0,
      "image": "/images/demo.jpg",
      "rating": 0,
      "numReviews": 0,
      "createdAt": "2026-06-27T13:14:31.101Z",
      "updatedAt": "2026-06-27T15:01:49.364Z",
      "__v": 0
    },
    {
      "_id": "69ea33e1907350f2b24a4307",
      "name": "ege",
      "description": "افضل ميلك بالعالم ",
      "price": 9.99,
      "category": "غزائيات ",
      "countInStock": 38,
      "image": "url:fgkdjlksj&(&*%kglkglkfglklbnl",
      "rating": 0,
      "numReviews": 0,
      "createdAt": "2026-04-23T14:59:45.433Z",
      "updatedAt": "2026-06-27T13:32:38.666Z",
      "__v": 0
    },
    {
      "_id": "6a3fcc6c1170f52925199ce4",
      "name": "Demo Product2",
      "description": "Sample product for Postman collection",
      "price": 9.99,
      "category": "demo",
      "countInStock": 90,
      "image": "/images/demo.jpg",
      "rating": 0,
      "numReviews": 0,
      "createdAt": "2026-06-27T13:13:16.782Z",
      "updatedAt": "2026-06-27T13:32:38.666Z",
      "__v": 0
    },
    {
      "_id": "69ea352c907350f2b24a4313",
      "name": "بازنجان",
      "description": "افضل ميلك بالعالم ",
      "price": 9.99,
      "category": "غزائيات ",
      "countInStock": 50,
      "image": "url:fgkdjlksj&(&*%kglkglkfglklbnl",
      "rating": 0,
      "numReviews": 0,
      "createdAt": "2026-04-23T15:05:16.265Z",
      "updatedAt": "2026-06-27T13:32:38.666Z",
      "__v": 0
    },
    {
      "_id": "6a3fcc1f1170f52925199ce1",
      "name": "Demo Product",
      "description": "Sample product for Postman collection",
      "price": 9.99,
      "category": "demo",
      "countInStock": 100,
      "image": "/images/demo.jpg",
      "rating": 0,
      "numReviews": 0,
      "createdAt": "2026-06-27T13:11:59.167Z",
      "updatedAt": "2026-06-27T13:32:38.666Z",
      "__v": 0
    },
    {
      "_id": "69ea3510907350f2b24a4310",
      "name": "بطاطا",
      "description": "افضل ميلك بالعالم ",
      "price": 9.99,
      "category": "غزائيات ",
      "countInStock": 50,
      "image": "url:fgkdjlksj&(&*%kglkglkfglklbnl",
      "rating": 0,
      "numReviews": 0,
      "createdAt": "2026-04-23T15:04:48.270Z",
      "updatedAt": "2026-06-27T13:32:38.666Z",
      "__v": 0
    },
    {
      "_id": "6a3e8e24d27ded35cf729fbd",
      "name": "Demo Product",
      "description": "Sample product for Postman collection",
      "price": 9.99,
      "category": "demo",
      "countInStock": 100,
      "image": "/images/demo.jpg",
      "rating": 0,
      "numReviews": 0,
      "createdAt": "2026-06-26T14:35:16.054Z",
      "updatedAt": "2026-06-27T13:32:38.666Z",
      "__v": 0
    },
    {
      "_id": "69ea33bf907350f2b24a4304",
      "name": "milk",
      "description": "افضل ميلك بالعالم ",
      "price": 9.99,
      "category": "غزائيات ",
      "countInStock": 50,
      "image": "url:fgkdjlksj&(&*%kglkglkfglklbnl",
      "rating": 0,
      "numReviews": 0,
      "createdAt": "2026-04-23T14:59:11.879Z",
      "updatedAt": "2026-06-27T13:32:38.666Z",
      "__v": 0
    },
    {
      "_id": "69ea34ff907350f2b24a430d",
      "name": "سردين",
      "description": "افضل ميلك بالعالم ",
      "price": 9.99,
      "category": "غزائيات ",
      "countInStock": 48,
      "image": "url:fgkdjlksj&(&*%kglkglkfglklbnl",
      "rating": 0,
      "numReviews": 0,
      "createdAt": "2026-04-23T15:04:31.002Z",
      "updatedAt": "2026-06-27T13:32:38.666Z",
      "__v": 0
    },
    {
      "_id": "6a3e9faed27ded35cf729fd3",
      "name": "Demo Product",
      "description": "Sample product for Postman collection",
      "price": 9.99,
      "category": "demo",
      "countInStock": 99,
      "image": "/images/demo.jpg",
      "rating": 0,
      "numReviews": 0,
      "createdAt": "2026-06-26T15:50:06.295Z",
      "updatedAt": "2026-06-27T13:32:38.666Z",
      "__v": 0
    }
  ]
}


{{baseUrl}}/api/products?sort=-price


{
  "page": 1,
  "limit": 10,
  "totalResults": 10,
  "totalPages": 1,
  "hasNextPage": false,
  "hasPrevPage": false,
  "products": [
    {
      "_id": "6a3fcc6c1170f52925199ce4",
      "name": "Demo Product2",
      "description": "Sample product for Postman collection",
      "price": 9.99,
      "category": "demo",
      "countInStock": 90,
      "image": "/images/demo.jpg",
      "rating": 0,
      "numReviews": 0,
      "createdAt": "2026-06-27T13:13:16.782Z",
      "updatedAt": "2026-06-27T13:32:38.666Z",
      "__v": 0
    },
    {
      "_id": "69ea352c907350f2b24a4313",
      "name": "بازنجان",
      "description": "افضل ميلك بالعالم ",
      "price": 9.99,
      "category": "غزائيات ",
      "countInStock": 50,
      "image": "url:fgkdjlksj&(&*%kglkglkfglklbnl",
      "rating": 0,
      "numReviews": 0,
      "createdAt": "2026-04-23T15:05:16.265Z",
      "updatedAt": "2026-06-27T13:32:38.666Z",
      "__v": 0
    },
    {
      "_id": "69ea33e1907350f2b24a4307",
      "name": "ege",
      "description": "افضل ميلك بالعالم ",
      "price": 9.99,
      "category": "غزائيات ",
      "countInStock": 38,
      "image": "url:fgkdjlksj&(&*%kglkglkfglklbnl",
      "rating": 0,
      "numReviews": 0,
      "createdAt": "2026-04-23T14:59:45.433Z",
      "updatedAt": "2026-06-27T13:32:38.666Z",
      "__v": 0
    },
    {
      "_id": "6a3fcc1f1170f52925199ce1",
      "name": "Demo Product",
      "description": "Sample product for Postman collection",
      "price": 9.99,
      "category": "demo",
      "countInStock": 100,
      "image": "/images/demo.jpg",
      "rating": 0,
      "numReviews": 0,
      "createdAt": "2026-06-27T13:11:59.167Z",
      "updatedAt": "2026-06-27T13:32:38.666Z",
      "__v": 0
    },
    {
      "_id": "6a3e8e24d27ded35cf729fbd",
      "name": "Demo Product",
      "description": "Sample product for Postman collection",
      "price": 9.99,
      "category": "demo",
      "countInStock": 100,
      "image": "/images/demo.jpg",
      "rating": 0,
      "numReviews": 0,
      "createdAt": "2026-06-26T14:35:16.054Z",
      "updatedAt": "2026-06-27T13:32:38.666Z",
      "__v": 0
    },
    {
      "_id": "69ea3510907350f2b24a4310",
      "name": "بطاطا",
      "description": "افضل ميلك بالعالم ",
      "price": 9.99,
      "category": "غزائيات ",
      "countInStock": 50,
      "image": "url:fgkdjlksj&(&*%kglkglkfglklbnl",
      "rating": 0,
      "numReviews": 0,
      "createdAt": "2026-04-23T15:04:48.270Z",
      "updatedAt": "2026-06-27T13:32:38.666Z",
      "__v": 0
    },
    {
      "_id": "69ea33bf907350f2b24a4304",
      "name": "milk",
      "description": "افضل ميلك بالعالم ",
      "price": 9.99,
      "category": "غزائيات ",
      "countInStock": 50,
      "image": "url:fgkdjlksj&(&*%kglkglkfglklbnl",
      "rating": 0,
      "numReviews": 0,
      "createdAt": "2026-04-23T14:59:11.879Z",
      "updatedAt": "2026-06-27T13:32:38.666Z",
      "__v": 0
    },
    {
      "_id": "69ea34ff907350f2b24a430d",
      "name": "سردين",
      "description": "افضل ميلك بالعالم ",
      "price": 9.99,
      "category": "غزائيات ",
      "countInStock": 48,
      "image": "url:fgkdjlksj&(&*%kglkglkfglklbnl",
      "rating": 0,
      "numReviews": 0,
      "createdAt": "2026-04-23T15:04:31.002Z",
      "updatedAt": "2026-06-27T13:32:38.666Z",
      "__v": 0
    },
    {
      "_id": "6a3e9faed27ded35cf729fd3",
      "name": "Demo Product",
      "description": "Sample product for Postman collection",
      "price": 9.99,
      "category": "demo",
      "countInStock": 99,
      "image": "/images/demo.jpg",
      "rating": 0,
      "numReviews": 0,
      "createdAt": "2026-06-26T15:50:06.295Z",
      "updatedAt": "2026-06-27T13:32:38.666Z",
      "__v": 0
    },
    {
      "_id": "6a3fccb71170f52925199ce7",
      "name": "Demo Product2",
      "description": "Sample product for Postman collection",
      "price": 0,
      "category": "demo",
      "countInStock": 0,
      "image": "/images/demo.jpg",
      "rating": 0,
      "numReviews": 0,
      "createdAt": "2026-06-27T13:14:31.101Z",
      "updatedAt": "2026-06-27T15:01:49.364Z",
      "__v": 0
    }
  ]
}


{{baseUrl}}/api/products?sort=


{
  "page": 1,
  "limit": 10,
  "totalResults": 10,
  "totalPages": 1,
  "hasNextPage": false,
  "hasPrevPage": false,
  "products": [
    {
      "_id": "6a3fccb71170f52925199ce7",
      "name": "Demo Product2",
      "description": "Sample product for Postman collection",
      "price": 0,
      "category": "demo",
      "countInStock": 0,
      "image": "/images/demo.jpg",
      "rating": 0,
      "numReviews": 0,
      "createdAt": "2026-06-27T13:14:31.101Z",
      "updatedAt": "2026-06-27T15:01:49.364Z",
      "__v": 0
    },
    {
      "_id": "6a3fcc6c1170f52925199ce4",
      "name": "Demo Product2",
      "description": "Sample product for Postman collection",
      "price": 9.99,
      "category": "demo",
      "countInStock": 90,
      "image": "/images/demo.jpg",
      "rating": 0,
      "numReviews": 0,
      "createdAt": "2026-06-27T13:13:16.782Z",
      "updatedAt": "2026-06-27T13:32:38.666Z",
      "__v": 0
    },
    {
      "_id": "6a3fcc1f1170f52925199ce1",
      "name": "Demo Product",
      "description": "Sample product for Postman collection",
      "price": 9.99,
      "category": "demo",
      "countInStock": 100,
      "image": "/images/demo.jpg",
      "rating": 0,
      "numReviews": 0,
      "createdAt": "2026-06-27T13:11:59.167Z",
      "updatedAt": "2026-06-27T13:32:38.666Z",
      "__v": 0
    },
    {
      "_id": "6a3e9faed27ded35cf729fd3",
      "name": "Demo Product",
      "description": "Sample product for Postman collection",
      "price": 9.99,
      "category": "demo",
      "countInStock": 99,
      "image": "/images/demo.jpg",
      "rating": 0,
      "numReviews": 0,
      "createdAt": "2026-06-26T15:50:06.295Z",
      "updatedAt": "2026-06-27T13:32:38.666Z",
      "__v": 0
    },
    {
      "_id": "6a3e8e24d27ded35cf729fbd",
      "name": "Demo Product",
      "description": "Sample product for Postman collection",
      "price": 9.99,
      "category": "demo",
      "countInStock": 100,
      "image": "/images/demo.jpg",
      "rating": 0,
      "numReviews": 0,
      "createdAt": "2026-06-26T14:35:16.054Z",
      "updatedAt": "2026-06-27T13:32:38.666Z",
      "__v": 0
    },
    {
      "_id": "69ea352c907350f2b24a4313",
      "name": "بازنجان",
      "description": "افضل ميلك بالعالم ",
      "price": 9.99,
      "category": "غزائيات ",
      "countInStock": 50,
      "image": "url:fgkdjlksj&(&*%kglkglkfglklbnl",
      "rating": 0,
      "numReviews": 0,
      "createdAt": "2026-04-23T15:05:16.265Z",
      "updatedAt": "2026-06-27T13:32:38.666Z",
      "__v": 0
    },
    {
      "_id": "69ea3510907350f2b24a4310",
      "name": "بطاطا",
      "description": "افضل ميلك بالعالم ",
      "price": 9.99,
      "category": "غزائيات ",
      "countInStock": 50,
      "image": "url:fgkdjlksj&(&*%kglkglkfglklbnl",
      "rating": 0,
      "numReviews": 0,
      "createdAt": "2026-04-23T15:04:48.270Z",
      "updatedAt": "2026-06-27T13:32:38.666Z",
      "__v": 0
    },
    {
      "_id": "69ea34ff907350f2b24a430d",
      "name": "سردين",
      "description": "افضل ميلك بالعالم ",
      "price": 9.99,
      "category": "غزائيات ",
      "countInStock": 48,
      "image": "url:fgkdjlksj&(&*%kglkglkfglklbnl",
      "rating": 0,
      "numReviews": 0,
      "createdAt": "2026-04-23T15:04:31.002Z",
      "updatedAt": "2026-06-27T13:32:38.666Z",
      "__v": 0
    },
    {
      "_id": "69ea33e1907350f2b24a4307",
      "name": "ege",
      "description": "افضل ميلك بالعالم ",
      "price": 9.99,
      "category": "غزائيات ",
      "countInStock": 38,
      "image": "url:fgkdjlksj&(&*%kglkglkfglklbnl",
      "rating": 0,
      "numReviews": 0,
      "createdAt": "2026-04-23T14:59:45.433Z",
      "updatedAt": "2026-06-27T13:32:38.666Z",
      "__v": 0
    },
    {
      "_id": "69ea33bf907350f2b24a4304",
      "name": "milk",
      "description": "افضل ميلك بالعالم ",
      "price": 9.99,
      "category": "غزائيات ",
      "countInStock": 50,
      "image": "url:fgkdjlksj&(&*%kglkglkfglklbnl",
      "rating": 0,
      "numReviews": 0,
      "createdAt": "2026-04-23T14:59:11.879Z",
      "updatedAt": "2026-06-27T13:32:38.666Z",
      "__v": 0
    }
  ]
}

{{baseUrl}}/api/products?sort=kh

{
  "page": 1,
  "limit": 10,
  "totalResults": 10,
  "totalPages": 1,
  "hasNextPage": false,
  "hasPrevPage": false,
  "products": [
    {
      "_id": "6a3fcc6c1170f52925199ce4",
      "name": "Demo Product2",
      "description": "Sample product for Postman collection",
      "price": 9.99,
      "category": "demo",
      "countInStock": 90,
      "image": "/images/demo.jpg",
      "rating": 0,
      "numReviews": 0,
      "createdAt": "2026-06-27T13:13:16.782Z",
      "updatedAt": "2026-06-27T13:32:38.666Z",
      "__v": 0
    },
    {
      "_id": "6a3fccb71170f52925199ce7",
      "name": "Demo Product2",
      "description": "Sample product for Postman collection",
      "price": 0,
      "category": "demo",
      "countInStock": 0,
      "image": "/images/demo.jpg",
      "rating": 0,
      "numReviews": 0,
      "createdAt": "2026-06-27T13:14:31.101Z",
      "updatedAt": "2026-06-27T15:01:49.364Z",
      "__v": 0
    },
    {
      "_id": "69ea352c907350f2b24a4313",
      "name": "بازنجان",
      "description": "افضل ميلك بالعالم ",
      "price": 9.99,
      "category": "غزائيات ",
      "countInStock": 50,
      "image": "url:fgkdjlksj&(&*%kglkglkfglklbnl",
      "rating": 0,
      "numReviews": 0,
      "createdAt": "2026-04-23T15:05:16.265Z",
      "updatedAt": "2026-06-27T13:32:38.666Z",
      "__v": 0
    },
    {
      "_id": "6a3fcc1f1170f52925199ce1",
      "name": "Demo Product",
      "description": "Sample product for Postman collection",
      "price": 9.99,
      "category": "demo",
      "countInStock": 100,
      "image": "/images/demo.jpg",
      "rating": 0,
      "numReviews": 0,
      "createdAt": "2026-06-27T13:11:59.167Z",
      "updatedAt": "2026-06-27T13:32:38.666Z",
      "__v": 0
    },
    {
      "_id": "6a3e8e24d27ded35cf729fbd",
      "name": "Demo Product",
      "description": "Sample product for Postman collection",
      "price": 9.99,
      "category": "demo",
      "countInStock": 100,
      "image": "/images/demo.jpg",
      "rating": 0,
      "numReviews": 0,
      "createdAt": "2026-06-26T14:35:16.054Z",
      "updatedAt": "2026-06-27T13:32:38.666Z",
      "__v": 0
    },
    {
      "_id": "69ea3510907350f2b24a4310",
      "name": "بطاطا",
      "description": "افضل ميلك بالعالم ",
      "price": 9.99,
      "category": "غزائيات ",
      "countInStock": 50,
      "image": "url:fgkdjlksj&(&*%kglkglkfglklbnl",
      "rating": 0,
      "numReviews": 0,
      "createdAt": "2026-04-23T15:04:48.270Z",
      "updatedAt": "2026-06-27T13:32:38.666Z",
      "__v": 0
    },
    {
      "_id": "69ea33e1907350f2b24a4307",
      "name": "ege",
      "description": "افضل ميلك بالعالم ",
      "price": 9.99,
      "category": "غزائيات ",
      "countInStock": 38,
      "image": "url:fgkdjlksj&(&*%kglkglkfglklbnl",
      "rating": 0,
      "numReviews": 0,
      "createdAt": "2026-04-23T14:59:45.433Z",
      "updatedAt": "2026-06-27T13:32:38.666Z",
      "__v": 0
    },
    {
      "_id": "69ea33bf907350f2b24a4304",
      "name": "milk",
      "description": "افضل ميلك بالعالم ",
      "price": 9.99,
      "category": "غزائيات ",
      "countInStock": 50,
      "image": "url:fgkdjlksj&(&*%kglkglkfglklbnl",
      "rating": 0,
      "numReviews": 0,
      "createdAt": "2026-04-23T14:59:11.879Z",
      "updatedAt": "2026-06-27T13:32:38.666Z",
      "__v": 0
    },
    {
      "_id": "69ea34ff907350f2b24a430d",
      "name": "سردين",
      "description": "افضل ميلك بالعالم ",
      "price": 9.99,
      "category": "غزائيات ",
      "countInStock": 48,
      "image": "url:fgkdjlksj&(&*%kglkglkfglklbnl",
      "rating": 0,
      "numReviews": 0,
      "createdAt": "2026-04-23T15:04:31.002Z",
      "updatedAt": "2026-06-27T13:32:38.666Z",
      "__v": 0
    },
    {
      "_id": "6a3e9faed27ded35cf729fd3",
      "name": "Demo Product",
      "description": "Sample product for Postman collection",
      "price": 9.99,
      "category": "demo",
      "countInStock": 99,
      "image": "/images/demo.jpg",
      "rating": 0,
      "numReviews": 0,
      "createdAt": "2026-06-26T15:50:06.295Z",
      "updatedAt": "2026-06-27T13:32:38.666Z",
      "__v": 0
    }
  ]
}





