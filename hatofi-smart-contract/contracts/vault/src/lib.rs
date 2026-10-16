#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, Symbol, token,
};


// Los datos viven ~30 días; cada vez que se escriben se renueva el "alquiler".
const DAY_IN_LEDGERS: u32 = 17_280; // esto equivale a 24 horas en ledgers, considerando que cada ledger es de 5 segundos
const BUMP_AMOUNT: u32 = 30 * DAY_IN_LEDGERS; // 30 días en ledgers
const LIFETIME_THRESHOLD: u32 = BUMP_AMOUNT - DAY_IN_LEDGERS; // 29 días en ledgers, para renovar antes de que expire

// -----------------------------------------------------------------------------
// Claves de Almacenamiento (Storage Keys)
// -----------------------------------------------------------------------------
#[contracttype]               // contracttype es un macro que permite que la blockchain serializar la estructura de datos
#[derive(Clone)]              // este macro agrega por detras el codigo necesario para clonar la estructura de datos, util para cuando se pasa por valor
pub enum DataKey {
    Admin,                    // Dirección del administrador del protocolo - solo se define una vez al inicializar el contrato
    Token,                    // Dirección del token aceptado (ej. USDC SAC) - solo se define una vez al inicializar el contrato
    Batch(u64),               // Almacena información del Lote por ID - cada lote tiene un ID único
    Investment(u64, Address), // Registra cuánto ha invertido una wallet en un Lote - cada inversión es única por combinación de lote e inversor
}

// -----------------------------------------------------------------------------
// Estructuras de Datos
// -----------------------------------------------------------------------------
#[contracttype]
#[derive(Clone)]
pub struct BatchInfo {
    pub id: u64,
    pub farmer: Address,          // Dirección del ganadero responsable
    pub target_amount: i128,       // Meta de capital a recaudar (en unidades atómicas de token)
    pub collected_amount: i128,    // Capital acumulado actualmente
    pub price_per_share: i128,     // Precio por acción/participación
    pub total_yield_returned: i128,// Total depositado por el ganadero para retorno (capital + ganancias)
    pub status: Symbol,            // Estados: FUNDING, FUNDED, IN_PROGRESS, CLOSED
}

// -----------------------------------------------------------------------------
// Contrato Principal
// -----------------------------------------------------------------------------
#[contract]
pub struct CattleInvestmentContract;

#[contractimpl]
impl CattleInvestmentContract {

    /// 0. Inicialización del Contrato
    pub fn __constructor(env: Env, admin: Address, token_address: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("El contrato ya ha sido inicializado");
        }
        env.storage().instance().set(&Datakey::Admin, &admin);
        env.storage().instance().set(&DataKey::Token, &token_address);
        extend_instance(&env);
    }

    /// 1. Crear un nuevo Lote de Ganado (Batch)
    pub fn create_batch(
        env: Env,
        batch_id: u64,
        farmer: Address,
        target_amount: i128,
        price_per_share: i128 
    ) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth(); // 

        if target_amount <= 0 || price_per_share <= 0 {
            panic!("Los montos deben ser mayores a cero");
        }

        let batch = BatchInfo {
            id: batch_id,
            farmer,
            target_amount,
            collected_amount: 0,
            price_per_share,
            total_yield_returned: 0,
            status: symbol_short!("FUNDING"), // Estado inicial: Recaudando fondos
        };

        env.storage().persistent().set(&DataKey::Batch(batch_id), &batch);
    }

    /// 1.1 Obtener los detalles del lote
    pub fn get_batch(env: Env, batch_id: u64) -> BatchInfo {
        env.storage()
            .persistent()
            .get(&DataKey::Batch(batch_id))
            .unwrap_or_panic(&env, "El lote no existe")
    }

    /// 2. Invertir / Congelar fondos en un Lote
    pub fn invest(env: Env, investor: Address, batch_id: u64, amount: i128) {
        investor.require_auth();

        if amount <= 0 {
            panic!("El monto a invertir debe ser positivo");
        }

        let mut batch: BatchInfo = env
            .storage()
            .persistent()
            .get(&DataKey::Batch(batch_id))
            .unwrap_or_panic(&env, "El lote no existe");

        if batch.status != symbol_short!("FUNDING") {
            panic!("El lote no esta recibiendo inversiones");
        }

        if batch.collected_amount + amount > batch.target_amount {
            panic!("La inversion excede la meta del lote");
        }

        // Transferir tokens desde el inversor hacia este contrato
        let token_address: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&investor, &env.current_contract_address(), &amount);

        // Actualizar acumulado del lote
        batch.collected_amount += amount;

        // Si se alcanza la meta exacta, cambiar estado a FUNDED
        if batch.collected_amount == batch.target_amount {
            batch.status = symbol_short!("FUNDED");
        }

        env.storage().persistent().set(&DataKey::Batch(batch_id), &batch);

        // Guardar o sumar el saldo invertido por la wallet
        let inv_key = DataKey::Investment(batch_id, investor.clone());
        let current_investment: i128 = env.storage().persistent().get(&inv_key).unwrap_or(0);
        env.storage().persistent().set(&inv_key, &(current_investment + amount));
    }

    /// 3. Desembolsar Fondos al Ganadero
    /// Una vez completada la meta (FUNDED), el admin o ganadero transfiere el dinero recaudado a la wallet del ganadero para comprar los bovinos.
    pub fn release_funds(env: Env, batch_id: u64) {
        let mut batch: BatchInfo = env
            .storage()
            .persistent()
            .get(&DataKey::Batch(batch_id))
            .unwrap_or_panic(&env, "El lote no existe");

        if batch.status != symbol_short!("FUNDED") {
            panic!("El lote no esta listo para desembolso");
        }

        // Desembolsar los fondos recaudados al ganadero
        let token_address: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&env.current_contract_address(), &batch.farmer, &batch.collected_amount);

        // Actualizar el estado a IN_PROGRESS (Ceba/Levante/Cría en proceso)
        batch.status = symbol_short!("IN_PROG");
        env.storage().persistent().set(&DataKey::Batch(batch_id), &batch);
    }

    /// 4. Retorno de Capital y Ganancias por el Ganadero
    /// Tras la venta del ganado, el ganadero transfiere al contrato el capital inicial más los rendimientos acordados.
    pub fn return_yield(env: Env, batch_id: u64, total_amount: i128) {
        let mut batch: BatchInfo = env
            .storage()
            .persistent()
            .get(&DataKey::Batch(batch_id))
            .unwrap_or_panic(&env, "El lote no existe");

        batch.farmer.require_auth();

        if batch.status != symbol_short!("IN_PROG") {
            panic!("El lote no esta en etapa de cierre/retorno");
        }

        // El ganadero transfiere los fondos de retorno al contrato
        let token_address: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&batch.farmer, &env.current_contract_address(), &total_amount);

        batch.total_yield_returned = total_amount;
        batch.status = symbol_short!("CLOSED"); // Proyecto liquidado
        env.storage().persistent().set(&DataKey::Batch(batch_id), &batch);
    }

    /// 5. Retiro de Ganancias Proporcional por parte del Inversor
    /// Cada inversor reclama su retorno equivalente a la proporción que invirtió sobre la meta total.
    pub fn claim_payout(env: Env, investor: Address, batch_id: u64) {
        investor.require_auth();

        let batch: BatchInfo = env
            .storage()
            .persistent()
            .get(&DataKey::Batch(batch_id))
            .unwrap_or_panic(&env, "El lote no existe");

        if batch.status != symbol_short!("CLOSED") {
            panic!("El lote aun no ha sido liquidado");
        }

        let inv_key = DataKey::Investment(batch_id, investor.clone());
        let investor_amount: i128 = env.storage().persistent().get(&inv_key).unwrap_or(0);

        if investor_amount == 0 {
            panic!("No tienes fondos por reclamar en este lote");
        }

        // Cálculo proporcional del pago: (Inversión * Total Retornado) / Meta Recaudada
        let payout = (investor_amount * batch.total_yield_returned) / batch.target_amount;

        // Resetear la inversión a 0 para prevenir múltiples retiros (Reentrancy prevention)
        env.storage().persistent().set(&inv_key, &0i128);

        // Transferir los rendimientos al inversor
        let token_address: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&env.current_contract_address(), &investor, &payout);
    }

    // -------------------------------------------------------------------------
    // Funciones Lectura (Consultas / Getters)
    // -------------------------------------------------------------------------


    /// Consultar el monto invertido por una wallet específica
    pub fn get_investment(env: Env, batch_id: u64, investor: Address) -> i128 {
        let inv_key = DataKey::Investment(batch_id, investor);
        env.storage().persistent().get(&inv_key).unwrap_or(0)
    }
}

/**
 * Función auxiliar para establecer datos persistentes en el almacenamiento del contrato.
 * Esta función asegura que los datos se almacenen de manera que persistan más allá del tiempo de vida predeterminado del contrato, evitando que se borren automáticamente.
 */
fn set_persistent<V: soroban_sdk::IntoVal<Env, soroban_sdk::Val>>(env: &Env, key: &DataKey, value: &V) {
    env.storage().persistent().set(key, &value);
    env.storage().persistent().extend_ttl(key, LIFETIME_THRESHOLD, BUMP_AMOUNT);
}

fn extend_instance(env: &Env) {
    env.storage()
        .instance()
        .extend_ttl(LIFETIME_THRESHOLD, BUMP_AMOUNT)
}