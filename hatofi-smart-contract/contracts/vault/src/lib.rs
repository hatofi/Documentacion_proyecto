#![no_std]

/**
 * explicacion de cada clase y funcion
 * contract: Define un contrato inteligente en Soroban.
 * contracterror: Define un tipo de error específico para el contrato inteligente.
 * contractimpl: Implementa las funciones del contrato inteligente.
 * contracttype: Define un tipo de datos que se puede almacenar en el contrato inteligente.
 * symbol_short: Crea un símbolo corto a partir de una cadena de texto.
 * Address: Representa la dirección de una cuenta en la red de Soroban.
 * Env: Proporciona acceso al entorno de ejecución del contrato inteligente.
 * String: Representa una cadena de texto en el contrato inteligente.
 * Symbol: Representa un símbolo en el contrato inteligente.
 */
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, token, Address, Env,
    String, Symbol,
};

const DAY_IN_LEDGERS: u32 = 17_280; // 24 horas * 60 minutos * 60 segundos / 5 segundos por ledger
const BUMP_AMOUNT: u32 = 30 * DAY_IN_LEDGERS; // 30 días en ledgers (5 segundos por ledger)
const LIFETIME_THRESHOLD: u32 = 29 * DAY_IN_LEDGERS; // 29 días en ledgers (5 segundos por ledger)

#[contracttype]
#[derive(Clone)]
pub enum DataKey { // es un enum que define las claves de datos utilizadas en el contrato inteligente para almacenar información en el almacenamiento persistente. Cada variante del enum representa un tipo específico de dato que se puede almacenar, como la dirección del administrador, la dirección del token, la información de un lote de inversión y la cantidad invertida por un inversor en un lote específico.
    Admin, // admin: Representa la dirección del administrador del contrato inteligente.
    Token, // token: Representa la dirección del token utilizado en el contrato inteligente.
    // batch: Representa la información de un lote de inversión. Se indexa por el código
    // del lote (uuid4) y no por el id autoincremental de la base de datos, para que el
    // lote siga siendo localizable aunque se reinicie o migre la base de datos.
    Batch(String),
    // investment: Representa la cantidad invertida por un inversor en un lote específico,
    // aqui se almacena el código del lote y la dirección del inversor.
    Investment(String, Address),
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct BatchInfo {
    // Identificador estable del lote (uuid4 generado en la base de datos). Es la clave
    // de almacenamiento y la que se usa para consultar y actualizar el lote.
    pub code: String,
    pub farm_id: u64,
    pub title: String,
    pub description: String,
    pub category: Symbol,
    pub farmer: Address,
    pub target_amount: i128,
    pub collected_amount: i128,
    pub price_per_share: i128,
    pub estimated_roi_percentage: i128,
    pub duration_months: u32,
    pub funding_start_date: u64,
    pub funding_end_date: u64,
    pub status: Symbol,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    BatchAlreadyExists = 2,
    BatchNotFound = 3,
    InvalidAmount = 4,
    InvalidBatch = 5,
    NotFunding = 6,
    ExceedsTarget = 7,
    InvalidStatus = 8,
    Unauthorized = 9,
}

#[contract]
pub struct CattleInvestmentContract;

#[contractimpl]
impl CattleInvestmentContract {
    pub fn __constructor(env: Env, admin: Address, token_address: Address) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(Error::AlreadyInitialized);
        } // si ya se ha inicializado el contrato, devuelve un error de "AlreadyInitialized"

        env.storage().instance().set(&DataKey::Admin, &admin); // establece la dirección del administrador en el almacenamiento del contrato
        env.storage()
            .instance()
            .set(&DataKey::Token, &token_address); // establece la dirección del token en el almacenamiento del contrato
        extend_instance(&env); // extiende el tiempo de vida del contrato en el almacenamiento del contrato
        Ok(()) // devuelve un resultado exitoso
    }

    pub fn create_batch(
        env: Env,
        code: String,
        farm_id: u64,
        title: String,
        description: String,
        category: Symbol,
        farmer: Address,
        target_amount: i128,
        price_per_share: i128,
        estimated_roi_percentage: i128,
        duration_months: u32,
        funding_start_date: u64,
        funding_end_date: u64,
    ) -> Result<(), Error> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(Error::Unauthorized)?;
        admin.require_auth();

        if code.is_empty()
            || farm_id == 0
            || target_amount <= 0
            || price_per_share <= 0
            || estimated_roi_percentage < 0
            || duration_months == 0
            || funding_start_date == 0
        {
            return Err(Error::InvalidBatch);
        }
        if env
            .storage()
            .persistent()
            .has(&DataKey::Batch(code.clone()))
        {
            return Err(Error::BatchAlreadyExists);
        }

        let batch = BatchInfo {
            code: code.clone(),
            farm_id,
            title,
            description,
            category,
            farmer,
            target_amount,
            collected_amount: 0,
            price_per_share,
            estimated_roi_percentage,
            duration_months,
            funding_start_date,
            funding_end_date,
            status: symbol_short!("FUNDING"),
        };

        set_persistent(&env, &DataKey::Batch(code), &batch); // almacena la información del lote en el almacenamiento persistente del contrato
        Ok(())
    }

    pub fn get_batch(env: Env, code: String) -> Result<BatchInfo, Error> {
        get_required(&env, &DataKey::Batch(code), Error::BatchNotFound)
    }

    pub fn invest(
        env: Env,
        investor: Address,
        code: String,
        amount: i128,
    ) -> Result<(), Error> {
        investor.require_auth();
        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        let mut batch: BatchInfo =
            get_required(&env, &DataKey::Batch(code.clone()), Error::BatchNotFound)?;
        if batch.status != symbol_short!("FUNDING") {
            return Err(Error::NotFunding);
        }
        let new_total = batch
            .collected_amount
            .checked_add(amount) // checked_add es una función que realiza una suma segura de dos números enteros, devolviendo None si hay un desbordamiento. En este caso, se utiliza para calcular la nueva cantidad total recaudada después de la inversión.
            .ok_or(Error::InvalidAmount)?;
        if new_total > batch.target_amount {
            return Err(Error::ExceedsTarget);
        }

        let token_address: Address = env
            .storage()
            .instance()
            .get(&DataKey::Token)
            .ok_or(Error::Unauthorized)?;
        token::Client::new(&env, &token_address).transfer(
            &investor,
            &env.current_contract_address(),
            &amount,
        ); // transfiere la cantidad de tokens especificada desde la cuenta del inversor a la cuenta del contrato inteligente, utilizando el cliente de token para interactuar con el contrato del token.

        batch.collected_amount = new_total;
        if new_total == batch.target_amount {
            batch.status = symbol_short!("FUNDED");
        }
        set_persistent(&env, &DataKey::Batch(code.clone()), &batch);

        let investment_key = DataKey::Investment(code, investor);
        let previous: i128 = env
            .storage()
            .persistent()
            .get(&investment_key)
            .unwrap_or(0);
        let total = previous.checked_add(amount).ok_or(Error::InvalidAmount)?; // calcula la nueva cantidad total invertida por el inversor en el lote específico, sumando la cantidad de la inversión actual a la cantidad previamente invertida. Si hay un desbordamiento, devuelve un error de "InvalidAmount".
        set_persistent(&env, &investment_key, &total);
        Ok(())
    }

    pub fn get_investment(env: Env, code: String, investor: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::Investment(code, investor))
            .unwrap_or(0)
    }

    // eliminar antes de ir a produccion
    pub fn set_token(env: Env, token_address: Address) -> Result<(), Error> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(Error::Unauthorized)?;
        admin.require_auth();
        env.storage().instance().set(&DataKey::Token, &token_address);
        extend_instance(&env);
        Ok(())
    }
}

fn get_required<V>(
    env: &Env,
    key: &DataKey,
    error: Error,
) -> Result<V, Error>
where
    V: soroban_sdk::IntoVal<Env, soroban_sdk::Val>
        + soroban_sdk::TryFromVal<Env, soroban_sdk::Val>,
{
    env.storage()
        .persistent()
        .get(key)
        .ok_or(error)
}

fn set_persistent<V: soroban_sdk::IntoVal<Env, soroban_sdk::Val>>(
    env: &Env,
    key: &DataKey,
    value: &V,
) {
    env.storage().persistent().set(key, value);
    env.storage()
        .persistent()
        .extend_ttl(key, LIFETIME_THRESHOLD, BUMP_AMOUNT);
}

fn extend_instance(env: &Env) {
    env.storage()
        .instance()
        .extend_ttl(LIFETIME_THRESHOLD, BUMP_AMOUNT);
}

#[cfg(test)]
mod test;
