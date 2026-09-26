# HatoFi — Problem Brief

> **Proyecto:** HatoFi  
> **Problema central:** Pequeños ganaderos con capacidad productiva no pueden aumentar su hato bovino por falta de acceso a capital, limitando su capacidad de crecimiento y generación de ingresos.

---

## 1. Decisión del problema

### Problema elegido

**Un pequeño ganadero tiene suficiente capacidad productiva para aumentar su hato, pero no cuenta con el capital necesario para adquirir más cabezas bovinas y no tiene acceso a crédito.**

**Proponente:** [Nombre / usuario de GitHub]

### Por qué elegimos este problema

El equipo seleccionó este problema porque conecta una necesidad productiva concreta del sector ganadero con una oportunidad de participación de terceros que actualmente no está resuelta dentro del flujo planteado.

La oportunidad se centra en conectar:

- La necesidad de capital del pequeño ganadero.
- La existencia de inversionistas interesados en participar en activos productivos.
- La compra de bovinos mediante subastas ganaderas.
- El seguimiento de cada bovino durante su ciclo productivo.
- La distribución de los recursos obtenidos al finalizar el ciclo.

Desde la perspectiva del curso, el caso presenta elementos donde blockchain podría aportar trazabilidad, un registro compartido del activo y automatización de reglas entre participantes que no necesariamente tienen una relación de confianza directa.

### Propuestas descartadas

> Completar con las propuestas individuales presentadas por el equipo.

| Propuesta | Proponente | Motivo del descarte |
|---|---|---|
| Impacto ambiental de las compras | Victor Manuel Zapata | Requería una coordinación comercial con varias cadenas de marcas y el registro de muchos productos y sus componentes, por lo que el esfuerzo era mayor. |
| Financiamiento para incrementar producción de café/aguacate | Santiago Sierra Cano | Los cultivos y sus cosechas no son tan precisos y podrían generar pérdidas por factores externos como clima, químicos, bichos o pestes. Si la producción no aumentaba, el modelo podía ser muy volátil. |

### Cómo tomamos la decisión

> Completar según lo ocurrido realmente: votación, consenso después de debate u otro mecanismo.

**Mecanismo utilizado:** Debate y selección entre las propuestas presentadas por los integrantes.

**Resultado:** El equipo acordó desarrollar HatoFi como problema seleccionado.

---

# 2. Problem Brief

## Encabezado

### HatoFi

**HatoFi busca facilitar el acceso a capital para pequeños ganaderos que tienen capacidad productiva, pero no cuentan con recursos suficientes para aumentar su hato bovino.**

---

## 3. Equipo y roles

| Integrante | Usuario GitHub | Rol | Responsabilidad |
|---|---|---|---|
| [Nombre] | [@usuario] | Product / Project | Coordinación y seguimiento |
| [Nombre] | [@usuario] | Blockchain | Arquitectura blockchain y Smart Contracts |
| [Nombre] | [@usuario] | Development | Desarrollo de plataforma |
| [Nombre] | [@usuario] | Business | Modelo de negocio y validación |
| [Nombre] | [@usuario] | UX / Research | Investigación y experiencia de usuario |

**Responsable de entregas:** [Nombre]  
**Canal de coordinación interna:** [Discord / WhatsApp / Slack / otro]

---

## 4. Problema y evidencia

Un pequeño ganadero puede contar con suficiente tierra, infraestructura y capacidad productiva para aumentar su número de cabezas bovinas, pero no dispone del capital necesario para adquirir nuevos animales. La falta de acceso a crédito limita su posibilidad de crecer y aprovechar la capacidad productiva disponible.

El problema ocurre cuando el productor necesita capital para realizar la compra de nuevos bovinos y no puede acceder a una fuente de financiación que le permita iniciar o ampliar su ciclo productivo. Como consecuencia, una capacidad productiva disponible puede permanecer subutilizada y el ganadero pierde la posibilidad de generar mayores ingresos mediante un hato más grande.

En el modelo planteado por el equipo, esta necesidad se relaciona con la posibilidad de vincular capital de inversionistas con activos productivos ganaderos. El objetivo es que el capital pueda utilizarse para adquirir bovinos mediante subastas ganaderas y que el resultado de su ciclo productivo pueda posteriormente distribuirse entre los participantes definidos.

La evidencia inicial utilizada por el equipo proviene del planteamiento del problema y de la mentoría realizada para HatoFi. En esta etapa, el equipo debe complementar la hipótesis con validaciones directas a pequeños ganaderos, inversionistas y otros actores del ecosistema para comprobar la frecuencia del problema, las barreras reales de acceso a capital y la disposición a utilizar un modelo de este tipo.

---

## 5. Usuario y actores

### Usuario principal: pequeño ganadero

El usuario principal es un pequeño productor ganadero que dispone de espacio y capacidad para aumentar su producción, pero necesita capital para adquirir más bovinos.

Actualmente, su principal limitación es financiera: sin recursos suficientes no puede aumentar el número de animales que administra. La necesidad principal es acceder a capital bajo un mecanismo que le permita incorporar nuevos bovinos a su ciclo productivo sin tener que asumir por sí solo todo el costo inicial.

### Actores involucrados

**Ganadero**
- Recibe los bovinos adquiridos con los recursos del proyecto.
- Administra y cuida los animales durante el ciclo productivo.
- Es responsable de su manejo y desarrollo productivo.
- Participa en la distribución del resultado económico de la venta.

**Inversionista**
- Aporta capital destinado a la adquisición de bovinos.
- Participa económicamente en el resultado del ciclo productivo.
- Necesita información sobre el activo en el que participa y sobre el estado de su inversión.

**Subasta ganadera**
- Participa en la compra y/o comercialización de los bovinos.
- Puede integrarse a la plataforma para facilitar las operaciones de adquisición y venta.

**Plataforma HatoFi**
- Conecta ganaderos e inversionistas.
- Registra la relación entre inversión, bovino y ciclo productivo.
- Coordina las reglas de distribución definidas por el modelo.

**Smart Contract**
- Administra las reglas programadas para recibir fondos y distribuir el resultado de la operación según las condiciones establecidas.

**Exchange / modelo de custodia**
- Se plantea como mecanismo para simplificar la creación y administración de billeteras para ganaderos, subastas e inversionistas.

---

## 6. Flujo actual de valor

El flujo actual planteado para el problema puede representarse de la siguiente manera:

1. El pequeño ganadero identifica que tiene capacidad para aumentar su hato.
2. Para hacerlo necesita capital para comprar nuevos bovinos.
3. El ganadero busca una fuente de financiación.
4. Debido a que no tiene acceso a crédito y no cuenta con capital suficiente, la compra de nuevos animales no puede realizarse o queda limitada.
5. Al no incorporar nuevos bovinos, el ganadero no puede aprovechar completamente la capacidad productiva disponible.
6. Como consecuencia, tampoco se genera el ciclo productivo adicional que podría terminar en una nueva comercialización.

### Flujo simplificado

```text
Capacidad productiva del ganadero
              │
              ▼
     Necesidad de más bovinos
              │
              ▼
       Necesidad de capital
              │
              ▼
       Búsqueda de financiación
              │
              ▼
      No acceso a crédito
              │
              ▼
   No puede comprar más bovinos
              │
              ▼
Capacidad productiva subutilizada
```

En esta descripción inicial no se ha identificado una obligación normativa específica que explique la falta de financiación. Las condiciones regulatorias aplicables a inversión, activos tokenizados, ganadería, custodia de fondos y comercialización deberán validarse posteriormente.

---

## 7. Fricciones identificadas

### 1. Falta de acceso a capital

**Paso:** financiación.

**Causa:** el pequeño ganadero no dispone del capital necesario y no tiene acceso a crédito.

**Afectado:** ganadero.

La principal fricción es que existe capacidad productiva, pero el capital requerido para adquirir nuevos animales no está disponible.

### 2. Desconexión entre capital e inversión productiva

**Paso:** búsqueda de financiación.

**Causa:** el modelo actual no contempla dentro del flujo planteado un mecanismo que conecte directamente a inversionistas con la adquisición de bovinos para ciclos productivos.

**Afectados:** ganadero e inversionista.

### 3. Necesidad de trazabilidad del activo

**Paso:** adquisición y ciclo productivo.

**Causa:** para vincular una inversión con un bovino concreto se requiere mantener una relación verificable entre el capital, el activo y su posterior comercialización.

**Afectados:** ganadero, inversionista y plataforma.

### 4. Distribución del resultado

**Paso:** finalización del ciclo productivo.

**Causa:** una vez comercializado el bovino, se requiere aplicar las reglas acordadas para distribuir los recursos entre los participantes.

**Afectados:** ganadero, inversionista y plataforma.

---

## 8. Oportunidad e hipótesis

### Oportunidad priorizada

La oportunidad priorizada es crear un mecanismo que conecte el capital de inversionistas con la adquisición y ciclo productivo de bovinos administrados por pequeños ganaderos.

HatoFi plantea que cada bovino incorporado al mercado pueda tener una representación digital mediante un NFT y que la inversión y posterior distribución del resultado sean administradas mediante Smart Contracts.

El flujo propuesto sería:

```text
Inversionistas
      │
      │ aportan capital
      ▼
Smart Contract
      │
      │ fondos para adquisición
      ▼
Subasta ganadera integrada
      │
      │ compra bovino
      ▼
Bovino registrado
      │
      │ NFT asociado
      ▼
Ganadero
      │
      │ ciclo productivo
      ▼
Subasta / comercialización
      │
      │ resultado de la venta
      ▼
Smart Contract
      │
      ├──► Ganadero
      ├──► Inversionista
      └──► Plataforma
```

### Hipótesis inicial

**Si** la relación entre inversión, bovino, ciclo productivo y distribución del resultado se registra y automatiza mediante blockchain y Smart Contracts, **entonces** HatoFi podría ofrecer a los participantes un registro compartido del activo y reglas transparentes para administrar la inversión y distribuir los recursos al finalizar el ciclo productivo.

La hipótesis debe validarse con usuarios reales antes de asumir que el modelo resuelve efectivamente la barrera de acceso a capital.

---

## 9. Criterio de pertinencia de blockchain

El caso presenta una posible aplicación de blockchain porque participan diferentes actores —ganaderos, inversionistas, subastas y la plataforma— que necesitan compartir información sobre un mismo activo y sobre los movimientos económicos relacionados con él.

Una base de datos tradicional podría registrar información sobre los bovinos, inversionistas y operaciones. Sin embargo, la hipótesis de HatoFi plantea una necesidad adicional: que las reglas relacionadas con la inversión y distribución del resultado puedan ejecutarse mediante Smart Contracts y que exista un historial compartido y verificable de las operaciones.

Los elementos propuestos para el modelo son:

- **Token XLM:** utilizado como activo de la red para las operaciones planteadas.
- **Token propio de la red:** mecanismo planteado para la capitalización del proyecto y posterior quema según las reglas que se definan.
- **NFT por bovino:** representación digital individual de cada bovino registrado en el mercado. La propuesta actual contempla su quema cuando el bovino sea vendido.
- **Smart Contract:** encargado de recibir los fondos de inversión y ejecutar las reglas de distribución al finalizar el ciclo productivo.
- **Modelo de custodia tipo Exchange:** busca reducir la complejidad de creación y administración de billeteras para ganaderos, subastas e inversionistas.

La pertinencia definitiva de blockchain dependerá de validar si estas características aportan un beneficio que no pueda obtenerse mediante una arquitectura tradicional con una base de datos y servicios de integración.

---

## 10. Supuestos y riesgos

### Supuesto 1 — Participación de inversionistas

Se asume que existen inversionistas interesados en aportar capital a ciclos productivos ganaderos bajo un modelo como el propuesto.

**Riesgo:** si no existe suficiente demanda de inversión, el mecanismo no tendría capital suficiente para financiar la compra de bovinos.

### Supuesto 2 — Participación de ganaderos y subastas

Se asume que pequeños ganaderos y subastas estarían dispuestos a integrarse a la plataforma y operar bajo las reglas del modelo.

**Riesgo:** la adopción puede verse limitada por la complejidad tecnológica, los procesos operativos o la falta de confianza en el nuevo mecanismo.

### Supuesto 3 — Información confiable del activo físico

Se asume que la información registrada sobre cada bovino corresponde realmente al animal físico y que los eventos relevantes del ciclo productivo y de comercialización pueden verificarse.

**Riesgo:** blockchain puede garantizar la integridad del registro digital, pero no garantiza por sí sola que la información introducida inicialmente sobre el bovino sea verdadera.

### Riesgo regulatorio y legal

El modelo propuesto involucra inversión, distribución de rendimientos, activos digitales, custodia y comercialización de ganado. Por ello, antes de implementar el modelo será necesario validar el marco legal y regulatorio aplicable en las jurisdicciones donde opere HatoFi.

---

## 11. Modelo conceptual de HatoFi

La propuesta inicial contempla cuatro componentes tecnológicos:

### 11.1. Token XLM

XLM sería el activo de la red utilizado dentro de la arquitectura blockchain seleccionada para las operaciones que se definan en el prototipo.

### 11.2. Token propio

Se plantea un token propio asociado al proyecto, con una lógica de capitalización y mecanismos de quema que deberán ser definidos y validados durante las siguientes fases.

### 11.3. NFT por bovino

Cada bovino registrado en el mercado tendría un NFT asociado como representación digital del activo dentro de la plataforma.

La propuesta inicial contempla que el NFT sea quemado cuando el bovino sea vendido, cerrando así el ciclo del activo digital.

### 11.4. Smart Contract

El Smart Contract representaría las reglas principales del ciclo de inversión:

```text
Aporte de inversionistas
          │
          ▼
   Smart Contract
          │
          ▼
Compra de bovinos
          │
          ▼
Asignación al ganadero
          │
          ▼
Ciclo productivo
          │
          ▼
Venta del bovino
          │
          ▼
Ingreso al Smart Contract
          │
          ▼
Distribución según reglas
   ┌──────┼──────┐
   ▼      ▼      ▼
Ganadero Inversor Plataforma
```

---

## 12. Preguntas pendientes de validación

Estas preguntas deben mantenerse como parte de la investigación del proyecto:

1. ¿Es viable y legal implementar un modelo de inversión de este tipo mediante Smart Contracts?
2. ¿Qué estructura jurídica tendría la participación del inversionista en el ciclo productivo?
3. ¿Cómo se determinará la rentabilidad de cada ciclo?
4. ¿La rentabilidad será variable y se calculará al finalizar el ciclo, o existirán valores previamente definidos?
5. ¿Qué activo debería mantenerse durante el ciclo: stablecoin, XLM o el token propio?
6. ¿Cómo se garantizará que el NFT represente efectivamente al bovino físico?
7. ¿Qué información del bovino debe registrarse y quién será responsable de validarla?
8. ¿Qué sucede con el NFT cuando el bovino es vendido?
9. ¿Qué porcentaje corresponde al ganadero, inversionista y plataforma?
10. ¿Cómo se manejarán pérdidas o ciclos productivos cuyo resultado sea inferior al esperado?
11. ¿Qué modelo de custodia tipo Exchange sería adecuado para facilitar la incorporación de usuarios sin experiencia en billeteras?
12. ¿Qué requisitos regulatorios aplican a la captación de inversión, custodia y distribución de rendimientos?

---

## 13. Alcance inicial del prototipo

Para una primera validación, HatoFi podría concentrarse en demostrar un ciclo completo simplificado:

1. Registro de un ganadero.
2. Registro de un bovino.
3. Creación del NFT asociado al bovino.
4. Registro de una oportunidad de inversión.
5. Aporte de fondos por parte de un inversionista.
6. Registro de la adquisición del bovino.
7. Asociación del bovino con el ganadero.
8. Simulación del ciclo productivo.
9. Registro de la venta del bovino.
10. Envío del resultado al Smart Contract.
11. Distribución simulada de los recursos entre ganadero, inversionista y plataforma.
12. Cierre o quema del NFT según la regla definida.

El objetivo del prototipo sería validar el flujo de valor y la relación entre las partes antes de implementar operaciones reales.

---

## 14. Resumen de la hipótesis de HatoFi

> **HatoFi parte de la hipótesis de que blockchain puede facilitar la conexión entre capital de inversionistas y pequeños ganaderos, utilizando una representación digital de cada bovino y Smart Contracts para registrar el ciclo productivo y automatizar la distribución del resultado de su comercialización.**

**Estado actual:** Hipótesis inicial pendiente de validación con usuarios, actores del sector ganadero y revisión legal/regulatoria.
