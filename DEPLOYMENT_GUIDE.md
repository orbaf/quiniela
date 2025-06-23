# Guía de Despliegue a Producción con Google Cloud Run y GitHub Actions

Esta guía detalla los pasos necesarios para configurar un pipeline de Integración y Despliegue Continuo (CI/CD) para la aplicación. El objetivo es automatizar el despliegue a producción cada vez que se realiza un merge a la rama `main`.

## Checklist de Implementación

### Fase 1: Configuración del Proyecto en Google Cloud

- [ ] **1. Crear un Proyecto en Google Cloud:**

  - Ve a la [Consola de Google Cloud](https://console.cloud.google.com/).
  - Crea un nuevo proyecto. Dale un nombre descriptivo (ej. `quiniela-prod`).
  - Anota el **ID del Proyecto** (Project ID), lo necesitarás más adelante.

- [ ] **2. Habilitar APIs requeridas:**

  - Dentro de tu proyecto, ve a la sección "APIs y servicios".
  - Habilita las siguientes APIs:
    1.  `Cloud Run Admin API`
    2.  `Artifact Registry API`
    3.  `Cloud Build API` (usado por Cloud Run para construir imágenes si es necesario)
    4.  `Container Scanning API` (Recomendado para el análisis de vulnerabilidades de imágenes Docker)

- [ ] **3. Instalar y Configurar la CLI de `gcloud` (Opcional pero recomendado):**
  - [Instala la CLI de Google Cloud](https://cloud.google.com/sdk/docs/install) en tu máquina local.
  - Autentícate ejecutando `gcloud auth login`.
  - Configura tu proyecto por defecto con `gcloud config set project TU_PROJECT_ID`.

### Fase 2: Configuración de Servicios en Google Cloud

- [ ] **1. Crear un Repositorio en Artifact Registry:**

  - Ve a Artifact Registry en la consola de Google Cloud.
  - Crea un nuevo repositorio.
  - **Nombre:** `quiniela-repo` (o el que prefieras).
  - **Formato:** `Docker`.
  - **Modo:** `Estándar` (es el modo para un repositorio normal donde subirás tus imágenes).
  - **Tipo de ubicación:** `Región`.
  - **Ubicación:** Elige una región cercana a tus usuarios (recomendado para Argentina: `southamerica-east1`).
  - **Descripción y Etiquetas:** Opcional. Puedes dejarlos en blanco. Sirven para organizar mejor tus recursos si tuvieras muchos repositorios.
  - **Configuración Adicional (Valores recomendados):**
    - **Encriptación:** `Clave de encriptación administrada por Google` (Opción por defecto, es segura y no requiere configuración).
    - **Etiquetas de imagen inmutables:** `Inhabilitado` (Nuestro pipeline usará etiquetas únicas, por lo que no es un riesgo. Esto ofrece más flexibilidad).
    - **Políticas de limpieza:** No definir ninguna por ahora. Se puede configurar más adelante para controlar costos si es necesario.
    - **Análisis de vulnerabilidades:** `Habilitado` (¡Muy recomendado! Analiza tus imágenes en busca de fallos de seguridad conocidos).
  - Anota el nombre completo del repositorio, que será algo como `southamerica-east1-docker.pkg.dev/TU_PROJECT_ID/quiniela-repo`.

- [ ] **2. Crear una Cuenta de Servicio (Service Account):**

  - Ve a "IAM y Administración" > "Cuentas de servicio".
  - Crea una nueva cuenta de servicio.
  - **Nombre:** `github-actions-deployer` (o similar).
  - **Descripción:** "Cuenta de servicio para desplegar la app desde GitHub Actions".
  - **Conceder Permisos (Dos partes):**
    - **a) Permisos sobre el Proyecto:**
      - Ve a la página principal de **"IAM y Administración" > "IAM"** y haz clic en `+ OTORGAR ACCESO`.
      - **Principal:** Tu nueva cuenta (`github-actions-deployer@...`).
      - **Roles:** Asígnale los siguientes dos roles:
        1. `Administrador de Cloud Run` (`Cloud Run Admin`)
        2. `Escritor de Artifact Registry` (`Artifact Registry Writer`)
      - Haz clic en `GUARDAR`.
    - **b) Permiso para "Actuar Como" (actAs):**
      - En el menú de la izquierda, ve a **"IAM y Administración" > "Cuentas de servicio"**.
      - Busca en la lista la cuenta llamada **"Default compute service account"** (su email termina en `-compute@developer.gserviceaccount.com`).
      - Selecciónala y haz clic en **"ADMINISTRAR ACCESO"** en el panel de la derecha.
      - Haz clic en `+ AGREGAR PRINCIPAL`.
      - **Nuevo Principal:** Pega el email de nuestra cuenta `github-actions-deployer@...`.
      - **Rol:** Asigna el rol **`Usuario de cuentas de servicio`** (`Service Account User`).
      - Haz clic en `GUARDAR`.

- [ ] **3. Generar una Clave para la Cuenta de Servicio (Archivo JSON):**
  - Vuelve a la lista de **"Cuentas de servicio"**.
  - En la lista, busca la que creaste (`github-actions-deployer@...`) y **haz clic en su dirección de correo electrónico**.
  - Se abrirá la página de detalles de esa cuenta. En la parte superior, verás varias pestañas. Haz clic en la pestaña **"CLAVES"**.
  - Haz clic en el botón **"AGREGAR CLAVE"** y selecciona **"Crear nueva clave"** en el menú desplegable.
  - Se abrirá una ventana emergente. Asegúrate de que el tipo de clave sea **JSON** (es el valor por defecto).
  - Haz clic en el botón **"CREAR"**.
  - El navegador descargará automáticamente un archivo con terminación `.json`. **Este archivo es tu credencial secreta.** Guárdalo en un lugar seguro y no lo compartas ni lo subas a tu repositorio. Lo necesitarás para la Fase 3.

### Fase 3: Configuración de Secretos en GitHub

- [ ] **1. Ve a la Configuración de tu Repositorio en GitHub:**

  - Abre tu repositorio en GitHub, ve a "Settings" > "Secrets and variables" > "Actions".

- [ ] **2. Crea los Secretos para GitHub Actions:**
  - Crea un nuevo "repository secret" llamado `GCP_PROJECT_ID`.
    - **Valor:** El ID de tu proyecto de Google Cloud.
  - Crea otro "repository secret" llamado `GCP_SA_KEY`.
    - **Valor:** Abre el archivo JSON que descargaste en el paso anterior, copia **todo su contenido** y pégalo aquí.

### Fase 4: Crear el Workflow de CI/CD en GitHub Actions

- [ ] **1. Crear el archivo de Workflow:**
  - Este paso se realizó de forma automática en el plan de ejecución. Se creó el archivo `.github/workflows/deploy.yml` con la lógica de despliegue.

### Fase 5: Subir los Cambios a GitHub y Activar el Workflow

- [ ] **1. Verificar el archivo de Workflow (`.github/workflows/deploy.yml`):**

  - Abre el archivo `.github/workflows/deploy.yml` que se acaba de crear.
  - En la sección `env:`, verifica que los siguientes valores coincidan con tu configuración en Google Cloud:
    - `GAR_LOCATION`: Debe ser la región que elegiste (ej. `southamerica-east1`).
    - `REPOSITORY_NAME`: Debe ser el nombre que le diste a tu repositorio de imágenes (ej. `quiniela-repo`).
  - **No modifiques las líneas de `PROJECT_ID` o `SERVICE_NAME`** a menos que sepas lo que haces.

- [ ] **2. Subir los cambios al repositorio:**
  - Abre una terminal en la raíz de tu proyecto.
  - Ejecuta los siguientes comandos uno por uno para subir la guía y el nuevo workflow a tu repositorio:
  ```bash
  git add DEPLOYMENT_GUIDE.md .github/workflows/deploy.yml
  ```
  ```bash
  git commit -m "feat: add CI/CD pipeline for Cloud Run deployment"
  ```
  ```bash
  git push origin main
  ```

### Fase 6: Monitorear el Primer Despliegue y Verificación

- [ ] **1. Monitorear el Workflow:**

  - En cuanto ejecutes `git push`, el workflow se activará.
  - Ve a tu repositorio en GitHub y haz clic en la pestaña **"Actions"**.
  - Verás el workflow corriendo. Puedes hacer clic en él para ver el progreso de cada paso en tiempo real. Si algo falla, los logs te indicarán el error.

- [ ] **2. Verificar el Servicio en Cloud Run:**
  - Una vez que el workflow termine con éxito, ve a la [Consola de Google Cloud](https://console.cloud.google.com/) y busca el servicio **Cloud Run**.
  - Deberías ver tu nuevo servicio llamado `quiniela-api`. Haz clic en él.
  - En la página de detalles del servicio, encontrarás la **URL pública**.
  - Abre esa URL en tu navegador o con una herramienta como `curl`. Deberías poder acceder a tu API desplegada.
  - ¡Felicidades, tu pipeline de CI/CD está funcionando!

---

## Historial de Implementación y Revisión

Esta sección documenta el proceso de implementación inicial y sirve como referencia para el futuro.

**Fecha de Implementación Exitosa:** 12 de Julio de 2024

### Resumen del Proceso

La implementación se centró en crear un pipeline de Integración y Despliegue Continuo (CI/CD) utilizando GitHub Actions y Google Cloud Run. El objetivo era automatizar el despliegue de la aplicación a producción tras cada `merge` o `push` a la rama `main`.

**Plan Original:**

- Configurar un proyecto en Google Cloud con las APIs y servicios necesarios (Artifact Registry, Cloud Run).
- Crear una cuenta de servicio con los permisos mínimos necesarios para realizar el despliegue.
- Utilizar secretos de GitHub para almacenar de forma segura las credenciales de la cuenta de servicio.
- Definir un workflow de GitHub Actions (`deploy.yml`) para construir la imagen de Docker y desplegarla en Cloud Run.

**Resultado de la Implementación:**
El plan se ejecutó con éxito. Se creó este mismo archivo (`DEPLOYMENT_GUIDE.md`) como una checklist viva que se fue refinando a medida que avanzábamos. Todos los pasos se completaron, resultando en un pipeline de CI/CD funcional.

Un punto de aprendizaje clave surgió durante la asignación de permisos: el error `iam.serviceaccounts.actAs` nos llevó a descubrir que la cuenta de servicio del deployer no solo necesita permisos a nivel de proyecto, sino que requiere específicamente el rol de `Usuario de cuentas de servicio` sobre la `Default compute service account`. Esta corrección fue crucial y quedó documentada en la guía.

El resultado final es una implementación que coincide con el plan original, ahora enriquecida con la experiencia y las soluciones a los problemas encontrados.

**Veredicto:** :white_check_mark: IMPLEMENTACIÓN EXITOSA Y COMPATIBLE CON EL PLAN.

---

### Fase 7: Dominio Personalizado (`orbaf.com.ar`) con Google Cloud DNS y Load Balancer

Esta fase ha sido adaptada para dominios registrados en `nic.ar`. El proceso consiste en delegar el dominio a Google Cloud DNS y luego configurar el Balanceador de Carga.

- [ ] **1. Crear una Zona DNS en Google Cloud:**

  - En la consola de Google Cloud, busca y ve a **"Cloud DNS"**.
  - Haz clic en **"CREAR ZONA"**.
  - **Nombre de la zona:** `orbaf-com-ar-zone` (o similar).
  - **Nombre de DNS:** `orbaf.com.ar`
  - **Tipo de Zona:** `Pública`.
  - Haz clic en **"Crear"**.

- [ ] **2. Obtener los Servidores de Nombres (Nameservers) de Google:**

  - Una vez creada la zona, verás una lista de registros. El registro de tipo `NS` (Name Server) contendrá 4 direcciones.
  - Anota estas 4 direcciones. Serán algo como `ns-cloud-a1.googledomains.com.`, `ns-cloud-a2.googledomains.com.`, etc.

- [ ] **3. Delegar tu Dominio en `nic.ar`:**

  - Inicia sesión en tu cuenta de [`nic.ar`](https://nic.ar/).
  - Ve a la sección de tus dominios y selecciona `orbaf.com.ar`.
  - Busca la opción "Modificar Delegaciones" o similar.
  - Reemplaza cualquier delegación existente con las 4 direcciones de servidores de nombres que obtuviste de Google Cloud DNS.
  - Guarda los cambios. **Nota:** Este cambio puede tardar varias horas en propagarse por todo internet.

- [ ] **4. Verificar Propiedad del Dominio y Configurar Registros DNS:**

  - **a) Iniciar Verificación en Google Search Console:**
    - Ve a la [página de Verificación de Dominios de Google](https://www.google.com/webmasters/verification/home).
    - Añade `orbaf.com.ar` como una nueva propiedad.
    - Google te ofrecerá varios métodos de verificación. Elige la opción **"Proveedor de nombres de dominio"**.
    - En la lista, busca `Google` o selecciona `Otro`. Te proporcionarán un valor de texto para un registro `TXT`, que será algo como `google-site-verification=...`. Copia ese valor completo.
  - **b) Añadir el Registro de Verificación en Cloud DNS:**
    - Vuelve a tu zona DNS en Google Cloud (`orbaf-com-ar-zone`).
    - Google puede ofrecerte un registro de tipo `TXT` (más común) o `CNAME`. Añade el que te hayan proporcionado.
    - Haz clic en **"Agregar estándar"**:
    - **Si es un registro TXT:**
      - **Tipo de registro:** `TXT`
      - **Datos:** Pega el código de verificación (`google-site-verification=...`).
    - **Si es un registro CNAME (como en la imagen proporcionada):**
      - **Nombre de DNS:** Pega la "Etiqueta/host" que te da Google (ej. `c5hnzhmhahvl`).
      - **Tipo de registro:** `CNAME`
      - **Nombre canónico:** Pega el "Destino/objetivo" que te da Google (ej. `gv-t3jsgklo2rpnsg.dv.googlehosted.com.`).
    - Haz clic en **"Crear"**.
  - **c) Esperar la verificación:** Vuelve a la página de Search Console y haz clic en "Verificar". Puede que tengas que esperar unos minutos a que el registro se propague.

- [ ] **5. Reservar IP y Crear Load Balancer (Pasos sin cambios):**

  - **Nota:** Los siguientes pasos son idénticos a la guía anterior, pero ahora los realizarás sabiendo que la gestión de DNS está en Google Cloud.
  - [ ] **a. Reservar una Dirección IP Externa Estática:**
    - En la consola de Google Cloud, busca "Direcciones IP" (en Red de VPC).
    - **Nombre:** `quiniela-lb-ip`, **Tipo:** `Global`. Anota la IP.
  - [ ] **b. Crear un Grupo de Extremos de Red (NEG) sin Servidor:**
    - **Nombre:** `quiniela-api-neg`, **Tipo:** `Grupo de extremos de red sin servidor`, apuntando a tu servicio `quiniela-api`.
  - [ ] **c. Crear el Balanceador de Carga HTTPS:**
    - Sigue los pasos para crear el balanceador de carga (`quiniela-lb`), conectando el frontend, las reglas de enrutamiento y el backend (con el NEG).
    - Al crear el **Certificado SSL gestionado por Google**, el proceso será mucho más rápido y fluido, ya que Google controla tanto el certificado como la zona DNS.

- [ ] **6. Apuntar el Dominio a la IP del Balanceador de Carga:**

  - Vuelve a tu zona DNS en Google Cloud (`orbaf-com-ar-zone`).
  - Haz clic en **"Agregar estándar"**.
  - **Tipo de registro de DNS:** `A`.
  - **Dirección IPv4:** Pega la dirección IP estática que reservaste para tu balanceador de carga.
  - Haz clic en **"Crear"**.

- [ ] **7. Esperar y Verificar:**
  - La propagación final de los DNS y el aprovisionamiento del certificado SSL pueden tardar un poco.
  - Una vez que todo esté activo (puedes ver el estado del certificado en los detalles del balanceador de carga), abre `https://orbaf.com.ar/quiniela`. ¡Debería funcionar!
