'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  ArrowLeft,
  User,
  LogOut,
  Settings,
  Upload,
  Save,
  DollarSign,
  X,
  AlertCircle,
  Banknote
} from 'lucide-react';

export default function AddItemPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formularz dodawania przedmiotu
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    category: 'elektronika',
    quantity: 0,
    unit: 'szt',
    purchasePrice: '',
    salePrice: '',
    image: null,
    imagePreview: null
  });

  const [formErrors, setFormErrors] = useState({});

  // Sprawdź czy użytkownik jest zalogowany
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    // Sprawdź uprawnienia
    if (parsedUser.accessLevel < 2) {
      router.push('/home');
      return;
    }
  }, []);

  // Walidacja formularza
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = 'Nazwa jest wymagana';
    if (!formData.code.trim()) errors.code = 'Kod jest wymagany';
    if (formData.quantity < 0) errors.quantity = 'Ilość nie może być ujemna';
    if (formData.purchasePrice && isNaN(parseFloat(formData.purchasePrice))) {
      errors.purchasePrice = 'Nieprawidłowa cena zakupu';
    }
    if (formData.salePrice && isNaN(parseFloat(formData.salePrice))) {
      errors.salePrice = 'Nieprawidłowa cena sprzedaży';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Obsługa przesyłania zdjęcia
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setFormErrors({...formErrors, image: 'Plik jest za duży (max 5MB)'});
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setFormErrors({...formErrors, image: 'Można przesłać tylko pliki graficzne'});
        return;
      }

      setFormData({
        ...formData,
        image: file,
        imagePreview: URL.createObjectURL(file)
      });
      
      // Usuń błąd po poprawnym wyborze pliku
      const newErrors = {...formErrors};
      delete newErrors.image;
      setFormErrors(newErrors);
    }
  };

  // Usuwanie zdjęcia
  const removeImage = () => {
    if (formData.imagePreview) {
      URL.revokeObjectURL(formData.imagePreview);
    }
    setFormData({
      ...formData,
      image: null,
      imagePreview: null
    });
  };

  // Resetowanie formularza
  const resetForm = () => {
    if (formData.imagePreview) {
      URL.revokeObjectURL(formData.imagePreview);
    }
    setFormData({
      name: '',
      code: '',
      description: '',
      category: 'elektronika',
      quantity: 0,
      unit: 'szt',
      purchasePrice: '',
      salePrice: '',
      image: null,
      imagePreview: null
    });
    setFormErrors({});
  };

  // Dodawanie przedmiotu
  const handleAddItem = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      
      // Dodaj wszystkie pola
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('code', formData.code.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('category', formData.category);
      formDataToSend.append('quantity', formData.quantity);
      formDataToSend.append('unit', formData.unit);
      
      // Dodaj opcjonalne pola tylko jeśli mają wartość
      if (formData.purchasePrice) {
        formDataToSend.append('purchasePrice', parseFloat(formData.purchasePrice));
      }
      if (formData.salePrice) {
        formDataToSend.append('salePrice', parseFloat(formData.salePrice));
      }
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const response = await fetch('/api/warehouse/items', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        // Przekieruj z powrotem do strony głównej
        router.push('/home?success=item-added');
      } else {
        setFormErrors({ submit: data.error || 'Wystąpił błąd podczas dodawania przedmiotu' });
      }
    } catch (error) {
      console.error('Error adding item:', error);
      setFormErrors({ submit: 'Wystąpił błąd podczas dodawania przedmiotu' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  const isAdmin = user?.accessLevel >= 3;
  const categories = ['elektronika', 'narzędzia', 'materiały', 'części', 'inne'];
  const units = ['szt', 'kg', 'l', 'm', 'm²', 'm³', 'op', 'par'];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/home')}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Package className="h-8 w-8 text-indigo-600" />
              <h1 className="text-xl font-bold text-gray-900">Dodaj nowy przedmiot</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{user?.name}</span>
                <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                  {user?.role} (LVL {user?.accessLevel})
                </span>
              </div>
              
              {isAdmin && (
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <Settings className="h-5 w-5" />
                </button>
              )}
              
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <form onSubmit={handleAddItem} className="space-y-6">
            {/* Błąd ogólny */}
            {formErrors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-red-700">{formErrors.submit}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Lewa kolumna */}
              <div className="space-y-6">
                {/* Nazwa przedmiotu */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nazwa przedmiotu *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 ${
                      formErrors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Nazwa przedmiotu"
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                  )}
                </div>

                {/* Kategoria */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategoria
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2z focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ilość i jednostka */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-gray-700">
                      Ilość
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700  ${
                        formErrors.quantity ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.quantity && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.quantity}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jednostka
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({...formData, unit: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
                    >
                      {units.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Ceny */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cena zakupu (PLN)
                    </label>
                    <div className="relative">
                      <Banknote className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-700 h-4 w-4" />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.purchasePrice}
                        onChange={(e) => setFormData({...formData, purchasePrice: e.target.value})}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 ${
                          formErrors.purchasePrice ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="0.00"
                      />
                    </div>
                    {formErrors.purchasePrice && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.purchasePrice}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cena sprzedaży (PLN)
                    </label>
                    <div className="relative">
                      <Banknote className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-700 h-4 w-4 " />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.salePrice}
                        onChange={(e) => setFormData({...formData, salePrice: e.target.value})}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 ${
                          formErrors.salePrice ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="0.00"
                      />
                    </div>
                    {formErrors.salePrice && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.salePrice}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Prawa kolumna */}
              <div className="space-y-6">
                {/* Opis */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-gray-700 ">
                    Opis
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
                    placeholder="Opis"
                  />
                </div>

                {/* Zdjęcie */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zdjęcie przedmiotu
                  </label>
                  
                  {!formData.imagePreview ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer"
                      >
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                          Kliknij aby dodać zdjęcie
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF do 5MB
                        </p>
                      </label>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={formData.imagePreview}
                        alt="Podgląd"
                        className="w-full h-48 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  
                  {formErrors.image && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.image}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Przyciski */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push('/home')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Anuluj
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Wyczyść
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Dodawanie...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Dodaj przedmiot
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}