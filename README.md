# HatoFi — Tokenización de Lotes Ganaderos y Fondeo Colectivo RWA

Plataforma descentralizada sobre la red **Stellar** y contratos inteligentes **Soroban** para conectar a ganaderos rurales con inversionistas mediante activos reales tokenizados (RWA).

🌐 **Demo en Producción:** [https://hatofi.vercel.app](https://hatofi.vercel.app)  
🎬 **Video Pitch & Demo (YouTube):** [https://youtu.be/85sOzfgKFdE](https://youtu.be/85sOzfgKFdE?si=ByBCDs92qCYRzd_n)

---

## 📑 Entregables del Bootcamp Stellar & Soroban

| Entregable | Descripción | Enlace |
|---|---|---|
| **Semana 1** | Planteamiento del Problema & Problem Brief | [`docs/semana1/`](./docs/semana1/) |
| **Semana 2** | Product Blueprint, Historias de Usuario & Lean Canvas | [`docs/semana2/`](./docs/semana2/) |
| **Semana 3** | Arquitectura Técnica, UI en Next.js & Decisión de Contratos | [`docs/semana3/Documentacion.md`](./docs/semana3/Documentacion.md) |
| **Semana 4 (MVP)** | **MVP Funcional en Testnet, Smart Contracts Soroban & Video** | [`docs/semana4/MVPFunctional.md`](./docs/semana4/MVPFunctional.md) |

---

## 🚀 Arquitectura del Repositorio

- **`hatofi-smart-contract/`**: Contrato inteligente Soroban en Rust (`CattleInvestmentContract`), tests unitarios con snapshots y scripts de despliegue en Testnet.
- **`hatofi-frontend/`**: Aplicación web desarrollada en Next.js 16 con Tailwind CSS, integrada con `@stellar/stellar-sdk` y billetera `@stellar/freighter-api`.
- **`docs/`**: Documentación acumulada de cada fase y entregables del bootcamp.
- **`architecture/`**: Diagramas de arquitectura backend AWS, base de datos y flujo de contratos inteligentes.

---

## 🛠️ Ejecución Local del Frontend

### Requisitos
- **Node.js**: Versión 20 LTS recomendada (mínimo 18.18+).
- **npm**: Versión 9+.
- **Freighter Wallet**: Extensión de navegador configurada en red `TESTNET`.

### Instalación y Puesta en Marcha
```bash
# 1. Entrar a la carpeta del frontend e instalar dependencias
cd hatofi-frontend
npm install

# 2. Iniciar el servidor de desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador. Para interactuar con las bóvedas de ceba en la blockchain, navegue a `/dashboard/investment` y conecte su billetera Freighter en Testnet.

