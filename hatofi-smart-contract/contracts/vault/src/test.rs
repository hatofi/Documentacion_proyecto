#![cfg(test)]

use super::*;
use soroban_sdk::{
    symbol_short,
    testutils::Address as _,
    token, Address, Env, String,
};

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
    client
        .create_batch(
            &1,
            &1,
            &String::from_str(env, "BATCH-001"),
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

    let batch = client.get_batch(&1);
    assert_eq!(batch.id, 1);
    assert_eq!(batch.farm_id, 1);
    assert_eq!(batch.code, String::from_str(&env, "BATCH-001"));
    assert_eq!(batch.status, symbol_short!("FUNDING"));
    assert_eq!(batch.collected_amount, 0);
}

#[test]
fn invests_and_accumulates_by_investor() {
    let (env, client, farmer, token_id) = setup();
    create_batch(&client, &env, &farmer);

    let investor = Address::generate(&env);
    let asset_admin = token::StellarAssetClient::new(&env, &token_id);
    asset_admin.mint(&investor, &1_000_000_000);

    client.invest(&investor, &1, &250_000_000);
    client.invest(&investor, &1, &100_000_000);

    assert_eq!(client.get_investment(&1, &investor), 350_000_000);
    assert_eq!(client.get_batch(&1).collected_amount, 350_000_000);
}

#[test]
fn reaching_target_marks_batch_funded() {
    let (env, client, farmer, token_id) = setup();
    create_batch(&client, &env, &farmer);

    let investor = Address::generate(&env);
    token::StellarAssetClient::new(&env, &token_id).mint(&investor, &1_000_000_000);

    client.invest(&investor, &1, &1_000_000_000);
    assert_eq!(client.get_batch(&1).status, symbol_short!("FUNDED"));
}

#[test]
#[should_panic]
fn rejects_investment_over_target() {
    let (env, client, farmer, token_id) = setup();
    create_batch(&client, &env, &farmer);

    let investor = Address::generate(&env);
    token::StellarAssetClient::new(&env, &token_id).mint(&investor, &2_000_000_000);
    client.invest(&investor, &1, &1_000_000_001);
}
