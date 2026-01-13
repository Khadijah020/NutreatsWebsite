// Google Analytics 4 (GA4) tracking utilities

// Initialize GA4
export const initGA = (measurementId) => {
  if (!measurementId || typeof window === 'undefined') return;

  // Load gtag.js script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', measurementId, {
    page_path: window.location.pathname,
    send_page_view: true
  });

  console.log('✅ Google Analytics initialized:', measurementId);
};

// Track page views
export const trackPageView = (url, title) => {
  if (typeof window.gtag !== 'function') return;

  const params = {
    page_path: url,
    page_title: title,
    page_location: window.location.href
  };

  window.gtag('event', 'page_view', params);
  console.log('📊 Analytics Event: page_view', params);
};

// Track custom events
export const trackEvent = (eventName, parameters = {}) => {
  if (typeof window.gtag !== 'function') return;

  window.gtag('event', eventName, parameters);
  console.log('📊 Analytics Event:', eventName, parameters);
};

// E-commerce tracking - View Product
export const trackProductView = (product) => {
  if (!product) return;

  trackEvent('view_item', {
    currency: 'PKR',
    value: product.offerPrice || product.price,
    items: [{
      item_id: product._id,
      item_name: product.name,
      item_category: product.category,
      price: product.offerPrice || product.price,
      quantity: 1
    }]
  });
};

// E-commerce tracking - Add to Cart
export const trackAddToCart = (product, quantity = 1, selectedWeight = null) => {
  if (!product) return;

  // Handle selectedWeight being a string (weight value) or object
  let price, itemName;
  if (selectedWeight) {
    if (typeof selectedWeight === 'string') {
      // selectedWeight is just the weight string, find the variant
      const weightVariant = product.weights?.find(w => w.weight === selectedWeight);
      price = weightVariant ? (weightVariant.offerPrice || weightVariant.price) : (product.offerPrice || product.price);
      itemName = `${product.name} - ${selectedWeight}`;
    } else {
      // selectedWeight is an object with price info
      price = selectedWeight.offerPrice || selectedWeight.price;
      itemName = `${product.name} - ${selectedWeight.weight}`;
    }
  } else {
    price = product.offerPrice || product.price;
    itemName = product.name;
  }

  trackEvent('add_to_cart', {
    currency: 'PKR',
    value: price * quantity,
    items: [{
      item_id: product._id,
      item_name: itemName,
      item_category: product.category,
      price: price,
      quantity: quantity
    }]
  });
};

// E-commerce tracking - Remove from Cart
export const trackRemoveFromCart = (product, quantity = 1, selectedWeight = null) => {
  if (!product) return;

  // Handle selectedWeight being a string (weight value) or object
  let price, itemName;
  if (selectedWeight) {
    if (typeof selectedWeight === 'string') {
      // selectedWeight is just the weight string, find the variant
      const weightVariant = product.weights?.find(w => w.weight === selectedWeight);
      price = weightVariant ? (weightVariant.offerPrice || weightVariant.price) : (product.offerPrice || product.price);
      itemName = `${product.name} - ${selectedWeight}`;
    } else {
      // selectedWeight is an object with price info
      price = selectedWeight.offerPrice || selectedWeight.price;
      itemName = `${product.name} - ${selectedWeight.weight}`;
    }
  } else {
    price = product.offerPrice || product.price;
    itemName = product.name;
  }

  trackEvent('remove_from_cart', {
    currency: 'PKR',
    value: price * quantity,
    items: [{
      item_id: product._id,
      item_name: itemName,
      item_category: product.category,
      price: price,
      quantity: quantity
    }]
  });
};

// E-commerce tracking - Begin Checkout
export const trackBeginCheckout = (cartItems, totalValue) => {
  trackEvent('begin_checkout', {
    currency: 'PKR',
    value: totalValue,
    items: cartItems
  });
};

// E-commerce tracking - Purchase
export const trackPurchase = (orderId, cartItems, totalValue, shipping = 0, tax = 0) => {
  trackEvent('purchase', {
    transaction_id: orderId,
    currency: 'PKR',
    value: totalValue,
    shipping: shipping,
    tax: tax,
    items: cartItems
  });
};

// E-commerce tracking - View Cart
export const trackViewCart = (cartItems, totalValue) => {
  trackEvent('view_cart', {
    currency: 'PKR',
    value: totalValue,
    items: cartItems
  });
};

// Search tracking
export const trackSearch = (searchTerm) => {
  trackEvent('search', {
    search_term: searchTerm
  });
};

// Category view tracking
export const trackCategoryView = (categoryName) => {
  trackEvent('view_item_list', {
    item_list_name: categoryName,
    item_list_id: categoryName.toLowerCase()
  });
};

// User signup/login tracking
export const trackSignUp = (method = 'email') => {
  trackEvent('sign_up', {
    method: method
  });
};

export const trackLogin = (method = 'email') => {
  trackEvent('login', {
    method: method
  });
};

// Engagement tracking
export const trackEngagement = (engagementType, value) => {
  trackEvent('engagement', {
    engagement_type: engagementType,
    value: value
  });
};

// Share tracking
export const trackShare = (method, contentType, itemId) => {
  trackEvent('share', {
    method: method,
    content_type: contentType,
    item_id: itemId
  });
};

// Newsletter signup tracking
export const trackNewsletterSignup = () => {
  trackEvent('newsletter_signup', {
    method: 'website'
  });
};

// Contact form tracking
export const trackContactForm = () => {
  trackEvent('contact_form_submit', {
    form_type: 'contact'
  });
};
