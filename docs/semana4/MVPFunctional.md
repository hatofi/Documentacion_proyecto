# Entregable 4: MVP Funcional — HatoFi

> **Bootcamp Stellar & Soroban 2026**  
> **Proyecto:** HatoFi — Tokenización de Lotes Ganaderos y Fondeo Colectivo RWA  
> **Fecha de entrega:** Lunes 19 de octubre de 2026, 11:00 p.m. (Hora Colombia)  
> **Plataforma Apex:** [Stellar Apex — HatoFi Project Submission](https://stellarapex.org/hackathons/ea3a5982-7c2e-4dce-a769-37e3a563fb15)  
> **Repositorio Oficial:** [github.com/hatofi/Documentacion_proyecto](https://github.com/hatofi/Documentacion_proyecto)

---

## Enlaces de Evidencia Técnica Verificable

| Recurso | Enlace / Identificador |
|---|---|
| **Producto en Línea (Despliegue en Producción)** | [`https://hatofi.vercel.app`](https://hatofi.vercel.app) |
| **Video Demostrativo y Pitch (≤ 3 min)** | [Ver Video en YouTube (Pitch & Demo)](https://youtu.be/85sOzfgKFdE?si=ByBCDs92qCYRzd_n) |
| **Contrato Inteligente en Testnet (ID)** | [`CCGGBMG72KCXUXAJCXYKCZD6K7MPTZNCTJP42PTLCUP447AKHHAFL6UX`](https://lab.stellar.org/r/testnet/contract/CCGGBMG72KCXUXAJCXYKCZD6K7MPTZNCTJP42PTLCUP447AKHHAFL6UX) |
| **Transacción de Deploy en Testnet Explorer** | [Transacción e59cc8b6... en Stellar.Expert](https://stellar.expert/explorer/testnet/tx/e59cc8b6031ae43297bd53da9ebe22639899225197e7be4855e3ece7fba7a589) |
| **Código Fuente del Contrato (Soroban / Rust)** | [`hatofi-smart-contract/contracts/vault/src/lib.rs`](https://github.com/hatofi/Documentacion_proyecto/blob/main/hatofi-smart-contract/contracts/vault/src/lib.rs) |
| **Integración Frontend Web3 (Stellar SDK & Freighter)** | [`hatofi-frontend/src/lib/stellar.ts`](https://github.com/hatofi/Documentacion_proyecto/blob/main/hatofi-frontend/src/lib/stellar.ts) |
| **Módulo de Inversión On-Chain en Frontend** | [`hatofi-frontend/src/app/dashboard/investment/page.tsx`](https://github.com/hatofi/Documentacion_proyecto/blob/main/hatofi-frontend/src/app/dashboard/investment/page.tsx) |

---

## 1. Aprendizajes y ajustes priorizados

Durante el desarrollo e integración del MVP funcional de HatoFi en Stellar Testnet, el equipo consolidó aprendizajes técnicos y de usabilidad críticos para la tokenización de activos del mundo real (RWA):

1. **Precisión aritmética y manejo de escalas en Soroban (Alto Impacto / Esfuerzo Medio):**  
   Aprendimos que la interoperabilidad entre los servicios backend (que manejan dos decimales en moneda fiduciaria y USDC) y los contratos inteligentes de Soroban exige una conversión rigurosa a unidades atómicas enteras de 7 decimales ($10^7$). Para evitar desbordamientos aritméticos (`overflow`) o discrepancias de redondeo al liquidar participaciones, estandarizamos la función `toAtomicAmount` en el frontend y operaciones seguras (`checked_add`) en Rust.
2. **Flujo de firma Web3 con Freighter (Alto Impacto / Esfuerzo Bajo):**  
   Comprendimos que exigir firmas criptográficas a inversionistas tradicionales o usuarios rurales requiere una experiencia guiada y transparente. Optimizamos el modal de inversión para preparar la transacción XDR, validar la red activa (`TESTNET`), solicitar la firma explícita a través de Freighter y consultar la confirmación final por RPC en tiempo real con retroalimentación visual clara.
3. **Validación condicional de metas de lote (Medio Impacto / Esfuerzo Bajo):**  
   Antes del cierre, ajustamos la lógica de inversión mínima a \$0.01 USDC para facilitar validaciones exhaustivas en Testnet, protegiendo al contrato contra sobre-financiamiento (`ExceedsTarget`) y transitando automáticamente el estado del lote a `FUNDED` al alcanzar el monto objetivo.

**Pendientes para futuras versiones:** Queda para la fase post-MVP la integración directa de oráculos automatizados de báscula RFID mediante contratos satélite y la dispersión descentralizada de utilidades (*Profit Splitter*) contra subastas ganaderas certificadas.

---

## 2. Riesgos y pendientes

Para la transición de HatoFi hacia un entorno productivo en Stellar Mainnet, el equipo identificó y priorizó riesgos técnicos, operativos y regulatorios que requieren mitigación metódica:

1. **Riesgos Técnicos y Conectividad de Red:**  
   - *Latencia en RPCs públicos de Stellar:* En momentos de alta demanda en Testnet, las consultas de confirmación (`pollTransaction`) pueden demorarse. Para producción se contempla configurar redundancia entre múltiples proveedores RPC y estrategias de reintentos exponenciales con manejo de desconexión.
   - *Adopción de billeteras en el sector rural:* Depender de extensiones de navegador como Freighter representa una fricción para los ganaderos en campo. Queda pendiente implementar soporte para cuentas inteligentes mediante el Stellar Passkey Kit, facilitando acceso con biometría o login social sin manejo manual de claves privadas.

2. **Riesgos Operativos y el Problema del Oráculo Físico:**  
   - *Integridad en el pesaje del ganado:* El activo respaldado es biológico y dinámico. Aunque los lotes están identificados con aretes oficiales del ICA y registros de manga, existe el riesgo de capturas manuales incorrectas en finca. El equipo definió en la arquitectura la integración de básculas ganaderas con conexión Bluetooth y validación por inspectores zootécnicos aliados antes de habilitar la liquidación final.
   - *Riesgo biológico y contingencias climáticas:* Los ciclos de ceba (6 a 10 meses) están expuestos a sequías o enfermedades. Como mitigación operativa, los lotes exigirán pólizas de seguro paramétrico pecuario contratadas directamente sobre el valor nominal del lote previo a su apertura al público.

3. **Riesgos Regulatorios y de Cumplimiento:**  
   - *Estructura legal de participaciones ganaderas:* La emisión de participaciones financieras respaldadas en ganado requiere estructuración bajo contratos de cuentas en participación o compraventa anticipada de biomasa de carne en pie. Queda pendiente formalizar los términos legales y los módulos de KYC/AML antes de captar capital en Mainnet.

---

## 3. Plan de validación con usuarios

Para validar que HatoFi resuelve efectivamente la falta de liquidez del campesino ganadero y democratiza el acceso a rendimientos pecuarios transparentes, establecemos un plan de validación enfocado en los actores del *Problem Brief*:

1. **Segmentos Objetivo a Validar:**  
   - **Ganaderos rurales de ceba y levante:** Productores medianos y pequeños de Córdoba, Magdalena Medio y Sucre (con hatos entre 20 y 100 reses) que padecen la intermediación desleal y el financiamiento usurero del modelo tradicional "al partir".
   - **Inversionistas individuales de impacto:** Profesionales y ahorristas interesados en activos del mundo real (RWA), con interés en retornos predecibles atados a la producción agropecuaria y descorrelacionados de la volatilidad del mercado cripto.

2. **Metodologías de Validación:**  
   - **Pruebas de usabilidad guiadas en potrero y manga (Ganaderos):** Sesiones presenciales y remotas de 45 minutos operando las vistas móviles de *Mi Finca* e *Inventario Bovino*, midiendo la facilidad para registrar pesajes, consultar saldos y solicitar nuevos lotes.
   - **Piloto controlado de fondeo simulado (Inversionistas):** Cohorte de 15 inversionistas navegando el catálogo de lotes, conectando su wallet en Testnet y ejecutando depósitos en USDC sobre el contrato inteligente desplegado.
   - **Entrevistas semiestructuradas de percepción de valor:** Evaluación de confianza en la trazabilidad por arete y disposición a financiar lotes reales bajo este esquema.

3. **Hipótesis y Criterios de Éxito:**  
   - **Hipótesis 1 (Adopción Ganadera):** Los ganaderos prefieren el modelo HatoFi frente al esquema tradicional "al partir" debido a la transparencia en precios y pago justo por kilo ganado.  
     - *Criterio de éxito:* Al menos el 80% de los ganaderos entrevistados manifiestan intención formal de enlistar al menos 1 lote de terneros en la plataforma.
   - **Hipótesis 2 (Usabilidad de Inversión Web3):** Un usuario sin experiencia avanzada en blockchain puede conectar su billetera y fondear una fracción de lote en menos de 3 minutos.  
     - *Criterio de éxito:* Tasa de finalización de inversión en el primer intento $\ge 85\%$ y tiempo promedio por transacción $\le 180$ segundos.
   - **Hipótesis 3 (Confianza en la Garantía RWA):** La visualización inmutable del historial de pesaje y el arete oficial disipa el temor de fraude o pérdida del activo físico.  
     - *Criterio de éxito:* Calificación de confianza superior a 4.5/5.0 en la encuesta post-fondeo.

---

## 4. Participación del equipo y evidencia de commits

Cada integrante del equipo contribuyó activamente en el diseño, desarrollo, pruebas e integración del MVP funcional durante la Semana 4:

| Integrante | Usuario GitHub | Rol en Semana 4 | Evidencia de Contribución |
|---|---|---|---|
| **Santiago Sierra Cano** | [`@Santiscano`](https://github.com/Santiscano) | Arquitectura Blockchain & Smart Contracts | Desarrollo de contratos Soroban en Rust (`CattleInvestmentContract`), suite de pruebas con snapshots, despliegue en Testnet, creación de API services y endpoints de lotes y fincas. |
| **Víctor Manuel Zapata** | [`@vzapatav`](https://github.com/vzapatav) | UI/UX & Responsive Web Architecture | Diseño responsive móvil/tablet de los dashboards, modularización del menú lateral, creación del inventario bovino, alineación con Stitch y redacción de documentación técnica. |
| **Jhon Benavides** | [`@JhonMB`](https://github.com/JhonMB) | Frontend & Integración de Componentes | Validación de componentes de interfaz, pruebas locales de flujos de registro y autenticación, revisión del diseño de tarjetas de inversión y soporte en documentación del MVP. |

---

## 5. Instrucciones de Ejecución Local del MVP

### Prerrequisitos
- Node.js 20+ y npm
- Extensión [Freighter Wallet](https://www.freighter.app/) instalada en el navegador y configurada en red `TESTNET`.

### Pasos
```bash
# 1. Clonar el repositorio
git clone https://github.com/hatofi/Documentacion_proyecto.git
cd Documentacion_proyecto/hatofi-frontend

# 2. Instalar dependencias
npm install

# 3. Variables de entorno (.env.local)
NEXT_PUBLIC_STELLAR_NETWORK=TESTNET
NEXT_PUBLIC_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_STELLAR_CONTRACT_ID=CCGGBMG72KCXUXAJCXYKCZD6K7MPTZNCTJP42PTLCUP447AKHHAFL6UX
NEXT_PUBLIC_STELLAR_TOKEN_DECIMALS=7

# 4. Iniciar servidor de desarrollo
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) e ingrese a `/dashboard/investment` para probar la conexión con Freighter y la inversión on-chain en el contrato de Testnet.
