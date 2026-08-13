export type StoreLang = "en" | "ar";

export interface StoreTranslations {
  nav: {
    home: string;
    shop: string;
    about: string;
    privacy: string;
    terms: string;
    refundPolicy: string;
    trackOrder: string;
    signIn: string;
    myAccount: string;
    viewProfile: string;
    signOut: string;
    wishlist: string;
    bag: string;
    searchPlaceholder: string;
    searchFootwear: string;
    searchAction: string;
    navigation: string;
    shopAndOrders: string;
    signInToAccount: string;
    categories: {
      shoes: string;
      bags: string;
      perfumes: string;
      accessories: string;
      comingSoon: string;
    };
  };
  footer: {
    aboutTitle: string;
    aboutDesc: string;
    quickLinks: string;
    customerCare: string;
    contactUs: string;
    phoneLabel: string;
    emailLabel: string;
    locationLabel: string;
    locationValue: string;
    allRightsReserved: string;
    curatedWithCare: string;
    secureCheckout: string;
  };
  cart: {
    title: string;
    emptyTitle: string;
    emptyDesc: string;
    startShopping: string;
    subtotal: string;
    shipping: string;
    calculatedAtCheckout: string;
    freeShipping: string;
    freeShippingQualified: string;
    awayFromFreeShipping: string;
    checkoutButton: string;
    remove: string;
    quantity: string;
    size: string;
    color: string;
  };
  productCard: {
    addToBag: string;
    quickView: string;
    soldOut: string;
    sale: string;
    new: string;
    colorsAvailable: string;
    buyNow: string;
  };
  home: {
    heroTag: string;
    heroTitle: string;
    heroSub: string;
    shopCollection: string;
    exploreCategories: string;
    featuredCollection: string;
    featuredSub: string;
    bestSellers: string;
    bestSellersSub: string;
    viewAll: string;
    whyDeRoma: string;
    curatedQualityTitle: string;
    curatedQualityDesc: string;
    comfortTitle: string;
    comfortDesc: string;
    fastShippingTitle: string;
    fastShippingDesc: string;
    easyExchangeTitle: string;
    easyExchangeDesc: string;
    customerReviews: string;
    customerReviewsSub: string;
  };
  shopPage: {
    title: string;
    subtitle: string;
    filterBy: string;
    allProducts: string;
    sortBy: string;
    sortFeatured: string;
    sortPriceLowHigh: string;
    sortPriceHighLow: string;
    sortNewest: string;
    noProductsFound: string;
    clearFilters: string;
    searchResultFor: string;
    category: string;
    priceRange: string;
    inStockOnly: string;
  };
  productDetail: {
    selectSize: string;
    selectColor: string;
    quantity: string;
    addToBag: string;
    addToCart: string;
    addedToCart: string;
    addingToBag: string;
    inStock: string;
    outOfStock: string;
    description: string;
    features: string;
    sizeGuide: string;
    shippingReturns: string;
    freeShippingNotice: string;
    customerReviews: string;
    writeReview: string;
    writeAReview: string;
    verifiedReviews: string;
    basedOnReviews: string;
    noReviewsYet: string;
    beFirstReview: string;
    relatedProducts: string;
    youMayAlsoLike: string;
    reviews: string;
  };
  wishlist: {
    title: string;
    subtitle: string;
    emptyTitle: string;
    emptyDesc: string;
    exploreShop: string;
    clearAll: string;
  };
  checkout: {
    title: string;
    expressCheckout: string;
    contactInfo: string;
    email: string;
    phone: string;
    shippingAddress: string;
    firstName: string;
    lastName: string;
    address: string;
    apartment: string;
    governorate: string;
    city: string;
    selectGovernorate: string;
    selectCity: string;
    notes: string;
    paymentMethod: string;
    cashOnDelivery: string;
    cashOnDeliveryDesc: string;
    creditCard: string;
    placeOrder: string;
    placingOrder: string;
    orderSummary: string;
    itemsCount: string;
    subtotal: string;
    shippingFee: string;
    total: string;
    free: string;
  };
  login: {
    signInTitle: string;
    signInSub: string;
    registerTitle: string;
    registerSub: string;
    emailLabel: string;
    passwordLabel: string;
    confirmPasswordLabel: string;
    fullNameLabel: string;
    phoneLabel: string;
    signInBtn: string;
    registerBtn: string;
    dontHaveAccount: string;
    alreadyHaveAccount: string;
    createAccount: string;
  };
  profile: {
    title: string;
    welcomeBack: string;
    orderHistory: string;
    noOrders: string;
    noOrdersDesc: string;
    orderNumber: string;
    date: string;
    status: string;
    total: string;
    items: string;
    accountDetails: string;
    editProfile: string;
    signOut: string;
  };
  track: {
    title: string;
    subtitle: string;
    orderNumberPlaceholder: string;
    phonePlaceholder: string;
    trackBtn: string;
    trackingOrder: string;
    statusPending: string;
    statusProcessing: string;
    statusShipped: string;
    statusDelivered: string;
    statusCancelled: string;
    orderNotFound: string;
  };
}

export const storeTranslations: Record<StoreLang, StoreTranslations> = {
  en: {
    nav: {
      home: "Home",
      shop: "Shop",
      about: "About Us & Contact",
      privacy: "Our Privacy",
      terms: "Terms of Service",
      refundPolicy: "Refund Policy",
      trackOrder: "Track Order",
      signIn: "Sign In",
      myAccount: "My Account",
      viewProfile: "View Profile & Orders",
      signOut: "Sign Out",
      wishlist: "Wishlist",
      bag: "Bag",
      searchPlaceholder: "Search shoes...",
      searchFootwear: "Search footwear...",
      searchAction: "Search...",
      navigation: "Navigation",
      shopAndOrders: "Shop & Orders",
      signInToAccount: "Sign In to Account",
      categories: {
        shoes: "Shoes",
        bags: "Bags",
        perfumes: "Perfumes",
        accessories: "Accessories",
        comingSoon: "Coming Soon",
      },
    },
    footer: {
      aboutTitle: "DeRoma Store",
      aboutDesc: "Curated boutique collection of elegant women's shoes with cushioned comfort, everyday support, and nationwide delivery.",
      quickLinks: "Quick Links",
      customerCare: "Customer Care",
      contactUs: "Contact Us",
      phoneLabel: "Phone",
      emailLabel: "Email",
      locationLabel: "Location",
      locationValue: "Cairo, Egypt",
      allRightsReserved: "All rights reserved.",
      curatedWithCare: "Curated with elegance in Egypt.",
      secureCheckout: "100% Secure Checkout & Easy Returns",
    },
    cart: {
      title: "Your Shopping Bag",
      emptyTitle: "Your bag is empty",
      emptyDesc: "Looks like you haven't added any elegant shoes to your bag yet.",
      startShopping: "Explore Shop",
      subtotal: "Subtotal",
      shipping: "Shipping",
      calculatedAtCheckout: "Calculated at checkout",
      freeShipping: "Free Shipping",
      freeShippingQualified: "You unlocked Free Shipping!",
      awayFromFreeShipping: "away from Free Shipping!",
      checkoutButton: "Proceed to Checkout",
      remove: "Remove",
      quantity: "Qty",
      size: "Size",
      color: "Color",
    },
    productCard: {
      addToBag: "Add to Bag",
      quickView: "Quick View",
      soldOut: "Sold Out",
      sale: "Sale",
      new: "New Arrival",
      colorsAvailable: "colors available",
      buyNow: "Buy Now",
    },
    home: {
      heroTag: "Curated Boutique Footwear",
      heroTitle: "Elegance in Every Step",
      heroSub: "Discover our curated collection selected for ultimate comfort and timeless style.",
      shopCollection: "Shop Collection",
      exploreCategories: "Explore Categories",
      featuredCollection: "Featured Collection",
      featuredSub: "Handpicked styles curated for your everyday elegance.",
      bestSellers: "Best Sellers",
      bestSellersSub: "Our most loved curated shoes.",
      viewAll: "View All Products",
      whyDeRoma: "Why Choose DeRoma",
      curatedQualityTitle: "Curated Quality",
      curatedQualityDesc: "Carefully selected styles chosen for comfort, durability, and everyday appeal.",
      comfortTitle: "All-Day Comfort",
      comfortDesc: "Double-cushioned insoles for effortless daily wear.",
      fastShippingTitle: "Fast Delivery",
      fastShippingDesc: "Reliable nationwide shipping right to your doorstep.",
      easyExchangeTitle: "Hassle-Free Exchange",
      easyExchangeDesc: "Simple exchange policy so you always get the perfect fit.",
      customerReviews: "What Our Customers Say",
      customerReviewsSub: "Real feedback from women who love DeRoma.",
    },
    shopPage: {
      title: "Our Footwear Collection",
      subtitle: "Browse elegant shoes selected for style and comfort.",
      filterBy: "Filter By",
      allProducts: "All Footwear",
      sortBy: "Sort By",
      sortFeatured: "Featured",
      sortPriceLowHigh: "Price: Low to High",
      sortPriceHighLow: "Price: High to Low",
      sortNewest: "Newest Arrivals",
      noProductsFound: "No shoes found matching your criteria.",
      clearFilters: "Clear Filters",
      searchResultFor: "Search results for",
      category: "Category",
      priceRange: "Price Range",
      inStockOnly: "In Stock Only",
    },
    productDetail: {
      selectSize: "Select Size",
      selectColor: "Select Color",
      quantity: "Quantity",
      addToBag: "Add to Shopping Bag",
      addToCart: "Add To Cart",
      addedToCart: "Added to Cart!",
      addingToBag: "Adding to Bag...",
      inStock: "In Stock - Ready to Ship",
      outOfStock: "Currently Out of Stock",
      description: "Description & Details",
      features: "Key Features",
      sizeGuide: "Size Guide",
      shippingReturns: "Shipping & Returns Policy",
      freeShippingNotice: "Free shipping on orders over 1000 EGP",
      customerReviews: "Customer Reviews",
      writeReview: "Write a Review",
      writeAReview: "Write a Review",
      verifiedReviews: "25,000+ verified reviews",
      basedOnReviews: "Based on reviews",
      noReviewsYet: "No reviews yet.",
      beFirstReview: "Be the first to review this product!",
      relatedProducts: "You May Also Like",
      youMayAlsoLike: "You May Also Like",
      reviews: "Reviews",
    },
    wishlist: {
      title: "My Wishlist",
      subtitle: "Save your favorite footwear styles for later.",
      emptyTitle: "Your wishlist is empty",
      emptyDesc: "Explore our collection and click the heart icon on any pair to save it here.",
      exploreShop: "Browse Collection",
      clearAll: "Clear Wishlist",
    },
    checkout: {
      title: "Checkout",
      expressCheckout: "Shipping & Customer Information",
      contactInfo: "Contact Information",
      email: "Email Address",
      phone: "Mobile Phone Number",
      shippingAddress: "Shipping Address",
      firstName: "First Name",
      lastName: "Last Name",
      address: "Street Address",
      apartment: "Building / Apt / Suite (Optional)",
      governorate: "Governorate",
      city: "City / District",
      selectGovernorate: "Select Governorate",
      selectCity: "Select City",
      notes: "Delivery Notes / Special Instructions (Optional)",
      paymentMethod: "Payment Method",
      cashOnDelivery: "Cash on Delivery (COD)",
      cashOnDeliveryDesc: "Pay in cash upon receiving your package.",
      creditCard: "Card Payment (Online)",
      placeOrder: "Confirm & Place Order",
      placingOrder: "Processing Order...",
      orderSummary: "Order Summary",
      itemsCount: "Items",
      subtotal: "Subtotal",
      shippingFee: "Shipping Fee",
      total: "Total",
      free: "FREE",
    },
    login: {
      signInTitle: "Welcome Back",
      signInSub: "Sign in to access your orders and saved wishlist items.",
      registerTitle: "Create an Account",
      registerSub: "Join DeRoma to track your orders and enjoy a faster checkout.",
      emailLabel: "Email Address",
      passwordLabel: "Password",
      confirmPasswordLabel: "Confirm Password",
      fullNameLabel: "Full Name",
      phoneLabel: "Phone Number",
      signInBtn: "Sign In",
      registerBtn: "Create Account",
      dontHaveAccount: "Don't have an account?",
      alreadyHaveAccount: "Already have an account?",
      createAccount: "Register now",
    },
    profile: {
      title: "My Profile",
      welcomeBack: "Welcome back",
      orderHistory: "Order History",
      noOrders: "No orders placed yet",
      noOrdersDesc: "When you complete an order, track its status and details right here.",
      orderNumber: "Order Number",
      date: "Date",
      status: "Status",
      total: "Total",
      items: "Items",
      accountDetails: "Account Details",
      editProfile: "Edit Information",
      signOut: "Sign Out",
    },
    track: {
      title: "Track Your Order",
      subtitle: "Enter your order details below to check the real-time status of your delivery.",
      orderNumberPlaceholder: "e.g. DER-1042",
      phonePlaceholder: "Enter your phone number",
      trackBtn: "Track Order",
      trackingOrder: "Searching order...",
      statusPending: "Order Received",
      statusProcessing: "Preparing for Dispatch",
      statusShipped: "Out for Delivery",
      statusDelivered: "Delivered",
      statusCancelled: "Cancelled",
      orderNotFound: "No order found matching these details. Please check your order ID and phone number.",
    },
  },
  ar: {
    nav: {
      home: "الرئيسية",
      shop: "المتجر",
      about: "من نحن والتواصل",
      privacy: "سياسة الخصوصية",
      terms: "الشروط والأحكام",
      refundPolicy: "سياسة الإستبدال والإسترجاع",
      trackOrder: "تتبع الطلب",
      signIn: "تسجيل الدخول",
      myAccount: "حسابي",
      viewProfile: "الملف الشخصي والطلبات",
      signOut: "تسجيل الخروج",
      wishlist: "المفضلة",
      bag: "حقيبة التسوق",
      searchPlaceholder: "ابحث عن حذاء...",
      searchFootwear: "ابحث في منتجاتنا...",
      searchAction: "بحث...",
      navigation: "القائمة الرئيسية",
      shopAndOrders: "المتجر والطلبات",
      signInToAccount: "تسجيل الدخول للحساب",
      categories: {
        shoes: "الأحذية",
        bags: "حقائب اليد",
        perfumes: "العطور",
        accessories: "الإكسسوارات",
        comingSoon: "قريباً",
      },
    },
    footer: {
      aboutTitle: "متجر دي روما (DeRoma)",
      aboutDesc: "تشكيلة فاخرة ومختارة بعناية من الأحذية النسائية الأنيقة والمريحة، مع توصيل سريع لجميع المحافظات.",
      quickLinks: "روابط سريعة",
      customerCare: "خدمة العملاء",
      contactUs: "تواصل معنا",
      phoneLabel: "الهاتف",
      emailLabel: "البريد الإلكتروني",
      locationLabel: "العنوان",
      locationValue: "القاهرة، مصر",
      allRightsReserved: "جميع الحقوق محفوظة.",
      curatedWithCare: "اختيارات أنيقة بعناية في مصر.",
      secureCheckout: "دفع آمن 100% وإستبدال سهل",
    },
    cart: {
      title: "حقيبة التسوق الخاصة بك",
      emptyTitle: "حقيبة التسوق فارغة",
      emptyDesc: "يبدو أنك لم تقومي بإضافة أي أحذية أنيقة إلى حقيبتك بعد.",
      startShopping: "تصفحي المتجر الآن",
      subtotal: "المجموع الفرعي",
      shipping: "الشحن",
      calculatedAtCheckout: "يحسب عند إتمام الطلب",
      freeShipping: "شحن مجاني",
      freeShippingQualified: "تهانينا! لقد حصلت على شحن مجاني!",
      awayFromFreeShipping: "يفصلك عن الشحن المجاني!",
      checkoutButton: "متابعة الشراء وإتمام الطلب",
      remove: "حذف",
      quantity: "الكمية",
      size: "المقاس",
      color: "اللون",
    },
    productCard: {
      addToBag: "إضافة للحقيبة",
      quickView: "نظرة سريعة",
      soldOut: "نفذت الكمية",
      sale: "خصم مميز",
      new: "وصل حديثاً",
      colorsAvailable: "ألوان متوفرة",
      buyNow: "شراء الآن",
    },
    home: {
      heroTag: "أحذية حريمي فاخرة مختارة بعناية",
      heroTitle: "الأناقة في كل خطوة",
      heroSub: "اكتشفي تشكيلتنا المختارة بعناية لتمنحك أقصى درجات الراحة والجمال العصري.",
      shopCollection: "تسوقي التشكيلة",
      exploreCategories: "تصفحي الفئات",
      featuredCollection: "التشكيلة المختارة",
      featuredSub: "تصاميم منتقاة بعناية لإطلالتك اليومية الأنيقة.",
      bestSellers: "الأكثر مبيعاً",
      bestSellersSub: "الأحذية الأكثر طلباً وإعجاباً من عميلاتنا.",
      viewAll: "عرض جميع المنتجات",
      whyDeRoma: "لماذا تختارين دي روما؟",
      curatedQualityTitle: "جودة مختارة بعناية",
      curatedQualityDesc: "موديلات مختارة بعناية لتجمع بين الراحة والمتانة والأناقة.",
      comfortTitle: "راحة طوال اليوم",
      comfortDesc: "بطانة مضاعفة مصممة خصيصاً لراحة قدميكِ أثناء السير والمشي اليومي.",
      fastShippingTitle: "توصيل سريع",
      fastShippingDesc: "شحن سريع وموثوق إلى باب منزلكِ في جميع محافظات مصر.",
      easyExchangeTitle: "إستبدال مرن وسهل",
      easyExchangeDesc: "سياسة استبدال مريحة لتضمني الحصول على المقاس والموديل المناسبين تماماً.",
      customerReviews: "آراء عميلاتنا",
      customerReviewsSub: "تقييمات وتجارب حقيقية من نساء يعشقن أحذية دي روما.",
    },
    shopPage: {
      title: "تشكيلة الأحذية الفاخرة",
      subtitle: "تصفحي أرقى موديلات الأحذية المختارة بعناية لتناسب راحتكِ وأناقتكِ.",
      filterBy: "تصفية حسب",
      allProducts: "جميع الأحذية",
      sortBy: "ترتيب حسب",
      sortFeatured: "الأبرز والأحدث",
      sortPriceLowHigh: "السعر: من الأقل للأعلى",
      sortPriceHighLow: "السعر: من الأعلى للأقل",
      sortNewest: "أحدث الموديلات",
      noProductsFound: "لم نجد أحذية تطابق خيارات البحث الخاصة بكِ.",
      clearFilters: "إعادة ضبط الفلاتر",
      searchResultFor: "نتائج البحث عن",
      category: "الفئة",
      priceRange: "نطاق السعر",
      inStockOnly: "المتوفر فقط",
    },
    productDetail: {
      selectSize: "اختاري المقاس",
      selectColor: "اختاري اللون",
      quantity: "الكمية",
      addToBag: "إضافة إلى حقيبة التسوق",
      addToCart: "إضافة إلى السلة",
      addedToCart: "تمت الإضافة إلى السلة!",
      addingToBag: "جاري الإضافة...",
      inStock: "متوفر بالمخزن - جاهز للشحن",
      outOfStock: "غير متوفر حالياً",
      description: "الوصف والتفاصيل",
      features: "المميزات الرئيسية",
      sizeGuide: "دليل المقاسات",
      shippingReturns: "سياسة الشحن والاستبدال",
      freeShippingNotice: "شحن مجاني للطلبات الأكثر من 1000 EGP",
      customerReviews: "تقييمات العميلات",
      writeReview: "كتابة تقييم",
      writeAReview: "كتابة تقييم",
      verifiedReviews: "تقييمات موثقة",
      basedOnReviews: "بناءً على التقييمات",
      noReviewsYet: "لا توجد تقييمات بعد.",
      beFirstReview: "كوني أول من يضيف تقييم لهذا المنتج!",
      relatedProducts: "منتجات قد تعجبكِ أيضاً",
      youMayAlsoLike: "منتجات قد تعجبكِ أيضاً",
      reviews: "التقييمات",
    },
    wishlist: {
      title: "قائمة المفضلة",
      subtitle: "احفظي أحذيتك المفضلة للعودة إليها والشراء لاحقاً.",
      emptyTitle: "قائمة المفضلة فارغة",
      emptyDesc: "تصفحي تشكيلتنا واضغطي على أيقونة القلب على أي حذاء لإضافته هنا.",
      exploreShop: "تصفحي تشكيلة الأحذية",
      clearAll: "محي المفضلة",
    },
    checkout: {
      title: "إتمام الشراء",
      expressCheckout: "بيانات الشحن والعميل",
      contactInfo: "معلومات التواصل",
      email: "البريد الإلكتروني",
      phone: "رقم المحمول",
      shippingAddress: "عنوان التوصيل",
      firstName: "الاسم الأول",
      lastName: "اسم العائلة",
      address: "العنوان بالتفصيل (الشارع / رقم المبنى)",
      apartment: "الشقة / الدور (اختياري)",
      governorate: "المحافظة",
      city: "المدينة / المنطقة",
      selectGovernorate: "اختر المحافظة",
      selectCity: "اختر المدينة",
      notes: "ملاحظات للتوصيل (اختياري)",
      paymentMethod: "طريقة الدفع",
      cashOnDelivery: "الدفع عند الاستلام (COD)",
      cashOnDeliveryDesc: "ادفعي نقداً فور استلام طلبيتكِ من مندوب الشحن.",
      creditCard: "الدفع بالبطاقة البنكية",
      placeOrder: "تأكيد وإرسال الطلب",
      placingOrder: "جاري إرسال الطلب...",
      orderSummary: "ملخص الطلب",
      itemsCount: "المنتجات",
      subtotal: "المجموع الفرعي",
      shippingFee: "مصاريف الشحن",
      total: "الإجمالي الكلي",
      free: "مجاناً",
    },
    login: {
      signInTitle: "مرحباً بعودتكِ",
      signInSub: "سجلي الدخول لمتابعة طلباتك وقائمة مفضلتكِ.",
      registerTitle: "إنشاء حساب جديد",
      registerSub: "انضمي إلى دي روما لتتبع طلباتكِ والاستمتاع بتجربة شراء أسرع.",
      emailLabel: "البريد الإلكتروني",
      passwordLabel: "كلمة المرور",
      confirmPasswordLabel: "تأكيد كلمة المرور",
      fullNameLabel: "الاسم بالكامل",
      phoneLabel: "رقم الهاتف",
      signInBtn: "تسجيل الدخول",
      registerBtn: "إنشاء الحساب",
      dontHaveAccount: "ليس لديكِ حساب؟",
      alreadyHaveAccount: "لديكِ حساب بالفعل؟",
      createAccount: "سجلي الآن",
    },
    profile: {
      title: "حسابي الشخصي",
      welcomeBack: "مرحباً بعودتكِ",
      orderHistory: "سجل الطلبات",
      noOrders: "لا توجد طلبات سابقة",
      noOrdersDesc: "عند إتمام أي طلبية، ستظهر حالتها وتفاصيلها هنا فوراً.",
      orderNumber: "رقم الطلب",
      date: "التاريخ",
      status: "الحالة",
      total: "الإجمالي",
      items: "المنتجات",
      accountDetails: "بيانات الحساب",
      editProfile: "تعديل البيانات",
      signOut: "تسجيل الخروج",
    },
    track: {
      title: "تتبع طلبكِ",
      subtitle: "أدخلي رقم الطلب ورقم الهاتف لمعرفة حالة التوصيل الحالية فوراً.",
      orderNumberPlaceholder: "مثال: DER-1042",
      phonePlaceholder: "أدخلي رقم المحمول",
      trackBtn: "تتبع الطلب الآن",
      trackingOrder: "جاري البحث عن الطلب...",
      statusPending: "تم استلام الطلب",
      statusProcessing: "جاري تجهيز الشحنة",
      statusShipped: "خرج للتوصيل",
      statusDelivered: "تم التسليم بنجاح",
      statusCancelled: "ملغي",
      orderNotFound: "لم نجد طلب بهذه البيانات. يرجى التأكد من رقم الطلب ورقم المحمول.",
    },
  },
};
