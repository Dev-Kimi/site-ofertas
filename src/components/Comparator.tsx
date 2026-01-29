import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, ArrowRightLeft, Check, X, ExternalLink, ChevronDown } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  specs_tecnicas: Record<string, string>;
  link_afiliado: string;
  imagem_url: string;
  nota: number;
}

export const Comparator: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [product1, setProduct1] = useState<Product | null>(null);
  const [product2, setProduct2] = useState<Product | null>(null);
  const [search1, setSearch1] = useState('');
  const [search2, setSearch2] = useState('');
  const [showDropdown1, setShowDropdown1] = useState(false);
  const [showDropdown2, setShowDropdown2] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('id, title, specs_tecnicas, link_afiliado, imagem_url, nota')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setProducts(data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = (search: string) => {
    return products.filter(p => 
      p.title.toLowerCase().includes(search.toLowerCase())
    );
  };

  // Heurística para determinar qual valor é "melhor"
  const compareValues = (val1: string, val2: string, key: string): 'better1' | 'better2' | 'equal' | null => {
    if (!val1 || !val2) return null;
    if (val1 === val2) return 'equal';

    // Extrair números
    const num1 = parseFloat(val1.replace(/[^0-9.]/g, ''));
    const num2 = parseFloat(val2.replace(/[^0-9.]/g, ''));

    if (isNaN(num1) || isNaN(num2)) return null;

    const lowerIsBetter = ['ms', 's', 'g', 'kg', 'mm', 'cm'].some(unit => key.toLowerCase().includes(unit)) || 
                          ['tempo', 'latencia', 'peso', 'espessura', 'delay'].some(term => key.toLowerCase().includes(term));
    
    // Exceção para bateria (mAh) onde maior é melhor, mas peso (g) menor é melhor
    if (key.toLowerCase().includes('bateria') || key.toLowerCase().includes('mah')) {
        return num1 > num2 ? 'better1' : 'better2';
    }

    if (lowerIsBetter) {
      return num1 < num2 ? 'better1' : 'better2';
    }

    // Default: maior é melhor (Hz, GB, TB, FPS, Nota, etc)
    return num1 > num2 ? 'better1' : 'better2';
  };

  // Obter todas as chaves de specs únicas dos dois produtos selecionados
  const getAllSpecKeys = () => {
    const keys = new Set<string>();
    if (product1?.specs_tecnicas) Object.keys(product1.specs_tecnicas).forEach(k => keys.add(k));
    if (product2?.specs_tecnicas) Object.keys(product2.specs_tecnicas).forEach(k => keys.add(k));
    return Array.from(keys);
  };

  const renderProductSelector = (
    selected: Product | null, 
    setSelected: (p: Product | null) => void, 
    search: string, 
    setSearch: (s: string) => void,
    showDropdown: boolean,
    setShowDropdown: (b: boolean)
  ) => (
    <div className="relative">
      {selected ? (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative group">
          <button 
            onClick={() => setSelected(null)}
            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="aspect-video w-full bg-gray-100 rounded-lg mb-4 overflow-hidden flex items-center justify-center">
            {selected.imagem_url ? (
              <img src={selected.imagem_url} alt={selected.title} className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400">Sem imagem</span>
            )}
          </div>
          <h3 className="font-bold text-gray-900 line-clamp-2 h-12">{selected.title}</h3>
          <div className="mt-2 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
              Nota: {selected.nota}
            </span>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div 
            className="w-full border border-gray-300 rounded-xl p-4 bg-white flex items-center justify-between cursor-pointer hover:border-blue-500 transition"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <span className="text-gray-500">Selecionar produto...</span>
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </div>
          
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto">
              <div className="p-2 sticky top-0 bg-white border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar..."
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </div>
              </div>
              <div className="p-2">
                {filterProducts(search).length > 0 ? (
                  filterProducts(search).map(product => (
                    <button
                      key={product.id}
                      onClick={() => {
                        setSelected(product);
                        setShowDropdown(false);
                        setSearch('');
                      }}
                      className="w-full text-left p-3 hover:bg-blue-50 rounded-lg transition flex items-center gap-3"
                    >
                      <div className="w-10 h-10 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                        {product.imagem_url && <img src={product.imagem_url} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 line-clamp-1">{product.title}</div>
                        <div className="text-xs text-gray-500">Nota: {product.nota}</div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">Nenhum produto encontrado</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Seletores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 relative">
        <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md border border-gray-100">
          <ArrowRightLeft className="w-6 h-6 text-blue-600" />
        </div>
        
        {renderProductSelector(product1, setProduct1, search1, setSearch1, showDropdown1, setShowDropdown1)}
        {renderProductSelector(product2, setProduct2, search2, setSearch2, showDropdown2, setShowDropdown2)}
      </div>

      {/* Tabela Comparativa */}
      {product1 && product2 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200">
            <div className="p-4 font-bold text-gray-500 text-sm uppercase tracking-wider flex items-center">Especificação</div>
            <div className="p-4 font-bold text-gray-900 text-center border-l border-gray-200">{product1.title}</div>
            <div className="p-4 font-bold text-gray-900 text-center border-l border-gray-200">{product2.title}</div>
          </div>

          <div className="divide-y divide-gray-100">
            {/* Linha de Nota */}
            <div className="grid grid-cols-3 hover:bg-gray-50 transition">
              <div className="p-4 text-gray-600 font-medium flex items-center">Avaliação Geral</div>
              <div className={`p-4 text-center border-l border-gray-100 font-bold text-lg ${product1.nota > product2.nota ? 'text-green-600 bg-green-50/50' : 'text-gray-900'}`}>
                {product1.nota}
              </div>
              <div className={`p-4 text-center border-l border-gray-100 font-bold text-lg ${product2.nota > product1.nota ? 'text-green-600 bg-green-50/50' : 'text-gray-900'}`}>
                {product2.nota}
              </div>
            </div>

            {/* Specs Dinâmicas */}
            {getAllSpecKeys().map(key => {
              const val1 = product1.specs_tecnicas?.[key] || '-';
              const val2 = product2.specs_tecnicas?.[key] || '-';
              const comparison = compareValues(val1, val2, key);

              return (
                <div key={key} className="grid grid-cols-3 hover:bg-gray-50 transition">
                  <div className="p-4 text-gray-600 font-medium flex items-center">{key}</div>
                  <div className={`p-4 text-center border-l border-gray-100 ${comparison === 'better1' ? 'text-green-700 font-semibold bg-green-50/50' : 'text-gray-700'}`}>
                    {val1}
                  </div>
                  <div className={`p-4 text-center border-l border-gray-100 ${comparison === 'better2' ? 'text-green-700 font-semibold bg-green-50/50' : 'text-gray-700'}`}>
                    {val2}
                  </div>
                </div>
              );
            })}

            {/* Botões de Ação */}
            <div className="grid grid-cols-3 bg-gray-50 border-t border-gray-200">
              <div className="p-4"></div>
              <div className="p-6 border-l border-gray-200">
                <a 
                  href={product1.link_afiliado}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-md hover:shadow-lg"
                >
                  Ver Melhor Preço <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <div className="p-6 border-l border-gray-200">
                <a 
                  href={product2.link_afiliado}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-md hover:shadow-lg"
                >
                  Ver Melhor Preço <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <ArrowRightLeft className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Selecione dois produtos para comparar</h3>
          <p className="text-gray-500">Escolha os itens acima para ver as diferenças lado a lado.</p>
        </div>
      )}
    </div>
  );
};
