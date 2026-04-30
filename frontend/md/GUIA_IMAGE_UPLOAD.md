# Guía: Cómo usar ImageUploadField en otros formularios

## Resumen Rápido

El componente `ImageUploadField` se puede reutilizar en cualquier formulario que necesite subir imágenes (Anexo 5, 6, 7, etc.).

## Instalación (simplemente copiar el import)

```typescript
import ImageUploadField from "../commons/ImageUpload";
```

## Ejemplo Básico

### En tu componente de formulario:

```typescript
import { useState } from "react";
import ImageUploadField from "../commons/ImageUpload";

export default function MiFormulario() {
  const [formValues, setFormValues] = useState({
    miImagen: null,      // Contendrá el File seleccionado
    miImagenGuardada: "", // Contendrá el filename del servidor
  });

  const API_BASE_URL = "http://localhost:8080";

  const handleChange = (key: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    
    // Agregar el archivo si existe
    if (formValues.miImagen instanceof File) {
      formData.append("miImagen", formValues.miImagen);
    }
    
    // Agregar otros campos...
    formData.append("nombreCampo", "valor");
    
    // Enviar al backend
    const response = await fetch(`${API_BASE_URL}/api/mi-endpoint`, {
      method: "POST",
      body: formData,
    });
    
    const savedData = await response.json();
    
    // ✅ IMPORTANTE: Actualizar con el filename devuelto del servidor
    setFormValues((prev) => ({
      ...prev,
      miImagenGuardada: savedData.miImagenGuardada,
      miImagen: null, // Limpiar el file
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <ImageUploadField
        label="Mi Imagen"
        fieldName="miImagen"
        apiBaseUrl={API_BASE_URL}
        imageEndpointPath="/api/mi-endpoint/images/"
        savedFilename={formValues.miImagenGuardada}
        maxHeight={220}
        helpText="Selecciona una imagen JPG o PNG (máx. 5 MB)"
        onChange={(file, fieldName) => handleChange(fieldName, file)}
      />
      
      <button type="submit">Guardar</button>
    </form>
  );
}
```

## Props Disponibles

### Requeridas
- `label` (string): Texto que aparece como título del campo
- `fieldName` (string): Nombre único para este campo (ej: "miImagen", "imagenPerfil")
- `apiBaseUrl` (string): URL base del backend (ej: "http://localhost:8080")
- `imageEndpointPath` (string): Path del endpoint para obtener imágenes (ej: "/api/usuarios/images/")

### Opcionales
- `helpText` (string): Texto de ayuda debajo del input
- `maxSizeMB` (number): Tamaño máximo en MB, default 5
- `acceptedTypes` (string[]): Tipos MIME permitidos, default ["image/jpeg", "image/jpg", "image/png"]
- `maxHeight` (number): Alto máximo de preview en px, default 220
- `maxWidth` (number): Ancho máximo de preview en px
- `disabled` (boolean): Deshabilitar input, default false
- `saving` (boolean): Mostrar estado de carga, default false
- `savedFilename` (string | null): Nombre del archivo guardado en servidor
- `externalError` (string | null): Mensaje de error externo
- `onChange` ((file, fieldName) => void): Callback cuando cambia la selección

## Caso de Uso: Anexo 5 (Ejemplo)

Si quieres agregar una imagen a Anexo 5:

```typescript
// En FormOperationAnexo5Detail.tsx

const [formValues, setFormValues] = useState({
  // ... otros campos
  fotoCertificado: "",       // Filename guardado
  fotoCertificadoFile: null, // File seleccionado
});

// En el JSX:
<ImageUploadField
  label="Foto del certificado"
  fieldName="fotoCertificadoFile"
  apiBaseUrl={API_BASE_URL}
  imageEndpointPath="/api/operations/anexo5/images/"
  savedFilename={formValues.fotoCertificado}
  maxHeight={150}
  helpText="Adjunte una foto del certificado de capacitación"
  externalError={errors.fotoCertificadoFile}
  onChange={(file, fieldName) => handleChange(fieldName, file)}
/>

// En handleSubmit:
if (formValues.fotoCertificadoFile instanceof File) {
  formData.append("fotoCertificadoFile", formValues.fotoCertificadoFile);
}

// Después de guardar:
setFormValues((prev) => ({
  ...prev,
  fotoCertificado: savedData?.fotoCertificado ?? prev.fotoCertificado,
  fotoCertificadoFile: null,
}));
```

## Usar el Hook directamente (Avanzado)

Si quieres usar solo el hook sin el componente visual:

```typescript
import { useImageUpload } from "../commons/hooks/useImageUpload";

const [state, handlers] = useImageUpload(
  {
    fieldName: "miImagen",
    maxSizeMB: 10,
  },
  initialSavedFilename
);

// state contiene:
// - file: File | null
// - previewUrl: string | null (blob URL)
// - savedFilename: string | null (nombre del archivo en servidor)
// - error: string | null

// handlers contiene:
// - onFileSelect(file)
// - onClear()
// - getFileForUpload() -> File | null
// - hasChanges: boolean
```

## Validación

El componente valida automáticamente:

```
✅ JPG y PNG permitidos
✅ Máximo 5 MB (configurable)
✅ Mensajes de error claros

Ejemplos de errores:
- "La imagen no puede superar los 5 MB"
- "Solo se permiten imágenes JPG o PNG"
```

## Endpoint Backend Esperado

Para que funcione correctamente, tu backend debe:

### 1. Aceptar el upload
```java
@PostMapping("/api/mi-endpoint")
public ResponseEntity<?> guardar(
  @RequestParam("miImagen") MultipartFile imagen,
  @RequestParam String otroCampo
) {
  // Guardar imagen en: uploads/mi-endpoint/{id}/imagen.jpg
  String filename = "imagen_" + System.currentTimeMillis() + ".jpg";
  Path path = Paths.get("uploads/mi-endpoint", filename);
  Files.write(path, imagen.getBytes());
  
  return ResponseEntity.ok(new {
    success: true,
    miImagenGuardada: filename, // Devolver el filename
  });
}
```

### 2. Servir las imágenes
```java
@GetMapping("/api/mi-endpoint/images/{filename}")
public ResponseEntity<Resource> getImage(@PathVariable String filename) {
  Path path = Paths.get("uploads/mi-endpoint", filename);
  Resource resource = new UrlResource(path.toUri());
  return ResponseEntity.ok()
    .contentType(MediaType.IMAGE_JPEG)
    .body(resource);
}
```

## Notas Importantes

1. **Sincronización Automática**: El hook sincroniza automáticamente `savedFilename` cuando cambia la prop. No necesitas hacer nada especial.

2. **Memory Leaks Prevenidos**: Las blob URLs se revocan automáticamente. No necesitas llamar a `URL.revokeObjectURL()`.

3. **Nombres de Campos**:
   - Enviar como: `fieldName` (ej: "miImagenFile")
   - Recibir como: Nombre diferente sin "File" (ej: "miImagen")
   - Esto es importante para que el backend pueda distinguir entre file y filename

4. **Después de Guardar**:
   - Siempre actualiza `savedFilename` con el valor devuelto del servidor
   - Siempre limpia el `File` para siguiente uso
   - Esto permite recargar el formulario sin problemas

5. **Reutilización**: Puedes usar el mismo componente múltiples veces en el mismo formulario con diferentes `fieldName`.

## Ejemplo Completo: Múltiples Imágenes

```typescript
const [formValues, setFormValues] = useState({
  imagen1: "",
  imagen1File: null,
  imagen2: "",
  imagen2File: null,
  imagen3: "",
  imagen3File: null,
});

// En el JSX:
<ImageUploadField
  label="Primera imagen"
  fieldName="imagen1File"
  apiBaseUrl={API_BASE_URL}
  imageEndpointPath="/api/mi-endpoint/images/"
  savedFilename={formValues.imagen1}
  onChange={(file, fieldName) => handleChange(fieldName, file)}
/>

<ImageUploadField
  label="Segunda imagen"
  fieldName="imagen2File"
  apiBaseUrl={API_BASE_URL}
  imageEndpointPath="/api/mi-endpoint/images/"
  savedFilename={formValues.imagen2}
  onChange={(file, fieldName) => handleChange(fieldName, file)}
/>

<ImageUploadField
  label="Tercera imagen"
  fieldName="imagen3File"
  apiBaseUrl={API_BASE_URL}
  imageEndpointPath="/api/mi-endpoint/images/"
  savedFilename={formValues.imagen3}
  onChange={(file, fieldName) => handleChange(fieldName, file)}
/>

// Cada uno funciona independientemente con su propio estado
```

## Troubleshooting

### "No veo la imagen guardada al recargar"
- ✅ Asegúrate que `savedFilename` está siendo pasado correctamente
- ✅ Verifica que el backend devuelve el filename en la respuesta
- ✅ Revisa que el endpoint `/api/mi-endpoint/images/{filename}` sirve las imágenes correctamente

### "La imagen aparece pero no se guarda"
- ✅ Verifica que estás agregando el File al FormData: `formData.append("imagenFile", file)`
- ✅ Revisa que el backend recibe el MultipartFile correctamente
- ✅ Verifica el nombre del parámetro en el backend

### "Errores de memory leak en la consola"
- ✅ Normalmente el hook maneja la revocación automáticamente
- ✅ Si persiste, verifica que limpias el File después de guardar
- ✅ Asegúrate que el componente se desmonta correctamente

## Más Información

- Ver [IMAGEN_UPLOAD_FLOW.md](./IMAGEN_UPLOAD_FLOW.md) para el flujo técnico completo
- Ver [RESUMEN_IMPLEMENTACION.md](./RESUMEN_IMPLEMENTACION.md) para el resumen de cambios
