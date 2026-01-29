import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Save, Image as ImageIcon, Loader2, Upload, Link as LinkIcon } from 'lucide-react';

interface Spec {
  key: string;
  value: string;
}

export const ReviewForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url');
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    rating: '',
    affiliateLink: '',
    imageUrl: '',
    summary: '',
    price: '',
    category: 'Outros',
  });
  const [specs, setSpecs] = useState<Spec[]>([{ key: '', value: '' }]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSpecChange = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = value;
    setSpecs(newSpecs);
  };

  const addSpec = () => {
    setSpecs([...specs, { key: '', value: '' }]);
  };

  const removeSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    setUploading(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('reviews')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('reviews').getPublicUrl(filePath);
      
      setFormData(prev => ({ ...prev, imageUrl: data.publicUrl }));
    } catch (error: any) {
      alert('Erro ao fazer upload da imagem: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      // Convert specs array to object
      const specsObject = specs.reduce((acc, spec) => {
        if (spec.key && spec.value) {
          acc[spec.key] = spec.value;
        }
        return acc;
      }, {} as Record<string, string>);

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase.from('reviews').insert({
        title: formData.title,
        content: formData.content,
        rating: parseFloat(formData.rating),
        affiliate_link: formData.affiliateLink,
        image_url: formData.imageUrl,
        specs: specsObject,
        author_id: user.id,
        summary: formData.summary,
        price: formData.price,
        category: formData.category,
      });

      if (error) throw error;

      setSuccess(true);
      setFormData({
        title: '',
        content: '',
        rating: '',
        affiliateLink: '',
        imageUrl: '',
        summary: '',
        price: '',
        category: 'Outros',
      });
      setSpecs([{ key: '', value: '' }]);
      window.scrollTo(0, 0);
    } catch (error: any) {
      alert('Erro ao salvar review: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8 border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Novo Review de Hardware</h2>
        <p className="text-gray-500">Preencha os dados abaixo para publicar uma nova análise.</p>
      </div>

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <Save className="w-5 h-5" />
          Review publicado com sucesso!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Título do Produto</label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Ex: Teclado Mecânico Logitech G Pro"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Resumo (para o card)</label>
          <input
            type="text"
            name="summary"
            required
            value={formData.summary}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Um breve resumo do produto..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Preço</label>
          <input
            type="text"
            name="price"
            required
            value={formData.price}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Ex: R$ 499,00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="Teclado">Teclado</option>
            <option value="Monitor">Monitor</option>
            <option value="GPU">GPU</option>
            <option value="Outros">Outros</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nota (0-10)</label>
          <input
            type="number"
            name="rating"
            required
            min="0"
            max="10"
            step="0.1"
            value={formData.rating}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Ex: 9.5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Link de Afiliado</label>
          <input
            type="url"
            name="affiliateLink"
            required
            value={formData.affiliateLink}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="https://..."
          />
        </div>

        <div className="col-span-2">
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">Imagem de Capa</label>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setUploadMode('url')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                  uploadMode === 'url' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-1">
                  <LinkIcon className="w-3 h-3" /> URL
                </div>
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('file')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                  uploadMode === 'file' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-1">
                  <Upload className="w-3 h-3" /> Upload
                </div>
              </button>
            </div>
          </div>
          
          <div className="flex gap-4 items-start">
            <div className="flex-grow">
              {uploadMode === 'url' ? (
                <input
                  type="url"
                  name="imageUrl"
                  required={!formData.imageUrl}
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="https://..."
                />
              ) : (
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {uploading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    </div>
                  )}
                </div>
              )}
              {uploadMode === 'file' && (
                <p className="text-xs text-gray-500 mt-1">
                  *Requer bucket 'reviews' configurado no Supabase.
                </p>
              )}
            </div>

            <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-300 overflow-hidden">
              {formData.imageUrl ? (
                <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-400" />
              )}
            </div>
          </div>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo do Review (Markdown)</label>
          <textarea
            name="content"
            required
            rows={10}
            value={formData.content}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
            placeholder="Escreva sua análise aqui..."
          />
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Especificações Técnicas</h3>
          <button
            type="button"
            onClick={addSpec}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Adicionar Campo
          </button>
        </div>
        
        <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
          {specs.map((spec, index) => (
            <div key={index} className="flex gap-3">
              <input
                type="text"
                placeholder="Nome (ex: DPI)"
                value={spec.key}
                onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
              <input
                type="text"
                placeholder="Valor (ex: 25.000)"
                value={spec.value}
                onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
              <button
                type="button"
                onClick={() => removeSpec(index)}
                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition"
                title="Remover"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-100">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Publicar Review
            </>
          )}
        </button>
      </div>
    </form>
  );
};
