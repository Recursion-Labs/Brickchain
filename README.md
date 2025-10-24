# BrickChain - Property Trading as Simple as Sending Crypto

*Built during the MLH Midnight Hackathon - Transforming real estate with privacy-first blockchain technology*

---

## Vision and Problem Statement

Real estate trading is notoriously **slow**, **paperwork-heavy**, and reliant on numerous intermediaries. **BrickChain** is built to fundamentally transform this process, making property transactions as straightforward and fast as sending cryptocurrency.

Our solution focuses on three core pillars:

* **Tokenization:** Fractionally digitizing properties into transferable digital assets.
* **Seamless Transfer:** Enabling private, instantaneous ownership changes.
* **Security & Verification:** Ensuring secure, verifiable proofs using zero-knowledge cryptography for a high degree of trust.

Leveraging **Midnight's privacy features** provides a secure, compliant, and confidential foundation for global property markets.

---

## Midnight Blockchain Integration

The project is architected around key features of the Midnight blockchain to deliver a privacy-first solution.

### Core Features:

* **Zero-Knowledge Proofs (ZK-Proofs):** Property owners can cryptographically prove ownership and eligibility for transactions without exposing sensitive underlying documents.
* **Shielded Transactions:** Property fractions are traded privately, ensuring that user balances and transaction values remain **confidential**.
* **Selective Disclosure:** Allows users to share only the necessary proofs with regulators or auditors, maintaining privacy over their entire asset portfolio.

---

## System Flow

```mermaid
flowchart TD
    A[Property Document] --> B[Hash Generation]
    B --> C[Smart Contract Registration]
    C --> D[Token Minting]
    D --> E[Fractional Ownership]
    E --> F[Shielded Transfer]
    F --> G[ZK Proof Generation]
    G --> H[Ownership Verification]
````

### Process Overview:

1.  **Property Registration:** A unique document hash is stored on-chain.
2.  **Tokenization:** The corresponding smart contract mints fractional tokens representing ownership.
3.  **Trading:** Ownership is transferred via shielded transactions for complete privacy.
4.  **Verification:** Zero-Knowledge proofs are used for fast, private, and secure ownership confirmation.

-----

## Architecture

The BrickChain platform is structured into modular components:

  * **Contracts:** Compact smart contracts responsible for fractional tokenization, property registration, and management logic.
  * **CLI:** A command-line interface for local deployment, testing, and interaction with the contracts.
  * **App:** The frontend application providing a user-friendly interface for property interaction.
  * **Docker:** Containerized services ensuring a simple, consistent, and easy-to-deploy environment.

-----

## Documentation

Coming Soon

## Execution and Results

### Contract Testing Summary

The system's core logic has been thoroughly tested, resulting in successful compilation and a comprehensive passing test suite, confirming the robustness and reliability of the on-chain operations.

```
...
 ✓ tests/main.test.ts (15 tests) 275ms

 Test Files  1 passed (1)
      Tests  15 passed (15)
...
Compiling 10 circuits:
```

### Test Coverage Highlights

Our test suite confirms functionality across critical scenarios:

  * **Token Operations:** Correct minting, transferring, burning, and operational state changes (pausing/unpausing).
  * **Property Operations:** Reliable registration, tokenization of a registered property, ownership transfer, and property deactivation.
  * **Validation Checks:** Thorough checks to prevent invalid operations such as zero-amount transactions, re-registering existing properties, or tokenizing unregistered assets.

-----

## Team Members

| Role | Name | GitHub Profile |
|---|---|---|
| **Research & Project Management** | Md Athar Jamal Makki | [@atharhive](https://github.com/atharhive) |
| **Tech Lead & Backend**| Samarth Mahapatra | [@samarth3301](https://github.com/samarth3301) |
| **Smart Contract & Frontend** | Akshad Jogi | [@akshad-exe](https://github.com/akshad-exe) |
| **Smart Contract & Backend** | Ayush Sarkar | [@dev-Ninjaa](https://github.com/dev-Ninjaa) |

-----

## License

Apache-2.0 License

-----

<div align="center">
Developed by Team Recursion
<br>
MLH Midnight Hackathon 2025
</div>
