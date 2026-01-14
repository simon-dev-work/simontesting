import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import Loader from '../components/Loader';

const InfoCentreItem = () => {
  const { category, itemId } = useParams();
  const [itemContent, setItemContent] = useState(null);
  const [categoryDetails, setCategoryDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First, fetch the category details
        const categoryResponse = await fetch('https://www.ocumail.com/api/section_categories');
        if (!categoryResponse.ok) {
          throw new Error('Failed to fetch category details');
        }
        const categories = await categoryResponse.json();
        const currentCategory = categories.find(cat => cat.id === parseInt(category));
        
        if (!currentCategory) {
          throw new Error('Category not found');
        }
        
        setCategoryDetails(currentCategory);
        
        // Then fetch the item content
        const itemResponse = await fetch(`https://www.ocumail.com/api/section_items/${itemId}`);
        if (!itemResponse.ok) {
          throw new Error('Failed to fetch item content');
        }
        const itemData = await itemResponse.json();
        const content = Array.isArray(itemData) 
          ? itemData.find(item => item.id === parseInt(itemId))
          : itemData;
          
        if (content) {
          setItemContent(content);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    if (category && itemId) {
      fetchData();
    }
  }, [category, itemId]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-red-600">{error}</p>
      </div>
    );
  }

  if (!itemContent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Content Not Found</p>
      </div>
    );
  }

  const sortedAttributes = itemContent.attributes.sort((a, b) => {
    const aSection = parseInt(a.name.split('.')[1]) || 0;
    const bSection = parseInt(b.name.split('.')[1]) || 0;
    return aSection - bSection;
  });

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Banner Section */}
      {itemContent.banner && (
        <div 
          style={{
            width: '100%',
            height: '400px',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            textAlign: 'center',
            color: 'white',
            position: 'relative',
            backgroundImage: `url(${itemContent.banner})`
          }}
        >
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 'bold' }}>{itemContent.title}</h1>
          </div>
        </div>
      )}

      {/* Content Section */}
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '3rem 1rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          padding: '2rem',
          margin: '0 auto',
          borderTop: '2px solid #3b82f6',
          maxWidth: '64rem'
        }}>
          {/* Breadcrumb nav */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ fontSize: '0.875rem' }}>
              <Link href="/pages/info_centre" style={{ color: '#3b82f6', textDecoration: 'underline' }}>
                Info Centre
              </Link>
              <span style={{ color: '#3b82f6', margin: '0 0.5rem' }}>{'|'}</span>
              <Link 
                href={`/info_centre/${category}`} 
                style={{ color: '#3b82f6', textDecoration: 'underline' }}
              >
                {categoryDetails?.name || 
                  (typeof category === 'string' ? 
                    category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                    : String(category)
                  )}
              </Link>
              <span style={{ color: '#3b82f6', margin: '0 0.5rem' }}>{'|'}</span>
              <span style={{ color: '#4b5563' }}>{itemContent.title || 'Content'}</span>
            </div>
          </div>

          {/* Content Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {sortedAttributes.map(attr => {
              const sectionNumber = parseInt(attr.name.split('.')[1]) || 0;
              if (sectionNumber > 0) {
                return (
                  <div key={attr.id}>
                    {attr.name.endsWith('.Title') && (
                      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#000', marginBottom: '1rem' }}>
                        {attr.data}
                      </h2>
                    )}
                    {attr.name.endsWith('.Body') && (
                      <div style={{ color: '#374151' }} dangerouslySetInnerHTML={{ __html: attr.data }} />
                    )}
                    {attr.name.endsWith('.Image') && (
                      <div style={{
                        position: 'relative',
                        height: '300px',
                        marginBottom: '2rem',
                        borderRadius: '0.5rem',
                        overflow: 'hidden'
                      }}>
                        <Image
                          src={attr.data}
                          alt="Section Image"
                          fill
                          style={{ objectFit: 'cover' }}
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            })}

            {/* References */}
            {sortedAttributes.find(attr => attr.name === 'Reference.1.Title') && (
              <div style={{ marginTop: '2rem', borderTop: '1px solid #e5e7eb', paddingTop: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>References</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {sortedAttributes
                    .filter(attr => attr.name.startsWith('Reference.') && attr.name.endsWith('.Title'))
                    .map((titleAttr, index) => {
                      const refNum = titleAttr.name.match(/Reference\.(\d+)/)[1];
                      const urlAttr = sortedAttributes.find(
                        attr => attr.name === `Reference.${refNum}.Url`
                      );
                      return (
                        <div key={titleAttr.id} style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ color: '#4b5563' }}>{index + 1}. </span>
                          <a
                            href={urlAttr?.data}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#2563eb', marginLeft: '0.5rem' }}
                          >
                            {titleAttr.data}
                          </a>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default InfoCentreItem;
