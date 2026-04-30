# Flujo Completo de Subida, Guardado y Recuperación de Imágenes

## Contexto
- **Frontend**: React + TypeScript + Vite, usa `fetch` (apiFetch) para peticiones HTTP
- **Backend**: Java Spring Boot, imágenes guardadas en disco en `uploads/operations/{id}/anexo4/`
- **Formulario**: Anexo 4 con dos campos de imagen: "imagenEspacioAereo" e "imagenZonaVuelo"
- **Las imágenes se envían** como MultipartFile en un FormData junto con otros campos

## Componentes Implementados

### 1. Hook `useImageUpload.ts` 
📁 Ubicación: `frontend/src/components/commons/hooks/useImageUpload.ts`

**Responsabilidades:**
- Maneja estado: `file`, `previewUrl`, `savedFilename`, `error`
- `onFileSelect`: Valida archivo y crea blob URL para preview
- `onClear`: Revoca blob URL y limpia estado
- **CRÍTICO**: Sincroniza `savedFilename` automáticamente via useEffect cuando cambia la prop inicial

**Estados del Hook:**
```typescript
{
  file: File | null,           // Archivo seleccionado localmente
  previewUrl: string | null,   // URL blob para mostrar preview
  savedFilename: string | null, // Nombre del archivo guardado en servidor
  error: string | null         // Mensaje de error de validación
}
```

### 2. Componente `ImageUploadField.tsx`
📁 Ubicación: `frontend/src/components/commons/ImageUpload.tsx`

**Props:**
- `label`: Texto del label
- `fieldName`: Nombre del campo (ej: "imagenEspacioAereoFile")
- `apiBaseUrl`: URL base del backend
- `imageEndpointPath`: Path del endpoint para obtener imágenes guardadas (ej: "/api/operations/anexo4/images/")
- `savedFilename`: Nombre del archivo guardado en servidor (vinculado a formValues)
- `maxHeight`: Altura máxima de preview (default: 220px)
- `maxWidth`: Ancho máximo (opcional)
- `disabled`, `saving`: Estados visuales
- `externalError`: Error externo del formulario
- `onChange`: Callback cuando cambia la selección

**Estados Visuales:**
- 🔴 Sin imagen: Mensaje "No hay imagen seleccionada"
- 🟢 Archivo nuevo: Preview local + badge "Nuevo archivo" + botón "Quitar"
- 💾 Imagen guardada: Muestra imagen del servidor + botón "Eliminar"

**Validación:**
- Solo JPG/PNG
- Máximo 5 MB (configurable)

## Integración en `FormOperationAnexo4Detail.tsx`

### 3.1 Reemplazo de inputs manuales
Se reemplazaron los inputs `<input type="file">` manuales con componentes `<ImageUploadField>`:

```tsx
<ImageUploadField
  label="Imagen del espacio aéreo"
  fieldName="imagenEspacioAereoFile"
  apiBaseUrl={API_BASE_URL}
  imageEndpointPath="/api/operations/anexo4/images/"
  savedFilename={formValues.imagenEspacioAereo}
  maxHeight={220}
  disabled={disabled || saving}
  helpText="Adjunte el mapa del espacio aéreo (JPG o PNG, máx. 5 MB)"
  externalError={errors.imagenEspacioAereoFile}
  onChange={(file, fieldName) => handleChange(fieldName, file)}
/>
```

### 3.2 Mejorado `handleChange`
Simplificado para usar el hook del componente:

```tsx
const handleChange = (key: string, value: any) => {
  // Si es un File (desde ImageUploadField), almacenarlo directamente
  if (value instanceof File) {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  }
  // Si es null (limpiar imagen)
  else if (value == null) {
    setFormValues((prev) => ({ ...prev, [key]: null }));
  }
  // Si es string o valores normales
  else {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  }
};
```

### 3.3 Mejorado `handleSubmit`
Después de guardar, se actualiza formValues con los filenames devueltos del servidor:

```tsx
const savedData = await saveAnexo4Data(operationId, formData);

// ✅ CRÍTICO: Actualizar formValues con filenames guardados
setFormValues((prev) => ({
  ...prev,
  imagenEspacioAereo: savedData?.imagenEspacioAereo ?? prev.imagenEspacioAereo,
  imagenZonaVuelo: savedData?.imagenZonaVuelo ?? prev.imagenZonaVuelo,
  // Limpiar los Files después de guardar
  imagenEspacioAereoFile: null,
  imagenZonaVueloFile: null,
}));

// Limpiar previewUrls locales (ya están guardadas en el servidor)
setPreviewUrls((prev) => {
  Object.values(prev).forEach((url) => {
    if (url) URL.revokeObjectURL(url);
  });
  return {};
});
```

## Flujo Completo paso a paso

### Escenario 1: Cargar operación existente (con imágenes ya guardadas)

```
1. Backend devuelve: { ..., imagenEspacioAereo: "img_123.jpg", imagenZonaVuelo: "img_456.jpg" }
   ↓
2. initialValues recibe estos valores
   ↓
3. setFormValues({ ...initialValues }) → formValues.imagenEspacioAereo = "img_123.jpg"
   ↓
4. ImageUploadField recibe prop: savedFilename={formValues.imagenEspacioAereo}
   ↓
5. 🔴 CRÍTICO: useEffect en hook sincroniza → state.savedFilename = "img_123.jpg"
   ↓
6. Componente construye URL: ${apiBaseUrl}/api/operations/anexo4/images/img_123.jpg
   ↓
7. ✅ Muestra imagen guardada en servidor
```

### Escenario 2: Usuario selecciona nueva imagen

```
1. Usuario selecciona archivo → <input onChange>
   ↓
2. ImageUploadField.handleFileChange → handlers.onFileSelect(file)
   ↓
3. Hook valida y crea blob URL
   ↓
4. onChange callback → handleChange("imagenEspacioAereoFile", file)
   ↓
5. setFormValues({ imagenEspacioAereoFile: file, ... })
   ↓
6. ✅ Muestra preview local con badge "Nuevo archivo"
```

### Escenario 3: Guardar formulario con nueva imagen

```
1. handleSubmit → valida campos
   ↓
2. Crea FormData e itera formValues:
   - if (value instanceof File) → formData.append("imagenEspacioAereoFile", file)
   ↓
3. Backend recibe MultipartFile y guarda en: uploads/operations/1/anexo4/img_789.jpg
   ↓
4. Backend devuelve: { imagenEspacioAereo: "img_789.jpg", ... }
   ↓
5. Frontend: setFormValues({ 
     imagenEspacioAereo: "img_789.jpg",      // ← Nuevo filename
     imagenEspacioAereoFile: null,           // ← Limpiar file
   })
   ↓
6. ImageUploadField recibe nueva prop: savedFilename="img_789.jpg"
   ↓
7. useEffect sincroniza → state.savedFilename = "img_789.jpg"
   ↓
8. Componente revoca blob URL (preview local) y muestra imagen guardada
   ↓
9. ✅ Imagen guardada se muestra correctamente
```

### Escenario 4: Recargar la misma operación (después de guardar)

```
1. Usuario navega fuera y vuelve a entrar al formulario
   ↓
2. Backend devuelve initialValues con: imagenEspacioAereo: "img_789.jpg"
   ↓
3. setFormValues con initialValues
   ↓
4. ImageUploadField recibe prop: savedFilename="img_789.jpg"
   ↓
5. useEffect sincroniza → state.savedFilename = "img_789.jpg"
   ↓
6. ✅ Imagen guardada se muestra correctamente (problema resuelto)
```

## Flujo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                    FormOperationAnexo4Detail                 │
│                                                              │
│  formValues = {                                              │
│    imagenEspacioAereo: string | null,      // ← Filename      │
│    imagenEspacioAereoFile: File | null,    // ← File          │
│    imagenZonaVuelo: string | null,         // ← Filename      │
│    imagenZonaVueloFile: File | null,       // ← File          │
│    ... otros campos                                          │
│  }                                                            │
│                                                              │
│  onChange={(file, fieldName) => handleChange(fieldName, file)}
└───────────┬────────────────────────────────────────────────┘
            │
            ↓
┌─────────────────────────────────────────────────────────────┐
│          ImageUploadField (campo imagenEspacioAereo)         │
│                                                              │
│  Props:                                                       │
│  - savedFilename: formValues.imagenEspacioAereo              │
│  - onChange: handleChange("imagenEspacioAereoFile", file)   │
│                                                              │
│  useImageUpload hook:                                         │
│  - Sincroniza savedFilename via useEffect                   │
│  - Maneja File, preview URL, validación                     │
└───────────┬────────────────────────────────────────────────┘
            │
            ↓
┌─────────────────────────────────────────────────────────────┐
│              Backend (Java Spring Boot)                      │
│                                                              │
│  POST /api/operations/{id}/anexo4                           │
│  FormData: { imagenEspacioAereoFile: File, ... }           │
│                                                              │
│  Response: {                                                 │
│    imagenEspacioAereo: "img_789.jpg",                       │
│    imagenZonaVuelo: "img_790.jpg",                          │
│    ... otros campos                                         │
│  }                                                            │
│                                                              │
│  Almacena en: uploads/operations/{id}/anexo4/img_789.jpg   │
└─────────────────────────────────────────────────────────────┘
```

## Puntos Clave

### ✅ Lo que funciona:

1. **Sincronización automática**: useEffect en el hook sincroniza savedFilename cuando llega de initialValues
2. **Validación integrada**: Verificación de tipo y tamaño en el hook
3. **Revocación de URLs**: Se liberan correctamente los blob URLs para evitar memory leaks
4. **Estados visuales claros**: Preview local vs. imagen guardada
5. **FormData correcto**: Files se envían como MultipartFile, filenames como strings

### ⚠️ Consideraciones importantes:

1. **Nombres de campos**:
   - Upload: `imagenEspacioAereoFile` (contiene File)
   - Guardado: `imagenEspacioAereo` (contiene filename del servidor)

2. **Después de guardar**:
   - Backend devuelve el filename guardado
   - Frontend actualiza formValues.imagenEspacioAereo
   - Frontend limpia formValues.imagenEspacioAereoFile (set to null)

3. **useEffect en hook es crítico**: Sin él, las imágenes guardadas no se muestran al cargar un formulario existente

4. **Revocación de URLs**: Se hace en:
   - `useImageUpload.onFileSelect` (cuando se selecciona nuevo archivo)
   - `useImageUpload.onClear` (cuando se limpia la selección)
   - `useImageUpload` useEffect (cuando cambia savedFilename)
   - `handleSubmit` (después de guardar, limpia previewUrls globales)

## Testing Checklist

- [ ] Abrir formulario nuevo → No hay imagen (correcto)
- [ ] Seleccionar imagen → Preview local se muestra con badge "Nuevo archivo" (correcto)
- [ ] Guardar formulario → Backend guarda, devuelve filename
- [ ] Verificar imagen guardada se muestra (sin preview local) (correcto)
- [ ] Navegar fuera y volver → Imagen guardada sigue visible (✅ RESUELTO)
- [ ] Cambiar imagen → Preview local aparece, badge muestra "Nuevo archivo"
- [ ] Guardar nuevamente → Imagen anterior se reemplaza, nueva se muestra
- [ ] Eliminar imagen → Se limpia completamente, muestra "No hay imagen seleccionada"
- [ ] Validación: Seleccionar PNG > 5MB → Error se muestra correctamente
