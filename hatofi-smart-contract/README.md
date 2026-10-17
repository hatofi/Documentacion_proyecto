# HatoFi Vault

The `vault` contract stores the financial state of a cattle batch and the
amount invested by each Stellar address.

## MVP interface

- `__constructor(admin, token_address)` configures the administrator and the
  Soroban token accepted by the vault.
- `create_batch(...)` is restricted to `admin` and stores the SQL-compatible
  batch identifier and financial fields in `DataKey::Batch(batch_id)`.
- `get_batch(batch_id)` reads the persisted batch.
- `invest(investor, batch_id, amount)` requires investor authorization,
  transfers token units into the vault and accumulates
  `DataKey::Investment(batch_id, investor)`.
- `get_investment(batch_id, investor)` reads the accumulated investment.

The backend and frontend use Testnet for the MVP. SQL amounts use two decimal
places; contract amounts are integer atomic units using the configured token
scale (default `10^7`).

## Project Structure

This repository uses the recommended structure for a Soroban project:

```text
.
├── contracts
│   └── hello_world
│       ├── src
│       │   ├── lib.rs
│       │   └── test.rs
│       └── Cargo.toml
├── Cargo.toml
├── AGENTS.md
└── README.md
```

- New Soroban contracts can be put in `contracts`, each in their own directory. There is already a `hello_world` contract in there to get you started.
- If you initialized this project with any other example contracts via `--with-example`, those contracts will be in the `contracts` directory as well.
- Contracts should have their own `Cargo.toml` files that rely on the top-level `Cargo.toml` workspace for their dependencies.
- Frontend libraries can be added to the top-level directory as well. If you initialized this project with a frontend template via `--frontend-template` you will have those files already included.


# Deploy result
https://stellar.expert/explorer/testnet/tx/e59cc8b6031ae43297bd53da9ebe22639899225197e7be4855e3ece7fba7a589
https://lab.stellar.org/r/testnet/contract/CCGGBMG72KCXUXAJCXYKCZD6K7MPTZNCTJP42PTLCUP447AKHHAFL6UX

CCGGBMG72KCXUXAJCXYKCZD6K7MPTZNCTJP42PTLCUP447AKHHAFL6UX