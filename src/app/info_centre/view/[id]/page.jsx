"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '../../../pages/Navbar';
import { useSiteSettings } from '../../../context/SiteSettingsContext';
import styles from '../../../../app/[practiceId]/info_centre/view/[itemId]/infoItem.module.css';
import Loader from '../../../components/Loader';

// Default practice ID to use when none is provided in the URL
const DEFAULT_PRACTICE_ID = '67';

export default function InfoItemPage() {
  const params = useParams();
  const practiceId = DEFAULT_PRACTICE_ID; // Using default practice ID since it's not in the URL
  const itemId = params.id; // Changed from params.itemId to params.id
  const router = useRouter();
  const { siteSettings } = useSiteSettings();
  const [content, setContent] = useState(null);
  const [categoryDetails, setCategoryDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (itemId) {
      const fetchContent = async () => {
        try {
          setLoading(true);
          setError(null);

          if (!itemId) {
            throw new Error('No item ID specified in the URL');
          }

          // Fetch all necessary data in parallel
          const [categoriesResponse, itemsResponse] = await Promise.all([
            axios.get('https://www.ocumail.com/api/section_categories'),
            axios.get('https://www.ocumail.com/api/section_items')
          ]);
          
          const categories = categoriesResponse?.data || [];
          const items = itemsResponse?.data || [];
          
          // Find the item by ID
          const item = items.find(i => String(i.id) === String(itemId));
          
          if (!item) {
            console.error('Item not found. Available items:', 
              items.map(i => `${i.id}: ${i.name}`).join('\n'));
            throw new Error(`Item with ID ${itemId} not found`);
          }
          
          // Find the category for this item
          const currentCategory = categories.find(cat => cat.id === item.section_category_id);
          
          if (!currentCategory) {
            console.error('Category not found for item. Available categories:', 
              categories.map(c => `${c.id}: ${c.name}`).join('\n'));
            throw new Error(`Category not found for item ${itemId}`);
          }
          
          setCategoryDetails(currentCategory);
          
          // Fetch item attributes
          const attributesResponse = await axios.get(`https://www.ocumail.com/api/item_attributes/${item.id}`);
          let attributes = attributesResponse?.data || [];

          // Process attributes to modify image paths in the data field
          attributes = attributes.map(attr => {
            if (attr.data && typeof attr.data === 'string') {
              let modifiedData = attr.data;
              // Handle image paths in the content
              modifiedData = modifiedData.replace(/<img[^>]+src=["']([^"']+)["']/gi, (match, src) => {
                // If it's already a full URL, leave it as is
                if (src.match(/^https?:\/\//i) || src.startsWith('//')) {
                  return match;
                }
                // If it's a local path starting with /images/, ensure it's absolute from the root
                if (src.toLowerCase().includes('images/')) {
                  // Get the filename part
                  const filename = src.split('/').pop();
                  // Create an absolute path from the root
                  const newSrc = `/images/Body/${filename}`;
                  return match.replace(src, newSrc);
                }
                // For any other relative paths, leave them as is
                return match;
              });
              return { ...attr, data: modifiedData };
            }
            return attr;
          });

          // Find banner image URL from attributes
          const bannerImgAttr = attributes.find(attr => attr.name === 'bannerImg');
          const bannerUrl = bannerImgAttr?.data || '';
          
          // Check if there's an Overview attribute
          const overviewAttr = attributes.find(attr => attr.name === 'Overview');
          
          setContent({
            id: item.id,
            name: item.title,
            banner: bannerUrl,
            overview: overviewAttr?.data || '',
            hasOverview: !!overviewAttr,
            // Only include non-Overview, non-banner attributes if there's no Overview
            attributes: overviewAttr 
              ? [] 
              : attributes.filter(attr => !['Overview', 'bannerImg'].includes(attr.name))
          });
        } catch (error) {
          console.error('Error fetching content:', error);
          setError('Failed to load content');
        } finally {
          setLoading(false);
        }
      };

      fetchContent();
    }
  }, [itemId, practiceId]);

  const renderReferences = () => {
    if (!content?.attributes) return null;

    const referenceTitles = content.attributes.filter(attr => 
      attr.name && attr.name.startsWith('Reference.') && attr.name.endsWith('.Title')
    );

    if (referenceTitles.length === 0) return null;

    return (
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">References</h3>
        <ol className="list-decimal space-y-2">
          {referenceTitles
            .sort((a, b) => {
              const numA = parseInt(a.name.match(/Reference\.(\d+)/)[1]);
              const numB = parseInt(b.name.match(/Reference\.(\d+)/)[1]);
              return numA - numB;
            })
            .map((titleAttr) => {
              const refNum = titleAttr.name.match(/Reference\.(\d+)/)[1];
              const urlAttr = content.attributes.find(
                attr => attr.name === `Reference.${refNum}.Url`
              );
              return (
                <li key={titleAttr.id} className="ml-4 pl-2">
                  {urlAttr ? (
                    <a
                      href={urlAttr.data}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {titleAttr.data}
                    </a>
                  ) : (
                    <span>{titleAttr.data}</span>
                  )}
                </li>
              );
            })}
        </ol>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return <Loader />;
    }

    if (error) {
      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2 className={styles.errorTitle}>Error Loading Content</h2>
          <p className={styles.errorMessage}>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className={styles.retryButton}
          >
            Try Again
          </button>
        </div>
      );
    }

    if (!content) {
      return (
        <div className={styles.errorContainer}>
          <h2 className={styles.errorTitle}>Content Not Found</h2>
          <p className={styles.errorMessage}>The requested content could not be loaded.</p>
          <Link 
            href={`/${practiceId}/info_centre`}
            className={styles.retryButton}
          >
            Return to Info Centre
          </Link>
        </div>
      );
    }

    return (
      <div className={styles.contentWrapper}>
        {content.overview ? (
          <div 
            className="reset-styles"
            dangerouslySetInnerHTML={{ __html: content.overview }}
          />
        ) : (
          content.attributes
            .filter(attr => attr.name.includes('.') && 
                          !attr.name.startsWith('Reference.') && 
                          !['bannerImg', 'Overview'].includes(attr.name))
            .sort((a, b) => {
              const getSectionNumber = (name) => {
                const match = name.match(/\.(\d+)\./);
                return match ? parseInt(match[1]) : 0;
              };
              return getSectionNumber(a.name) - getSectionNumber(b.name);
            })
            .map((attr, idx, arr) => {
              const sectionNumber = parseInt(attr.name.split('.')[1]) || 0;
              if (sectionNumber === 0) return null;

              const isNewSection = idx === 0 || 
                (parseInt(arr[idx-1]?.name.split('.')[1]) || 0) !== sectionNumber;

              if (isNewSection) {
                const sectionAttrs = content.attributes.filter(a =>
                  a.name.startsWith(`Section.${sectionNumber}.`)
                );

                const titleAttr = sectionAttrs.find(a => a.name.endsWith('.Title'));
                const bodyAttr = sectionAttrs.find(a => a.name.endsWith('.Body'));
                const imageAttr = sectionAttrs.find(a => a.name.endsWith('.Image'));

                return (
                  <div key={`section-${sectionNumber}`} className={styles.section}>
                    {titleAttr && (
                      <h2 className={styles.sectionTitle}>
                        {titleAttr.data}
                      </h2>
                    )}
                    
                    <div className={styles.sectionContent}>
                      {bodyAttr && (
                        <div 
                          className={styles.prose}
                          dangerouslySetInnerHTML={{ __html: bodyAttr.data }}
                        />
                      )}
                      
                      {imageAttr && (
                        <div className={styles.imageContainer}>
                          <Image
                            src={imageAttr.data}
                            alt={titleAttr?.data || 'Section image'}
                            width={800}
                            height={450}
                            className={styles.sectionImage}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            })
        )}
        
        {renderReferences()}        
        
      </div>
    );
  };

  const renderBreadcrumbs = () => {
  if (!content) return null;
  
  // Always use clean paths without practice ID or customer code
  const infoCentrePath = '/info_centre';
  const categoryPath = categoryDetails 
    ? `/info_centre/list/${categoryDetails.id}`
    : infoCentrePath;
  
  return (
    <div className="bg-gray-100 py-5 pb-1 px-4">
      <div className="container mx-auto">
        <div className="text-xl font-medium text-center">
          <Link href={infoCentrePath} className="text-primary underline">
            Info Centre
          </Link>
          {categoryDetails && (
            <>
              <span className="mx-2 text-primary">|</span>
              <Link href={categoryPath} className="text-primary underline">
                {categoryDetails.name}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

  return (
    <div className={styles.mainContent}>
      {/* Banner section */}
      {content?.banner && (
        <div
          className="w-full h-[600px] bg-cover bg-center text-center text-white relative"
          style={{ backgroundImage: content.banner ? `url(${content.banner})` : 'none' }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <h1 className="text-5xl text-white font-bold">{content.name}</h1>
          </div>
        </div>
      )}
      
      {renderBreadcrumbs()}
      
      <main 
        className={`${styles.contentContainer} ${content?.banner ? styles.withBanner : ''}`}
        style={{
          '--primary-color': siteSettings?.primaryColor || 'black',
          borderColor: siteSettings?.primaryColor || 'black',
          marginTop: '1.5rem' // Add some space between breadcrumb and content
        }}
      >
        {!content?.banner && content?.name && (
          <h1 className={styles.pageTitle}>{content.name}</h1>
        )}
        {renderContent()}
      </main>
    </div>
  );
}