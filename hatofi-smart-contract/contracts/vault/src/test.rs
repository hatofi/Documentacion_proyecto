#![cfg(test)]

use super::*;
use soroban_sdk::{
    symbol_short,
    testutils::Address as _,
    token, Address, Env, String,
};

/// Código de lote con el mismo formato que genera la API (prefijo + uuid4 en hex).
/// Es el identificador estable del lote en la blockchain, independiente del id de la BD.
const BATCH_CODE: &str = "BATCH-3F2504E0-4F89-41D3-9A0C-0305E82C3301";

fn setup() -> (Env, CattleInvestmentContractClient<'static>, Address, Address) {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let farmer = Address::generate(&env);
    let token_id = env.register_stellar_asset_contract(admin.clone());
    let contract_id = env.register(
        CattleInvestmentContract,
        (admin.clone(), token_id.clone()),
    );
    let client = CattleInvestmentContractClient::new(&env, &contract_id);
    (env, client, farmer, token_id)
}

fn create_batch(client: &CattleInvestmentContractClient, env: &Env, farmer: &Address) {
    client.create_batch(
        &String::from_str(env, BATCH_CODE),
        &1,
        &String::from_str(env, "Lote de prueba"),
        &String::from_str(env, "MVP"),
        &symbol_short!("CEBA_INT"),
        farmer,
        &1_000_000_000,
        &100_000_000,
        &15,
        &18,
        &1_700_000_000,
        &0,
    );
}

#[test]
fn creates_batch_with_model_aligned_data() {
    let (env, client, farmer, _) = setup();
    create_batch(&client, &env, &farmer);

    let batch = client.get_batch(&String::from_str(&env, BATCH_CODE));
    assert_eq!(batch.code, String::from_str(&env, BATCH_CODE));
    assert_eq!(batch.farm_id, 1);
    assert_eq!(batch.status, symbol_short!("FUNDING"));
    assert_eq!(batch.collected_amount, 0);
}

#[test]
fn accepts_batch_with_zero_roi() {
    let (env, client, farmer, _) = setup();

    client.create_batch(
        &String::from_str(&env, BATCH_CODE),
        &1,
        &String::from_str(&env, "Lote de prueba"),
        &String::from_str(&env, "Sin ROI estimado"),
        &symbol_short!("CEBA_INT"),
        &farmer,
        &1_000_000_000,
        &100_000_000,
        &0,
        &18,
        &1_700_000_000,
        &0,
    );

    assert_eq!(
        client
            .get_batch(&String::from_str(&env, BATCH_CODE))
            .estimated_roi_percentage,
        0
    );
}

#[test]
fn rejects_duplicate_code() {
    let (env, client, farmer, _) = setup();
    create_batch(&client, &env, &farmer);

    let error = client.try_create_batch(
        &String::from_str(&env, BATCH_CODE),
        &2,
        &String::from_str(&env, "Otro lote"),
        &String::from_str(&env, "Duplicado"),
        &symbol_short!("CEBA_INT"),
        &farmer,
        &1_000_000_000,
        &100_000_000,
        &15,
        &18,
        &1_700_000_000,
        &0,
    );
    assert_eq!(error, Err(Ok(Error::BatchAlreadyExists)));
}

#[test]
fn rejects_empty_code() {
    let (env, client, farmer, _) = setup();

    let error = client.try_create_batch(
        &String::from_str(&env, ""),
        &1,
        &String::from_str(&env, "Lote sin código"),
        &String::from_str(&env, "Sin código"),
        &symbol_short!("CEBA_INT"),
        &farmer,
        &1_000_000_000,
        &100_000_000,
        &15,
        &18,
        &1_700_000_000,
        &0,
    );
    assert_eq!(error, Err(Ok(Error::InvalidBatch)));
}

#[test]
fn batches_with_different_codes_coexist() {
    let (env, client, farmer, _) = setup();
    let other_code = "BATCH-9C0F-C0DE-1234-5678-9ABC-DEF012345678";

    create_batch(&client, &env, &farmer);
    client.create_batch(
        &String::from_str(&env, other_code),
        &1,
        &String::from_str(&env, "Lote de prueba"),
        &String::from_str(&env, "MVP"),
        &symbol_short!("CEBA_INT"),
        &farmer,
        &1_000_000_000,
        &100_000_000,
        &15,
        &18,
        &1_700_000_000,
        &0,
    );

    assert_eq!(
        client.get_batch(&String::from_str(&env, BATCH_CODE)).code,
        String::from_str(&env, BATCH_CODE)
    );
    assert_eq!(
        client.get_batch(&String::from_str(&env, other_code)).code,
        String::from_str(&env, other_code)
    );
}

#[test]
fn invests_and_accumulates_by_investor() {
    let (env, client, farmer, token_id) = setup();
    create_batch(&client, &env, &farmer);

    let investor = Address::generate(&env);
    let asset_admin = token::StellarAssetClient::new(&env, &token_id);
    asset_admin.mint(&investor, &1_000_000_000);

    let code = String::from_str(&env, BATCH_CODE);
    client.invest(&investor, &code, &250_000_000);
    client.invest(&investor, &code, &100_000_000);

    assert_eq!(client.get_investment(&code, &investor), 350_000_000);
    assert_eq!(client.get_batch(&code).collected_amount, 350_000_000);
}

#[test]
fn updates_token_used_by_investments() {
    let (env, client, farmer, token_id) = setup();
    create_batch(&client, &env, &farmer);

    let replacement_token = env.register_stellar_asset_contract(Address::generate(&env));
    client.set_token(&replacement_token);

    let investor = Address::generate(&env);
    token::StellarAssetClient::new(&env, &replacement_token).mint(&investor, &10);
    let code = String::from_str(&env, BATCH_CODE);
    client.invest(&investor, &code, &10);

    assert_eq!(client.get_investment(&code, &investor), 10);
}

#[test]
fn reaching_target_marks_batch_funded() {
    let (env, client, farmer, token_id) = setup();
    create_batch(&client, &env, &farmer);

    let investor = Address::generate(&env);
    token::StellarAssetClient::new(&env, &token_id).mint(&investor, &1_000_000_000);

    let code = String::from_str(&env, BATCH_CODE);
    client.invest(&investor, &code, &1_000_000_000);
    assert_eq!(client.get_batch(&code).status, symbol_short!("FUNDED"));
}

#[test]
#[should_panic]
fn rejects_investment_over_target() {
    let (env, client, farmer, token_id) = setup();
    create_batch(&client, &env, &farmer);

    let investor = Address::generate(&env);
    token::StellarAssetClient::new(&env, &token_id).mint(&investor, &2_000_000_000);

    let code = String::from_str(&env, BATCH_CODE);
    client.invest(&investor, &code, &1_000_000_001);
}

#[test]
fn unknown_code_is_not_found() {
    let (env, client, _, _) = setup();

    let error = client.try_get_batch(&String::from_str(&env, "BATCH-INEXISTENTE"));
    assert_eq!(error, Err(Ok(Error::BatchNotFound)));
}
