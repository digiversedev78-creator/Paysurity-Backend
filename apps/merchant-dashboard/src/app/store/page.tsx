export const dynamic = 'force-dynamic';
import React from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  slug: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

// Helper to fetch data with basic error handling
async function fetchData<T>(url: string): Promise<T | null> {
  try {
    // In a real application, you might use a more robust API client like axios
    // and handle base URLs, headers (e.g., auth tokens), etc.
    const response = await fetch(url, { cache: 'no-store' }); // Disable cache for development/dynamic data
    if (!response.ok) {
      console.error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
      return null;
    }
    return response.json();
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return null;
  }
}

export default async function StoreHomePage() {
  // In a real multi-tenant application, the storeSlug would dynamically come from
  // the current merchant's configuration or session for their primary store.
  // For this exercise within the merchant dashboard, we use a placeholder.
  // If this were a consumer-facing app with dynamic routes, it would be `params.slug`.
  const STORE_SLUG = 'merchant-paysurity-store-123'; 

  // Fetch data in parallel for efficiency in a server component
  const [featuredProducts, categories] = await Promise.all([
    fetchData<Product[]>(`/api/store/${STORE_SLUG}/products?featured=true`),
    fetchData<Category[]>(`/api/store/${STORE_SLUG}/categories`),
    // Add other API calls for dynamic banners if available
  ]);

  // Placeholder data for banners
  const heroBanner = {
    title: 'Discover Our Latest Collection',
    subtitle: 'Shop now and elevate your style!',
    imageUrl: 'https://via.placeholder.com/1600x600/F0F0F0/333333?text=Hero+Banner',
    link: `#featured-products`,
  };

  const promoBanners = [
    {
      id: 'promo1',
      title: 'Summer Sale!',
      description: 'Up to 50% off on selected items.',
      imageUrl: 'https://via.placeholder.com/600x200/E0E0E0/333333?text=Promo+1',
      link: `/store/${STORE_SLUG}/category/summer-sale`,
    },
    {
      id: 'promo2',
      title: 'Free Shipping',
      description: 'On all orders over $75.',
      imageUrl: 'https://via.placeholder.com/600x200/D0D0D0/333333?text=Promo+2',
      link: `/store/${STORE_SLUG}/shipping-info`,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Hero Banner */}
      <section
        className="relative h-96 md:h-[500px] bg-cover bg-center flex items-center justify-center text-white p-4"
        style={{ backgroundImage: `url(${heroBanner.imageUrl})` }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 text-center max-w-2xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
            {heroBanner.title}
          </h1>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            {heroBanner.subtitle}
          </p>
          <Link
            href={heroBanner.link}
            className="inline-block bg-white text-gray-900 px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-200 transition duration-300 ease-in-out shadow-lg"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="py-8 md:py-12 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">Shop by Category</h2>
          {categories && categories.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/store/${STORE_SLUG}/category/${category.slug}`}
                  className="px-6 py-3 bg-gray-100 rounded-full text-lg font-medium text-gray-700 hover:bg-gray-200 transition duration-300 ease-in-out shadow-sm"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600">No categories found.</p>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section id="featured-products" className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">Featured Products</h2>
          {featuredProducts && featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/store/${STORE_SLUG}/product/${product.slug}`}
                  className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out overflow-hidden group"
                >
                  <div className="relative w-full h-64 overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-2xl font-bold text-gray-800">${product.price.toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 text-lg">No featured products available at the moment. Please check back later!</p>
          )}
        </div>
      </section>

      {/* Promotional Banners */}
      <section className="py-12 md:py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">Special Offers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {promoBanners.map((banner) => (
              <Link
                key={banner.id}
                href={banner.link}
                className="block relative bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out overflow-hidden"
              >
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-48 object-cover object-center md:h-64"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center text-center p-4">
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{banner.title}</h3>
                  <p className="text-lg text-white opacity-90">{banner.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Optional: Footer or other sections */}
      <footer className="py-8 bg-gray-900 text-white text-center">
        <div className="container mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} PaySurity Store. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}