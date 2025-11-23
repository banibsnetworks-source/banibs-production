import React, { useState, useEffect } from 'react';
import { Store, Loader2 } from 'lucide-react';
import FashionLayout from '../../components/fashion/FashionLayout';
import FashionBrandCard from '../../components/fashion/FashionBrandCard';
import { xhrRequest } from '../../utils/xhrRequest';

const FashionBrandDirectory = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  
  const brandTypes = [
    { value: '', label: 'All Types' },
    { value: 'sneaker', label: 'Sneakers' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'designer', label: 'Designer' },
    { value: 'boutique', label: 'Boutique' },
    { value: 'customizer', label: 'Customizer' }
  ];
  
  useEffect(() => {
    loadBrands();
  }, [filterType]);
  
  const loadBrands = async () => {
    setLoading(true);
    try {
      let url = `${process.env.REACT_APP_BACKEND_URL}/api/fashion/brands?`;
      if (filterType) url += `type=${filterType}`;
      const response = await xhrRequest(url);
      if (response.ok) setBrands(response.data.brands);
    } catch (err) {
      console.error('Error loading brands:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <FashionLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Black-Owned Fashion Directory</h1>
        <p className="text-muted-foreground">Discover and support Black-owned sneaker and fashion brands</p>
      </div>
      <div className="mb-6">
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-2 rounded-lg border border-border bg-card text-foreground">
          {brandTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
        </select>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={48} className="animate-spin text-blue-500" /></div>
      ) : brands.length === 0 ? (
        <div className="text-center py-20"><Store size={48} className="text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">No brands found.</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {brands.map((brand) => <FashionBrandCard key={brand.id} brand={brand} />)}
        </div>
      )}
    </FashionLayout>
  );
};

export default FashionBrandDirectory;