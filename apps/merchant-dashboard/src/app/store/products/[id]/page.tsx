'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';

// Define types for product data
interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
  color?: string;
  size?: string;
  sku?: string;
  imageUrl?: string; // Specific image for this variant
}

interface Product {
  id: string;
  slug: string; // Product slug
  name: string;
  description: string;
  price: number; // Base price, might be overridden by variant
  imageUrl: string; // Main product image
  images: string[]; // Additional gallery images
  variants: ProductVariant[];
  averageRating: number;
  reviewCount: number;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  reviewerName: string;
  createdAt: string;
}

// Helper to extract storeSlug and productId from the pathname
// Given URL pattern: /store/:slug/products/:id
// Given file path: apps/merchant-dashboard/src/app/store/products/[id]/page.tsx
// This component's `params` will only contain `id`. `slug` needs to be parsed from the full pathname.
const extractSlugsFromPathname = (pathname: string) => {
  const parts = pathname.split('/');
  // Expected structure: ['', 'store', 'store-slug', 'products', 'product-id']
  const storeIndex = parts.indexOf('store');
  const productsIndex = parts.indexOf('products');

  let storeSlug: string | undefined;
  let productId: string | undefined;

  if (storeIndex !== -1 && productsIndex !== -1 && productsIndex === storeIndex + 2) {
    storeSlug = parts[storeIndex + 1];
    productId = parts[productsIndex + 1];
  } else {
    // Fallback if the strict pattern is not met. We ensure productId is taken from params later.
    // For this helper, we assume params.id will be used if productId isn't found here.
    console.warn("Could not reliably extract storeSlug from URL path. Expected format: /store/:slug/products/:id");
  }

  return { storeSlug, productId: productId }; // productId will be overridden by params.id
};

// Next.js App Router `page.tsx` receives `params`.
// However, given `apps/merchant-dashboard/src/app/store/products/[id]/page.tsx`,
// `params` will only contain `{ id: string }`.
// The `:slug` from `/store/:slug/products/:id` needs to be extracted from `usePathname`.
interface ProductDetailPageProps {
  params: {
    id: string; // This corresponds to [id] in the file path
  };
  // searchParams?: { [key: string]: string | string[] | undefined } // Not used for slug based on task
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ params }) => {
  const router = useRouter();
  const pathname = usePathname();

  // Extract storeSlug from pathname, productId from params
  const { storeSlug: parsedStoreSlug } = extractSlugsFromPathname(pathname);
  const productId = params.id;
  const storeSlug = parsedStoreSlug; // Use the parsed slug

  const [product, setProduct] = useState<Product | null>(null);
  useEffect(() => { if (!currentImage && product?.imageUrl) setCurrentImage(product.imageUrl); }, [product, currentImage]);
  const [reviews, setReviews] = useState<Review[]>([]);
  useEffect(() => { if (!currentImage && product?.imageUrl) setCurrentImage(product.imageUrl); }, [product, currentImage]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  useEffect(() => { if (!currentImage && product?.imageUrl) setCurrentImage(product.imageUrl); }, [product, currentImage]);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => { if (!currentImage && product?.imageUrl) setCurrentImage(product.imageUrl); }, [product, currentImage]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (!currentImage && product?.imageUrl) setCurrentImage(product.imageUrl); }, [product, currentImage]);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  useEffect(() => { if (!currentImage && product?.imageUrl) setCurrentImage(product.imageUrl); }, [product, currentImage]);
  const [quantity, setQuantity] = useState<number>(1);
  useEffect(() => { if (!currentImage && product?.imageUrl) setCurrentImage(product.imageUrl); }, [product, currentImage]);
  const [currentImage, setCurrentImage] = useState<string>('');
  useEffect(() => { if (!currentImage && product?.imageUrl) setCurrentImage(product.imageUrl); }, [product, currentImage]);

  const fetchProductData = useCallback(async () => {
    if (!storeSlug || !productId) {
      setError("Store slug or product ID is missing. Cannot fetch product details.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Fetch product details
      const productRes = await fetch(`/api/store/${storeSlug}/products/${productId}`);
      if (!productRes.ok) {
        throw new Error(`Failed to fetch product: ${productRes.status} ${productRes.statusText}`);
      }
      const productData: Product = await productRes.json();
      setProduct(productData);

      // Initialize selected variant and current image
      if (productData.variants && productData.variants.length > 0) {
        setSelectedVariant(productData.variants[0]);
        setCurrentImage(productData.variants[0].imageUrl || productData.imageUrl);
      } else {
        setCurrentImage(productData.imageUrl);
      }

      // Fetch product reviews
      const reviewsRes = await fetch(`/api/store/${storeSlug}/products/${productId}/reviews`);
      if (!reviewsRes.ok) {
        throw new Error(`Failed to fetch reviews: ${reviewsRes.status} ${reviewsRes.statusText}`);
      }
      const reviewsData: Review[] = await reviewsRes.json();
      setReviews(reviewsData);

      // Fetch related products
      const relatedProductsRes = await fetch(`/api/store/${storeSlug}/products/${productId}/related`);
      if (!relatedProductsRes.ok) {
        throw new Error(`Failed to fetch related products: ${relatedProductsRes.status} ${relatedProductsRes.statusText}`);
      }
      const relatedProductsData: Product[] = await relatedProductsRes.json();
      setRelatedProducts(relatedProductsData);

    } catch (err: any) {
      setError(err.message || "An unknown error occurred while fetching product data.");
      console.error("Error fetching product data:", err);
    } finally {
      setLoading(false);
    }
  }, [storeSlug, productId]);

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  const handleVariantChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!product) return;
    const variantId = e.target.value;
    const newVariant = product.variants.find(v => v.id === variantId);
    if (newVariant) {
      setSelectedVariant(newVariant);
      setCurrentImage(newVariant.imageUrl || product.imageUrl);
    }
  }, [product]);

  const handleQuantityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  }, []);

  const handleAddToCart = useCallback(async () => {
    if (!product || !selectedVariant || quantity <= 0) {
      alert("Please select a variant and valid quantity.");
      return;
    }
    if (quantity > selectedVariant.stock) {
      alert(`Cannot add ${quantity} items. Only ${selectedVariant.stock} available.`);
      return;
    }

    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          variantId: selectedVariant.id,
          quantity: quantity,
          storeSlug: storeSlug // Pass storeSlug if required by the cart API
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add item to cart.');
      }

      alert('Item added to cart successfully!');
      // Optionally, redirect to cart or show a confirmation modal
      router.push(`/store/${storeSlug}/cart`); // Example redirect
    } catch (err: any) {
      alert(`Error adding to cart: ${err.message}`);
      console.error("Add to cart error:", err);
    }
  }, [product, selectedVariant, quantity, storeSlug, router]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center text-red-600">
        <p>Error: {error}</p>
        <button onClick={() => fetchProductData()} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Retry</button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>Product not found.</p>
      </div>
    );
  }

  const displayPrice = selectedVariant ? selectedVariant.price : product.price;
  const availableStock = selectedVariant ? selectedVariant.stock : 0;
  const isOutOfStock = availableStock <= 0;

  // Aggregate all unique image URLs for the gallery
  const galleryImages = [
    product.imageUrl,
    ...(product.images || []),
    ...(product.variants.map(v => v.imageUrl).filter(Boolean) as string[])
  ].filter((value, index, self) => self.indexOf(value) === index); // Ensure unique images


  return (
    <div className="container mx-auto p-4">
      {/* Product Detail Section */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Image Gallery */}
        <div className="md:w-1/2">
          <div className="relative w-full aspect-square bg-gray-100 flex items-center justify-center">
            {currentImage ? (
              <Image
                src={currentImage}
                alt={product.name}
                layout="fill"
                objectFit="contain"
                className="rounded"
              />
            ) : (
              <div className="text-gray-500">Image not available</div>
            )}
          </div>
          <div className="flex gap-2 mt-4 overflow-x-auto p-2">
            {galleryImages.map((img, index) => (
              <div
                key={index}
                className={`relative w-20 h-20 flex-shrink-0 border-2 ${img === currentImage ? 'border-blue-500' : 'border-gray-200'} rounded cursor-pointer`}
                onClick={() => setCurrentImage(img)}
              >
                <Image
                  src={img}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  layout="fill"
                  objectFit="cover"
                  className="rounded"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="md:w-1/2">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-700 text-xl mb-4">${displayPrice.toFixed(2)}</p>

          <div className="mb-4 flex items-center">
            <div className="flex text-yellow-500">
              {Array(5).fill(0).map((_, i) => (
                <svg key={i} className={`w-5 h-5 ${i < Math.floor(product.averageRating) ? 'text-yellow-500' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="ml-2 text-gray-600">
              ({product.reviewCount} reviews)
            </span>
          </div>

          <p className="text-gray-800 mb-6 whitespace-pre-line">{product.description}</p>

          {product.variants.length > 0 && (
            <div className="mb-4">
              <label htmlFor="variant-select" className="block text-sm font-medium text-gray-700">
                Select Variant:
              </label>
              <select
                id="variant-select"
                value={selectedVariant?.id || ''}
                onChange={handleVariantChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                {product.variants.map(variant => (
                  <option key={variant.id} value={variant.id}>
                    {variant.name} {variant.color ? `(${variant.color}` : ''} {variant.size ? `${variant.size}` : ''} {variant.color || variant.size ? ')' : ''} - ${variant.stock > 0 ? `${variant.stock} in stock` : 'Out of Stock'}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mb-6 flex items-center gap-4">
            <label htmlFor="quantity-input" className="block text-sm font-medium text-gray-700">
              Quantity:
            </label>
            <input
              type="number"
              id="quantity-input"
              min="1"
              max={availableStock > 0 ? availableStock : 1}
              value={quantity}
              onChange={handleQuantityChange}
              className="w-20 p-2 border border-gray-300 rounded-md text-center"
              disabled={isOutOfStock}
            />
            {isOutOfStock && (
                <span className="text-red-500 text-sm">Out of Stock</span>
            )}
            {!isOutOfStock && selectedVariant && selectedVariant.stock < 10 && selectedVariant.stock > 0 && (
                <span className="text-orange-500 text-sm">{selectedVariant.stock} left in stock!</span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || quantity > availableStock}
            className={`w-full px-6 py-3 text-lg font-semibold text-white rounded-md ${
              isOutOfStock || quantity > availableStock
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
        ) : (
          <div className="space-y-6">
            {reviews.map(review => (
              <div key={review.id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-center mb-2">
                  <div className="flex text-yellow-500 mr-2">
                    {Array(5).fill(0).map((_, i) => (
                      <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="font-semibold">{review.reviewerName}</span>
                  <span className="text-gray-500 ml-auto text-sm">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(rp => (
              <div key={rp.id} className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <a href={`/store/${storeSlug}/products/${rp.id}`} onClick={(e) => { e.preventDefault(); router.push(`/store/${storeSlug}/products/${rp.id}`); }}>
                  <div className="relative w-full h-48 bg-gray-100 mb-4 flex items-center justify-center">
                    {rp.imageUrl ? (
                      <Image
                        src={rp.imageUrl}
                        alt={rp.name}
                        layout="fill"
                        objectFit="contain"
                        className="rounded"
                      />
                    ) : (
                      <div className="text-gray-500">No Image</div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold truncate mb-1">{rp.name}</h3>
                  <p className="text-gray-700">${rp.price.toFixed(2)}</p>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;