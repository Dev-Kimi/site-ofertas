import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Save, Image as ImageIcon, Loader2 } from 'lucide-react';

interface Spec {
  key: string;
  value: string;
}

export const ReviewForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    rating: '',
    affiliateLink: '',
    imageUrl: '',
  });
  const [specs, setSpecs] = useState<Spec[]>([{ key: '', value: '' }]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        nota: parseFloat(formData.rating),
        link_afiliado: formData.affiliateLink,
        imagem_url: formData.imageUrl,
        specs_tecnicas: specsObject,
        author_id: user.id,
      });

      if (error) throw error;

      setSuccess(true);
      setFormData({
        title: '',
        content: '',
        rating: '',
        affiliateLink: '',
        imageUrl: '',
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
          <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem de Capa</label>
          <div className="flex gap-2">
            <input
              type="url"
              name="imageUrl"
              required
              value={formData.imageUrl}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="https://..."
            />
            <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-300">
              {formData.imageUrl ? (
                <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <ImageIcon className="w-5 h-5 text-gray-400" />
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
