# Análisis de Bug: Falla en la Interpretación del Sueño Número 0

## 1. Resumen del Incidente

Se detectó un bug crítico en la API de la Quiniela donde las solicitudes para el sueño número `0` (enviado como `?dream=0` o `?dream=00`) resultaban en la generación de un número aleatorio en lugar de devolver los datos para el número `0`. Este comportamiento errático comprometía la funcionalidad principal del endpoint.

## 2. Diagnóstico Final y Causa Raíz

La causa raíz del bug fue una interacción no prevista entre el middleware `queryValidator.js` y la lógica de negocio en `GetQuinielaUseCase.js`.

**Flujo del Error:**

1.  **Coerción de Tipo en el Middleware:** El middleware `queryValidator.js`, que se ejecuta en cada petición a `/api`, contiene una lógica de "normalización" que convierte el parámetro `dream` de la consulta (que es un `string`) en un `number` usando `parseInt()`.

    ```javascript
    // En queryValidator.js
    if (dream !== undefined) {
      req.query.dream = parseInt(dream, 10);
    }
    ```

    Cuando la API recibía `?dream=0`, el middleware transformaba `req.query.dream` de la cadena `'0'` al número `0`.

2.  **Lógica Frágil en el Caso de Uso:** La versión original del caso de uso `GetQuinielaUseCase.js` utilizaba una comprobación de "veracidad" (`truthiness`) para determinar si se debía generar un número aleatorio.
    ```javascript
    // Lógica original problemática
    const number = dream ? parseInt(dream, 10) : this.generateQuinielaNumber();
    ```
    Cuando el `dream` (ya convertido en el número `0` por el middleware) llegaba a esta línea, la condición `dream` se evaluaba como `false`, ya que `0` es un valor "falsy" en JavaScript. Esto activaba incorrectamente la generación de un número aleatorio.

**En resumen, el bug no era un simple error de validación, sino un fallo sistémico causado por la modificación del tipo de dato en una capa (middleware) sin que la capa de negocio estuviera preparada para manejar esa transformación de forma robusta.**

## 3. Análisis de Falla de Pruebas

El bug no fue detectado por la suite de pruebas inicial por dos razones:

1.  **Falta de Casos Borde:** No existían tests unitarios ni de integración que cubrieran explícitamente el caso `dream=0` o `dream=00`.
2.  **Entorno de Prueba Inconsistente (Hipótesis Inicial):** Durante la investigación se sospechó que las pruebas de integración no ejecutaban el middleware `queryValidator`. Aunque se demostró que el middleware sí se ejecutaba, el no tener un test para el caso `0` fue el fallo principal que permitió que el bug pasara desapercibido.

## 4. Estrategia de Solución Implementada

La solución se abordó con un enfoque integral para garantizar la robustez y la fiabilidad de las pruebas:

1.  **Fortalecimiento de las Pruebas:** Se añadieron nuevos casos de prueba tanto a nivel unitario (`GetQuinielaUseCase.test.js`) como de integración (`quinielaApi.test.js`) para cubrir los siguientes escenarios:

    - `dream=0` y `dream=00`.
    - Números negativos (`dream=-1`), esperando un error.
    - Se validaron los mensajes de respuesta contra los datos exactos del archivo de persistencia (`dreamMeanings.json`).

2.  **Corrección Robusta del Código:** Se refactorizó la lógica en `GetQuinielaUseCase.js` para eliminar la ambigüedad. La comprobación `const isDreamProvided = dream != null && dream !== '';` fue implementada. Esta condición es inmune a la coerción de tipos, ya que `dream != null` (equivalente a `dream !== null && dream !== undefined`) funciona correctamente tanto si `dream` es el número `0` como si es la cadena `'0'`.

## 5. Caso de Prueba de Evidencia (QA)

---

**ID del Caso de Prueba:** TC-API-003
**Título:** Verificación del Comportamiento del Parámetro 'dream' con el Valor Cero

**Objetivo:** Asegurar que la API procese correctamente el número de sueño `0` (en formatos `0` y `00`) y devuelva el significado correspondiente sin generar un número aleatorio.

**Precondiciones:**

- El servicio de la API de Quiniela está en ejecución.
- El middleware `queryValidator` está activo.
- Existen datos de significado para el número `0` en el sistema.

**Pasos de Ejecución:**

| Paso | Acción                                                          | Dato de Entrada             | Resultado Esperado                                                                                                                                  |
| :--- | :-------------------------------------------------------------- | :-------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Realizar una petición GET a la API con el parámetro `dream=0`.  | `GET /api?lang=es&dream=0`  | - El código de estado de la respuesta es `200 OK`.<br>- El cuerpo de la respuesta contiene `status: "success"`.<br>- El campo `data.number` es `0`. |
| 2    | Realizar una petición GET a la API con el parámetro `dream=00`. | `GET /api?lang=es&dream=00` | - El código de estado de la respuesta es `200 OK`.<br>- El cuerpo de la respuesta contiene `status: "success"`.<br>- El campo `data.number` es `0`. |

**Criterios de Aceptación:**

- Todas las pruebas deben pasar. El sistema debe manejar el valor `0` como una entrada válida y no confundirlo con la ausencia de un parámetro.

---
